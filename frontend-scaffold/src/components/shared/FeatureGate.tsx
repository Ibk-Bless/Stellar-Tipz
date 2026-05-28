import React from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface FeatureGateProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  defaultValue?: boolean;
}

function FeatureGate({ flag, children, fallback = null, defaultValue = false }: FeatureGateProps) {
  const enabled = useFeatureFlag(flag, defaultValue);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default FeatureGate;
