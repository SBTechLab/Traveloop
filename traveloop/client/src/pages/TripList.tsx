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

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">✈️ My Trips</h1>
          <p className="text-gray-500 mt-1">{trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex items-center gap-2">
          <span>+</span> New Trip
        </Link>
      </div>

      {loading ? <LoadingSkeleton type="card" count={6} /> : trips.length === 0 ? (
        <EmptyState
          icon="✈️"
          title="No trips yet"
          description="Start planning your first adventure! The world is waiting."
          action={<Link to="/trips/new" className="btn-primary">Plan Your First Trip</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onDelete={(id) => setDeleteId(id)} />
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Trip" size="sm">
        <p className="text-gray-400 mb-5">Are you sure you want to delete this trip? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
