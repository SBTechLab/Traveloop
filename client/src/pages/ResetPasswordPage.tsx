import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword as apiResetPassword } from '../api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await apiResetPassword(token, form.password);
      toast.success('Password reset! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired link');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-8">
        <span className="material-symbols-outlined text-4xl text-error">link_off</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-2">Invalid Link</h1>
      <p className="text-on-surface-variant mb-8 max-w-xs">The reset link is invalid or has expired. Please request a new one.</p>
      <Link to="/login" className="btn-secondary px-8 py-3">Back to Login</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-primary-container font-fill">travel_explore</span>
            </div>
            <span className="font-serif text-3xl font-bold text-primary">Traveloop</span>
          </Link>
          <h2 className="font-serif text-4xl font-bold text-on-surface mb-3">Secure Reset</h2>
          <p className="text-on-surface-variant font-medium">Protect your journey with a new password.</p>
        </div>

        <div className="bg-surface-container-low p-8 md:p-10 rounded-[32px] border border-outline-variant/10 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">New Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">lock</span>
                <input 
                  type="password" 
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface" 
                  placeholder="At least 6 characters" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm Identity</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">verified_user</span>
                <input 
                  type="password" 
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface" 
                  placeholder="Repeat your password" 
                  value={form.confirm} 
                  onChange={e => setForm({ ...form, confirm: e.target.value })} 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Securing...' : (
                <>
                  <span className="material-symbols-outlined">key</span>
                  Update Password
                </>
              )}
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/login" className="text-on-surface-variant hover:text-primary text-sm font-bold transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
