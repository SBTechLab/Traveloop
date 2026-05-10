import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getTrips, getCities, getBudget, getPopularCities } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [upcomingBudget, setUpcomingBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([getTrips(), getCities(), getPopularCities()])
      .then(async ([tripsRes, citiesRes, popularRes]) => {
        const allTrips = tripsRes.data;
        const sortedTrips = [...allTrips].sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        setTrips(sortedTrips.slice(0, 5));
        setCities(citiesRes.data.slice(0, 4));
        setPopularCities(popularRes.data);
        
        const upcoming = sortedTrips.find((t: any) => new Date(t.startDate) >= now);
        if (upcoming) {
          try { 
            const b = await getBudget(upcoming.id); 
            setUpcomingBudget({ ...b.data, tripName: upcoming.name, startDate: upcoming.startDate }); 
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalBudget = upcomingBudget
    ? upcomingBudget.transportCost + upcomingBudget.stayCost + upcomingBudget.mealsCost + upcomingBudget.miscCost
    : 0;

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `In ${days} Days` : 'Started';
  };

  if (loading) {
    return (
      <main className="pt-24 pb-24 md:pb-12 max-w-7xl mx-auto px-6 md:px-12">
        <LoadingSkeleton type="card" count={3} />
      </main>
    );
  }

  return (
    <main className="bg-surface text-on-surface min-h-screen pt-24 pb-24 md:pb-12 max-w-7xl mx-auto px-6 md:px-12 animate-fade-in">
      {/* Welcome Hero Section */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">Member Edition</span>
              <div className="h-px w-12 bg-primary/20"></div>
            </div>
            <h1 className="font-serif text-5xl md:text-8xl font-bold mb-6 tracking-tight leading-[0.95]">
              Welcome back, <br />
              <span className="text-primary italic">{user?.name?.split(' ')[0]}.</span>
            </h1>
            <p className="font-body-lg text-on-surface-variant text-xl max-w-2xl leading-relaxed italic opacity-80">
              "Every journey starts with a single step. Yours is already halfway orchestrated."
            </p>
          </div>
          <Link to="/trips/new" className="group flex items-center gap-4 bg-primary text-on-primary px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all w-fit">
            <span className="material-symbols-outlined font-fill">add_circle</span>
            Plan New Adventure
          </Link>
        </div>
      </section>

      {/* Main Content Grid (Bento Style) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-16">
        
        {/* Left: Upcoming Trips Slider */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-bold">Upcoming Itineraries</h2>
            <div className="flex gap-3">
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-bright transition-all">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-bright transition-all">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
            {trips.length > 0 ? trips.map((trip, idx) => (
              <Link 
                key={trip.id} 
                to={`/trips/${trip.id}`}
                className="min-w-[340px] md:min-w-[440px] group bg-surface-container-low rounded-[40px] border border-outline-variant/10 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={trip.coverPhoto || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800`} 
                    alt={trip.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-90" />
                  <div className={`absolute top-6 left-6 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white/10 text-white border border-white/20'}`}>
                    {getDaysUntil(trip.startDate)}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-serif text-3xl font-bold text-on-surface mb-3 line-clamp-1">{trip.name}</h3>
                  <div className="flex items-center gap-6 mb-8 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      {trip.stops?.length || 0} Stops
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Destiny</p>
                      <p className="font-serif text-xl font-bold text-primary">{trip.stops?.[0]?.city?.name || 'Designing...'}</p>
                    </div>
                    <div className="relative w-14 h-14 rounded-full border-4 border-surface-container-high flex items-center justify-center">
                       <div className="absolute inset-[-4px] border-4 border-primary rounded-full" style={{ clipPath: 'inset(0 0 15% 0)' }}></div>
                       <span className="text-[10px] font-bold text-on-surface">85%</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="min-w-[340px] md:min-w-[440px] h-[480px] bg-surface-container-low rounded-[40px] border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center p-12 text-center group transition-all">
                 <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">travel_explore</span>
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-4">No Itineraries Yet</h3>
                 <p className="text-on-surface-variant text-sm leading-relaxed mb-8">The world is a book, and those who do not travel read only a page.</p>
                 <Link to="/trips/new" className="text-primary font-bold text-xs uppercase tracking-widest border-b border-primary/30 pb-1">Start Writing Yours</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Personal Insights Bento */}
        <aside className="xl:col-span-4 space-y-8">
           <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl font-bold text-on-surface">Financial Insight</h3>
                <span className="material-symbols-outlined text-primary font-fill">payments</span>
              </div>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Estimated Budget</p>
                    <p className="text-4xl font-serif font-bold text-on-surface">${totalBudget.toLocaleString()}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Upcoming Focus</p>
                    <p className="text-sm font-bold text-on-surface">{upcomingBudget?.tripName || 'No active trip'}</p>
                 </div>
                 <div className="pt-4 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-on-surface-variant">Savings Goal</span>
                       <span className="text-primary">75%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                       <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(255,182,144,0.3)]" style={{ width: '75%' }}></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-surface-container-high p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl font-bold text-on-surface">Popular Hubs</h3>
                <span className="material-symbols-outlined text-primary font-fill">trending_up</span>
              </div>
              
              <div className="space-y-6">
                {popularCities.map((city, idx) => (
                  <Link 
                    key={city.id} 
                    to={`/cities/${city.id}/activities`}
                    className="flex items-center justify-between group/item"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-on-surface-variant w-4">{idx + 1}</span>
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-outline-variant/20">
                        <img src={city.coverPhoto || 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=100'} alt={city.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface group-hover/item:text-primary transition-colors">{city.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{city.country}</p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-primary group-hover/item:scale-110 transition-transform">
                      {city.tripCount || 0}
                    </span>
                  </Link>
                ))}
              </div>
           </div>

           <div className="bg-primary-container p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-surface/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 text-on-primary-container">
                 <h3 className="font-serif text-2xl font-bold mb-4 italic">Pro Membership</h3>
                 <p className="text-sm leading-relaxed mb-8 opacity-80">Elite Status Unlocked: Level 4. You have 3 complimentary concierge calls remaining.</p>
                 <button className="w-full py-4 bg-on-primary-container text-primary-container rounded-2xl font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                    View Benefits
                 </button>
              </div>
           </div>
        </aside>
      </div>

      {/* Discover Section */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-serif text-4xl font-bold">Curated Discovery</h2>
          <Link to="/cities" className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group">
            Explore All Destinations
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-auto md:h-[650px]">
          {cities.length >= 4 ? (
            <>
              {/* Main Featured Item */}
              <div className="md:col-span-2 md:row-span-2 relative rounded-[40px] overflow-hidden group shadow-2xl">
                <img className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" src={cities[0].image || cities[0].coverPhoto} alt={cities[0].name} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/95 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10">
                  <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 inline-block">Trending Hub</span>
                  <h3 className="text-on-surface font-serif text-5xl font-bold mb-4">{cities[0].name}</h3>
                  <p className="text-on-surface-variant font-body-md text-lg mb-8 max-w-md line-clamp-2 italic">"{cities[0].description}"</p>
                  <Link to={`/cities/${cities[0].id}/activities`} className="bg-white text-surface px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all inline-block shadow-2xl">Discover Experiences</Link>
                </div>
              </div>
              
              {/* Secondary Bento Items */}
              <div className="md:col-span-2 relative rounded-[40px] overflow-hidden group shadow-xl">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={cities[1].image || cities[1].coverPhoto} alt={cities[1].name} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-on-surface font-serif text-3xl font-bold mb-2">{cities[1].name}</h3>
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{cities[1].country}</p>
                </div>
              </div>

              <div className="relative rounded-[40px] overflow-hidden group shadow-lg">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={cities[2].image || cities[2].coverPhoto} alt={cities[2].name} />
                <div className="absolute inset-0 bg-surface/40 group-hover:bg-surface/60 backdrop-blur-[2px] transition-all"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h4 className="text-on-surface font-serif text-2xl font-bold mb-2">{cities[2].name}</h4>
                  <span className="text-primary text-[10px] font-bold uppercase tracking-widest border-b border-primary/50 pb-1">Architecture Tour</span>
                </div>
              </div>

              <div className="relative rounded-[40px] overflow-hidden group shadow-lg">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={cities[3].image || cities[3].coverPhoto} alt={cities[3].name} />
                <div className="absolute inset-0 bg-surface/40 group-hover:bg-surface/60 backdrop-blur-[2px] transition-all"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h4 className="text-on-surface font-serif text-2xl font-bold mb-2">{cities[3].name}</h4>
                  <span className="text-primary text-[10px] font-bold uppercase tracking-widest border-b border-primary/50 pb-1">Culinary Guide</span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-4 flex flex-col items-center justify-center bg-surface-container-low rounded-[40px] p-24 text-center border border-outline-variant/10">
               <span className="material-symbols-outlined text-6xl text-primary/20 mb-6">map_search</span>
               <p className="text-on-surface-variant font-serif text-xl italic max-w-md">"Our curators are currently preparing new destination guides for your review."</p>
            </div>
          )}
        </div>
      </section>

      {/* Global Explorer Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-outline-variant/10">
        <div className="flex flex-col items-center text-center">
           <span className="text-5xl font-serif font-bold text-primary mb-2">
             {Array.from(new Set(trips.flatMap(t => t.stops?.map((s: any) => s.city?.country) || []))).length}
           </span>
           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Countries Visited</span>
        </div>
        <div className="flex flex-col items-center text-center">
           <span className="text-5xl font-serif font-bold text-primary mb-2">
             {trips.reduce((acc, t) => acc + (t.stops?.reduce((a: number, s: any) => a + (s.stopActivities?.length || 0), 0) || 0), 0)}
           </span>
           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Experiences Saved</span>
        </div>
        <div className="flex flex-col items-center text-center">
           <span className="text-5xl font-serif font-bold text-primary mb-2">
             {trips.length * 500}
           </span>
           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Explorer Points</span>
        </div>
        <div className="flex flex-col items-center text-center">
           <span className="text-5xl font-serif font-bold text-primary mb-2">
             {Math.min(100, Math.round((trips.length / 50) * 100))}%
           </span>
           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">World Unlocked</span>
        </div>
      </section>
    </main>
  );
}
