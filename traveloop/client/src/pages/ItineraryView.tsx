import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, eachDayOfInterval } from 'date-fns';
import { getTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

type View = 'list' | 'calendar';

const TYPE_ICONS: Record<string, string> = { sightseeing: '🏛️', food: '🍽️', adventure: '🧗', cultural: '🎭' };
const TYPE_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  food: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  adventure: 'bg-red-500/20 text-red-300 border-red-500/30',
  cultural: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');

  useEffect(() => {
    if (!id) return;
    getTrip(id).then(r => setTrip(r.data)).catch(() => toast.error('Failed to load trip')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container"><LoadingSkeleton type="list" count={5} /></div>;
  if (!trip) return <div className="page-container text-center py-20 text-gray-500">Trip not found</div>;

  const stops = [...(trip.stops || [])].sort((a: any, b: any) => a.order - b.order);
  const totalCost = stops.reduce((acc: number, stop: any) =>
    acc + stop.stopActivities.reduce((a: number, sa: any) => a + sa.activity.cost, 0), 0);
  const totalActivities = stops.reduce((acc: number, stop: any) => acc + stop.stopActivities.length, 0);

  return (
    <div className="page-container">
      <button onClick={() => navigate('/trips')} className="flex items-center gap-1 text-gray-400 hover:text-gray-100 transition-colors mb-4 text-sm">← Back to Trips</button>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl mb-8 h-48">
        <img src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200'} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-transparent" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h1 className="text-3xl font-bold text-white mb-1">{trip.name}</h1>
          <p className="text-gray-300 text-sm">
            {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')} · {stops.length} stops · {totalActivities} activities
          </p>
        </div>
      </div>

      {/* Actions + View toggle */}
      <div className="flex items-center gap-3 mb-6 flex-wrap no-print">
        <Link to={`/trips/${id}/build`} className="btn-secondary text-sm">Edit</Link>
        <Link to={`/trips/${id}/budget`} className="btn-secondary text-sm">Budget</Link>
        <Link to={`/trips/${id}/packing`} className="btn-secondary text-sm">Packing</Link>
        <Link to={`/trips/${id}/notes`} className="btn-secondary text-sm">Notes</Link>
        {trip.isPublic && trip.shareSlug && (
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${trip.shareSlug}`); toast.success('Share link copied!'); }} className="btn-accent text-sm">Copy Share Link</button>
        )}
        <button onClick={() => window.print()} className="btn-secondary text-sm ml-auto">Print</button>
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'}`}>List</button>
          <button onClick={() => setView('calendar')} className={`px-3 py-1.5 text-sm transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'}`}>Calendar</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-100">{stops.length}</p>
          <p className="text-sm text-gray-500">Stops</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-100">{totalActivities}</p>
          <p className="text-sm text-gray-500">Activities</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-accent">${totalCost.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Activity Cost</p>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-6">
          {stops.map((stop: any, i: number) => (
            <div key={stop.id} className="card overflow-hidden">
              {/* City Header */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-100">{stop.city.name}, {stop.city.country}</h2>
                  <p className="text-xs text-gray-500">{format(new Date(stop.arrivalDate), 'MMM d')} – {format(new Date(stop.departureDate), 'MMM d, yyyy')}</p>
                </div>
                {stop.city.coverPhoto && <img src={stop.city.coverPhoto} alt={stop.city.name} className="w-12 h-12 rounded-lg object-cover" />}
              </div>
              {/* Activities */}
              <div className="p-4 space-y-2">
                {stop.stopActivities.length === 0 ? (
                  <p className="text-gray-600 text-sm italic">No activities added yet</p>
                ) : stop.stopActivities.map((sa: any) => (
                  <div key={sa.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                    {sa.activity.imageUrl && <img src={sa.activity.imageUrl} alt={sa.activity.name} className="w-10 h-10 rounded object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">{sa.activity.name}</span>
                        <span className={`badge border ${TYPE_COLORS[sa.activity.type] || 'bg-gray-700 text-gray-400'}`}>
                          {TYPE_ICONS[sa.activity.type]} {sa.activity.type}
                        </span>
                      </div>
                      {sa.scheduledTime && <p className="text-xs text-gray-500 mt-0.5">⏰ {sa.scheduledTime}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-200">${sa.activity.cost}</p>
                      <p className="text-xs text-gray-600">{sa.activity.durationHours}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="space-y-4">
          {stops.map((stop: any) => {
            const days = eachDayOfInterval({ start: new Date(stop.arrivalDate), end: new Date(stop.departureDate) });
            return (
              <div key={stop.id} className="card overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-primary/15 to-transparent border-b border-gray-800">
                  <h2 className="font-bold text-gray-100">📍 {stop.city.name}</h2>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-800 p-0.5">
                  {days.map(day => (
                    <div key={day.toISOString()} className="bg-gray-900 p-2 min-h-16">
                      <p className="text-xs font-medium text-gray-400 mb-1">{format(day, 'EEE d')}</p>
                      {stop.stopActivities.slice(0, 2).map((sa: any) => (
                        <div key={sa.id} className="text-xs bg-primary/20 text-primary-300 rounded px-1 py-0.5 mb-0.5 truncate">{sa.activity.name}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
