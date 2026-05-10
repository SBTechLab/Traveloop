import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTrips, deleteTrip } from '../api';
import TripCard from '../components/TripCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function TripList() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    getTrips().then(r => setTrips(r.data)).catch(() => toast.error('Failed to load trips')).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTrip(deleteId);
      setTrips(trips.filter(t => t.id !== deleteId));
      toast.success('Trip deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const filteredTrips = trips.filter(trip => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (filter === 'upcoming') return start > today || (start <= today && end >= today);
    if (filter === 'past') return end < today;
    return true;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Header */}
      <header className="pt-24 pb-12 px-6 md:px-12 border-b border-outline-variant/10 bg-surface-container-lowest/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 tracking-tight">Your <span className="text-primary italic">Adventures.</span></h1>
            <p className="text-on-surface-variant font-bold text-lg">{trips.length} journeys planned across the globe.</p>
          </div>
          <Link 
            to="/trips/new" 
            className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all w-fit"
          >
            <span className="material-symbols-outlined font-fill">add_circle</span>
            New Trip
          </Link>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto mt-12 flex bg-surface-container-low p-1.5 rounded-2xl w-fit border border-outline-variant/10 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-surface-container-highest text-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            All Trips
          </button>
          <button 
            onClick={() => setFilter('upcoming')}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'upcoming' ? 'bg-surface-container-highest text-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilter('past')}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'past' ? 'bg-surface-container-highest text-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Past Memories
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton type="card" count={6} />
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="py-20 flex flex-col items-center">
            <EmptyState
              icon="travel_explore"
              title="No adventures found"
              description={filter === 'all' ? "The world is waiting for your first step. Start planning today!" : `No ${filter} trips found in your collection.`}
              action={<Link to="/trips/new" className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all mt-8">Begin Your Journey</Link>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} onDelete={(id) => setDeleteId(id)} />
            ))}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-24 bg-surface-container-lowest border-t border-outline-variant/10 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <span className="material-symbols-outlined text-primary text-5xl mb-6 font-fill">flight_takeoff</span>
          <h2 className="font-serif text-3xl font-bold mb-4 italic">Where to next?</h2>
          <p className="text-on-surface-variant mb-12 leading-relaxed">
            Your travel story is still being written. Discover new cities and add them to your bucket list.
          </p>
          <Link to="/cities" className="bg-surface-container-high text-on-surface px-10 py-4 rounded-2xl font-bold border border-outline-variant/30 hover:bg-surface-bright transition-all">
            Explore Destinations
          </Link>
        </div>
      </footer>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Trip" size="sm">
        <div className="p-2">
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Are you sure you want to remove this journey? All planned stops, activities, and budget data will be permanently deleted.
          </p>
          <div className="flex gap-4">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="bg-error text-white font-bold py-3 rounded-xl flex-1 hover:brightness-110 active:scale-95 transition-all">
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
