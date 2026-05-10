import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getSharedTrip, copySharedTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS: Record<string, string> = { sightseeing: '🏛️', food: '🍽️', adventure: '🧗', cultural: '🎭' };

export default function SharedItinerary() {
  const { shareSlug } = useParams<{ shareSlug: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shareSlug) return;
    getSharedTrip(shareSlug)
      .then(r => setTrip(r.data))
      .catch(() => { /* handled below */ })
      .finally(() => setLoading(false));
  }, [shareSlug]);

  const handleCopy = async () => {
    if (!user) { navigate('/login'); return; }
    setCopying(true);
    try {
      const r = await copySharedTrip(shareSlug!);
      toast.success('Trip copied to your account! 🎉');
      navigate(`/trips/${r.data.tripId}/build`);
    } catch { toast.error('Failed to copy trip'); }
    finally { setCopying(false); }
  };

  const shareUrl = window.location.href;
  const twitterUrl = `https://twitter.com/intent/tweet?text=Check%20out%20my%20trip%20on%20Traveloop!&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=Check%20out%20my%20trip%20on%20Traveloop!%20${encodeURIComponent(shareUrl)}`;

  if (loading) return <div className="page-container"><LoadingSkeleton type="card" count={3} /></div>;

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Trip Not Found</h1>
        <p className="text-gray-500 mb-6">This trip may be private or the link is invalid.</p>
        <Link to="/" className="btn-primary">Go to Traveloop</Link>
      </div>
    </div>
  );

  const stops = [...(trip.stops || [])].sort((a: any, b: any) => a.order - b.order);
  const totalCost = trip.budget ? trip.budget.transportCost + trip.budget.stayCost + trip.budget.mealsCost + trip.budget.miscCost : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header bar */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">T</span>
          </div>
          <span className="font-bold bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">Traveloop</span>
        </Link>
        <div className="flex gap-2 flex-wrap">
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">🐦 Twitter</a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">💬 WhatsApp</a>
          <button onClick={handleCopy} disabled={copying} className="btn-primary text-xs py-1.5 px-3">
            {copying ? 'Copying...' : '📋 Copy This Trip'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Trip Hero */}
        <div className="relative h-56 rounded-2xl overflow-hidden mb-8">
          <img src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200'} alt={trip.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <p className="text-xs text-gray-400 mb-1">Shared by {trip.user?.name}</p>
            <h1 className="text-3xl font-bold text-white mb-1">{trip.name}</h1>
            <p className="text-gray-300 text-sm">
              {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
              · {stops.length} stops
            </p>
          </div>
        </div>

        {trip.description && <p className="text-gray-400 mb-6 card p-4">{trip.description}</p>}

        {/* Budget Summary */}
        {totalCost > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[['🚂 Transport', trip.budget?.transportCost], ['🏨 Stay', trip.budget?.stayCost], ['🍽️ Meals', trip.budget?.mealsCost], ['🛍️ Misc', trip.budget?.miscCost]].map(([l, v]) => (
              <div key={l as string} className="card p-3 text-center">
                <p className="text-xs text-gray-500">{l}</p>
                <p className="text-base font-bold text-gray-200">${(v as number || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Stops & Activities */}
        <div className="space-y-6">
          {stops.map((stop: any, i: number) => (
            <div key={stop.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-gray-800">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">{i + 1}</div>
                <div>
                  <h2 className="font-bold text-gray-100">{stop.city.name}, {stop.city.country}</h2>
                  <p className="text-xs text-gray-500">{format(new Date(stop.arrivalDate), 'MMM d')} – {format(new Date(stop.departureDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {stop.stopActivities.length === 0 ? (
                  <p className="text-gray-600 text-sm italic">No activities</p>
                ) : stop.stopActivities.map((sa: any) => (
                  <div key={sa.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-lg">{TYPE_ICONS[sa.activity.type] || '📌'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200">{sa.activity.name}</p>
                      {sa.scheduledTime && <p className="text-xs text-gray-500">⏰ {sa.scheduledTime}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-200">${sa.activity.cost}</p>
                      <p className="text-xs text-gray-600">{sa.activity.durationHours}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center card p-8">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Love this itinerary?</h2>
          <p className="text-gray-500 mb-4">Copy it to your Traveloop account and start customizing!</p>
          <button onClick={handleCopy} disabled={copying} className="btn-primary px-8 py-3 text-base">
            {copying ? 'Copying...' : '📋 Copy This Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
