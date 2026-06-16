import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import API from '../services/api';
import { connectSocket, getSocket } from '../services/socket';

const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'picked', label: 'Picked Up' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

function OrderTrackingContent() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/track/${id}`).then(res => setOrder(res.data)).finally(() => setLoading(false));

    const socket = connectSocket();
    socket.emit('joinOrder', id);
    socket.on('orderUpdate', (data) => {
      setOrder(prev => ({ ...prev, ...data }));
    });

    return () => {
      socket.off('orderUpdate');
    };
  }, [id]);

  const simulateDelivery = () => {
    getSocket().emit('simulateDelivery', id);
  };

  if (loading) return <div className="text-center py-20">Loading order...</div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const currentIdx = STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Order #{order.id}</h1>
      <p className="text-gray-500 mb-8">{order.Restaurant?.name}</p>

      <div className="card p-6 mb-6">
        <div className="relative">
          {STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step.key} className="flex items-start gap-4 pb-8 last:pb-0 relative">
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[15px] top-8 w-0.5 h-full ${done ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                } ${active ? 'ring-4 ring-orange-200 dark:ring-orange-900' : ''}`}>
                  {done ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <div>
                  <p className={`font-semibold ${active ? 'text-orange-500' : done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {active && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <p className="text-sm text-gray-500 animate-pulse">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {order.deliveryPartner && order.status !== 'delivered' && (
        <div className="card p-5 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delivery Partner</h3>
          <p className="text-gray-600 dark:text-gray-300">{order.deliveryPartner}</p>
          <p className="text-sm text-gray-500 mt-1">Est. delivery: {order.deliveryTimeEstimate || 35} min</p>
        </div>
      )}

      <div className="card p-5 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Order Summary</h3>
        {order.OrderItems?.map(oi => (
          <div key={oi.id} className="flex justify-between text-sm py-1">
            <span>{oi.FoodItem?.name || 'Item'} x{oi.quantity}</span>
            <span>₹{(oi.price * oi.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span><span className="text-orange-500">₹{order.total}</span>
        </div>
      </div>

      {order.status === 'placed' && (
        <button onClick={simulateDelivery} className="btn-secondary w-full text-sm">
          Simulate Live Tracking (Demo)
        </button>
      )}
    </div>
  );
}

export default function OrderTracking() {
  return (
    <ProtectedRoute>
      <Layout showAI={false}><OrderTrackingContent /></Layout>
    </ProtectedRoute>
  );
}
