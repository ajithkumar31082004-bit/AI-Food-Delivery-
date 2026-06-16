import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import API from '../services/api';

function DashboardContent() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [newAddress, setNewAddress] = useState({ line1: '', city: '', postalCode: '', isDefault: false });
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      if (tab === 'orders') {
        const { data } = await API.get('/orders/history');
        setOrders(data);
      } else if (tab === 'addresses') {
        const { data } = await API.get('/user/addresses');
        setAddresses(data);
      } else if (tab === 'favorites') {
        const { data } = await API.get('/user/favorites');
        setFavorites(data);
      } else if (tab === 'profile') {
        const { data } = await API.get('/user/profile');
        setProfile({ name: data.name, phone: data.phone || '' });
      } else if (tab === 'coupons') {
        const { data } = await API.get('/user/coupons');
        setCoupons(data);
      }
    } catch { /* silent */ }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/user/profile', profile);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await API.post('/user/addresses', newAddress);
      toast.success('Address added');
      setNewAddress({ line1: '', city: '', postalCode: '', isDefault: false });
      loadData();
    } catch { toast.error('Failed to add address'); }
  };

  const generateCoupon = async () => {
    try {
      const { data } = await API.get('/user/coupons/generate');
      toast.success(data.message || `Coupon ${data.code} generated!`);
      loadData();
    } catch { toast.error('Failed to generate coupon'); }
  };

  const tabs = [
    { id: 'orders', label: 'Order History' },
    { id: 'addresses', label: 'Saved Addresses' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'coupons', label: 'Coupons' },
    { id: 'profile', label: 'Account Settings' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Dashboard</h1>

      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? <p className="text-gray-500">No orders yet</p> : orders.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{o.Restaurant?.name}</h4>
                  <p className="text-sm text-gray-500">Order #{o.id} • {new Date(o.createdAt).toLocaleDateString()}</p>
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>{o.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-500">₹{o.total}</p>
                  {o.status !== 'cancelled' && o.status !== 'delivered' && (
                    <Link to={`/orders/${o.id}/track`} className="text-sm text-orange-500 hover:underline mt-1 block">Track →</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'addresses' && (
        <div>
          <div className="space-y-3 mb-6">
            {addresses.map(a => (
              <div key={a.id} className="card p-4">
                <p className="font-medium text-gray-900 dark:text-white">{a.line1}</p>
                <p className="text-sm text-gray-500">{a.city}, {a.postalCode}</p>
                {a.isDefault && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded mt-1 inline-block">Default</span>}
              </div>
            ))}
          </div>
          <form onSubmit={addAddress} className="card p-5 space-y-3">
            <h4 className="font-bold">Add New Address</h4>
            <input required placeholder="Address line" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field" />
              <input required placeholder="Postal code" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="input-field" />
            </div>
            <button type="submit" className="btn-primary">Add Address</button>
          </form>
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.length === 0 ? <p className="text-gray-500">No favorites yet</p> : favorites.map(f => (
            <Link key={f.id} to={`/restaurants/${f.Restaurant?.id}`} className="card p-4 flex items-center gap-3 hover:shadow-lg transition-shadow">
              <img src={f.Restaurant?.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{f.Restaurant?.name}</h4>
                <p className="text-sm text-gray-500">{f.Restaurant?.cuisineType}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'coupons' && (
        <div>
          <button onClick={generateCoupon} className="btn-primary mb-6">Generate AI Coupon</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map(c => (
              <div key={c.id} className="card p-5 border-dashed border-2 border-orange-300">
                <p className="font-mono font-bold text-xl text-orange-500">{c.code}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                  {c.minOrder ? ` • Min ₹${c.minOrder}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="card p-6 space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
            <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input-field mt-1" />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      )}
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute roles={['customer']}>
      <Layout><DashboardContent /></Layout>
    </ProtectedRoute>
  );
}
