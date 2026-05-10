import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPackingItems, addPackingItem, updatePackingItem, deletePackingItem, resetPackingItems, getTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'other'];
const CAT_ICONS: Record<string, string> = { clothing: 'apparel', documents: 'description', electronics: 'devices', toiletries: 'medication', other: 'inventory_2' };

export default function PackingChecklist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'clothing' });
  const [adding, setAdding] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const load = async () => {
    try {
      const [tripRes, itemsRes] = await Promise.all([getTrip(id!), getPackingItems(id!)]);
      setTrip(tripRes.data);
      setItems(itemsRes.data);
    } catch { toast.error('Failed to load checklist'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Enter an item name'); return; }
    setAdding(true);
    try {
      const r = await addPackingItem(id!, form);
      setItems([...items, r.data]);
      setForm({ name: '', category: 'clothing' });
      setShowAdd(false);
      toast.success('Item added');
    } catch { toast.error('Failed to add'); }
    finally { setAdding(false); }
  };

  const togglePacked = async (item: any) => {
    try {
      const r = await updatePackingItem(item.id, { isPacked: !item.isPacked });
      setItems(items.map(i => i.id === item.id ? r.data : i));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deletePackingItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
      toast.success('Removed');
    } catch { toast.error('Delete failed'); }
  };

  const handleReset = async () => {
    try {
      await resetPackingItems(id!);
      setItems(items.map(i => ({ ...i, isPacked: false })));
      toast.success('List reset');
      setShowReset(false);
    } catch { toast.error('Reset failed'); }
  };

  const packedCount = items.filter(i => i.isPacked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
  
  // Progress Ring logic
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <LoadingSkeleton type="list" count={5} />
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-surface min-h-screen">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-4">
            <Link to="/trips" className="text-xs font-bold uppercase tracking-wider hover:text-primary transition-colors">Trips</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-xs font-bold uppercase tracking-wider">{trip?.name}</span>
          </nav>
          <h1 className="font-serif text-5xl font-bold text-primary">Packing Essentials</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Your curated checklist for the upcoming journey.</p>
        </div>
        
        <div className="flex items-center gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 shadow-xl">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r={radius} stroke="currentColor" strokeWidth="6"></circle>
              <circle 
                className="text-primary-container transition-all duration-700 ease-out" 
                cx="40" cy="40" fill="transparent" r={radius} stroke="currentColor" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                strokeLinecap="round" strokeWidth="6"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-on-surface">{progressPercent}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-on-surface uppercase tracking-wider">{packedCount} of {totalCount} Packed</p>
            <div className="flex gap-4">
              <button onClick={() => setShowReset(true)} className="text-primary font-bold text-[10px] uppercase hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reset List
              </button>
              <button onClick={() => setShowAdd(true)} className="text-secondary font-bold text-[10px] uppercase hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      {items.length === 0 ? (
        <EmptyState 
          icon="inventory_2" 
          title="List is Empty" 
          description="Start adding items to your packing list. We can help you categorize them."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add First Item</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map(cat => grouped[cat]?.length > 0 && (
            <section key={cat} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-lg h-fit">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary font-fill">{CAT_ICONS[cat]}</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-on-surface capitalize">{cat}</h2>
              </div>
              <ul className="space-y-3">
                {grouped[cat].map(item => (
                  <li key={item.id} className="flex items-center gap-3 group">
                    <button 
                      onClick={() => togglePacked(item)}
                      className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                        item.isPacked 
                          ? 'bg-primary-container border-primary-container text-on-primary-container shadow-lg shadow-primary-container/20' 
                          : 'border-outline-variant/50 hover:border-primary'
                      }`}
                    >
                      {item.isPacked && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </button>
                    <span className={`flex-1 text-sm font-medium transition-all ${item.isPacked ? 'line-through text-on-surface-variant/40' : 'text-on-surface'}`}>
                      {item.name}
                    </span>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-error hover:bg-error/10 p-1 rounded transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          
          {/* Add Item Card */}
          <section className="bg-surface-container-highest/30 p-8 rounded-2xl flex flex-col justify-center gap-4 border-2 border-dashed border-outline-variant/20 hover:border-primary/30 transition-all group">
            <h3 className="font-serif text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">Add Essentials</h3>
            <p className="text-xs text-on-surface-variant mb-2">Forget something? Add it here instantly.</p>
            <div className="relative">
              <input 
                className="w-full h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-all pr-12" 
                placeholder="What else..." 
                type="text"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      setForm({ ...form, name: val });
                      handleAdd();
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button 
                onClick={() => setShowAdd(true)}
                className="absolute right-2 top-2 w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
               {['Swiss Knife', 'Camera', 'Adapter', 'Powerbank'].map(s => (
                 <span 
                   key={s} 
                   onClick={() => { setForm({ name: s, category: 'electronics' }); handleAdd(); }}
                   className="bg-surface-container-low border border-outline-variant/20 text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 hover:text-primary cursor-pointer transition-all"
                 >
                   + {s}
                 </span>
               ))}
            </div>
          </section>
        </div>
      )}

      {/* Large Imagery Break */}
      <div className="mt-20 rounded-[32px] overflow-hidden h-64 relative border border-outline-variant/10 shadow-2xl">
        <img 
          alt="Adventure theme" 
          className="w-full h-full object-cover opacity-40 brightness-75 scale-110 hover:scale-100 transition-transform duration-1000" 
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent flex flex-col justify-end p-12">
          <p className="font-serif text-3xl font-bold text-on-surface">Adventure is calling. <br /><span className="text-primary">Be prepared.</span></p>
        </div>
      </div>

      {/* Detailed Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Packing Item" size="sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Item Name</label>
            <input 
              className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface focus:border-primary outline-none transition-all" 
              placeholder="e.g. Passport" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} 
              autoFocus 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <button 
                  key={c}
                  onClick={() => setForm({ ...form, category: c })}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    form.category === c 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-outline-variant/30 hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{CAT_ICONS[c]}</span>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAdd} disabled={adding} className="btn-primary flex-1">
              {adding ? 'Adding...' : 'Confirm Item'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation */}
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset Checklist" size="sm">
        <div className="p-2">
          <p className="text-on-surface-variant mb-8">This will uncheck all items in your list. Are you sure you want to start over?</p>
          <div className="flex gap-4">
            <button onClick={() => setShowReset(false)} className="btn-secondary flex-1">Keep List</button>
            <button onClick={handleReset} className="bg-error text-on-error py-3 rounded-xl font-bold flex-1 active:scale-95 transition-all">Yes, Reset All</button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
