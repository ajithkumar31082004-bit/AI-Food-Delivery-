import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../store/authSlice';
import {
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const STEPS = ['Account Type', 'Personal Info', 'Set Password'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < current
                  ? 'bg-orange-500 text-white shadow-glow-sm'
                  : i === current
                  ? 'bg-orange-500 text-white shadow-glow-orange ring-4 ring-orange-200 dark:ring-orange-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {i < current ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`hidden sm:block text-xs font-semibold transition-colors ${
                i <= current ? 'text-orange-500' : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 max-w-[60px] h-0.5 transition-all duration-500 ${
                i < current ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '6+ chars', ok: password.length >= 6 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              n <= strength ? colors[strength] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md transition-all ${
                c.ok
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
              }`}
            >
              {c.ok ? '✓ ' : ''}{c.label}
            </span>
          ))}
        </div>
        {strength > 0 && (
          <span className={`text-xs font-bold ${strength === 4 ? 'text-emerald-500' : strength >= 3 ? 'text-blue-500' : strength >= 2 ? 'text-yellow-500' : 'text-red-400'}`}>
            {labels[strength]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      /* role selection — always valid */
    } else if (s === 1) {
      if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
      if (!/^[0-9+\-\s]{10,15}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    } else if (s === 2) {
      if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    dispatch(clearError());
    try {
      await dispatch(registerUser(form)).unwrap();
      toast.success('Account created! Welcome to FoodExpress 🎉', {
        style: { borderRadius: '12px', fontWeight: '600' },
        duration: 4000,
      });
      navigate('/');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const field = (name, label, type, placeholder, icon) => (
    <div>
      <label className="input-label" htmlFor={name}>{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">{icon}</div>
        <input
          id={name}
          type={type}
          value={form[name]}
          onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }}
          className={errors[name] ? 'input-field-error pl-11' : 'input-field pl-11'}
          placeholder={placeholder}
          autoComplete={name}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-black text-lg">F</span>
            </div>
            <span className="text-white font-extrabold text-xl">FoodExpress</span>
          </Link>

          <div className="text-white">
            <SparklesIcon className="w-8 h-8 mb-4 opacity-80" />
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Start ordering<br />in minutes 🚀
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Create your free account and enjoy AI-powered food recommendations, real-time tracking, and exclusive deals.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                '🤖 AI meal recommendations',
                '⚡ Real-time order tracking',
                '💰 Exclusive coupons & offers',
                '🍕 100+ restaurant partners',
              ].map((item) => (
                <li key={item} className="text-sm text-white/90 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-white/60 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/50 text-xs">© 2026 FoodExpress Technologies</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
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

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2">
            Create your account
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
            Join thousands of food lovers
          </p>

          <StepIndicator current={step} />

          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            {/* Step 0: Account type */}
            {step === 0 && (
              <div className="animate-fade-in">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  I want to join as:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'customer', label: 'Customer', desc: 'Order food from restaurants', Icon: UserGroupIcon },
                    { id: 'owner', label: 'Restaurant Owner', desc: 'List and manage your restaurant', Icon: BuildingStorefrontIcon },
                  ].map(({ id, label, desc, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm({ ...form, role: id })}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        form.role === id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-glow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                      }`}
                      id={`role-${id}`}
                    >
                      <Icon className={`w-7 h-7 mb-3 ${form.role === id ? 'text-orange-500' : 'text-gray-400'}`} />
                      <p className={`font-bold text-sm ${form.role === id ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{desc}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary w-full mt-6 py-3"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 1: Personal info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                {field('name', 'Full Name', 'text', 'John Doe', <UserIcon className="w-5 h-5" />)}
                {field('email', 'Email Address', 'email', 'you@example.com', <EnvelopeIcon className="w-5 h-5" />)}
                {field('phone', 'Phone Number', 'tel', '9876543210', <PhoneIcon className="w-5 h-5" />)}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">
                    ← Back
                  </button>
                  <button type="button" onClick={nextStep} className="btn-primary flex-1 py-3">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="input-label" htmlFor="password">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                      className={errors.password ? 'input-field-error pl-11 pr-11' : 'input-field pl-11 pr-11'}
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  <PasswordStrength password={form.password} />
                </div>

                <div>
                  <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPw ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                      className={errors.confirmPassword ? 'input-field-error pl-11 pr-11' : 'input-field pl-11 pr-11'}
                      placeholder="Repeat password"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirmPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Passwords match
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 animate-slide-down">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3" id="register-submit">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      '🎉 Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
