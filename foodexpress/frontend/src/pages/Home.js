import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon as StarOutline,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import RestaurantCard from '../components/RestaurantCard';
import SkeletonList from '../components/Skeleton';
import API from '../services/api';
import { useSelector } from 'react-redux';

const OFFERS = [
  {
    title: '50% OFF',
    desc: 'Up to ₹100 on first order',
    code: 'WELCOME20',
    gradient: 'from-orange-500 to-pink-600',
    emoji: '🎉',
  },
  {
    title: 'Free Delivery',
    desc: 'On orders above ₹299',
    code: 'FREEDEL',
    gradient: 'from-emerald-500 to-teal-600',
    emoji: '🚀',
  },
  {
    title: 'Flat ₹100 OFF',
    desc: 'On orders above ₹499',
    code: 'SAVE100',
    gradient: 'from-violet-500 to-purple-700',
    emoji: '💸',
  },
];

const REVIEWS = [
  {
    name: 'Arun K.',
    avatar: 'AK',
    text: 'FoodGPT suggested the perfect biryani for my taste. Delivery was super fast — under 30 minutes!',
    rating: 5,
    color: 'from-orange-400 to-red-500',
  },
  {
    name: 'Meera S.',
    avatar: 'MS',
    text: 'Love the dark mode and smooth animations. Best food delivery app experience I\'ve had!',
    rating: 5,
    color: 'from-purple-400 to-pink-500',
  },
  {
    name: 'David R.',
    avatar: 'DR',
    text: 'The AI nutrition info helped me pick healthier options. Order tracking is super accurate!',
    rating: 4,
    color: 'from-blue-400 to-cyan-500',
  },
];

const FEATURES = [
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: 'AI-Powered',
    desc: 'FoodGPT recommends meals based on your mood, budget, and history',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: <BoltIcon className="w-6 h-6" />,
    title: 'Lightning Fast',
    desc: 'Real-time order tracking with live updates via Socket.io',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Secure Payments',
    desc: 'UPI, Cards, and Cash on Delivery — all secured & encrypted',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, restRes] = await Promise.all([
          API.get('/restaurants/categories'),
          API.get('/restaurants?featured=true'),
        ]);
        setCategories(catRes.data);
        setRestaurants(restRes.data);
        if (user) {
          const recRes = await API.get('/ai/recommendations').catch(() => null);
          if (recRes) setRecommendations(recRes.data);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/restaurants?search=${encodeURIComponent(search)}`);
  };

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-red-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              Powered by FoodGPT AI
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5">
              Hungry?<br />
              <span className="text-yellow-300">We've got you</span> covered.
            </h1>
            <p className="text-lg text-orange-100 mb-8 leading-relaxed">
              Order from the best restaurants near you. AI-powered recommendations, real-time tracking, and lightning-fast delivery at your doorstep.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl" id="hero-search-form">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="hero-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search "biryani", "pizza", "burger"...'
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-white/50 outline-none shadow-lg text-sm font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
              >
                Search <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>

            {/* Quick searches */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['🍕 Pizza', '🍗 Biryani', '🍔 Burgers', '🥗 Healthy', '🍜 Noodles'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/restaurants?search=${encodeURIComponent(tag.split(' ')[1])}`)}
                  className="text-xs font-medium bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why FoodExpress ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className={`${f.bg} p-3 rounded-xl ${f.color} flex-shrink-0`}>{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Recommendations ── */}
      {recommendations?.meals?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-50 dark:bg-orange-950/30 p-2 rounded-xl">
              <SparklesIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {recommendations.greeting || 'Recommended for you'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">AI-curated just for you</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.meals.slice(0, 4).map((m, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-card hover:shadow-card-hover transition-all duration-300 border-l-4 border-l-orange-500 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{m.name}</h4>
                <p className="text-xs text-orange-500 font-medium mt-0.5">{m.restaurant}</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{m.reason}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="font-black text-orange-500">₹{m.price}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    🔥 {m.calories} cal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="section-title mb-8">Popular Categories</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square skeleton rounded-2xl" />
                  <div className="h-3 skeleton rounded w-3/4" />
                </div>
              ))
            : categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/restaurants?categoryId=${cat.id}`}
                  className="group flex flex-col items-center text-center animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 ring-2 ring-transparent group-hover:ring-orange-500 transition-all duration-300 shadow-card group-hover:shadow-glow-sm">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* ── Featured Restaurants ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Featured Restaurants</h2>
          <Link
            to="/restaurants"
            className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors"
          >
            View all <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r, i) => (
              <div
                key={r.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <RestaurantCard restaurant={r} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Offers ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="section-title mb-8">Offers & Discounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((o, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${o.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up relative overflow-hidden`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <span className="text-4xl">{o.emoji}</span>
                <h3 className="text-2xl font-black mt-2">{o.title}</h3>
                <p className="text-white/80 mt-1 text-sm">{o.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-lg">
                  <span className="font-mono font-bold text-sm tracking-wider">{o.code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        <div className="text-center mb-10">
          <h2 className="section-title">What our customers say</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Trusted by food lovers across the city</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="card p-6 animate-slide-up hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${r.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {r.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIcon
                        key={j}
                        className={`w-3.5 h-3.5 ${j < r.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-yellow-300/20 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-extrabold mb-3">Ready to order?</h2>
              <p className="text-white/80 text-lg mb-6">Join thousands of happy food lovers today</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-all duration-200 shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/restaurants"
                  className="border-2 border-white/40 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Browse Restaurants
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
