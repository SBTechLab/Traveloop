import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { getBudget, updateBudget, getTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [budget, setBudget] = useState<any>(null);
  const [form, setForm] = useState({ transportCost: '0', stayCost: '0', mealsCost: '0', miscCost: '0', budgetCap: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTrip(id), getBudget(id)])
      .then(([tripRes, budgetRes]) => {
        setTrip(tripRes.data);
        const b = budgetRes.data;
        setBudget(b);
        setForm({
          transportCost: String(b.transportCost || 0),
          stayCost: String(b.stayCost || 0),
          mealsCost: String(b.mealsCost || 0),
          miscCost: String(b.miscCost || 0),
          budgetCap: b.budgetCap ? String(b.budgetCap) : '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await updateBudget(id!, {
        transportCost: parseFloat(form.transportCost) || 0,
        stayCost: parseFloat(form.stayCost) || 0,
        mealsCost: parseFloat(form.mealsCost) || 0,
        miscCost: parseFloat(form.miscCost) || 0,
        budgetCap: form.budgetCap ? parseFloat(form.budgetCap) : null,
      });
      setBudget(r.data);
      toast.success('Budget saved! 💰');
    } catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-container"><LoadingSkeleton type="stat" count={4} /></div>;

  const total = ['transportCost', 'stayCost', 'mealsCost', 'miscCost'].reduce((a, k) => a + (parseFloat(form[k as keyof typeof form]) || 0), 0);
  const cap = parseFloat(form.budgetCap) || 0;
  const overBudget = cap > 0 && total > cap;
  const days = trip ? Math.max(1, differenceInDays(new Date(trip.endDate), new Date(trip.startDate))) : 1;

  const pieData = [
    { name: 'Transport', value: parseFloat(form.transportCost) || 0 },
    { name: 'Stay', value: parseFloat(form.stayCost) || 0 },
    { name: 'Meals', value: parseFloat(form.mealsCost) || 0 },
    { name: 'Misc', value: parseFloat(form.miscCost) || 0 },
  ].filter(d => d.value > 0);

  const barData = trip?.stops?.map((stop: any) => ({
    name: stop.city?.name || 'Stop',
    Activities: stop.stopActivities?.reduce((a: number, sa: any) => a + sa.activity.cost, 0) || 0,
  })) || [];

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-100 mb-2">💰 Budget Breakdown</h1>
      <p className="text-gray-500 mb-8">{trip?.name}</p>

      {/* Over budget warning */}
      {overBudget && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 animate-pulse-slow">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Over Budget!</p>
            <p className="text-sm text-red-400/70">You're ${(total - cap).toLocaleString()} over your ${cap.toLocaleString()} cap.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Total Estimated</p>
          <p className={`text-3xl font-bold ${overBudget ? 'text-red-400' : 'text-accent'}`}>${total.toLocaleString()}</p>
          {cap > 0 && <p className="text-xs text-gray-500 mt-1">of ${cap.toLocaleString()} cap</p>}
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Per Day</p>
          <p className="text-2xl font-bold text-gray-100">${(total / days).toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-1">{days} days</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 mb-1">Stops</p>
          <p className="text-2xl font-bold text-gray-100">{trip?.stops?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">cities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Editable Fields */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-200 mb-2">Edit Costs</h2>
          {[
            { key: 'transportCost', label: 'Transport', icon: '🚂' },
            { key: 'stayCost', label: 'Accommodation', icon: '🏨' },
            { key: 'mealsCost', label: 'Meals', icon: '🍽️' },
            { key: 'miscCost', label: 'Miscellaneous', icon: '🛍️' },
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xl w-8">{icon}</span>
              <label className="text-sm text-gray-400 w-36">{label}</label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" className="input-field pl-6" value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} min="0" step="10" />
              </div>
            </div>
          ))}
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-3">
              <span className="text-xl w-8">🎯</span>
              <label className="text-sm text-gray-400 w-36">Budget Cap</label>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" className="input-field pl-6" placeholder="Optional limit" value={form.budgetCap}
                  onChange={e => setForm({ ...form, budgetCap: e.target.value })} min="0" step="100" />
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-2">
            {saving ? '💾 Saving...' : '💾 Save Budget'}
          </button>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-200 mb-4">Cost Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-600 py-16">Enter costs to see the chart</p>}
        </div>
      </div>

      {/* Activity cost per stop bar chart */}
      {barData.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-200 mb-4">Activity Cost per Stop</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Activities']} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} />
              <Bar dataKey="Activities" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
