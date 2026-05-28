import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  verificationType?: 'Identity' | 'SocialMedia' | 'Community';
  verifiedAt?: number;
  revokedAt?: number;
  domain?: string;
  domainVerified?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  verificationType,
  verifiedAt,
  revokedAt,
  domain,
  domainVerified,
  className = '',
}) => {
  if (domainVerified && domain) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full ${className}`}>
        <CheckCircle className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-medium text-emerald-700">
          Verified domain ({domain})
        </span>
      </div>
    );
  }

  if (!isVerified && !revokedAt) {
    return null;
  }

  if (revokedAt) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span className="text-xs font-medium text-red-600">Verification Revoked</span>
      </div>
    );
  }

  const typeLabel = verificationType === 'SocialMedia' ? 'Social Media' : verificationType;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full ${className}`}>
      <CheckCircle className="w-4 h-4 text-blue-600" />
      <span className="text-xs font-medium text-blue-600">
        Verified {typeLabel && `(${typeLabel})`}
      </span>
    </div>
  );
};

export default VerificationBadge;
