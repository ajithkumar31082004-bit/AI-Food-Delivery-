import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import FoodCard from '../components/FoodCard';
import SkeletonList from '../components/Skeleton';
import API from '../services/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    API.get(`/restaurants/${id}`).then(res => setRestaurant(res.data)).catch(() => toast.error('Restaurant not found')).finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to leave a review'); return; }
    try {
      await API.post(`/restaurants/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      const res = await API.get(`/restaurants/${id}`);
      setRestaurant(res.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <Layout><div className="max-w-7xl mx-auto px-4 py-8"><SkeletonList count={3} /></div></Layout>;
  if (!restaurant) return <Layout><div className="text-center py-20">Restaurant not found</div></Layout>;

  const categories = ['All', ...new Set((restaurant.FoodItems || []).map(f => f.menuCategory))];
  const filteredItems = activeCategory === 'All'
    ? restaurant.FoodItems
    : restaurant.FoodItems?.filter(f => f.menuCategory === activeCategory);

  return (
    <Layout>
      <div className="relative h-64 md:h-80">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{restaurant.name}</h1>
          <p className="text-white/80 mt-1">{restaurant.cuisineType} • {restaurant.address}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-2 py-1 rounded">
              <StarIcon className="w-4 h-4" /> {restaurant.rating?.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-white/80 text-sm"><ClockIcon className="w-4 h-4" /> {restaurant.deliveryTime} min</span>
            {restaurant.offer && <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded">{restaurant.offer}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurant.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-6">{restaurant.description}</p>
        )}

        {restaurant.aiSummary && (
          <div className="card p-5 mb-8 border-l-4 border-orange-500">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-orange-500" /> AI Review Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{restaurant.aiSummary.summary}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-600">Pros:</span>
                <ul className="list-disc list-inside text-gray-500 mt-1">
                  {(restaurant.aiSummary.pros || []).map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              {(restaurant.aiSummary.cons?.length > 0) && (
                <div>
                  <span className="font-medium text-red-500">Cons:</span>
                  <ul className="list-disc list-inside text-gray-500 mt-1">
                    {restaurant.aiSummary.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredItems?.map(item => <FoodCard key={item.id} item={item} showNutrition />)}
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reviews</h3>
          {restaurant.Reviews?.length > 0 ? (
            <div className="space-y-4 mb-6">
              {restaurant.Reviews.map(r => (
                <div key={r.id} className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{r.User?.name}</span>
                    <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 mb-6">No reviews yet. Be the first!</p>}

          {user && (
            <form onSubmit={submitReview} className="space-y-3">
              <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: +e.target.value })} className="input-field">
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience..." className="input-field" rows={3} required />
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
