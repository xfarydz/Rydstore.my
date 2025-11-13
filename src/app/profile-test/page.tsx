'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function SimpleProfilePage() {
  const [loading, setLoading] = useState(false);

  const createTestUser = () => {
    setLoading(true);
    try {
      const testUser = {
        id: 'user-' + Date.now(),
        name: 'Test User',
        fullName: 'Test User Full Name',
        email: 'test@example.com',
        phone: '+60123456789',
        address: {
          street: '123 Test Street',
          city: 'Kuala Lumpur',  
          state: 'Kuala Lumpur',
          postcode: '50000',
          country: 'Malaysia'
        },
        joinedDate: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(testUser));
      alert('Test user created! Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('Error creating test user:', error);
      alert('Error creating test user');
    }
    setLoading(false);
  };

  const clearData = () => {
    localStorage.clear();
    alert('All data cleared! Reloading page...');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold">Profile Page Test</h1>
            <p className="text-gray-600">Testing profile functionality</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={createTestUser}
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test User'}
            </button>

            <button
              onClick={clearData}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>

            <a
              href="/profile"
              className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Full Profile Page
            </a>

            <a
              href="/"
              className="block w-full text-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Homepage
            </a>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current User Data:</h3>
            <pre className="text-sm text-gray-600 overflow-auto">
              {typeof window !== 'undefined' ? localStorage.getItem('currentUser') || 'No user data' : 'Loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}