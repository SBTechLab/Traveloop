import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../api';
import { useAuth } from '../store/AuthContext';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const LANGUAGES = [
  { value: 'en', label: '🇬🇧 English' },
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
      toast.success('Profile updated!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password min 6 characters'); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
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
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete account'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="page-container max-w-2xl"><LoadingSkeleton type="list" count={4} /></div>;

  const avatarSrc = photoPreview || (profile?.profilePhoto ? `${profile.profilePhoto}` : null);

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-gray-100 transition-colors text-sm">← Back</button>
        <h1 className="text-3xl font-bold text-gray-100">Profile & Settings</h1>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-200 mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {avatarSrc ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" /> : profile?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <label className="btn-secondary text-sm cursor-pointer">
                Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP. Max 5MB.</p>
            </div>
          </div>

          <div>
            <label className="label">Display Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Language</label>
            <select className="input-field" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-200 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
          </div>
          <button type="submit" disabled={pwSaving} className="btn-primary w-full">{pwSaving ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-200 mb-3">Account Info</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Member since: <span className="text-gray-200">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span></p>
          <p>Role: <span className={`font-medium ${profile?.isAdmin ? 'text-amber-400' : 'text-gray-200'}`}>{profile?.isAdmin ? '⚡ Admin' : 'User'}</span></p>
        </div>
      </div>

      <div className="card p-6 border-red-500/20 bg-red-500/5">
        <h2 className="font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-gray-500 text-sm mb-4">Deleting your account is permanent and cannot be undone.</p>
        <button onClick={() => setShowDelete(true)} className="btn-danger text-sm">Delete My Account</button>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Account" size="sm">
        <p className="text-gray-400 mb-5">Are you absolutely sure? This will permanently delete your account and all trips.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDeleteAccount} disabled={deleting} className="btn-danger flex-1">{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
        </div>
      </Modal>
    </div>
  );
}
