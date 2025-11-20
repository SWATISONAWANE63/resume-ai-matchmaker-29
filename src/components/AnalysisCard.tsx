import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { SkillBadge } from './SkillBadge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, TrendingUp, FileText } from 'lucide-react';

interface AnalysisCardProps {
  skills: string[];
  summary: string;
  experience: string;
  education: string;
  score: number;
  improvements: string;
}

export const AnalysisCard = ({
  skills,
  summary,
  experience,
  education,
  score,
  improvements,
}: AnalysisCardProps) => {
  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Resume Score</span>
          </CardTitle>
          <CardDescription>Overall assessment of your resume quality</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressBar value={score} size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            {score >= 80 && "Excellent! Your resume is well-structured and comprehensive."}
            {score >= 60 && score < 80 && "Good work! Some improvements could make it even better."}
            {score >= 40 && score < 60 && "Fair resume, but there's room for significant improvement."}
            {score < 40 && "Your resume needs substantial improvements to stand out."}
          </p>
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Extracted Skills</span>
          </CardTitle>
          <CardDescription>Technical and soft skills identified in your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <SkillBadge key={index} skill={skill} variant="default" />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills identified</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Professional Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Experience Highlights</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{experience}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Education</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{education}</p>
          </div>
        </CardContent>
      </Card>

      {/* Improvements Card */}
      {improvements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-chart-3" />
              <span>Improvement Suggestions</span>
            </CardTitle>
            <CardDescription>Recommendations to enhance your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{improvements}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};