import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { getNotes, createNote, updateNote, deleteNote, getTrip } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function TripNotes() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTrip(id), getNotes(id)])
      .then(([tripRes, notesRes]) => { 
        setTrip(tripRes.data); 
        setNotes(notesRes.data);
        if (notesRes.data.length > 0) {
          setActiveNote(notesRes.data[0]);
          setEditContent(notesRes.data[0].content);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCreate = async () => {
    setAdding(true);
    try {
      const r = await createNote(id!, { content: 'New trip note...', stopId: undefined });
      const newNote = r.data;
      setNotes([newNote, ...notes]);
      setActiveNote(newNote);
      setEditContent(newNote.content);
      setIsEditing(true);
      toast.success('Draft created');
    } catch { toast.error('Failed to create note'); }
    finally { setAdding(false); }
  };

  const handleUpdate = async () => {
    if (!activeNote || !editContent.trim()) return;
    try {
      const r = await updateNote(activeNote.id, { content: editContent });
      setNotes(notes.map(n => n.id === activeNote.id ? r.data : n));
      setActiveNote(r.data);
      setIsEditing(false);
      toast.success('Note saved');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(noteId);
      const filtered = notes.filter(n => n.id !== noteId);
      setNotes(filtered);
      if (activeNote?.id === noteId) {
        setActiveNote(filtered[0] || null);
        setEditContent(filtered[0]?.content || '');
      }
      toast.success('Note removed');
    } catch { toast.error('Failed to delete'); }
  };

  const filteredNotes = notes.filter(n => n.content.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-12"><LoadingSkeleton type="list" count={5} /></div>;

  return (
    <main className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-surface">
      {/* Sidebar: Notes List */}
      <section className="w-full md:w-80 border-r border-outline-variant/10 bg-surface-container-low flex flex-shrink-0 flex-col overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-2xl font-bold text-on-surface">Journal</h3>
            <button 
              onClick={handleCreate}
              disabled={adding}
              className="w-10 h-10 bg-primary-container text-on-primary-container rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-high rounded-xl border-none text-xs font-bold text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 outline-none transition-all" 
              placeholder="Search memories..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <p className="text-center text-xs text-on-surface-variant p-12 italic">No notes found</p>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => { setActiveNote(note); setEditContent(note.content); setIsEditing(false); }}
                className={`p-4 rounded-xl cursor-pointer transition-all border-l-4 ${
                  activeNote?.id === note.id 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'hover:bg-surface-container-high border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold truncate max-w-[140px] ${activeNote?.id === note.id ? 'text-primary' : 'text-on-surface'}`}>
                    {note.content.split('\n')[0] || 'Untitled Note'}
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: false }).replace('about ', '')}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/70 line-clamp-1 italic">
                  {note.content.split('\n').slice(1).join(' ') || 'No additional text...'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {note.stop && (
                    <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] rounded font-bold text-primary">
                      📍 {note.stop.city?.name}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] rounded font-bold text-on-surface-variant">
                    {note.content.length} chars
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Editor/View Canvas */}
      <section className="flex-grow flex flex-col bg-surface overflow-hidden relative">
        {!activeNote ? (
          <EmptyState icon="edit_note" title="Select a note" description="Choose a memory from the list or start a new entry for your trip." />
        ) : (
          <>
            {/* Toolbar */}
            <div className="px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(`/trips/${id}`)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                   <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface transition-colors">
                    <span className="material-symbols-outlined">format_bold</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface transition-colors">
                    <span className="material-symbols-outlined">format_list_bulleted</span>
                  </button>
                  <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                  <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface transition-colors">
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hidden sm:inline">
                  {isEditing ? 'Editing now...' : `Saved ${formatDistanceToNow(new Date(activeNote.updatedAt))} ago`}
                </span>
                <div className="flex gap-2">
                   {isEditing ? (
                    <button onClick={handleUpdate} className="bg-primary text-on-primary px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                      Save Changes
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-surface-container-high text-on-surface px-6 py-2 rounded-xl text-xs font-bold border border-outline-variant/30 hover:bg-surface-bright transition-all">
                      Edit Note
                    </button>
                  )}
                  <button onClick={() => handleDelete(activeNote.id)} className="w-10 h-10 flex items-center justify-center text-error hover:bg-error/10 rounded-xl transition-all">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <article className="flex-grow overflow-y-auto px-8 md:px-12 py-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-surface-container-high text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">
                      {activeNote.stop ? `📍 ${activeNote.stop.city?.name}` : 'General Trip Entry'}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {new Date(activeNote.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <textarea 
                      className="w-full font-serif text-xl md:text-2xl text-on-surface bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-on-surface-variant/20"
                      value={editContent}
                      onChange={e => { setEditContent(e.target.value); setIsEditing(true); }}
                      rows={15}
                      autoFocus
                    />
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <h1 className="font-serif text-4xl md:text-5xl font-bold text-on-surface mb-8 leading-tight">
                        {activeNote.content.split('\n')[0] || 'Untitled Reflection'}
                      </h1>
                      <div className="whitespace-pre-wrap font-sans text-lg text-on-surface/90 leading-relaxed">
                        {activeNote.content.split('\n').slice(1).join('\n') || 'Start typing your thoughts below...'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative Element */}
                {!isEditing && (
                  <div className="mt-20 border-t border-outline-variant/10 pt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                       <div className="rounded-3xl overflow-hidden aspect-video relative group">
                          <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600" alt="Travel" className="w-full h-full object-cover" />
                       </div>
                       <div className="rounded-3xl overflow-hidden aspect-video relative group">
                          <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=600" alt="Memories" className="w-full h-full object-cover" />
                       </div>
                    </div>
                    <div className="mt-8 border-l-4 border-primary/30 pl-6 py-4 italic text-on-surface-variant text-sm leading-relaxed">
                      "To travel is to live, and to document is to remember forever."
                    </div>
                  </div>
                )}
              </div>
            </article>
          </>
        )}
      </section>
    </main>
  );
}
