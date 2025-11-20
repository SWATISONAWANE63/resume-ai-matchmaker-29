import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription, reportId } = await req.json();

    if (!resumeText || !jobDescription || !reportId) {
      throw new Error('Resume text, job description, and report ID are required');
    }

    // Get Lovable AI API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Analyzing job match for user:', user.id, 'report:', reportId);

    // Call Lovable AI to analyze the match
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at matching resumes to job descriptions. Compare the resume against the job description and provide:
1. Match percentage (0-100, how well the resume matches the job requirements)
2. Missing skills (array of skills mentioned in the job description but not in the resume)
3. Suggestions (specific recommendations to improve the match, 3-5 actionable points)

Return your analysis as a JSON object with these exact keys: matchPercentage, missingSkills, suggestions.
The suggestions should be a single string with line breaks between points.`
          },
          {
            role: 'user',
            content: `Resume:\n\n${resumeText}\n\n---\n\nJob Description:\n\n${jobDescription}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    console.log('Job match analysis completed:', analysis);

    // Update the report with job match data
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        job_description: jobDescription,
        match_percentage: analysis.matchPercentage || 0,
        missing_skills: analysis.missingSkills || [],
        suggestions: analysis.suggestions || '',
      })
      .eq('id', reportId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Report updated with job match data');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in job-match function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});