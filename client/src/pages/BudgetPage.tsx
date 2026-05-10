import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { differenceInDays } from 'date-fns';
import { getBudget, updateBudget, getTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CHART_COLORS = ['#f97316', '#818cf8', '#2dd4bf', '#bec6e0'];

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      toast.success('Budget updated');
    } catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <LoadingSkeleton type="stat" count={4} />
    </div>
  );

  const total = ['transportCost', 'stayCost', 'mealsCost', 'miscCost'].reduce((a, k) => a + (parseFloat(form[k as keyof typeof form]) || 0), 0);
  const cap = parseFloat(form.budgetCap) || 0;
  const overBudget = cap > 0 && total > cap;
  const days = trip ? Math.max(1, differenceInDays(new Date(trip.endDate), new Date(trip.startDate))) : 1;

  const pieData = [
    { name: 'Stay', value: parseFloat(form.stayCost) || 0 },
    { name: 'Transport', value: parseFloat(form.transportCost) || 0 },
    { name: 'Activities', value: parseFloat(form.mealsCost) || 0 }, // Using meals as general activity proxy for simplicity in demo
    { name: 'Misc', value: parseFloat(form.miscCost) || 0 },
  ].filter(d => d.value > 0);

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-surface min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 text-on-surface-variant mb-4">
              <Link to="/trips" className="text-xs font-bold uppercase tracking-wider hover:text-primary transition-colors">Trips</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-xs font-bold uppercase tracking-wider">{trip?.name}</span>
            </nav>
            <h1 className="font-serif text-5xl font-bold text-primary">Budget Analysis</h1>
            <p className="text-on-surface-variant mt-3 max-w-xl">
              Keep track of your travel expenses and ensure your {days}-day journey stays within limits.
            </p>
          </div>
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/20 flex flex-col items-center md:items-end shadow-xl">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Estimated Total</span>
            <span className={`font-serif text-4xl font-bold ${overBudget ? 'text-error' : 'text-secondary'}`}>
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="flex gap-4 mt-2">
              {overBudget ? (
                <span className="flex items-center gap-1 text-error font-bold text-xs">
                  <span className="material-symbols-outlined text-sm font-fill">warning</span>
                  ${(total - cap).toLocaleString()} over
                </span>
              ) : cap > 0 ? (
                <span className="flex items-center gap-1 text-chart-teal font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">trending_down</span>
                  ${(cap - total).toLocaleString()} remaining
                </span>
              ) : null}
              <span className="text-outline-variant">|</span>
              <span className="text-on-surface-variant font-bold text-xs">Daily: ${(total / days).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Category Breakdown & Inputs */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-lg flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-8">Edit Expenses</h3>
            <div className="space-y-6">
              {[
                { key: 'stayCost', label: 'Accommodation', icon: 'hotel' },
                { key: 'transportCost', label: 'Transport', icon: 'train' },
                { key: 'mealsCost', label: 'Activities & Dining', icon: 'restaurant' },
                { key: 'miscCost', label: 'Shopping & Misc', icon: 'shopping_bag' },
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input 
                      type="number" 
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-low transition-all text-on-surface outline-none"
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-outline-variant/20">
                <label className="text-xs font-bold text-on-surface uppercase tracking-widest flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Budget Cap
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                  <input 
                    type="number" 
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-low transition-all text-on-surface outline-none placeholder:text-on-surface-variant/30"
                    placeholder="Enter a limit (optional)"
                    value={form.budgetCap}
                    onChange={e => setForm({ ...form, budgetCap: e.target.value })}
                  />
                </div>
              </div>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {saving ? 'Updating...' : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Financial Data
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-outline-variant/20 pt-12 md:pt-0 md:pl-12">
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-8">Cost Allocation</h3>
            <div className="relative w-full aspect-square max-w-[280px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={120} 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#152031', border: '1px solid #2a3548', borderRadius: '12px', color: '#d8e3fb' }}
                      itemStyle={{ color: '#ffb690', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant text-center">
                  <span className="material-symbols-outlined text-5xl mb-2 opacity-20">pie_chart</span>
                  <p className="text-xs">No data to display yet</p>
                </div>
              )}
              {pieData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total spent</span>
                  <span className="font-serif text-2xl font-bold">${total.toFixed(0)}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Insight Card */}
        <div className={`lg:col-span-4 p-8 rounded-2xl shadow-lg border flex flex-col justify-between ${
          overBudget 
            ? 'bg-error-container text-on-error-container border-error/20' 
            : 'bg-primary-container text-on-primary-container border-primary/20'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined font-fill">{overBudget ? 'warning' : 'insights'}</span>
              <span className="text-xs font-bold uppercase tracking-widest">Smart Insight</span>
            </div>
            <h4 className="font-serif text-3xl font-bold mb-4">
              {overBudget ? 'Budget Limit Reached' : 'Plan Within Budget'}
            </h4>
            <p className="text-sm opacity-90 leading-relaxed">
              {overBudget 
                ? `You are currently $${(total-cap).toLocaleString()} above your target. Consider reducing Accommodation or Misc costs to stay balanced.` 
                : cap > 0 
                  ? `Great job! You have $${(cap-total).toLocaleString()} left in your budget. Plenty of room for some extra local experiences.`
                  : "Set a budget cap to see progress bars and remaining balance alerts as you plan your journey."}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/trips/${id}/build`)}
            className={`mt-12 w-full py-4 rounded-xl font-bold active:scale-[0.98] transition-all ${
              overBudget 
                ? 'bg-on-error-container text-error-container' 
                : 'bg-on-primary-container text-primary-container'
            }`}
          >
            Review Itinerary
          </button>
        </div>
      </section>

      {/* Stop Breakdown */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-xl">
        <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="font-serif text-2xl font-bold text-on-surface">Stop-by-Stop Overview</h3>
          <div className="flex gap-4">
             <span className="text-xs font-bold text-on-surface-variant italic">{trip?.stops?.length || 0} stops planned</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Destination</th>
                <th className="px-8 py-4">Activities</th>
                <th className="px-8 py-4 text-right">Activity Cost</th>
              </tr>
            </thead>
            <tbody className="text-on-surface divide-y divide-outline-variant/10">
              {trip?.stops?.map((stop: any) => {
                const activityTotal = stop.stopActivities?.reduce((a: number, sa: any) => a + sa.activity.cost, 0) || 0;
                return (
                  <tr key={stop.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-variant overflow-hidden flex-shrink-0">
                          {stop.city.coverPhoto ? (
                            <img src={stop.city.coverPhoto} alt={stop.city.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined">location_city</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-sm">{stop.city.name}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold">{stop.city.country}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold">
                        {stop.stopActivities?.length || 0} experiences
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-serif font-bold text-primary">
                      ${activityTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {(!trip?.stops || trip.stops.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-on-surface-variant italic text-sm">
                    No stops added to this trip yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
