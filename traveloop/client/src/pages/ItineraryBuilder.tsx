import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTrip, createStop, deleteStop, reorderStops, getCities, getCityActivities, addActivityToStop, removeStopActivity } from '../api';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast_, { Toaster } from 'react-hot-toast';

// Sortable Stop Item
function SortableStop({ stop, onDelete, onAddActivity }: { stop: any; onDelete: (id: string) => void; onAddActivity: (stop: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`card p-4 ${isDragging ? 'shadow-2xl shadow-primary/30' : ''} transition-all`}>
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing mt-1 flex-shrink-0">⠿⠿</button>
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
          {stop.city.coverPhoto
            ? <img src={stop.city.coverPhoto} alt={stop.city.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl">🏙️</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-100">{stop.city.name}</h3>
            <span className="text-xs text-gray-500">{stop.city.country}</span>
          </div>
          <p className="text-xs text-gray-500">
            {format(new Date(stop.arrivalDate), 'MMM d')} → {format(new Date(stop.departureDate), 'MMM d, yyyy')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-primary/20 text-primary-300 border border-primary/20">
              🎯 {stop.stopActivities?.length || 0} activities
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => onAddActivity(stop)} className="btn-accent text-xs py-1 px-3">+ Activity</button>
          <button onClick={() => onDelete(stop.id)} className="btn-secondary text-xs py-1 px-2 hover:text-red-400">🗑️</button>
        </div>
      </div>
      {/* Activities list */}
      {stop.stopActivities?.length > 0 && (
        <div className="mt-3 ml-14 space-y-1.5">
          {stop.stopActivities.map((sa: any) => (
            <div key={sa.id} className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-1.5">
              <span className="text-gray-200 font-medium">{sa.activity.name}</span>
              {sa.scheduledTime && <span>@ {sa.scheduledTime}</span>}
              <span className="text-gray-600 ml-auto">${sa.activity.cost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [addingStop, setAddingStop] = useState(false);
  const [stopForm, setStopForm] = useState({ cityId: '', arrivalDate: '', departureDate: '' });

  const loadTrip = useCallback(async () => {
    if (!id) return;
    try {
      const r = await getTrip(id);
      setTrip(r.data);
      setStops([...r.data.stops].sort((a: any, b: any) => a.order - b.order));
    } catch { toast.error('Failed to load trip'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadTrip(); }, [loadTrip]);

  useEffect(() => {
    if (showAddStop) {
      getCities({ search: citySearch }).then(r => setCities(r.data));
    }
  }, [showAddStop, citySearch]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stops.findIndex(s => s.id === active.id);
    const newIndex = stops.findIndex(s => s.id === over.id);
    const newOrder = arrayMove(stops, oldIndex, newIndex);
    setStops(newOrder);
    try {
      await reorderStops(id!, newOrder.map(s => s.id));
      toast.success('Order saved');
    } catch { toast.error('Failed to reorder'); loadTrip(); }
  };

  const handleAddStop = async () => {
    if (!stopForm.cityId || !stopForm.arrivalDate || !stopForm.departureDate) { toast.error('Fill all fields'); return; }
    setAddingStop(true);
    try {
      await createStop({ tripId: id, ...stopForm });
      toast.success('Stop added!');
      setShowAddStop(false);
      setStopForm({ cityId: '', arrivalDate: '', departureDate: '' });
      loadTrip();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setAddingStop(false); }
  };

  const handleDeleteStop = async (stopId: string) => {
    try {
      await deleteStop(stopId);
      setStops(stops.filter(s => s.id !== stopId));
      toast.success('Stop removed');
    } catch { toast.error('Failed to delete stop'); }
  };

  const handleOpenActivity = async (stop: any) => {
    setSelectedStop(stop);
    setShowAddActivity(true);
    const r = await getCityActivities(stop.cityId);
    setActivities(r.data);
    setSelectedCity(stop.city);
  };

  const handleAddActivity = async (activity: any) => {
    try {
      await addActivityToStop(selectedStop.id, { activityId: activity.id });
      toast.success(`${activity.name} added!`);
      loadTrip();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const filteredActivities = activityTypeFilter ? activities.filter(a => a.type === activityTypeFilter) : activities;

  if (loading) return <div className="page-container"><LoadingSkeleton type="list" count={4} /></div>;

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-100">🗺️ {trip?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{trip?.description}</p>
        </div>
        <Link to={`/trips/${id}`} className="btn-secondary text-sm">👁 View</Link>
        <Link to={`/trips/${id}/budget`} className="btn-secondary text-sm">💰 Budget</Link>
      </div>

      {/* Quick Nav */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{label:'Packing', path:`/trips/${id}/packing`},{label:'Notes', path:`/trips/${id}/notes`},{label:'Budget', path:`/trips/${id}/budget`}].map(l => (
          <Link key={l.path} to={l.path} className="btn-secondary text-sm py-1.5">{l.label}</Link>
        ))}
      </div>

      {/* Stops */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-200">Stops ({stops.length})</h2>
        <button onClick={() => setShowAddStop(true)} className="btn-primary text-sm">+ Add Stop</button>
      </div>

      {stops.length === 0 ? (
        <EmptyState icon="📍" title="No stops yet" description="Add your first city stop to start building your itinerary."
          action={<button onClick={() => setShowAddStop(true)} className="btn-primary">+ Add First Stop</button>} />
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {stops.map(stop => (
                <SortableStop key={stop.id} stop={stop} onDelete={handleDeleteStop} onAddActivity={handleOpenActivity} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Stop Modal */}
      <Modal isOpen={showAddStop} onClose={() => setShowAddStop(false)} title="Add Stop" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Search City</label>
            <input className="input-field" placeholder="Paris, Tokyo..." value={citySearch} onChange={e => setCitySearch(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {cities.map(city => (
              <button key={city.id} onClick={() => setStopForm({ ...stopForm, cityId: city.id })}
                className={`w-full text-left p-3 rounded-lg border transition-all ${stopForm.cityId === city.id ? 'border-primary bg-primary/10 text-primary-300' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
                <span className="font-medium">{city.name}</span> <span className="text-gray-500 text-sm">— {city.country}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Arrival Date</label>
              <input type="date" className="input-field" value={stopForm.arrivalDate} onChange={e => setStopForm({ ...stopForm, arrivalDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Departure Date</label>
              <input type="date" className="input-field" value={stopForm.departureDate} min={stopForm.arrivalDate} onChange={e => setStopForm({ ...stopForm, departureDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddStop(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAddStop} disabled={addingStop || !stopForm.cityId} className="btn-primary flex-1">
              {addingStop ? 'Adding...' : 'Add Stop'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={showAddActivity} onClose={() => setShowAddActivity(false)} title={`Activities in ${selectedCity?.name}`} size="lg">
        <div className="space-y-4">
          <div className="flex gap-2">
            {['', 'sightseeing', 'food', 'adventure', 'cultural'].map(type => (
              <button key={type} onClick={() => setActivityTypeFilter(type)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activityTypeFilter === type ? 'bg-primary text-white border-primary' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {type || 'All'}
              </button>
            ))}
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredActivities.map(act => {
              const alreadyAdded = selectedStop?.stopActivities?.some((sa: any) => sa.activityId === act.id);
              return (
                <div key={act.id} className="card p-3 flex items-start gap-3">
                  {act.imageUrl && <img src={act.imageUrl} alt={act.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-200 text-sm">{act.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="badge bg-gray-800 text-gray-400 border border-gray-700">{act.type}</span>
                      <span className="text-xs text-gray-500">${act.cost} · {act.durationHours}h</span>
                    </div>
                    {act.description && <p className="text-xs text-gray-600 mt-1 line-clamp-1">{act.description}</p>}
                  </div>
                  <button onClick={() => handleAddActivity(act)} disabled={alreadyAdded}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${alreadyAdded ? 'bg-green-500/20 text-green-400 cursor-default' : 'btn-primary'}`}>
                    {alreadyAdded ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              );
            })}
            {filteredActivities.length === 0 && <p className="text-center text-gray-500 py-6">No activities found</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
