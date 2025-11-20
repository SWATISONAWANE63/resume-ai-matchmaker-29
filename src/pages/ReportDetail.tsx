import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, ArrowLeft, Download, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { AnalysisCard } from '@/components/AnalysisCard';
import { SkillBadge } from '@/components/SkillBadge';
import { ProgressBar } from '@/components/ProgressBar';

interface ReportData {
  id: string;
  resume_filename: string;
  resume_text: string;
  skills: string[];
  summary: string;
  experience: string;
  education: string;
  score: number;
  improvements: string;
  job_description: string | null;
  match_percentage: number | null;
  missing_skills: string[];
  suggestions: string | null;
  status: string;
  created_at: string;
}

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchReport();
    }
  }, [user, id]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (error: any) {
      toast.error('Failed to load report');
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                {report.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{report.resume_filename}</h1>
          </div>
          <p className="text-muted-foreground">
            Analyzed on {new Date(report.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Analysis Results */}
        <AnalysisCard
          skills={report.skills}
          summary={report.summary}
          experience={report.experience}
          education={report.education}
          score={report.score}
          improvements={report.improvements}
        />

        {/* Job Match Results (if available) */}
        {report.job_description && report.match_percentage !== null && (
          <div className="mt-6 space-y-6">
            <Separator />
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span>Job Match Analysis</span>
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>Match Score</CardTitle>
                <CardDescription>How well your resume matches the job description</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressBar value={report.match_percentage} size="lg" />
              </CardContent>
            </Card>

            {report.missing_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Missing Skills</CardTitle>
                  <CardDescription>Skills from the job description not found in your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.missing_skills.map((skill, index) => (
                      <SkillBadge key={index} skill={skill} variant="warning" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.suggestions && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                  <CardDescription>Recommendations to improve your match</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {report.suggestions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add Job Match CTA if not done yet */}
        {!report.job_description && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Compare with a Job Description</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Get insights on how well your resume matches specific job requirements
              </p>
              <Button onClick={() => navigate(`/job-match/${report.id}`)}>
                Analyze Job Match
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ReportDetail;