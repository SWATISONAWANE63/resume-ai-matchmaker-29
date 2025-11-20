import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = ({ 
  value, 
  max = 100, 
  className,
  showLabel = true,
  size = 'md' 
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColor = (percent: number) => {
    if (percent >= 80) return 'bg-success';
    if (percent >= 60) return 'bg-primary';
    if (percent >= 40) return 'bg-chart-3';
    return 'bg-destructive';
  };

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Score</span>
          <span className="text-muted-foreground">{value} / {max}</span>
        </div>
      )}
      <div className={cn('w-full bg-secondary rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            getColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};