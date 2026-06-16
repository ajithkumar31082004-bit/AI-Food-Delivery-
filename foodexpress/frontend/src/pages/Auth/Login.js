import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../store/authSlice';
import { fetchCart } from '../../store/cartSlice';
import {
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'user@foodexpress.com', password: 'user1234', color: 'bg-emerald-500' },
  { label: 'Owner', email: 'owner@foodexpress.com', password: 'owner123', color: 'bg-blue-500' },
  { label: 'Admin', email: 'admin@foodexpress.com', password: 'admin123', color: 'bg-purple-500' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      const result = await dispatch(loginUser({ email: form.email, password: form.password })).unwrap();
      await dispatch(fetchCart());
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 👋`, {
        style: { borderRadius: '12px', fontWeight: '600' },
      });
      const path =
        result.user.role === 'admin' ? '/admin' : result.user.role === 'owner' ? '/owner' : '/';
      navigate(path);
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  const fillDemo = (acc) => {
    setForm((f) => ({ ...f, email: acc.email, password: acc.password }));
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600">
        {/* Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-red-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-black text-lg">F</span>
            </div>
            <span className="text-white font-extrabold text-xl">FoodExpress</span>
          </Link>

          {/* Center content */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                AI-Powered Food Delivery
              </span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Delicious food,<br />delivered fast 🍕
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Join thousands of food lovers ordering from 100+ restaurants with real-time tracking and AI meal recommendations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { val: '100+', label: 'Restaurants' },
                { val: '10K+', label: 'Orders' },
                { val: '4.8★', label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-2xl font-black">{s.val}</p>
                  <p className="text-xs text-white/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/50 text-xs">© 2026 FoodExpress. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black">F</span>
              </div>
              <span className="text-2xl font-extrabold">
                <span className="text-orange-500">Food</span>
                <span className="text-gray-900 dark:text-white">Express</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Sign in to your account to continue ordering
            </p>
          </div>

          {/* Demo account pills */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2.5">
              Quick Demo Login
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-all duration-200"
                >
                  <span className={`w-2 h-2 rounded-full ${acc.color}`} />
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 animate-slide-down">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
