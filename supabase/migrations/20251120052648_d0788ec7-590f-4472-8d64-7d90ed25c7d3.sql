-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('processing', 'completed', 'failed');

-- Create reports table to store resume analysis results
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_filename TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  
  -- Analysis results
  skills TEXT[] DEFAULT '{}',
  summary TEXT,
  experience TEXT,
  education TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  improvements TEXT,
  
  -- Job match results (optional)
  job_description TEXT,
  match_percentage INTEGER CHECK (match_percentage >= 0 AND match_percentage <= 100),
  missing_skills TEXT[] DEFAULT '{}',
  suggestions TEXT,
  
  status report_status DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);