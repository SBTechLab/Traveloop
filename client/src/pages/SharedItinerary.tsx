import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getSharedTrip, copySharedTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../store/AuthContext';

const TYPE_ICONS: Record<string, string> = { 
  sightseeing: '🏛️', 
  food: '🍽️', 
  adventure: '🧗', 
  cultural: '🎭' 
};

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

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <LoadingSkeleton type="card" count={3} />
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-8">
        <span className="material-symbols-outlined text-5xl text-outline-variant">lock</span>
      </div>
      <h1 className="font-serif text-4xl font-bold text-on-surface mb-3">Expedition Not Found</h1>
      <p className="text-on-surface-variant mb-8 max-w-md">This trip may be private or the link is invalid. Check with the explorer who shared it.</p>
      <Link to="/" className="btn-primary px-8 py-3">Explore Other Journeys</Link>
    </div>
  );

  const stops = [...(trip.stops || [])].sort((a: any, b: any) => a.order - b.order);
  const totalCost = trip.budget ? (trip.budget.transportCost || 0) + (trip.budget.stayCost || 0) + (trip.budget.mealsCost || 0) + (trip.budget.miscCost || 0) : 0;

  return (
    <div className="min-h-screen bg-surface">
      {/* Dynamic Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 h-16">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-primary">Traveloop</Link>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex gap-2">
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-sm">share</span>
                </a>
             </div>
             <button 
                onClick={handleCopy} 
                disabled={copying}
                className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {copying ? 'Copying...' : 'Copy Itinerary'}
              </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-16">
        <div className="relative h-[45vh] min-h-[400px] w-full overflow-hidden">
          <img 
            src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600'} 
            alt={trip.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
            <div className="max-w-5xl mx-auto">
               <div className="flex items-center gap-3 mb-4">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20 backdrop-blur-md">
                    Shared Expedition
                  </span>
                  <span className="text-on-surface-variant text-xs font-medium">Shared by {trip.user?.name}</span>
               </div>
               <h1 className="font-serif text-5xl md:text-7xl font-bold text-on-surface mb-4 leading-tight tracking-tight">
                {trip.name}
               </h1>
               <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-medium">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm font-fill">calendar_today</span>
                    {format(new Date(trip.startDate), 'MMM d')} — {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm font-fill">location_on</span>
                    {stops.length} Destinations
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {trip.description && (
          <div className="mb-16">
            <p className="text-xl text-on-surface-variant leading-relaxed font-medium max-w-3xl italic">
              "{trip.description}"
            </p>
          </div>
        )}

        {/* Budget Snapshot */}
        {totalCost > 0 && (
          <section className="mb-20">
            <h2 className="font-serif text-2xl font-bold text-on-surface mb-8">Estimated Investment</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Transport', value: trip.budget?.transportCost, icon: 'flight' },
                { label: 'Accommodation', value: trip.budget?.stayCost, icon: 'hotel' },
                { label: 'Activities', value: trip.budget?.mealsCost, icon: 'local_activity' },
                { label: 'Miscellaneous', value: trip.budget?.miscCost, icon: 'shopping_bag' }
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">${(item.value || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Journey Timeline */}
        <section className="space-y-12">
          <h2 className="font-serif text-2xl font-bold text-on-surface mb-8">The Journey Outline</h2>
          {stops.map((stop: any, i: number) => (
            <div key={stop.id} className="relative pl-12 pb-12">
              {i !== stops.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 border-l-2 border-dashed border-outline-variant/30"></div>
              )}
              <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 flex items-center justify-center font-bold text-primary z-10 shadow-lg">
                {i + 1}
              </div>
              
              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 shadow-xl">
                <div className="p-6 md:p-8 border-b border-outline-variant/10 bg-surface-container-low/30">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-on-surface">{stop.city.name}, {stop.city.country}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {format(new Date(stop.arrivalDate), 'MMMM d')} — {format(new Date(stop.departureDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="bg-surface-variant/50 px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant uppercase tracking-widest self-start md:self-center">
                      {stop.stopActivities?.length || 0} Experiences
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stop.stopActivities.length === 0 ? (
                    <p className="text-on-surface-variant text-sm italic">No specific activities listed for this stop.</p>
                  ) : stop.stopActivities.map((sa: any) => (
                    <div key={sa.id} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-2xl shadow-inner">
                        {TYPE_ICONS[sa.activity.type] || '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{sa.activity.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                          {sa.activity.type} • {sa.activity.durationHours}h
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">${sa.activity.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section className="mt-24 bg-primary-container/20 rounded-[32px] p-12 text-center border border-primary-container/30 backdrop-blur-sm shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mb-4">Inspired by this journey?</h2>
          <p className="text-on-surface-variant mb-8 max-w-xl mx-auto leading-relaxed">
            Traveloop allows you to copy shared itineraries directly into your account so you can start personalizing them for your own adventure.
          </p>
          <button 
            onClick={handleCopy} 
            disabled={copying}
            className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center gap-3 mx-auto"
          >
            {copying ? 'Copying...' : (
              <>
                <span className="material-symbols-outlined">auto_fix_high</span>
                Customize This Expedition
              </>
            )}
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-outline-variant/10 text-center">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          Created with <span className="text-primary mx-1">Traveloop</span> expedition tools
        </p>
      </footer>
    </div>
  );
}
