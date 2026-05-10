import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTrip } from '../api';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverPhoto: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in name and dates');
      return;
    }

    setLoading(true);
    try {
      const r = await createTrip(formData);
      toast.success('Trip created! Start adding stops.');
      navigate(`/trips/${r.data.id}/build`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary/30">
      {/* Focused Header */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-serif text-2xl font-bold text-primary">Traveloop</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-on-surface-variant font-bold hover:text-primary transition-colors text-sm"
        >
          Exit
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-2xl">
          {/* Step Indicator (Visual Only) */}
          <nav className="flex items-center justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-highest -z-10 -translate-y-1/2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold ring-4 ring-surface shadow-lg">1</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Basics</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-surface">2</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Stops</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-surface">3</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Activities</span>
            </div>
          </nav>

          {/* Form Content */}
          <div className="bg-surface-container-low rounded-2xl shadow-2xl border border-outline-variant/10 p-8 md:p-12">
            <div className="mb-10 text-center">
              <h1 className="font-serif text-4xl font-bold text-on-surface mb-3">New Adventure</h1>
              <p className="text-on-surface-variant">Tell us the basics to start crafting your unique itinerary.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Trip Name */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-on-surface uppercase tracking-wider" htmlFor="name">Trip Name</label>
                <input 
                  className="w-full h-14 px-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all text-on-surface outline-none placeholder:text-on-surface-variant/30" 
                  id="name"
                  placeholder="e.g., European Summer Expedition" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  type="text"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-on-surface uppercase tracking-wider" htmlFor="startDate">Start Date</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">calendar_today</span>
                    <input 
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all text-on-surface outline-none" 
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-on-surface uppercase tracking-wider" htmlFor="endDate">End Date</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">event</span>
                    <input 
                      className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all text-on-surface outline-none" 
                      id="endDate"
                      type="date"
                      min={formData.startDate}
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-on-surface uppercase tracking-wider" htmlFor="description">Description (Optional)</label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all text-on-surface outline-none resize-none placeholder:text-on-surface-variant/30" 
                  id="description"
                  placeholder="What's the vibe of this journey?" 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
                <button 
                  disabled={loading}
                  className="w-full sm:flex-1 h-14 bg-primary-container text-on-primary-container font-bold rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                  type="submit"
                >
                  {loading ? 'Creating...' : (
                    <>
                      <span>Start Planning</span>
                      <span className="material-symbols-outlined">explore</span>
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-8 h-14 border border-outline-variant/30 text-on-surface font-bold rounded-xl hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Contextual Help */}
          <div className="mt-8 flex items-center gap-3 p-4 bg-primary-container/10 rounded-xl border border-primary-container/20">
            <span className="material-symbols-outlined text-primary font-fill">info</span>
            <p className="text-on-surface-variant text-xs">
              You can always change these details later in your trip settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
