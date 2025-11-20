import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, LogOut, Plus, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ProgressBar } from '@/components/ProgressBar';

interface Report {
  id: string;
  resume_filename: string;
  score: number;
  created_at: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, resume_filename, score, created_at, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast.error('Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || loading) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Resume Analyzer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/')} variant="ghost">
                <Plus className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Reports</h2>
          <p className="text-muted-foreground">
            View and manage your resume analysis history
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Upload your first resume to get started with AI-powered analysis
              </p>
              <Button onClick={() => navigate('/')}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/report/${report.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">
                      {report.resume_filename}
                    </CardTitle>
                    <Badge
                      variant={report.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-2 mt-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.status === 'completed' && report.score && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium">Score</span>
                        </span>
                        <span className="text-muted-foreground">{report.score}/100</span>
                      </div>
                      <ProgressBar value={report.score} showLabel={false} size="sm" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;