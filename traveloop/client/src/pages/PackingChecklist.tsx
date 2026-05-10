import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPackingItems, addPackingItem, updatePackingItem, deletePackingItem, resetPackingItems } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'other'];
const CAT_ICONS: Record<string, string> = { clothing: '👕', documents: '📄', electronics: '💻', toiletries: '🧴', other: '📦' };
const CAT_COLORS: Record<string, string> = { clothing: 'bg-blue-500/20 text-blue-300', documents: 'bg-yellow-500/20 text-yellow-300', electronics: 'bg-purple-500/20 text-purple-300', toiletries: 'bg-green-500/20 text-green-300', other: 'bg-gray-500/20 text-gray-300' };

export default function PackingChecklist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'clothing' });
  const [adding, setAdding] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const load = () => getPackingItems(id!).then(r => setItems(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  useEffect(() => { if (id) load(); }, [id]);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Enter an item name'); return; }
    setAdding(true);
    try {
      const r = await addPackingItem(id!, form);
      setItems([...items, r.data]);
      setForm({ name: '', category: 'clothing' });
      setShowAdd(false);
      toast.success('Item added!');
    } catch { toast.error('Failed to add'); }
    finally { setAdding(false); }
  };

  const togglePacked = async (item: any) => {
    try {
      const r = await updatePackingItem(item.id, { isPacked: !item.isPacked });
      setItems(items.map(i => i.id === item.id ? r.data : i));
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deletePackingItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
      toast.success('Removed');
    } catch { toast.error('Failed to delete'); }
  };

  const handleReset = async () => {
    try {
      await resetPackingItems(id!);
      setItems(items.map(i => ({ ...i, isPacked: false })));
      toast.success('All items reset');
      setShowReset(false);
    } catch { toast.error('Failed to reset'); }
  };

  const packed = items.filter(i => i.isPacked).length;
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div className="page-container"><LoadingSkeleton type="list" count={5} /></div>;

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-gray-400 hover:text-gray-100 transition-colors mb-1 text-sm">← Back to Trip</button>
          <h1 className="text-3xl font-bold text-gray-100">Packing Checklist</h1>
          <p className="text-gray-500 mt-1">{packed} of {items.length} items packed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowReset(true)} className="btn-secondary text-sm" disabled={items.length === 0}>Reset</button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">+ Add Item</button>
        </div>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Packing Progress</span>
            <span className={`font-semibold ${packed === items.length ? 'text-accent' : 'text-primary-300'}`}>
              {packed === items.length ? 'All packed!' : `${Math.round((packed / items.length) * 100)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full transition-all duration-500 ${packed === items.length ? 'bg-accent' : 'bg-primary'}`}
              style={{ width: `${items.length ? (packed / items.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="🧳" title="Nothing packed yet" description="Start adding items to your packing list."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add First Item</button>} />
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map(cat => grouped[cat]?.length > 0 && (
            <div key={cat}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                <span>{CAT_ICONS[cat]}</span> {cat} ({grouped[cat].length})
              </h3>
              <div className="space-y-2">
                {grouped[cat].map(item => (
                  <div key={item.id} className={`card p-3 flex items-center gap-3 transition-all ${item.isPacked ? 'opacity-60' : ''}`}>
                    <button onClick={() => togglePacked(item)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.isPacked ? 'bg-accent border-accent text-white' : 'border-gray-600 hover:border-primary'}`}>
                      {item.isPacked && '✓'}
                    </button>
                    <span className={`flex-1 text-sm ${item.isPacked ? 'line-through text-gray-600' : 'text-gray-200'}`}>{item.name}</span>
                    <span className={`badge text-xs ${CAT_COLORS[item.category]}`}>{item.category}</span>
                    <button onClick={() => handleDelete(item.id)} className="text-gray-700 hover:text-red-400 transition-colors text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Packing Item" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Item Name</label>
            <input className="input-field" placeholder="e.g. Passport" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAdd} disabled={adding} className="btn-primary flex-1">{adding ? 'Adding...' : 'Add Item'}</button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirm */}
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset All Items" size="sm">
        <p className="text-gray-400 mb-5">This will uncheck all packed items. Continue?</p>
        <div className="flex gap-3">
          <button onClick={() => setShowReset(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleReset} className="btn-danger flex-1">Reset All</button>
        </div>
      </Modal>
    </div>
  );
}
