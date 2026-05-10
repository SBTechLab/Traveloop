import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCities, getTrips, createStop } from '../api';
import CityCard from '../components/CityCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const REGIONS = ['', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Middle East'];

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
    }, 300);
    return () => clearTimeout(timer);
  }, [search, region]);

  const handleAddToTrip = async (city: any) => {
    setAddModal(city);
    const r = await getTrips();
    setTrips(r.data);
  };

  const handleConfirmAdd = async () => {
    if (!selectedTripId || !stopForm.arrivalDate || !stopForm.departureDate) { toast.error('Fill all fields'); return; }
    setAdding(true);
    try {
      await createStop({ tripId: selectedTripId, cityId: addModal.id, ...stopForm });
      toast.success(`${addModal.name} added to trip!`);
      setAddModal(null);
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setAdding(false); }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">🌍 Explore Cities</h1>
        <p className="text-gray-500 mt-1">Discover destinations and add them to your trips</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            className="input-field pl-10"
            placeholder="Search cities or countries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field sm:w-48" value={region} onChange={e => setRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r} value={r}>{r || 'All Regions'}</option>)}
        </select>
      </div>

      {/* Results */}
      {loading ? <LoadingSkeleton type="card" count={6} /> : cities.length === 0 ? (
        <EmptyState icon="🔍" title="No cities found" description={`No results for "${search}". Try a different search.`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cities.map(city => <CityCard key={city.id} city={city} onAddToTrip={handleAddToTrip} />)}
        </div>
      )}

      {/* Add to Trip Modal */}
      <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={`Add ${addModal?.name} to a Trip`} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Select Trip</label>
            <select className="input-field" value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)}>
              <option value="">Choose a trip...</option>
              {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
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
            <button onClick={() => setAddModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirmAdd} disabled={adding} className="btn-primary flex-1">
              {adding ? 'Adding...' : 'Add to Trip'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
