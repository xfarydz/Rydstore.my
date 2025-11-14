'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function DebugAuth() {
  const { user, isAuthenticated } = useAuth();
  const [localStorage, setLocalStorage] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorage({
        currentUser: window.localStorage.getItem('currentUser'),
        registeredUsers: window.localStorage.getItem('registeredUsers')
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Auth Hook Status:</h3>
              <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
              <p>user: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">LocalStorage:</h3>
              <p>currentUser: {localStorage?.currentUser || 'null'}</p>
              <p>registeredUsers: {localStorage?.registeredUsers || 'null'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Actions:</h3>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    const testUser = {
                      id: 'user-' + Date.now(),
                      name: 'Test User',
                      fullName: 'Test User Full Name',
                      email: 'test@example.com',
                      phone: '+60123456789',
                      address: {
                        street: 'Test Street',
                        city: 'Kuala Lumpur',
                        state: 'Kuala Lumpur',
                        postcode: '50000',
                        country: 'Malaysia'
                      },
                      joinedDate: new Date().toISOString()
                    };
                    
                    window.localStorage.setItem('currentUser', JSON.stringify(testUser));
                    window.location.reload();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Create Test User
                </button>
                
                <button
                  onClick={() => {
                    window.localStorage.clear();
                    window.location.reload();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Clear Storage
                </button>

                <a
                  href="/profile"
                  className="bg-green-500 text-white px-4 py-2 rounded inline-block"
                >
                  Go to Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}