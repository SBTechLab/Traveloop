import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCities, getTrips, createStop } from '../api';
import CityCard from '../components/CityCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const REGIONS = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Middle East'];
const INTERESTS = ['Culture', 'Beach', 'Nightlife', 'Nature', 'History', 'Tech', 'Foodie'];

export default function CitySearch() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [addModal, setAddModal] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stopForm, setStopForm] = useState({ arrivalDate: '', departureDate: '' });
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      getCities({ search: search || undefined, region: region || undefined })
        .then(r => setCities(r.data))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, region]);

  const handleAddToTrip = async (city: any) => {
    setAddModal(city);
    try {
      const r = await getTrips();
      setTrips(r.data);
    } catch { toast.error('Failed to load trips'); }
  };

  const handleConfirmAdd = async () => {
    if (!selectedTripId || !stopForm.arrivalDate || !stopForm.departureDate) { toast.error('Please fill in all fields'); return; }
    setAdding(true);
    try {
      await createStop({ tripId: selectedTripId, cityId: addModal.id, ...stopForm });
      toast.success(`${addModal.name} added to your journey!`);
      setAddModal(null);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to add stop'); }
    finally { setAdding(false); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Hero Search Section */}
      <header className="relative pt-24 pb-16 px-6 md:px-12 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight">Discover your next <span className="text-primary italic">escape.</span></h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg mb-12 leading-relaxed">
          Search thousands of destinations curated for every type of explorer, from bustling metropolises to serene coastal retreats.
        </p>
        
        <div className="max-w-3xl mx-auto relative group">
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-[28px] px-8 py-4 shadow-2xl focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-500 hover:border-primary/50">
            <span className="material-symbols-outlined text-primary text-2xl mr-4 font-fill">search</span>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-xl text-on-surface placeholder:text-on-surface-variant/30 outline-none" 
              placeholder="Where do you want to go?" 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="hidden sm:block bg-primary text-on-primary px-10 py-3 rounded-2xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
              Explore
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8 bg-surface-container-low/50 p-8 rounded-[32px] border border-outline-variant/10 shadow-xl">
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">public</span>
                  Regions
                </h3>
                <div className="space-y-4">
                  {['', ...REGIONS].map(r => (
                    <label key={r} className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${region === r ? 'bg-primary border-primary' : 'border-outline-variant/50 group-hover:border-primary/50'}`}>
                        {region === r && <span className="material-symbols-outlined text-[10px] text-on-primary font-bold">check</span>}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        name="region" 
                        checked={region === r} 
                        onChange={() => setRegion(r)} 
                      />
                      <span className={`text-sm font-bold transition-colors ${region === r ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                        {r || 'Global Explore'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-outline-variant/10">
                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(i => (
                    <button 
                      key={i} 
                      className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 hover:text-primary transition-all border border-outline-variant/10"
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-outline-variant/10">
                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  Budget Range
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {['$', '$$', '$$$', '$$$$'].map(b => (
                    <button key={b} className="py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant text-xs font-bold hover:border-primary hover:text-primary transition-all">
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Section */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-on-surface">
                  {cities.length} <span className="text-on-surface-variant font-normal">Destinations available</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Sort by:</span>
                <select className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 cursor-pointer hover:underline transition-all">
                  <option className="bg-surface-container">Most Popular</option>
                  <option className="bg-surface-container">New Additions</option>
                  <option className="bg-surface-container">A — Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <LoadingSkeleton type="card" count={6} />
              </div>
            ) : cities.length === 0 ? (
              <div className="py-24 flex flex-col items-center">
                <EmptyState icon="location_off" title="No results found" description={`We couldn't find any matches for "${search}". Try adjusting your filters or search term.`} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cities.map(city => <CityCard key={city.id} city={city} onAddToTrip={handleAddToTrip} />)}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="bg-surface-container-low py-24 text-center border-t border-outline-variant/10">
        <h2 className="font-serif text-4xl font-bold mb-6">Didn't find what you're looking for?</h2>
        <p className="text-on-surface-variant mb-10 max-w-xl mx-auto leading-relaxed">
          We're constantly adding new gems. Subscribe to our newsletter to get the latest destination alerts.
        </p>
        <div className="max-w-md mx-auto flex gap-4 px-6">
          <input className="flex-1 h-14 bg-surface px-6 rounded-xl border border-outline-variant/30 outline-none focus:border-primary transition-all" placeholder="Enter your email..." />
          <button className="bg-primary text-on-primary px-8 rounded-xl font-bold hover:brightness-110 transition-all">Notify Me</button>
        </div>
      </section>

      {/* Add to Trip Modal */}
      <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={`Journey to ${addModal?.name}`} size="md">
        <div className="space-y-8 p-2">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Select Itinerary</label>
            <select 
              className="w-full h-14 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface focus:border-primary outline-none transition-all font-bold" 
              value={selectedTripId} 
              onChange={e => setSelectedTripId(e.target.value)}
            >
              <option value="">Choose a trip...</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Arrival</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">flight_land</span>
                <input type="date" className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface focus:border-primary outline-none transition-all" value={stopForm.arrivalDate} onChange={e => setStopForm({ ...stopForm, arrivalDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Departure</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">flight_takeoff</span>
                <input type="date" className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface focus:border-primary outline-none transition-all" value={stopForm.departureDate} min={stopForm.arrivalDate} onChange={e => setStopForm({ ...stopForm, departureDate: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setAddModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirmAdd} disabled={adding} className="btn-primary flex-1 py-4 shadow-xl shadow-primary/20">
              {adding ? 'Adding Stop...' : 'Add Destination'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
