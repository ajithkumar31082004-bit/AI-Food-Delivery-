import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { fetchCart, updateCartItem, removeFromCart, selectCartTotal } from '../store/cartSlice';

const GST_RATE = 0.05;
const DELIVERY = 40;

function CartContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantName, loading } = useSelector(s => s.cart);
  const subtotal = useSelector(selectCartTotal);
  const tax = subtotal * GST_RATE;
  const total = subtotal + tax + DELIVERY;

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const updateQty = async (foodItemId, quantity) => {
    try {
      await dispatch(updateCartItem({ foodItemId, quantity })).unwrap();
    } catch (err) { toast.error(err); }
  };

  const remove = async (foodItemId) => {
    try {
      await dispatch(removeFromCart(foodItemId)).unwrap();
      toast.success('Item removed');
    } catch (err) { toast.error(err); }
  };

  if (loading && !items.length) return <div className="text-center py-20">Loading cart...</div>;

  if (!items.length) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Cart</h1>
      {restaurantName && <p className="text-gray-500 mb-6">from {restaurantName}</p>}

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.foodItemId} className="card p-4 flex items-center gap-4">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
              <p className="text-orange-500 font-bold">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.foodItemId, item.quantity - 1)} className="p-1 rounded bg-gray-100 dark:bg-gray-700"><MinusIcon className="w-4 h-4" /></button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateQty(item.foodItemId, item.quantity + 1)} className="p-1 rounded bg-gray-100 dark:bg-gray-700"><PlusIcon className="w-4 h-4" /></button>
            </div>
            <span className="font-bold text-gray-900 dark:text-white w-16 text-right">₹{item.price * item.quantity}</span>
            <button onClick={() => remove(item.foodItemId)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><TrashIcon className="w-5 h-5" /></button>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Delivery Charge</span><span>₹{DELIVERY}</span></div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Grand Total</span><span className="text-orange-500">₹{total.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6">Proceed to Checkout</button>
      </div>
    </div>
  );
}

export default function Cart() {
  return (
    <ProtectedRoute>
      <Layout><CartContent /></Layout>
    </ProtectedRoute>
  );
}
