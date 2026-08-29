'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Sign In</h2>
        <p className="text-center text-sm text-slate-500 mb-6">Enter your credentials to access your dashboard</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 text-center">Quick Fill Test Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTestAccount('admin@example.com')}
              className="py-1 px-2 text-xs bg-purple-50 text-purple-700 font-medium rounded border border-purple-200 hover:bg-purple-100"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setTestAccount('client1@example.com')}
              className="py-1 px-2 text-xs bg-blue-50 text-blue-700 font-medium rounded border border-blue-200 hover:bg-blue-100"
            >
              Client 1
            </button>
            <button
              type="button"
              onClick={() => setTestAccount('worker1@example.com')}
              className="py-1 px-2 text-xs bg-emerald-50 text-emerald-700 font-medium rounded border border-emerald-200 hover:bg-emerald-100"
            >
              Worker 1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}