'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug logging
    console.log('Username:', username, 'Length:', username.length);
    console.log('Password:', password, 'Length:', password.length);
    console.log('Username match:', username === 'admin');
    console.log('Password match:', password === 'rydstore2024');

    // Simple authentication (in production, use proper authentication)
    const validUsername = username.trim() === 'admin';
    const validPassword = password.trim() === 'rydstore2024' || password.trim() === 'admin';
    
    if (validUsername && validPassword) {
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin/dashboard');
    } else {
      setError(`Invalid credentials. Got: "${username.trim()}" / "${password.trim()}"`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            RYDSTORE.MY Admin Panel
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Default credentials: admin / rydstore2024
          </div>
        </form>
      </div>
    </div>
  );
}