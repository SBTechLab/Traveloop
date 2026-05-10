import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCityActivities, getCity, getTrips, addActivityToStop } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const TYPE_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-500/20 text-blue-300',
  food: 'bg-orange-500/20 text-orange-300',
  adventure: 'bg-red-500/20 text-red-300',
  cultural: 'bg-purple-500/20 text-purple-300',
};

export default function ActivitySearch() {
  const { cityId } = useParams<{ cityId: string }>();
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

  useEffect(() => {
    if (!cityId) return;
    Promise.all([getCity(cityId), getCityActivities(cityId)])
      .then(([cityRes, actRes]) => { setCity(cityRes.data); setActivities(actRes.data); })
      .finally(() => setLoading(false));
  }, [cityId]);

  const handleFilterChange = async () => {
    if (!cityId) return;
    const params: any = {};
    if (typeFilter) params.type = typeFilter;
    if (maxCost) params.maxCost = maxCost;
    if (maxDuration) params.maxDuration = maxDuration;
    const r = await getCityActivities(cityId, params);
    setActivities(r.data);
  };

  useEffect(() => { handleFilterChange(); }, [typeFilter, maxCost, maxDuration]);

  const handleAdd = async (activity: any) => {
    const r = await getTrips();
    setTrips(r.data);
    setAddModal(activity);
  };

  const handleConfirmAdd = async () => {
    if (!selectedTripStop) { toast.error('Select a stop'); return; }
    setAdding(true);
    try {
      await addActivityToStop(selectedTripStop, { activityId: addModal.id });
      toast.success(`${addModal.name} added!`);
      setAddModal(null);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setAdding(false); }
  };

  if (loading) return <div className="page-container"><LoadingSkeleton type="card" count={6} /></div>;

  return (
    <div className="page-container">
      {/* City hero */}
      {city && (
        <div className="relative h-40 rounded-2xl overflow-hidden mb-8">
          <img src={city.coverPhoto || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200'} alt={city.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h1 className="text-2xl font-bold text-white">🎯 Activities in {city.name}</h1>
            <p className="text-gray-300 text-sm">{city.country} · {activities.length} activities available</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['', 'sightseeing', 'food', 'adventure', 'cultural'].map(type => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-full text-sm border transition-all font-medium ${typeFilter === type ? 'bg-primary text-white border-primary' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
            {type || 'All'} {type === 'sightseeing' ? '🏛️' : type === 'food' ? '🍽️' : type === 'adventure' ? '🧗' : type === 'cultural' ? '🎭' : ''}
          </button>
        ))}
        <input type="number" placeholder="Max cost $" className="input-field w-32 py-2" value={maxCost} onChange={e => setMaxCost(e.target.value)} />
        <input type="number" placeholder="Max hours" className="input-field w-28 py-2" value={maxDuration} onChange={e => setMaxDuration(e.target.value)} step="0.5" />
      </div>

      {/* Activity Grid */}
      {activities.length === 0 ? (
        <EmptyState icon="🎯" title="No activities found" description="Try adjusting your filters" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map(act => (
            <div key={act.id} className="card overflow-hidden hover:border-primary/40 transition-all duration-300 group">
              {act.imageUrl && (
                <div className="h-36 overflow-hidden">
                  <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display='none'; }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-100 text-sm leading-tight">{act.name}</h3>
                  <span className={`badge flex-shrink-0 ${TYPE_COLORS[act.type] || 'bg-gray-700 text-gray-400'}`}>{act.type}</span>
                </div>
                {act.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{act.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>💵 ${act.cost}</span>
                    <span>⏱️ {act.durationHours}h</span>
                  </div>
                  <button onClick={() => handleAdd(act)} className="btn-primary text-xs py-1.5 px-3">+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add to Stop Modal */}
      <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={`Add "${addModal?.name}" to Trip`} size="md">
        <div className="space-y-4">
          <label className="label">Select a Stop</label>
          <select className="input-field" value={selectedTripStop} onChange={e => setSelectedTripStop(e.target.value)}>
            <option value="">Choose a stop...</option>
            {trips.flatMap(trip =>
              trip.stops?.map((stop: any) => (
                <option key={stop.id} value={stop.id}>{trip.name} → {stop.city?.name}</option>
              )) || []
            )}
          </select>
          <div className="flex gap-3">
            <button onClick={() => setAddModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirmAdd} disabled={adding} className="btn-primary flex-1">
              {adding ? 'Adding...' : 'Add Activity'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
