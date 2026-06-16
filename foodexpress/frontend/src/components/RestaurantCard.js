import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ClockIcon, CurrencyRupeeIcon, HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';

export default function RestaurantCard({ restaurant }) {
  const offerColor = restaurant.offer?.includes('Free')
    ? 'bg-emerald-500'
    : restaurant.offer?.includes('OFF') || restaurant.offer?.includes('off')
    ? 'bg-blue-600'
    : 'bg-purple-600';

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
      id={`restaurant-card-${restaurant.id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={
            restaurant.image ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'
          }
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Offer badge */}
        {restaurant.offer && (
          <div className="absolute bottom-3 left-3">
            <span className={`${offerColor} text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md`}>
              {restaurant.offer}
            </span>
          </div>
        )}

        {/* Closed overlay */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-black/40 px-4 py-2 rounded-xl">
              Currently Closed
            </span>
          </div>
        )}

        {/* Featured badge */}
        {restaurant.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-orange-500 transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {restaurant.cuisineType}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="rating-badge">
            <StarIcon className="w-3 h-3" />
            <span>{restaurant.rating?.toFixed(1) || '4.0'}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{restaurant.deliveryTime || 30} min</span>
          </div>

          <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 ml-auto">
            <span>₹{restaurant.priceForTwo || 500} for two</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
