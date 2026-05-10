import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
      toast.success('Access modified');
    } catch { toast.error('Failed to update user'); }
  };

  const tripsByDayData = stats?.tripsByDay
    ? Object.entries(stats.tripsByDay).map(([date, count]) => ({ date: date.slice(5), trips: count })).slice(-14)
    : [];

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20"><LoadingSkeleton type="stat" count={4} /></div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Admin Header */}
      <header className="pt-24 pb-12 px-6 md:px-12 border-b border-outline-variant/10 bg-surface-container-lowest/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                <span className="material-symbols-outlined font-fill">shield_person</span>
              </span>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">Command Center</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 tracking-tight">Platform <span className="text-primary italic">Intelligence.</span></h1>
            <p className="text-on-surface-variant font-bold text-lg">Real-time metrics and governance for the Traveloop ecosystem.</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 flex items-center gap-8 shadow-xl">
             <div className="text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">System Health</p>
                <p className="text-primary font-bold">Optimal</p>
             </div>
             <div className="h-8 w-px bg-outline-variant/20"></div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Nodes</p>
                <p className="text-on-surface font-bold">12 / 12</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Core Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Total Explorers', value: stats?.totalUsers || 0, icon: 'groups', color: 'primary' },
            { label: 'Global Journeys', value: stats?.totalTrips || 0, icon: 'travel_explore', color: 'secondary' },
            { label: 'Active Sessions', value: users.filter(u => u.isActive).length, icon: 'bolt', color: 'primary' },
            { label: 'Growth Delta', value: '+12.5%', icon: 'trending_up', color: 'primary' },
          ].map(s => (
            <div key={s.label} className="group bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 shadow-xl hover:translate-y-[-4px] transition-all">
              <div className={`mb-6 w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/5 text-primary border border-primary/10 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl font-fill">{s.icon}</span>
              </div>
              <p className="text-4xl font-serif font-bold text-on-surface mb-2">{s.value}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl font-bold text-on-surface">Journey Trajectory</h2>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Last 14 Days</span>
            </div>
            {tripsByDayData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tripsByDayData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#929ab2', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,182,144,0.05)' }}
                      contentStyle={{ backgroundColor: '#111c2d', borderRadius: '16px', border: '1px solid rgba(255,182,144,0.2)', color: '#d8e3fb' }} 
                    />
                    <Bar dataKey="trips" radius={[8, 8, 0, 0]}>
                      {tripsByDayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === tripsByDayData.length - 1 ? '#ffb690' : 'rgba(255,182,144,0.3)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-[300px] flex items-center justify-center italic text-on-surface-variant">Gathering data...</div>}
          </div>

          {/* Top Destinations */}
          <div className="bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl">
             <h2 className="font-serif text-2xl font-bold text-on-surface mb-8">Popular Hubs</h2>
             <div className="space-y-6">
                {(stats?.topCities || []).slice(0, 5).map((tc: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 group/item">
                    <span className="text-[10px] font-bold text-primary w-4">{i + 1}</span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-outline-variant/20">
                      <img src={tc.city?.coverPhoto || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=100'} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">{tc.city?.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{tc.city?.country}</p>
                    </div>
                    <span className="text-primary font-serif font-bold">{tc.count}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* User Governance */}
        <div className="bg-surface-container-low rounded-[40px] border border-outline-variant/10 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-outline-variant/10 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">Explorer Governance</h2>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{users.length} registered profiles</p>
            </div>
            <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl text-xs font-bold border border-outline-variant/20 hover:bg-surface-bright transition-all">
              Export Audit Log
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-lowest/50">
                  <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Identity</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Authority</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Provenance</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden flex items-center justify-center text-primary font-bold">
                           {u.profilePhoto ? <img src={u.profilePhoto} alt="" className="w-full h-full object-cover" /> : u.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{u.name}</p>
                          <p className="text-xs text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${u.isAdmin ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20'}`}>
                        {u.isAdmin ? '⚡ High Authority' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-xs text-on-surface-variant font-bold">{new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-primary animate-pulse' : 'bg-outline-variant'}`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${u.isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {u.isActive ? 'Live' : 'Restricted'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleToggle(u.id)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${u.isActive ? 'border-error/20 text-error hover:bg-error/10' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                      >
                        {u.isActive ? 'Restrict Access' : 'Restore Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
