import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCityActivities, getCity, getTrips, addActivityToStop } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const TYPES = ['sightseeing', 'food', 'adventure', 'cultural', 'relaxation'];

export default function ActivitySearch() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [trips, setTrips] = useState<any[]>([]);
  const [addModal, setAddModal] = useState<any>(null);
  const [selectedTripStop, setSelectedTripStop] = useState('');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!cityId) return;
    Promise.all([getCity(cityId), getCityActivities(cityId), getTrips()])
      .then(([cityRes, actRes, tripsRes]) => { 
        setCity(cityRes.data); 
        setActivities(actRes.data); 
        setTrips(tripsRes.data);
      })
      .finally(() => setLoading(false));
  }, [cityId]);

  const handleFilterChange = async () => {
    if (!cityId) return;
    const params: any = {};
    if (typeFilter) params.type = typeFilter;
    if (maxCost) params.maxCost = maxCost;
    if (maxDuration) params.maxDuration = maxDuration;
    if (search) params.search = search;
    const r = await getCityActivities(cityId, params);
    setActivities(r.data);
  };

  useEffect(() => { 
    const timer = setTimeout(() => { handleFilterChange(); }, 400);
    return () => clearTimeout(timer);
  }, [typeFilter, maxCost, maxDuration, search]);

  const handleAdd = (activity: any) => {
    setAddModal(activity);
  };

  const handleConfirmAdd = async () => {
    if (!selectedTripStop) { toast.error('Please select a trip stop'); return; }
    setAdding(true);
    try {
      await addActivityToStop(selectedTripStop, { activityId: addModal.id });
      toast.success(`${addModal.name} added to your plan!`);
      setAddModal(null);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to add activity'); }
    finally { setAdding(false); }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12"><LoadingSkeleton type="card" count={6} /></div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Header Section */}
      <header className="pt-24 pb-12 px-6 md:px-12 border-b border-outline-variant/10 bg-surface-container-lowest/30">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <button onClick={() => navigate('/cities')} className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Cities
            </button>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-3 tracking-tight">Discover {city?.name}</h1>
            <p className="text-on-surface-variant font-bold text-lg">Find the perfect experiences for your stay in {city?.country}.</p>
          </div>
          <div className="relative w-full md:w-[400px]">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
            <input 
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary outline-none transition-all shadow-xl" 
              placeholder="Search experiences..." 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Chips */}
        <div className="max-w-container-max mx-auto mt-12 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setTypeFilter('')}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${!typeFilter ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:border-primary/50'}`}
          >
            All Activities
          </button>
          {TYPES.map(type => (
            <button 
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap flex items-center gap-2 ${typeFilter === type ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-sm">{type === 'food' ? 'restaurant' : type === 'adventure' ? 'hiking' : type === 'sightseeing' ? 'camera_alt' : type === 'relaxation' ? 'spa' : 'palette'}</span>
              {type}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-container-max mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Main Grid */}
          <div className="xl:col-span-8">
            {activities.length === 0 ? (
              <EmptyState icon="event_busy" title="No results match your search" description="Try broadening your filters or searching for something else." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activities.map(act => (
                  <div key={act.id} className="group bg-surface-container-low rounded-[32px] border border-outline-variant/10 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={act.imageUrl || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600'} 
                        alt={act.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <span className="material-symbols-outlined text-primary text-sm font-fill">star</span>
                        <span className="text-[10px] font-bold text-on-surface">4.8</span>
                      </div>
                      <div className="absolute bottom-4 left-6">
                        <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30">
                          {act.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-2xl font-bold text-on-surface leading-tight">{act.name}</h3>
                        <span className="text-primary font-serif font-bold text-xl">${act.cost}</span>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-8 line-clamp-2 italic">
                        {act.description || "Discover the essence of local culture through this curated high-fidelity experience."}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                        <div className="flex items-center gap-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {act.durationHours}h
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">group</span>
                            Small Group
                          </span>
                        </div>
                        <button 
                          onClick={() => handleAdd(act)}
                          className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                          Add to Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Current Plans */}
          <aside className="xl:col-span-4">
            <div className="sticky top-24 bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-bold text-on-surface">Upcoming Stops</h2>
                <span className="material-symbols-outlined text-primary font-fill">event</span>
              </div>
              
              <div className="space-y-6">
                {trips.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic text-center py-8">Create a trip first to start planning activities.</p>
                ) : (
                  trips.slice(0, 3).map(trip => (
                    <div key={trip.id} className="p-5 rounded-2xl bg-surface-container border border-outline-variant/10">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{trip.name}</h4>
                      <div className="space-y-3">
                        {trip.stops?.slice(0, 2).map((stop: any) => (
                          <div key={stop.id} className="flex items-center gap-3 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                            <span className="font-bold text-on-surface">{stop.city.name}</span>
                            <span className="text-[10px] text-on-surface-variant ml-auto">
                              {format(new Date(stop.arrivalDate), 'MMM d')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Pro Tip</p>
                <p className="text-xs text-on-surface-variant leading-relaxed italic">
                  "Mix intense activities with relaxation to get the most out of your journey without burning out."
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Add Activity Modal */}
      <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={`Add ${addModal?.name}`} size="md">
        <div className="space-y-8 p-2">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Select Destination Stop</label>
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {trips.flatMap(trip =>
                trip.stops?.map((stop: any) => (
                  <button 
                    key={stop.id}
                    onClick={() => setSelectedTripStop(stop.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedTripStop === stop.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface-container-low border-outline-variant/30 hover:border-primary/50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{trip.name}</p>
                        <p className="font-bold text-on-surface">📍 {stop.city?.name}</p>
                      </div>
                      {selectedTripStop === stop.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                    </div>
                  </button>
                )) || []
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setAddModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirmAdd} disabled={adding} className="btn-primary flex-1 py-4 shadow-xl shadow-primary/20">
              {adding ? 'Adding...' : 'Confirm Activity'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
