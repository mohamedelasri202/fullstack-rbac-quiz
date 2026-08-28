'use client';

import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-bold text-slate-900">TaskMatrix</span>
          {user && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300 uppercase">
              {user.role}
            </span>
          )}
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 font-medium">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}