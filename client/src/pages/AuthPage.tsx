import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as apiLogin, signup as apiSignup, forgotPassword as apiForgotPassword } from '../api';
import { useAuth } from '../store/AuthContext';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Required fields missing'); return; }
    setLoading(true);
    try {
      const res = await apiLogin(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! ✈️`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error('Email required'); return; }
    setForgotLoading(true);
    try {
      await apiForgotPassword(forgotEmail);
      toast.success('Reset protocol initiated. Check your inbox.');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send reset email');
    } finally { setForgotLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface-container-lowest">
      {/* Left: Branding & Visuals */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            alt="Travel Inspiration" 
            className="w-full h-full object-cover brightness-75 transition-transform duration-[10s] hover:scale-110" 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
        
        {/* Branding */}
        <div className="absolute top-12 left-12 flex items-center gap-3 backdrop-blur-md bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
          <span className="material-symbols-outlined text-primary text-3xl font-fill">explore</span>
          <span className="font-serif text-3xl font-bold text-white tracking-tight">Traveloop</span>
        </div>

        <div className="relative z-10 p-24 mt-auto max-w-2xl">
          <h2 className="font-serif text-6xl font-bold text-white mb-8 leading-tight">Explore the world <br/><span className="text-primary italic">with purpose.</span></h2>
          <p className="font-body-lg text-lg text-white/80 leading-relaxed mb-12">
            Join thousands of modern explorers planning collaborative, seamless journeys with Traveloop's premium intelligence.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container overflow-hidden shadow-lg">
                  <img src={`https://i.pravatar.cc/100?u=auth${i}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">+ 12k share itineraries today</span>
          </div>
        </div>
      </section>

      {/* Right: Authentication Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-secondary/5 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Branding */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl font-fill">explore</span>
              <span className="font-serif text-3xl font-bold text-on-surface">Traveloop</span>
            </div>
            <Link to="/" className="text-[10px] font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </Link>
          </div>

          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-on-surface mb-3 tracking-tight">
              {showForgot ? 'Reset Protocol' : 'Welcome Back.'}
            </h1>
            <p className="text-on-surface-variant font-bold text-sm uppercase tracking-[0.2em]">
              {showForgot ? 'Re-establish your access key' : 'Enter your credentials to continue'}
            </p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Digital Identity</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40">alternate_email</span>
                  <input 
                    id="login-email" 
                    type="email" 
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold placeholder:text-on-surface-variant/30" 
                    placeholder="e.g. wanderer@traveloop.com" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Secret Key</label>
                   <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:brightness-125 transition-all">Forgot?</button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40">lock</span>
                  <input 
                    id="login-password" 
                    type="password" 
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold placeholder:text-on-surface-variant/30" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <button 
                id="login-submit" 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="mt-4 p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/20 text-[10px] font-bold text-on-surface-variant text-center uppercase tracking-widest leading-relaxed">
                Demo Access: <span className="text-primary ml-2">demo@traveloop.com</span> / <span className="text-primary ml-1">demo1234</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-6">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-xs font-bold text-primary leading-relaxed uppercase tracking-widest text-center">
                Protocol: Secure reset link will be dispatched to your registered mail.
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Identity Mail</label>
                <input 
                  type="email" 
                  className="w-full h-16 px-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold" 
                  placeholder="you@example.com" 
                  value={forgotEmail} 
                  onChange={e => setForgotEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowForgot(false)} className="flex-1 h-14 bg-surface-container-high text-on-surface rounded-2xl font-bold text-xs uppercase tracking-widest">Back</button>
                <button type="submit" disabled={forgotLoading} className="flex-1 h-14 bg-primary text-on-primary rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                  {forgotLoading ? 'Dispatching...' : 'Dispatch Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">
              New Explorer? 
              <Link to="/signup" className="text-primary hover:brightness-125 transition-all ml-4 border-b border-primary/30">Create an Account</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="fixed bottom-8 right-12 hidden lg:flex items-center gap-6 opacity-40">
        <Link to="/admin/login" className="text-[10px] font-bold text-on-surface-variant hover:text-amber-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-xs">shield_person</span>
          Admin Access
        </Link>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          © 2024 Traveloop Inc. • System v3.0 • Privacy • Terms
        </p>
      </footer>
    </div>
  );
}

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Incomplete credentials'); return; }
    if (form.password.length < 6) { toast.error('Security key too short'); return; }
    if (form.password !== form.confirm) { toast.error('Security mismatch'); return; }
    setLoading(true);
    try {
      const res = await apiSignup({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Registration successful! Welcome to the ecosystem 🌍');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface-container-lowest">
      {/* Left: Branding (Signup version) */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            alt="Travel Adventure" 
            className="w-full h-full object-cover brightness-[0.6] transition-transform duration-[15s] hover:scale-125" 
            src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=1200" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-surface-container-lowest/90"></div>
        
        <div className="absolute top-12 left-12 flex items-center gap-3 backdrop-blur-md bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
          <span className="material-symbols-outlined text-primary text-3xl font-fill">explore</span>
          <span className="font-serif text-3xl font-bold text-white tracking-tight">Traveloop</span>
        </div>

        <div className="relative z-10 p-24 mt-auto max-w-2xl">
          <h2 className="font-serif text-6xl font-bold text-white mb-8 leading-tight">Your story <br/><span className="text-primary italic">starts here.</span></h2>
          <p className="font-body-lg text-lg text-white/80 leading-relaxed">
            Begin your transformation from traveler to explorer. Access world-class tools for world-class experiences.
          </p>
        </div>
      </section>

      {/* Right: Signup Form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-24 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Branding */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl font-fill">explore</span>
              <span className="font-serif text-3xl font-bold text-on-surface">Traveloop</span>
            </div>
            <Link to="/" className="text-[10px] font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Home
            </Link>
          </div>

          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-on-surface mb-3 tracking-tight">Create Profile.</h1>
            <p className="text-on-surface-variant font-bold text-sm uppercase tracking-[0.2em]">Initiate your digital travel vault</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Full Identity</label>
              <input 
                id="signup-name" 
                type="text" 
                className="w-full h-16 px-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold placeholder:text-on-surface-variant/30" 
                placeholder="Alex Wanderer" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Communication Mail</label>
              <input 
                id="signup-email" 
                type="email" 
                className="w-full h-16 px-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold placeholder:text-on-surface-variant/30" 
                placeholder="you@example.com" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Secret Key</label>
                <input 
                  id="signup-password" 
                  type="password" 
                  className="w-full h-16 px-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold placeholder:text-on-surface-variant/30" 
                  placeholder="Min. 6" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Confirm Key</label>
                <input 
                  id="signup-confirm" 
                  type="password" 
                  className="w-full h-16 px-6 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:border-primary outline-none transition-all font-bold placeholder:text-on-surface-variant/30" 
                  placeholder="••••••••" 
                  value={form.confirm} 
                  onChange={e => setForm({ ...form, confirm: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <button 
              id="signup-submit" 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              {loading ? 'Creating...' : 'Establish Profile'}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">
              Existing Explorer? 
              <Link to="/login" className="text-primary hover:brightness-125 transition-all ml-4 border-b border-primary/30">Sign In instead</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export { LoginPage, SignupPage };
