import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  status?: string;
  level?: string;
  size?: 'sm' | 'md';
}

export function VerificationBadge({ status, level, size = 'md' }: VerificationBadgeProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  const verificationStatus = status || level;

  if (verificationStatus === 'VERIFIED') {
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle className={iconSize} />
        {size === 'md' && 'Verified'}
      </Badge>
    );
  }

  if (verificationStatus === 'PENDING' || verificationStatus === 'PARTIALLY_VERIFIED') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className={iconSize} />
        {size === 'md' && (verificationStatus === 'PARTIALLY_VERIFIED' ? 'Partially Verified' : 'Pending')}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <AlertCircle className={iconSize} />
      {size === 'md' && (verificationStatus === 'SELF_REPORTED' ? 'Self Reported' : 'Unverified')}
    </Badge>
  );
}
