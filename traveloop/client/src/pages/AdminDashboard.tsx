import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminStats, getAdminUsers, toggleUserActive } from '../api';
import { useAuth } from '../store/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !user.isAdmin) { navigate('/'); toast.error('Admin access required'); return; }
    Promise.all([getAdminStats(), getAdminUsers()])
      .then(([statsRes, usersRes]) => { setStats(statsRes.data); setUsers(usersRes.data); })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleToggle = async (userId: string) => {
    try {
      const r = await toggleUserActive(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: r.data.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update'); }
  };

  const tripsByDayData = stats?.tripsByDay
    ? Object.entries(stats.tripsByDay).map(([date, count]) => ({ date: date.slice(5), trips: count })).slice(-14)
    : [];

  if (loading) return <div className="page-container"><LoadingSkeleton type="stat" count={4} /></div>;

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-400 hover:text-gray-100 transition-colors text-sm">← Back</button>
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-xl">⚡</div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and user management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👤', color: 'text-blue-400' },
          { label: 'Total Trips', value: stats?.totalTrips || 0, icon: '✈️', color: 'text-primary-400' },
          { label: 'Active Users', value: users.filter(u => u.isActive).length, icon: '✅', color: 'text-accent' },
          { label: 'Top Destination', value: stats?.topCities?.[0]?.city?.name || '—', icon: '🏆', color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top 5 Cities */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-200 mb-4">🏆 Top Cities by Stops</h2>
          <div className="space-y-3">
            {(stats?.topCities || []).map((tc: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-5">{i + 1}</span>
                {tc.city?.coverPhoto && <img src={tc.city.coverPhoto} alt={tc.city?.name} className="w-8 h-8 rounded object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">{tc.city?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{tc.city?.country}</p>
                </div>
                <span className="badge bg-primary/20 text-primary-300">{tc.count} stops</span>
              </div>
            ))}
            {(!stats?.topCities || stats.topCities.length === 0) && <p className="text-gray-600 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Trips Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-200 mb-4">📊 Trips Created (Last 14 Days)</h2>
          {tripsByDayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tripsByDayData}>
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
                <Bar dataKey="trips" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-600 py-10">No trip data yet</p>}
        </div>
      </div>

      {/* User Management */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-semibold text-gray-200">👥 User Management ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-gray-200 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700 text-gray-400'}`}>
                      {u.isAdmin ? '⚡ Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'}`}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(u.id)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-accent/30 text-accent hover:bg-accent/10'}`}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-600 py-8">No users found</p>}
        </div>
      </div>
    </div>
  );
}
