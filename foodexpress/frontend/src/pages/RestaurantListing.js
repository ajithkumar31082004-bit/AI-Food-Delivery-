import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import RestaurantCard from '../components/RestaurantCard';
import SkeletonList from '../components/Skeleton';
import API from '../services/api';

const FILTER_PRESETS = [
  { label: 'All', key: null },
  { label: '⭐ 4+ Stars', key: 'minRating', value: '4' },
  { label: '🥗 Veg Only', key: 'isVeg', value: 'true' },
  { label: '⚡ Fast (< 30 min)', key: 'deliveryTime', value: '30' },
  { label: '💰 Budget < ₹300', key: 'maxPrice', value: '300' },
  { label: '🌟 Featured', key: 'featured', value: 'true' },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Rating', value: 'rating' },
  { label: 'Delivery Time', value: 'deliveryTime' },
  { label: 'Price: Low', value: 'priceLow' },
  { label: 'Price: High', value: 'priceHigh' },
];

export default function RestaurantListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minRating: '',
    maxPrice: '',
    isVeg: '',
    cuisineType: '',
    featured: searchParams.get('featured') || '',
    deliveryTime: '',
  });

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const catId = searchParams.get('categoryId');
      if (catId) params.set('categoryId', catId);

      const { data } = await API.get(`/restaurants?${params}`);
      setAllRestaurants(data);
      setRestaurants(sortResults(data, sortBy));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [filters, searchParams, sortBy]);

  useEffect(() => { loadRestaurants(); }, [filters, searchParams]);

  useEffect(() => {
    setRestaurants(sortResults(allRestaurants, sortBy));
  }, [sortBy, allRestaurants]);

  function sortResults(data, sort) {
    if (!sort || !data.length) return data;
    const copy = [...data];
    if (sort === 'rating') return copy.sort((a, b) => b.rating - a.rating);
    if (sort === 'deliveryTime') return copy.sort((a, b) => a.deliveryTime - b.deliveryTime);
    if (sort === 'priceLow') return copy.sort((a, b) => a.priceForTwo - b.priceForTwo);
    if (sort === 'priceHigh') return copy.sort((a, b) => b.priceForTwo - a.priceForTwo);
    return copy;
  }

  const applyPreset = (preset) => {
    if (!preset.key) {
      setFilters((f) => ({ ...f, minRating: '', isVeg: '', maxPrice: '', featured: '', deliveryTime: '' }));
      setActivePreset(null);
      return;
    }
    setActivePreset(preset.label);
    setFilters((f) => ({ ...f, [preset.key]: preset.value }));
  };

  const clearAllFilters = () => {
    setFilters({ search: '', minRating: '', maxPrice: '', isVeg: '', cuisineType: '', featured: '', deliveryTime: '' });
    setActivePreset(null);
    setSortBy('');
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && k !== 'search');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="section-title">Restaurants near you</h1>
          {!loading && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="restaurant-search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && loadRestaurants()}
              placeholder='Try "best biryani", "south indian", "veg pizza"...'
              className="search-input pl-12"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
              showAdvanced || hasActiveFilters
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
            id="advanced-filter-toggle"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span className="hidden sm:block">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter Presets */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {FILTER_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                activePreset === preset.label || (!activePreset && preset.label === 'All')
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="card p-5 mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-orange-500" />
                Advanced Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 font-semibold hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <XMarkIcon className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label text-xs">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm py-2.5">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label text-xs">Min Rating</label>
                <select value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })} className="input-field text-sm py-2.5">
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                  <option value="4">4+ ⭐⭐⭐⭐</option>
                  <option value="3.5">3.5+ ⭐⭐⭐</option>
                </select>
              </div>
              <div>
                <label className="input-label text-xs">Max Budget (for two)</label>
                <select value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="input-field text-sm py-2.5">
                  <option value="">Any budget</option>
                  <option value="300">Under ₹300</option>
                  <option value="500">Under ₹500</option>
                  <option value="800">Under ₹800</option>
                </select>
              </div>
              <div>
                <label className="input-label text-xs">Food Preference</label>
                <select value={filters.isVeg} onChange={(e) => setFilters({ ...filters, isVeg: e.target.value })} className="input-field text-sm py-2.5">
                  <option value="">All</option>
                  <option value="true">🥗 Veg Only</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="input-label text-xs">Cuisine Type</label>
                <input
                  value={filters.cuisineType}
                  onChange={(e) => setFilters({ ...filters, cuisineType: e.target.value })}
                  placeholder="e.g. South Indian, Italian, Chinese"
                  className="input-field text-sm py-2.5"
                />
              </div>
              <div>
                <label className="input-label text-xs">Max Delivery Time</label>
                <select value={filters.deliveryTime} onChange={(e) => setFilters({ ...filters, deliveryTime: e.target.value })} className="input-field text-sm py-2.5">
                  <option value="">Any</option>
                  <option value="20">Under 20 min ⚡</option>
                  <option value="30">Under 30 min</option>
                  <option value="45">Under 45 min</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* AI Smart Search hint */}
        {filters.search && filters.search.length > 5 && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
            <SparklesIcon className="w-4 h-4 text-orange-400" />
            <span>Tip: FoodGPT AI can understand natural language — try "spicy chicken under ₹300"</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <SkeletonList count={6} />
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No restaurants found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search term</p>
            <button onClick={clearAllFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r, i) => (
              <div
                key={r.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
              >
                <RestaurantCard restaurant={r} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
