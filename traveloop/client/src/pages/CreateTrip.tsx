import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTrip } from '../api';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', isPublic: false, budgetCap: '' });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCoverPhoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) { toast.error('Please fill all required fields'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) { toast.error('End date must be after start date'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (coverPhoto) fd.append('coverPhoto', coverPhoto);
      const res = await createTrip(fd);
      toast.success('Trip created! 🎉 Now build your itinerary.');
      navigate(`/trips/${res.data.id}/build`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create trip');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">✈️ Plan New Trip</h1>
        <p className="text-gray-500 mt-1">Fill in the details to start building your adventure</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Cover Photo */}
        <div>
          <label className="label">Cover Photo (optional)</label>
          <div className="relative">
            {preview ? (
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setCoverPhoto(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80">Remove</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-gray-700 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                <span className="text-3xl mb-2">🖼️</span>
                <span className="text-sm text-gray-500">Click to upload cover photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="label">Trip Name <span className="text-red-500">*</span></label>
          <input id="trip-name" type="text" className="input-field" placeholder="Europe Dream Tour" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input-field resize-none" rows={3} placeholder="Describe your trip..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date <span className="text-red-500">*</span></label>
            <input id="trip-start" type="date" className="input-field" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
          </div>
          <div>
            <label className="label">End Date <span className="text-red-500">*</span></label>
            <input id="trip-end" type="date" className="input-field" value={form.endDate} min={form.startDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
          </div>
        </div>

        <div>
          <label className="label">Budget Cap (optional, $)</label>
          <input type="number" className="input-field" placeholder="e.g. 3000" value={form.budgetCap} onChange={e => setForm({ ...form, budgetCap: e.target.value })} min="0" />
        </div>

        <div className="flex items-center gap-3">
          <input id="trip-public" type="checkbox" className="w-4 h-4 rounded accent-primary" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
          <label htmlFor="trip-public" className="text-sm text-gray-400 cursor-pointer">
            Make this trip <span className="text-gray-200 font-medium">public</span> (shareable link)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button id="create-trip-submit" type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? '⏳ Creating...' : '🚀 Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
