import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning';
  className?: string;
}

export const SkillBadge = ({ skill, variant = 'default', className }: SkillBadgeProps) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border-primary text-primary',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    warning: 'bg-chart-3 text-white hover:bg-chart-3/90',
  };

  return (
    <Badge 
      variant={variant === 'success' || variant === 'warning' ? 'default' : variant}
      className={cn(
        variantClasses[variant],
        'px-3 py-1 text-sm font-medium',
        className
      )}
    >
      {skill}
    </Badge>
  );
};