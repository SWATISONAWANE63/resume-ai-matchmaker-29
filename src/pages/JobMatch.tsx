import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, ArrowLeft, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const JobMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchResumeData();
    }
  }, [user, id]);

  const fetchResumeData = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('resume_text')
        .eq('id', id)
        .single();

      if (error) throw error;
      setResumeText(data.resume_text);
    } catch (error: any) {
      toast.error('Failed to load resume data');
      console.error(error);
      navigate('/dashboard');
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('job-match', {
        body: {
          resumeText,
          jobDescription,
          reportId: id,
        },
      });

      if (error) throw error;

      toast.success('Job match analysis completed!');
      navigate(`/report/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze job match');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(`/report/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Job Description Match</h1>
          </div>
          <p className="text-muted-foreground">
            Paste a job description below to see how well your resume matches the requirements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Copy and paste the full job description including requirements, qualifications, and responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description Text</Label>
              <Textarea
                id="job-description"
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={15}
                className="resize-y"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              className="w-full"
              size="lg"
              disabled={loading || !jobDescription.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Analyze Job Match
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JobMatch;