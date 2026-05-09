// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('admin@skgroups.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo area */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 mb-4 shadow-lg shadow-orange-500/25">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">
            SK GROUPS
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">ERP Management System</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/40"
        >
          <h2 className="text-xl font-semibold text-zinc-100 mb-1">Welcome back</h2>
          <p className="text-sm text-zinc-500 mb-6">Sign in to your account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                placeholder="admin@skgroups.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold hover:from-orange-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                Sign up
              </a>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-zinc-600">BUSINESSES</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <span className="text-lg">🧱</span>
              <div>
                <p className="text-xs font-semibold text-orange-400">POWER BRICK</p>
                <p className="text-[10px] text-zinc-600">Brick & Materials</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <span className="text-lg">🍞</span>
              <div>
                <p className="text-xs font-semibold text-purple-400">BAKE LAND</p>
                <p className="text-[10px] text-zinc-600">Bakery</p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          &copy; 2026 SK GROUPS. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
