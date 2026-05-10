import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, differenceInDays, addDays } from 'date-fns';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTrip, createStop, deleteStop, reorderStops, getCities, getCityActivities, addActivityToStop, removeStopActivity } from '../api';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

// Sortable Stop Item for Sidebar
function SortableStop({ stop, isActive, onSelect, onDelete }: { stop: any; isActive: boolean; onSelect: () => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0 };

  const nights = differenceInDays(new Date(stop.departureDate), new Date(stop.arrivalDate));

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer group overflow-hidden ${
        isActive 
          ? 'bg-surface-container border-2 border-primary/40' 
          : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container'
      } ${isDragging ? 'opacity-50 shadow-2xl' : ''}`}
    >
      {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>}
      <div className="flex items-center gap-3">
        <span {...attributes} {...listeners} className={`material-symbols-outlined cursor-grab active:cursor-grabbing ${isActive ? 'text-primary' : 'text-outline group-hover:text-primary'}`}>
          drag_indicator
        </span>
        <div className="flex-1 min-w-0">
          <h4 className={`font-label-md text-sm truncate ${isActive ? 'text-on-surface font-bold' : 'text-on-surface'}`}>
            {stop.city.name}, {stop.city.country}
          </h4>
          <p className={`text-xs ${isActive ? 'text-primary/80' : 'text-on-surface-variant'}`}>
            {nights} nights • {format(new Date(stop.arrivalDate), 'MMM d')} - {format(new Date(stop.departureDate), 'MMM d')}
          </p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(stop.id); }}
          className="opacity-0 group-hover:opacity-100 material-symbols-outlined text-sm text-error hover:bg-error/10 p-1 rounded transition-all"
        >
          delete
        </button>
      </div>
    </div>
  );
}

export default function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [activeStop, setActiveStop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [addingStop, setAddingStop] = useState(false);
  const [stopForm, setStopForm] = useState({ cityId: '', arrivalDate: '', departureDate: '' });

  const loadTrip = useCallback(async (selectId?: string) => {
    if (!id) return;
    try {
      const r = await getTrip(id);
      setTrip(r.data);
      const sortedStops = [...r.data.stops].sort((a: any, b: any) => a.order - b.order);
      setStops(sortedStops);
      if (selectId) {
        setActiveStop(sortedStops.find(s => s.id === selectId));
      } else if (!activeStop && sortedStops.length > 0) {
        setActiveStop(sortedStops[0]);
      } else if (activeStop) {
        setActiveStop(sortedStops.find(s => s.id === activeStop.id));
      }
    } catch { toast.error('Failed to load trip'); }
    finally { setLoading(false); }
  }, [id, activeStop]);

  useEffect(() => { loadTrip(); }, [id]); // Initial load

  useEffect(() => {
    if (showAddStop) {
      const timer = setTimeout(() => {
        getCities({ search: citySearch }).then(r => setCities(r.data));
      }, 300);
      return () => clearTimeout(timer);
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
      const r = await createStop({ tripId: id, ...stopForm });
      toast.success('Stop added!');
      setShowAddStop(false);
      setStopForm({ cityId: '', arrivalDate: '', departureDate: '' });
      loadTrip(r.data.id);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setAddingStop(false); }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to remove this stop?')) return;
    try {
      await deleteStop(stopId);
      const newStops = stops.filter(s => s.id !== stopId);
      setStops(newStops);
      if (activeStop?.id === stopId) setActiveStop(newStops[0] || null);
      toast.success('Stop removed');
    } catch { toast.error('Failed to delete stop'); }
  };

  const openActivityModal = async () => {
    if (!activeStop) return;
    setShowAddActivity(true);
    const r = await getCityActivities(activeStop.cityId);
    setActivities(r.data);
  };

  const handleAddActivity = async (activity: any) => {
    try {
      await addActivityToStop(activeStop.id, { activityId: activity.id });
      toast.success(`${activity.name} added!`);
      loadTrip();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleRemoveActivity = async (saId: string) => {
    try {
      await removeStopActivity(saId);
      toast.success('Activity removed');
      loadTrip();
    } catch { toast.error('Failed to remove activity'); }
  };

  const filteredActivities = activityTypeFilter ? activities.filter(a => a.type === activityTypeFilter) : activities;

  if (loading) return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-surface">
      <LoadingSkeleton type="list" count={4} />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-surface">
      {/* Sidebar - Stops */}
      <aside className="w-80 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-full">
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="font-serif text-xl font-bold text-primary mb-1 truncate">{trip?.name}</h2>
          <p className="text-xs text-on-surface-variant font-medium">
            {trip && `${format(new Date(trip.startDate), 'MMM d')} — ${format(new Date(trip.endDate), 'MMM d, yyyy')}`}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Your Journey</span>
            <span className="text-xs text-outline italic">{stops.length} stops</span>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {stops.map(stop => (
                  <SortableStop 
                    key={stop.id} 
                    stop={stop} 
                    isActive={activeStop?.id === stop.id} 
                    onSelect={() => setActiveStop(stop)}
                    onDelete={handleDeleteStop}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button 
            onClick={() => setShowAddStop(true)}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant/50 rounded-xl text-on-surface-variant hover:border-primary hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_location</span>
            <span className="font-label-md font-bold">Add Stop</span>
          </button>
        </div>

        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex gap-2">
          <Link to={`/trips/${id}/budget`} className="flex-1 text-center py-2 rounded-lg bg-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-bright transition-colors">Budget</Link>
          <Link to={`/trips/${id}/notes`} className="flex-1 text-center py-2 rounded-lg bg-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-bright transition-colors">Journal</Link>
        </div>
      </aside>

      {/* Main Content - Daily Schedule */}
      <main className="flex-1 overflow-y-auto bg-surface custom-scrollbar relative">
        {activeStop ? (
          <div className="max-w-4xl mx-auto px-8 md:px-12 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <p className="font-label-md text-primary uppercase tracking-widest mb-1">Itinerary Builder</p>
                <h1 className="font-serif text-4xl font-bold text-on-surface mb-2">Daily Journey</h1>
                <p className="text-on-surface-variant">
                  Planning for <span className="font-bold text-primary">{activeStop.city.name}</span> ({format(new Date(activeStop.arrivalDate), 'MMM d')} — {format(new Date(activeStop.departureDate), 'MMM d')})
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={openActivityModal} className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary-container/20">
                  <span className="material-symbols-outlined">add</span>
                  Add Activity
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-12">
              {(() => {
                const days = differenceInDays(new Date(activeStop.departureDate), new Date(activeStop.arrivalDate)) + 1;
                const timeline = [];
                for (let i = 0; i < days; i++) {
                  const currentDate = addDays(new Date(activeStop.arrivalDate), i);
                  const dateStr = format(currentDate, 'yyyy-MM-dd');
                  // We don't strictly have 'date' on StopActivity, so we'll just show them for now or assume they are assigned to Day 1
                  const dayActivities = activeStop.stopActivities?.filter((sa: any) => sa.scheduledTime?.startsWith(dateStr)) || [];
                  
                  // For demo purposes if no scheduledTime is set, put all in Day 1 or split them
                  const displayActivities = i === 0 && dayActivities.length === 0 ? activeStop.stopActivities || [] : dayActivities;

                  timeline.push(
                    <div key={i} className="relative pl-12">
                      <div className="absolute left-[19px] top-0 bottom-[-48px] w-0.5 border-l-2 border-dashed border-outline-variant/30"></div>
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 shadow-lg ring-4 ring-surface ${i === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-surface border-2 border-primary-container text-primary'}`}>
                        {i + 1}
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl font-bold text-on-surface">{format(currentDate, 'EEEE, MMMM d')}</h3>
                        <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">
                          {i === 0 ? 'Arrival' : i === days - 1 ? 'Departure' : `Day ${i + 1}`}
                        </span>
                      </div>

                      {displayActivities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {displayActivities.map((sa: any) => (
                            <div key={sa.id} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all group relative">
                              <button 
                                onClick={() => handleRemoveActivity(sa.id)}
                                className="absolute top-2 right-2 z-20 bg-error/10 text-error p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                              <div className="h-40 relative overflow-hidden">
                                <img 
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                                  src={sa.activity.imageUrl || `https://images.unsplash.com/photo-1500835595353-b0ad2e57b591?auto=format&fit=crop&q=80&w=400`} 
                                  alt={sa.activity.name} 
                                />
                                {sa.scheduledTime && (
                                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1 rounded text-primary font-bold text-xs">
                                    {sa.scheduledTime.split('T')[1]?.substring(0, 5) || 'TBD'}
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold text-on-surface mb-1 truncate">{sa.activity.name}</h4>
                                <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 h-8">{sa.activity.description}</p>
                                <div className="flex gap-2">
                                  <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{sa.activity.type}</span>
                                  <span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${sa.activity.cost}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-surface-container-low rounded-xl p-8 border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-on-surface-variant">
                            <span className="material-symbols-outlined">event_available</span>
                          </div>
                          <h4 className="font-bold text-on-surface mb-1">Day currently free</h4>
                          <p className="text-xs text-on-surface-variant mb-4 max-w-xs">No activities scheduled for this day yet.</p>
                          <button onClick={openActivityModal} className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Browse local experiences
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
                return timeline;
              })()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <EmptyState 
              icon="location_on" 
              title="No stops selected" 
              description="Add or select a stop from the sidebar to start building your daily itinerary."
              action={<button onClick={() => setShowAddStop(true)} className="btn-primary">+ Add Your First Stop</button>}
            />
          </div>
        )}
      </main>

      {/* Add Stop Modal */}
      <Modal isOpen={showAddStop} onClose={() => setShowAddStop(false)} title="Add New Stop" size="md">
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="input-field pl-10" 
              placeholder="Where are you heading next? (e.g. Paris)" 
              value={citySearch} 
              onChange={e => setCitySearch(e.target.value)} 
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {cities.map(city => (
              <button 
                key={city.id} 
                onClick={() => setStopForm({ ...stopForm, cityId: city.id })}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  stopForm.cityId === city.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-outline-variant/30 bg-surface-container hover:border-outline'
                }`}
              >
                <div className="font-bold">{city.name}</div>
                <div className="text-xs text-on-surface-variant">{city.country} • {city.region}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Arrival</label>
              <input type="date" className="input-field" value={stopForm.arrivalDate} onChange={e => setStopForm({ ...stopForm, arrivalDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Departure</label>
              <input type="date" className="input-field" value={stopForm.departureDate} min={stopForm.arrivalDate} onChange={e => setStopForm({ ...stopForm, departureDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAddStop(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAddStop} disabled={addingStop || !stopForm.cityId} className="btn-primary flex-1">
              {addingStop ? 'Adding...' : 'Confirm Stop'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={showAddActivity} onClose={() => setShowAddActivity(false)} title={`Discover in ${activeStop?.city.name}`} size="lg">
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {['', 'sightseeing', 'food', 'adventure', 'cultural'].map(type => (
              <button 
                key={type} 
                onClick={() => setActivityTypeFilter(type)}
                className={`text-xs px-4 py-2 rounded-full border whitespace-nowrap transition-all font-bold tracking-wide uppercase ${
                  activityTypeFilter === type 
                    ? 'bg-primary text-on-primary border-primary' 
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-outline'
                }`}
              >
                {type || 'All Highlights'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {filteredActivities.map(act => {
              const alreadyAdded = activeStop?.stopActivities?.some((sa: any) => sa.activityId === act.id);
              return (
                <div key={act.id} className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/30 flex items-start gap-4 hover:border-primary/50 transition-all group">
                  {act.imageUrl && (
                    <img src={act.imageUrl} alt={act.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface text-sm mb-1 truncate">{act.name}</h4>
                    <p className="text-[10px] text-on-surface-variant line-clamp-2 mb-2">{act.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-primary">${act.cost}</span>
                      <span className="text-[10px] text-outline">• {act.durationHours}h</span>
                    </div>
                    <button 
                      onClick={() => handleAddActivity(act)} 
                      disabled={alreadyAdded}
                      className={`w-full text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-all ${
                        alreadyAdded 
                          ? 'bg-primary/10 text-primary cursor-default' 
                          : 'bg-primary-container text-on-primary-container hover:opacity-90'
                      }`}
                    >
                      {alreadyAdded ? '✓ Selected' : '+ Add to Plan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              No matching activities found for this city.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
