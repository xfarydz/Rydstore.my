'use client';

import { useAuth } from '@/hooks/useAuth';
import { isProfileCompleteForCheckout } from '@/utils/profileValidation';

export default function ProfileCompletionWarning() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const profileCheck = isProfileCompleteForCheckout(user);
  
  // Only show if profile is incomplete
  if (profileCheck.isComplete) return null;

  // Return null - indicator will be shown in Header component instead
  return null;
}