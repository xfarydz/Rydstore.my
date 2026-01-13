'use client';

import { useAuth } from '@/hooks/useAuth';

export default function WelcomeSection() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <div className="bg-gray-100 py-4 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-lg text-gray-700">
          Welcome, <span className="font-bold text-black">{user.fullName || user.name}</span>!
        </p>
      </div>
    </div>
  );
}