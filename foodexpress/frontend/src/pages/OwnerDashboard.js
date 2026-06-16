import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import API from '../services/api';

function OwnerDashboardContent() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', menuCategory: 'Main Course', isVeg: true });
  const [aiDesc, setAiDesc] = useState({ name: '', cuisineType: '' });

  useEffect(() => { loadTab(); }, [tab]);

  const loadTab = async () => {
    try {
      if (tab === 'stats') {
        const { data } = await API.get('/owner/stats');
        setStats(data);
      } else if (tab === 'menu') {
        const { data } = await API.get('/owner/menu');
        setMenu(data);
      } else if (tab === 'orders') {
        const { data } = await API.get('/owner/orders');
        setOrders(data);
      }
    } catch { /* silent */ }
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    try {
      await API.post('/owner/menu', { ...newItem, price: parseFloat(newItem.price) });
      toast.success('Item added');
      setNewItem({ name: '', description: '', price: '', menuCategory: 'Main Course', isVeg: true });
      loadTab();
    } catch { toast.error('Failed to add item'); }
  };

  const toggleAvailability = async (id, available) => {
    await API.put(`/owner/menu/${id}`, { available: !available });
    loadTab();
  };

  const deleteItem = async (id) => {
    await API.delete(`/owner/menu/${id}`);
    toast.success('Item deleted');
    loadTab();
  };

  const updateOrderStatus = async (id, status) => {
    await API.put(`/owner/orders/${id}/status`, { status });
    toast.success('Order status updated');
    loadTab();
  };

  const generateDescription = async () => {
    try {
      const { data } = await API.post('/owner/generate-description', aiDesc);
      toast.success('Description generated!');
      setNewItem(prev => ({ ...prev, description: data.description }));
    } catch { toast.error('AI generation failed'); }
  };

  const tabs = ['stats', 'menu', 'orders', 'profile'];
  const STATUS_FLOW = ['placed', 'preparing', 'picked', 'out_for_delivery', 'delivered'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Restaurant Dashboard</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            {t === 'stats' ? 'Statistics' : t}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats.totalOrders },
              { label: 'Revenue', value: `₹${stats.revenue}` },
              { label: 'Rating', value: stats.avgRating },
              { label: 'Predicted Today', value: stats.forecast?.predictedOrders || '-' }
            ].map((s, i) => (
              <div key={i} className="card p-5 text-center">
                <p className="text-2xl font-bold text-orange-500">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-bold mb-4">Popular Foods</h3>
              {stats.popularFoods?.map((f, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span>{f.name}</span><span className="font-medium">{f.count} orders</span>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="font-bold mb-4">AI Forecast Insights</h3>
              <p className="text-sm text-gray-500 mb-2">Peak hours: {stats.forecast?.peakHours?.join(', ')}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {(stats.forecast?.insights || []).map((ins, i) => <li key={i}>• {ins}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'menu' && (
        <div>
          <form onSubmit={addMenuItem} className="card p-5 mb-6 space-y-3">
            <h3 className="font-bold">Add Food Item</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <input required placeholder="Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input-field" />
              <input required type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="input-field" />
            </div>
            <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="input-field" rows={2} />
            <div className="flex gap-3 items-end">
              <input placeholder="Restaurant name" value={aiDesc.name} onChange={e => setAiDesc({ ...aiDesc, name: e.target.value })} className="input-field flex-1" />
              <input placeholder="Cuisine" value={aiDesc.cuisineType} onChange={e => setAiDesc({ ...aiDesc, cuisineType: e.target.value })} className="input-field flex-1" />
              <button type="button" onClick={generateDescription} className="btn-secondary whitespace-nowrap">AI Description</button>
            </div>
            <button type="submit" className="btn-primary">Add Item</button>
          </form>

          <div className="space-y-3">
            {menu.map(item => (
              <div key={item.id} className="card p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                  <p className="text-sm text-gray-500">₹{item.price} • {item.menuCategory}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAvailability(item.id, item.available)} className={`text-xs px-3 py-1 rounded ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-xs px-3 py-1 rounded bg-red-100 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold">Order #{o.id}</h4>
                  <p className="text-sm text-gray-500">{o.User?.name} • ₹{o.total}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-700">{o.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => updateOrderStatus(o.id, s)} className={`text-xs px-2 py-1 rounded ${o.status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'profile' && stats?.restaurant && (
        <div className="card p-6 max-w-lg">
          <h3 className="font-bold text-xl mb-4">{stats.restaurant.name}</h3>
          <p className="text-gray-500 mb-2">{stats.restaurant.cuisineType}</p>
          <p className="text-gray-600 dark:text-gray-300">{stats.restaurant.description}</p>
          <p className="text-sm text-gray-400 mt-4">{stats.restaurant.address}</p>
        </div>
      )}
    </div>
  );
}

export default function OwnerDashboard() {
  return (
    <ProtectedRoute roles={['owner', 'admin']}>
      <Layout showAI={false}><OwnerDashboardContent /></Layout>
    </ProtectedRoute>
  );
}
