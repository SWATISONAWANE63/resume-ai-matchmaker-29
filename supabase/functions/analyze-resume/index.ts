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
    const { resumeText, filename } = await req.json();

    if (!resumeText || !filename) {
      throw new Error('Resume text and filename are required');
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

    console.log('Analyzing resume for user:', user.id);

    // Call Lovable AI to analyze the resume
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
            content: `You are an expert resume analyzer. Analyze the provided resume and extract:
1. Skills (as an array of strings)
2. Professional summary (concise, 2-3 sentences)
3. Experience highlights (key achievements, 2-3 sentences)
4. Education summary (degrees and institutions, 1-2 sentences)
5. Resume score (0-100, based on completeness, clarity, and formatting)
6. Improvement suggestions (specific, actionable advice, 3-4 points)

Return your analysis as a JSON object with these exact keys: skills, summary, experience, education, score, improvements.
The improvements should be a single string with line breaks between points.`
          },
          {
            role: 'user',
            content: `Analyze this resume:\n\n${resumeText}`
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

    console.log('Analysis completed:', analysis);

    // Save to database
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        resume_filename: filename,
        resume_text: resumeText,
        skills: analysis.skills || [],
        summary: analysis.summary || '',
        experience: analysis.experience || '',
        education: analysis.education || '',
        score: analysis.score || 0,
        improvements: analysis.improvements || '',
        status: 'completed',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    console.log('Report saved:', report.id);

    return new Response(
      JSON.stringify({ reportId: report.id, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});