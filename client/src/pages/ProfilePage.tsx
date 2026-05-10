import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../api';
import { useAuth } from '../store/AuthContext';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const LANGUAGES = [
  { value: 'en', label: '🇬🇧 English (UK)' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'de', label: '🇩🇪 German' },
  { value: 'ja', label: '🇯🇵 Japanese' },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', language: 'en' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  useEffect(() => {
    getProfile().then(r => {
      setProfile(r.data);
      setForm({ name: r.data.name, email: r.data.email, language: r.data.language });
    }).finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('language', form.language);
      if (photo) fd.append('profilePhoto', photo);
      const r = await updateProfile(fd);
      setProfile(r.data);
      updateUser(r.data);
      toast.success('Profile modernized!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Security updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setPwSaving(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      navigate('/login');
      toast.success('Safe travels elsewhere!');
    } catch { toast.error('Failed to delete account'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20"><LoadingSkeleton type="list" count={5} /></div>;

  const avatarSrc = photoPreview || (profile?.profilePhoto ? `${profile.profilePhoto}` : null);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Side Navigation */}
          <aside className="md:col-span-3 space-y-2">
            <div className="p-4 mb-10">
              <h1 className="font-serif text-4xl font-bold text-primary mb-2">Settings</h1>
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Explorer Profile</p>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined font-fill">person</span>
                <span className="text-sm font-bold uppercase tracking-widest">Personal Details</span>
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'security' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined font-fill">security</span>
                <span className="text-sm font-bold uppercase tracking-widest">Security</span>
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'preferences' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined font-fill">auto_awesome</span>
                <span className="text-sm font-bold uppercase tracking-widest">Preferences</span>
              </button>
            </nav>

            <div className="mt-20 p-8 rounded-3xl bg-primary-container text-on-primary-container shadow-xl">
               <h3 className="font-serif text-xl font-bold mb-4 italic">Travel Persona</h3>
               <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-surface/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Global Nomad</span>
                  <span className="bg-surface/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Tech Explorer</span>
               </div>
               <p className="text-xs leading-relaxed opacity-80">"Your profile data helps us curate the perfect destinations for your style."</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="md:col-span-9 space-y-12">
            {activeTab === 'profile' && (
              <section className="bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl animate-fade-in">
                <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface ring-4 ring-primary/20 shadow-2xl">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl font-serif font-bold">
                          {profile?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="font-serif text-4xl font-bold text-on-surface mb-2">{profile?.name}</h2>
                    <p className="text-on-surface-variant font-bold text-sm uppercase tracking-[0.2em]">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Active Traveler Since {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2024'}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Full Identity</label>
                    <input 
                      className="w-full h-16 bg-surface px-6 rounded-2xl border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Digital Mail</label>
                    <input 
                      type="email" 
                      className="w-full h-16 bg-surface px-6 rounded-2xl border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" 
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Interface Language</label>
                    <select 
                      className="w-full h-16 bg-surface px-6 rounded-2xl border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" 
                      value={form.language} 
                      onChange={e => setForm({ ...form, language: e.target.value })}
                    >
                      {LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-surface">{l.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-6">
                    <button type="submit" disabled={saving} className="w-full md:w-fit bg-primary text-on-primary px-12 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                      {saving ? 'Updating...' : 'Save My Changes'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'security' && (
              <section className="bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl animate-fade-in">
                <div className="mb-10">
                  <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">Vault Security</h2>
                  <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Keep your travel data secure</p>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full h-16 bg-surface px-6 rounded-2xl border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">New Secret</label>
                      <input type="password" placeholder="••••••••" className="w-full h-16 bg-surface px-6 rounded-2xl border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Confirm Secret</label>
                      <input type="password" placeholder="••••••••" className="w-full h-16 bg-surface px-6 rounded-2xl border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" disabled={pwSaving} className="w-full md:w-fit bg-primary text-on-primary px-12 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                    {pwSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                <div className="mt-16 pt-12 border-t border-outline-variant/10">
                  <h3 className="text-error font-bold text-sm uppercase tracking-widest mb-4">Danger Zone</h3>
                  <div className="bg-error/5 p-8 rounded-3xl border border-error/20 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <p className="text-on-surface font-bold">Close Your Account</p>
                      <p className="text-on-surface-variant text-xs mt-1">This action is permanent and will delete all your travel history and data.</p>
                    </div>
                    <button onClick={() => setShowDelete(true)} className="bg-error/10 text-error px-8 py-3 rounded-xl text-xs font-bold border border-error/20 hover:bg-error hover:text-white transition-all">
                      Delete Forever
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'preferences' && (
              <section className="bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/10 shadow-2xl animate-fade-in">
                 <div className="mb-10 text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">settings_suggest</span>
                    <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">Smart Preferences</h2>
                    <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Coming soon: Advanced personalization algorithms.</p>
                 </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="End Journey Permanently" size="sm">
        <div className="p-2">
          <p className="text-on-surface-variant mb-10 leading-relaxed italic">
            "We're sad to see you go. Every destination has a story, and we're honored to have been part of yours."
          </p>
          <div className="flex gap-4">
            <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">I'll Stay</button>
            <button onClick={handleDeleteAccount} disabled={deleting} className="bg-error text-white font-bold py-3 rounded-xl flex-1 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-error/20">
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
