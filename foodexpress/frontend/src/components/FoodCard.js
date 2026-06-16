import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '../store/cartSlice';
import API from '../services/api';
import { PlusIcon, MinusIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/solid';

function HealthBar({ score }) {
  const getColor = (s) => {
    if (s >= 8) return 'bg-emerald-500';
    if (s >= 6) return 'bg-green-400';
    if (s >= 4) return 'bg-yellow-400';
    return 'bg-red-400';
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400">Health</span>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{score}/10</span>
    </div>
  );
}

export default function FoodCard({ item, showNutrition }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [quantity, setQuantity] = useState(0);
  const [nutrition, setNutrition] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please login to add items');
      return;
    }
    if (!item.available) return;
    setAdding(true);
    try {
      await dispatch(addToCart({ foodItemId: item.id, quantity: 1 })).unwrap();
      setQuantity((q) => q + 1);
      toast.success(`${item.name} added!`, {
        icon: '🍔',
        style: {
          borderRadius: '12px',
          fontWeight: '600',
        },
      });
    } catch (err) {
      toast.error(err || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const loadNutrition = async () => {
    if (nutritionLoading) return;
    setNutritionOpen(true);
    if (nutrition) return;
    setNutritionLoading(true);
    try {
      const { data } = await API.get(`/ai/nutrition/${item.id}`);
      setNutrition(data);
    } catch {
      toast.error('Could not load nutrition info');
      setNutritionOpen(false);
    } finally {
      setNutritionLoading(false);
    }
  };

  return (
    <div
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
      id={`food-card-${item.id}`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <img
          src={
            item.image ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Veg/Non-veg indicator */}
        <div className="absolute top-2 left-2">
          <div
            className={`w-5 h-5 rounded-sm border-2 ${item.isVeg ? 'border-green-600 bg-white dark:bg-gray-900' : 'border-red-600 bg-white dark:bg-gray-900'} flex items-center justify-center shadow-sm`}
            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
        </div>

        {/* Unavailable overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Unavailable</span>
          </div>
        )}

        {/* Calorie badge */}
        {item.calories && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md">
            <FireIcon className="w-3 h-3 text-orange-400" />
            <span>{item.calories} cal</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
          {item.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 flex-1 leading-relaxed">
          {item.description}
        </p>

        {/* Nutrition panel */}
        {showNutrition && nutritionOpen && (
          <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl animate-fade-in">
            {nutritionLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <SparklesIcon className="w-3.5 h-3.5 text-orange-400 animate-spin-slow" />
                Analyzing with AI...
              </div>
            ) : nutrition ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-3 gap-1 text-center">
                  {[
                    { label: 'Protein', val: `${nutrition.protein}g`, color: 'text-blue-500' },
                    { label: 'Carbs', val: `${nutrition.carbs}g`, color: 'text-yellow-500' },
                    { label: 'Fat', val: `${nutrition.fat}g`, color: 'text-red-400' },
                  ].map((n) => (
                    <div key={n.label} className="text-[10px]">
                      <p className={`font-bold ${n.color}`}>{n.val}</p>
                      <p className="text-gray-400">{n.label}</p>
                    </div>
                  ))}
                </div>
                {nutrition.healthScore && <HealthBar score={nutrition.healthScore} />}
              </div>
            ) : null}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-black text-gray-900 dark:text-white">
              ₹{item.price}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showNutrition && (
              <button
                onClick={loadNutrition}
                className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-0.5"
                title="AI Nutrition Info"
              >
                <SparklesIcon className="w-3 h-3" />
                {nutritionOpen ? 'Hide' : 'Nutrition'}
              </button>
            )}
            <button
              onClick={handleAdd}
              disabled={!item.available || adding}
              className={`text-xs font-bold px-4 py-1.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm ${
                item.available
                  ? 'bg-white dark:bg-gray-800 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-glow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700 cursor-not-allowed'
              }`}
              id={`add-to-cart-${item.id}`}
            >
              {adding ? '...' : 'ADD +'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
