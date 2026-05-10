import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { getTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ShareModal from '../components/ShareModal';

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTrip(id).then(r => setTrip(r.data)).catch(() => toast.error('Failed to load trip')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12"><LoadingSkeleton type="list" count={5} /></div>;
  if (!trip) return <div className="max-w-7xl mx-auto px-6 py-20 text-center text-on-surface-variant font-serif text-2xl italic">Trip not found</div>;

  const stops = [...(trip.stops || [])].sort((a: any, b: any) => a.order - b.order);
  const totalCost = stops.reduce((acc: number, stop: any) =>
    acc + stop.stopActivities.reduce((a: number, sa: any) => a + sa.activity.cost, 0), 0);
  const totalActivities = stops.reduce((acc: number, stop: any) => acc + stop.stopActivities.length, 0);
  const daysCount = Math.max(1, differenceInDays(new Date(trip.endDate), new Date(trip.startDate)));

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[450px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/20 to-transparent z-10" />
        <img 
          src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200'} 
          alt={trip.name} 
          className="w-full h-full object-cover brightness-[0.8] scale-105" 
        />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-container-max mx-auto left-0 right-0">
          <div>
            <div className="flex gap-2 mb-6">
              <span className="bg-primary/20 backdrop-blur-md text-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30">
                {daysCount} Days
              </span>
              <span className="bg-secondary/20 backdrop-blur-md text-secondary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-secondary/30">
                {stops.length} Stops
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-3 tracking-tight">{trip.name}</h1>
            <p className="text-on-surface/80 font-bold text-lg md:text-xl">
              {format(new Date(trip.startDate), 'MMMM d')} — {format(new Date(trip.endDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              to={`/trips/${id}/build`} 
              className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">edit_calendar</span>
              Edit Plan
            </Link>
            <button 
              onClick={() => setShowShareModal(true)}
              className="bg-surface-container-high/60 backdrop-blur-md text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 border border-outline-variant/30 hover:bg-surface-container-highest transition-all"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              Share
            </button>
          </div>
        </div>
      </section>

      {showShareModal && (
        <ShareModal 
          tripId={id!} 
          tripName={trip.name} 
          onClose={() => setShowShareModal(false)} 
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-primary mb-2">location_on</span>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Destinations</p>
            <p className="text-3xl font-serif font-bold text-on-surface">{stops.length}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-secondary mb-2">tour</span>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Activities</p>
            <p className="text-3xl font-serif font-bold text-on-surface">{totalActivities}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-chart-teal mb-2">payments</span>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Activity Cost</p>
            <p className="text-3xl font-serif font-bold text-primary">${totalCost.toLocaleString()}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-tertiary mb-2">group</span>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Travelers</p>
            <p className="text-3xl font-serif font-bold text-on-surface">1</p>
          </div>
        </section>

        {/* Bento Itinerary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar: Day List */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-on-surface mb-8">Daily Timeline</h3>
              <div className="space-y-3">
                {stops.map((stop: any, idx: number) => (
                  <button 
                    key={stop.id}
                    onClick={() => setActiveDay(idx)}
                    className={`w-full p-5 rounded-2xl flex flex-col items-start gap-1 transition-all border text-left ${
                      activeDay === idx 
                        ? 'bg-primary/10 border-primary shadow-lg' 
                        : 'bg-surface-container-low border-transparent hover:bg-surface-container-high hover:border-outline-variant/20'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${activeDay === idx ? 'text-primary' : 'text-on-surface-variant'}`}>
                      Day {idx + 1}
                    </span>
                    <span className={`font-bold text-sm ${activeDay === idx ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {stop.city.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Content Canvas */}
          <div className="lg:col-span-9 space-y-16">
            {stops.map((stop: any, idx: number) => (
              <section key={stop.id} className={`${activeDay !== idx && 'hidden'}`}>
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center font-serif text-2xl font-bold shadow-2xl shadow-primary/20">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </div>
                  <div>
                    <h2 className="font-serif text-4xl font-bold text-on-surface mb-2">{stop.city.name}: {stop.city.country}</h2>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      {format(new Date(stop.arrivalDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Activity List */}
                <div className="space-y-8">
                  {stop.stopActivities.length === 0 ? (
                    <div className="bg-surface-container-low p-12 rounded-3xl border border-dashed border-outline-variant/20 text-center">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">event_busy</span>
                      <p className="text-on-surface-variant italic">No activities planned for this day yet.</p>
                      <Link to={`/trips/${id}/build`} className="text-primary font-bold text-sm hover:underline mt-4 inline-block">Start building →</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {stop.stopActivities.map((sa: any, saIdx: number) => (
                        <div 
                          key={sa.id} 
                          className={`bg-surface-container-low border border-outline-variant/10 rounded-3xl overflow-hidden shadow-xl hover:shadow-primary/5 transition-all group ${saIdx % 3 === 2 ? 'md:col-span-2' : ''}`}
                        >
                          <div className="relative h-64 overflow-hidden">
                            <img 
                              src={sa.activity.imageUrl || 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600'} 
                              alt={sa.activity.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-6">
                              <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30">
                                {sa.scheduledTime || 'Unscheduled'}
                              </span>
                            </div>
                          </div>
                          <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-serif text-2xl font-bold text-on-surface">{sa.activity.name}</h4>
                              <span className="text-primary font-serif font-bold text-xl">${sa.activity.cost}</span>
                            </div>
                            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-3">
                              {sa.activity.description || "Discover the hidden gems of this location with a curated experience designed to immerse you in local culture and history."}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                              <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">schedule</span>
                                  {sa.activity.durationHours}h
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">category</span>
                                  {sa.activity.type}
                                </span>
                              </div>
                              <Link to={`/cities/${stop.city.id}/activities`} className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all">
                                <span className="material-symbols-outlined text-sm">arrow_outward</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day Connector */}
                {idx < stops.length - 1 && (
                  <div className="flex justify-center py-20">
                    <div className="h-24 w-px border-l-2 border-dashed border-outline-variant/30 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-outline-variant/30" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-outline-variant/30" />
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-24 bg-surface-container-lowest border-t border-outline-variant/10 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <span className="material-symbols-outlined text-primary text-5xl mb-6 font-fill">explore</span>
          <h2 className="font-serif text-3xl font-bold mb-4 italic">Ready to explore?</h2>
          <p className="text-on-surface-variant mb-12 leading-relaxed">
            Every great journey begins with a single step. We're here to make every step after that just as perfect.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/trips" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">My Trips</Link>
            <span className="text-outline-variant">/</span>
            <Link to="/cities" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">Discover Cities</Link>
            <span className="text-outline-variant">/</span>
            <Link to="/profile" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">Account Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
