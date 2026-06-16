import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { selectCartTotal } from '../store/cartSlice';
import API from '../services/api';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳' },
  { id: 'debit_card', label: 'Debit Card', icon: '💳' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' }
];

function CheckoutContent() {
  const navigate = useNavigate();
  const subtotal = useSelector(selectCartTotal);
  const { items } = useSelector(s => s.cart);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ deliveryAddress: '', contactPhone: '', paymentMethod: 'upi', couponCode: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/user/addresses').then(res => {
      setAddresses(res.data);
      const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
      if (defaultAddr) {
        setForm(f => ({
          ...f,
          deliveryAddress: [defaultAddr.line1, defaultAddr.city, defaultAddr.postalCode].filter(Boolean).join(', ')
        }));
      }
    }).catch(() => {});
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/orders/place', form);
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.id}/track`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + subtotal * 0.05 + 40;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Delivery Address</h3>
          {addresses.length > 0 && (
            <select
              onChange={e => {
                const addr = addresses.find(a => a.id === +e.target.value);
                if (addr) setForm(f => ({ ...f, deliveryAddress: [addr.line1, addr.city, addr.postalCode].filter(Boolean).join(', ') }));
              }}
              className="input-field mb-3"
            >
              {addresses.map(a => (
                <option key={a.id} value={a.id}>{a.line1}, {a.city}</option>
              ))}
            </select>
          )}
          <textarea
            required
            value={form.deliveryAddress}
            onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
            placeholder="Enter full delivery address"
            className="input-field"
            rows={3}
          />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contact Number</h3>
          <input
            required
            type="tel"
            value={form.contactPhone}
            onChange={e => setForm({ ...form, contactPhone: e.target.value })}
            placeholder="9876543210"
            className="input-field"
          />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Coupon Code</h3>
          <input
            value={form.couponCode}
            onChange={e => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
            placeholder="WELCOME20, SAVE100..."
            className="input-field"
          />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setForm({ ...form, paymentMethod: m.id })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.paymentMethod === m.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <p className="font-medium text-sm mt-1 text-gray-900 dark:text-white">{m.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Payable</span>
            <span className="text-orange-500">₹{total.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4 disabled:opacity-50">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <Layout showAI={false}><CheckoutContent /></Layout>
    </ProtectedRoute>
  );
}
