import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, LogOut, LayoutDashboard, Sparkles, CheckCircle2, TrendingUp, Target } from 'lucide-react';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Set worker path for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  };

  const handleFileSelect = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to analyze resumes');
      navigate('/auth');
      return;
    }

    setUploading(true);
    try {
      let text: string;
      
      // Extract text based on file type
      if (file.type === 'application/pdf') {
        toast.info('Extracting text from PDF...');
        text = await extractTextFromPDF(file);
      } else {
        // For DOC/DOCX or plain text files
        text = await file.text();
      }

      if (!text || text.trim().length < 50) {
        throw new Error('Could not extract enough text from the file. Please ensure your resume has readable content.');
      }

      // Call edge function to analyze resume
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: {
          resumeText: text,
          filename: file.name,
        },
      });

      if (error) throw error;

      toast.success('Resume analyzed successfully!');
      navigate(`/report/${data.reportId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze resume');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Resume Analyzer</h1>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <Button onClick={() => navigate('/dashboard')} variant="ghost">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button onClick={handleSignOut} variant="outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Title and Description */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Resume Analysis
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get instant insights on your resume with advanced AI. Extract skills, receive personalized feedback, and match your resume to job descriptions.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Smart Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically extract skills, experience, and education from your resume
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-success/10 rounded-full mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Quality Score</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a comprehensive score with actionable improvement suggestions
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Job Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Compare your resume against job descriptions to find gaps
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-center mb-2">
                  {user ? 'Upload Your Resume' : 'Sign In to Get Started'}
                </h2>
                <p className="text-center text-muted-foreground">
                  {user
                    ? 'Upload your resume to receive AI-powered insights in seconds'
                    : 'Create an account or sign in to analyze your resume'}
                </p>
              </div>
              {user ? (
                <FileUploader onFileSelect={handleFileSelect} loading={uploading} />
              ) : (
                <div className="text-center py-8">
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
