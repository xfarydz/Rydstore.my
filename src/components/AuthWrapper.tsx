'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}