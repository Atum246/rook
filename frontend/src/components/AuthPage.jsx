'use client';

import { useAuth } from './AuthProvider';
import { useState } from 'react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-rook-900/20 via-dark-950 to-dark-950 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">♜</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rook-400 to-rook-600 bg-clip-text text-transparent">
              Rook
            </h1>
          </div>
          <p className="text-dark-400">Your agent&apos;s home ✨</p>
        </div>

        {/* Auth Card */}
        <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            {mode === 'login' ? 'Welcome back ♜' : 'Get started ♜'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-dark-400 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you? 👋"
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-rook-500 focus:ring-1 focus:ring-rook-500 transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-dark-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com 📧"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-rook-500 focus:ring-1 focus:ring-rook-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-dark-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• 🔒"
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-rook-500 focus:ring-1 focus:ring-rook-500 transition"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rook-600 to-rook-700 hover:from-rook-500 hover:to-rook-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rook-700/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign in ♜' : 'Create account ♜'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm text-rook-400 hover:text-rook-300 transition"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up ✨"
                : 'Already have an account? Sign in 👋'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
