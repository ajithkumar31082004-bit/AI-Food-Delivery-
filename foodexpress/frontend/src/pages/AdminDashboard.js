import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import API from '../services/api';

function AdminDashboardContent() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });

  useEffect(() => { loadTab(); }, [tab]);

  const loadTab = async () => {
    try {
      const endpoints = {
        stats: '/admin/stats',
        users: '/admin/users',
        restaurants: '/admin/restaurants',
        categories: '/admin/categories',
        orders: '/admin/orders'
      };
      const { data } = await API.get(endpoints[tab]);
      if (tab === 'stats') setStats(data);
      else if (tab === 'users') setUsers(data);
      else if (tab === 'restaurants') setRestaurants(data);
      else if (tab === 'categories') setCategories(data);
      else if (tab === 'orders') setOrders(data);
    } catch { /* silent */ }
  };

  const toggleUser = async (id, isActive) => {
    await API.put(`/admin/users/${id}`, { isActive: !isActive });
    toast.success('User updated');
    loadTab();
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await API.post('/admin/categories', newCategory);
    toast.success('Category added');
    setNewCategory({ name: '', slug: '' });
    loadTab();
  };

  const deleteCategory = async (id) => {
    await API.delete(`/admin/categories/${id}`);
    toast.success('Category deleted');
    loadTab();
  };

  const tabs = ['stats', 'users', 'restaurants', 'categories', 'orders'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Restaurants', value: stats.totalRestaurants },
              { label: 'Total Orders', value: stats.totalOrders },
              { label: 'Revenue', value: `₹${Math.round(stats.revenue || 0)}` }
            ].map((s, i) => (
              <div key={i} className="card p-5 text-center">
                <p className="text-3xl font-bold text-orange-500">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Order Trends</h3>
            <div className="flex items-end gap-4 h-40">
              {(stats.orderTrends || []).map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-orange-500 rounded-t transition-all" style={{ height: `${Math.max(t.count * 20, 8)}px` }} />
                  <span className="text-xs text-gray-500 mt-2">{t.month}</span>
                  <span className="text-xs font-medium">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2">Name</th><th className="text-left py-3 px-2">Email</th><th className="text-left py-3 px-2">Role</th><th className="text-left py-3 px-2">Status</th><th className="py-3 px-2">Action</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2">{u.name}</td>
                  <td className="py-3 px-2">{u.email}</td>
                  <td className="py-3 px-2"><span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{u.role}</span></td>
                  <td className="py-3 px-2">{u.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => toggleUser(u.id, u.isActive)} className="text-xs text-orange-500 hover:underline">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'restaurants' && (
        <div className="space-y-3">
          {restaurants.map(r => (
            <div key={r.id} className="card p-4 flex items-center gap-4">
              <img src={r.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-bold">{r.name}</h4>
                <p className="text-sm text-gray-500">{r.cuisineType} • ⭐ {r.rating}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${r.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'categories' && (
        <div>
          <form onSubmit={addCategory} className="card p-4 mb-6 flex gap-3">
            <input required placeholder="Category name" value={newCategory.name} onChange={e => setNewCategory({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input-field flex-1" />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="card p-4 flex justify-between items-center">
                <span className="font-medium">{c.name}</span>
                <button onClick={() => deleteCategory(c.id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="card p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Order #{o.id}</p>
                <p className="text-sm text-gray-500">{o.User?.name} • {o.Restaurant?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-500">₹{o.total}</p>
                <p className="text-xs text-gray-500">{o.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin']}>
      <Layout showAI={false}><AdminDashboardContent /></Layout>
    </ProtectedRoute>
  );
}
