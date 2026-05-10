import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as apiLogin } from '../api';
import { useAuth } from '../store/AuthContext';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await apiLogin(form);
      if (!res.data.user.isAdmin) {
        toast.error('Access Denied: Admin credentials required.');
        setLoading(false);
        return;
      }
      login(res.data.token, res.data.user);
      toast.success(`Admin access granted. Welcome ${res.data.user.name}`);
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md card p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 shadow-glow mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-100 mb-2">Admin Portal</h2>
          <p className="text-gray-400">Secure access to platform management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Admin Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="admin@traveloop.com" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="label">Admin Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-accent w-full py-3.5 text-base shadow-[0_0_20px_rgba(20,184,166,0.3)] bg-amber-500 hover:bg-amber-600 shadow-amber-500/30">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Return to User Login
          </button>
        </div>
      </div>
    </div>
  );
}
