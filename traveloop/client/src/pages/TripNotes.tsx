import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { getNotes, createNote, updateNote, deleteNote, getTrip } from '../api';
import { useAuth } from '../store/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function TripNotes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getTrip(id), getNotes(id)])
      .then(([tripRes, notesRes]) => { setTrip(tripRes.data); setNotes(notesRes.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!content.trim()) { toast.error('Write something first'); return; }
    setAdding(true);
    try {
      const r = await createNote(id!, { content, stopId: selectedStop || undefined });
      setNotes([r.data, ...notes]);
      setContent('');
      setSelectedStop('');
      toast.success('Note saved!');
    } catch { toast.error('Failed to add note'); }
    finally { setAdding(false); }
  };

  const handleEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      const r = await updateNote(noteId, { content: editContent });
      setNotes(notes.map(n => n.id === noteId ? r.data : n));
      setEditingId(null);
      toast.success('Note updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="page-container"><LoadingSkeleton type="list" count={4} /></div>;

  const stops = trip?.stops || [];

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Trip Journal</h1>
          <p className="text-gray-500 mt-1">{trip?.name} · {notes.length} notes</p>
        </div>
        <Link to={`/trips/${id}`} className="btn-secondary text-sm ml-auto">← Back to Trip</Link>
      </div>

      {/* Add Note */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold text-gray-300 mb-3">Add a Note</h2>
        {stops.length > 0 && (
          <div className="mb-3">
            <label className="label text-xs">Link to a Stop (optional)</label>
            <select className="input-field text-sm" value={selectedStop} onChange={e => setSelectedStop(e.target.value)}>
              <option value="">General trip note</option>
              {stops.map((s: any) => (
                <option key={s.id} value={s.id}>📍 {s.city?.name}</option>
              ))}
            </select>
          </div>
        )}
        <textarea
          className="input-field resize-none mb-3"
          rows={4}
          placeholder="Write your thoughts, tips, memories..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">{content.length} characters</span>
          <button onClick={handleAdd} disabled={adding || !content.trim()} className="btn-primary text-sm">
            {adding ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <EmptyState icon="📝" title="No notes yet" description="Start writing your travel journal. Document tips, memories, and ideas." />
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="card p-5 hover:border-gray-700 transition-colors animate-fade-in">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {note.stop && (
                    <span className="badge bg-primary/20 text-primary-300 border border-primary/20 text-xs">
                      📍 {note.stop.city?.name}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">{formatDistanceToNow(new Date(note.createdAt))} ago</span>
                  {note.updatedAt !== note.createdAt && (
                    <span className="text-xs text-gray-700">(edited)</span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {editingId !== note.id && (
                    <button onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                      className="text-gray-600 hover:text-primary-300 text-xs transition-colors">Edit</button>
                  )}
                  <button onClick={() => handleDelete(note.id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">Delete</button>
                </div>
              </div>

              {/* Content */}
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea className="input-field resize-none w-full" rows={4} value={editContent} onChange={e => setEditContent(e.target.value)} autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs">Cancel</button>
                    <button onClick={() => handleEdit(note.id)} className="btn-primary text-xs">Save</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
