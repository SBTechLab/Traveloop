import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as apiLogin, signup as apiSignup } from '../api';
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
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await apiLogin(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}! ✈️`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password reset link sent! (Demo: no email sent)');
    setShowForgot(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-3">Plan your dream journey</h1>
            <p className="text-white/80 text-lg">Discover cities, build itineraries, track budgets — all in one place.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">Traveloop</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to continue your journey</p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input id="login-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input id="login-password" type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</button>
              <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? '⏳ Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary-300 mb-2">
                Enter your email and we'll send you a reset link.
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForgot(false)} className="btn-secondary flex-1">Back</button>
                <button type="submit" className="btn-primary flex-1">Send Reset Link</button>
              </div>
            </form>
          )}

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign up free</Link>
          </p>

          <div className="mt-4 p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-500 text-center">
            Demo: <span className="text-gray-300">demo@traveloop.com</span> / <span className="text-gray-300">demo1234</span>
          </div>
        </div>
      </div>
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
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await apiSignup({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to Traveloop 🌍');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/70 to-primary/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h1 className="text-4xl font-bold text-white mb-3">Your adventure starts here</h1>
          <p className="text-white/80 text-lg">Join thousands of travelers planning their perfect trips.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center"><span className="text-white font-bold">T</span></div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">Traveloop</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">Create your account</h2>
            <p className="text-gray-500 mt-1">Start planning amazing trips</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input id="signup-name" type="text" className="input-field" placeholder="Alex Wanderer" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input id="signup-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="signup-password" type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input id="signup-confirm" type="password" className="input-field" placeholder="••••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <button id="signup-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? '⏳ Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export { LoginPage, SignupPage };
