import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-card">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-1/2" />
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="h-5 skeleton rounded-md w-12" />
          <div className="h-3 skeleton rounded-lg w-16" />
          <div className="h-3 skeleton rounded-lg w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}

function SkeletonFoodCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-card">
      <div className="h-40 skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-full" />
        <div className="h-3 skeleton rounded-lg w-2/3" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-5 skeleton rounded-lg w-14" />
          <div className="h-8 skeleton rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
      <div className="h-3 skeleton rounded-lg w-1/2 mx-auto mb-3" />
      <div className="h-8 skeleton rounded-lg w-2/3 mx-auto" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="w-14 h-14 skeleton rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded-lg w-1/2" />
        <div className="h-3 skeleton rounded-lg w-1/3" />
      </div>
      <div className="h-8 skeleton rounded-lg w-20 flex-shrink-0" />
    </div>
  );
}

export default function SkeletonList({ count = 6, type = 'restaurant' }) {
  const cards = Array.from({ length: count });
  if (type === 'food') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((_, i) => <SkeletonFoodCard key={i} />)}
      </div>
    );
  }
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
    );
  }
  if (type === 'row') {
    return (
      <div className="space-y-3">
        {cards.map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
