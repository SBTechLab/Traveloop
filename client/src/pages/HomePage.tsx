import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  
  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section: Cinematic Entrance */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 text-center overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000" 
            alt="Ocean Horizon" 
            className="w-full h-full object-cover brightness-[0.4] scale-105 animate-slow-zoom" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/40 to-surface"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        </div>

        {/* Navbar: Floating Glass */}
        <nav className="absolute top-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-50 h-20 px-8 flex items-center justify-between rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl font-fill">explore</span>
            <span className="font-serif text-3xl font-bold tracking-tight text-white">Traveloop</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            <a href="#philosophy" className="text-[11px] font-bold text-white/60 hover:text-primary uppercase tracking-[0.2em] transition-all">Philosophy</a>
            <a href="#engine" className="text-[11px] font-bold text-white/60 hover:text-primary uppercase tracking-[0.2em] transition-all">The Engine</a>
            
            {user?.isAdmin && (
              <Link
                to="/admin/dashboard"
                className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 hover:text-amber-400 transition-all flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20"
              >
                <span className="material-symbols-outlined text-sm font-fill">shield_person</span>
                Admin Portal
              </Link>
            )}

            {!user ? (
              <>
                <Link to="/login" className="text-[11px] font-bold text-white/60 hover:text-primary uppercase tracking-[0.2em] transition-all">Login</Link>
                <Link to="/signup" className="bg-primary text-on-primary px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
                  Join the Expedition
                </Link>
              </>
            ) : (
              <Link to="/trips" className="bg-primary text-on-primary px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
                Go to Dashboard
              </Link>
            )}
          </div>
          <button className="lg:hidden material-symbols-outlined text-white text-3xl">menu</button>
        </nav>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-6xl mt-32">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 animate-fade-in backdrop-blur-md">
            <span className="bg-primary w-2 h-2 rounded-full animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Intelligence Redefined</span>
          </div>
          
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.85] mb-10 tracking-tighter text-white">
            Travel without <br />
            <span className="text-primary italic">compromise.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-16 leading-relaxed font-light italic">
            "Experience the fusion of high-fidelity planning and collaborative intelligence. <br className="hidden md:block" /> Your next masterpiece is waiting to be written."
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mb-24">
            <Link to="/signup" className="w-full sm:w-auto bg-primary text-on-primary px-12 py-5 rounded-[20px] text-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
              Initiate First Trip
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </Link>
            <Link to="/cities" className="w-full sm:w-auto bg-white/5 backdrop-blur-xl text-white px-12 py-5 rounded-[20px] text-lg font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              Explore Destinations
            </Link>
          </div>

          {/* Floating UI Teasers */}
          <div className="relative w-full max-w-5xl mx-auto py-12">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 hover:opacity-100 transition-opacity duration-1000">
                <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 px-6 md:px-12 max-w-7xl mx-auto text-center border-b border-outline-variant/10">
        <div className="mb-24">
          <h2 className="font-serif text-5xl md:text-7xl font-bold mb-8 tracking-tight">The Traveloop <span className="text-primary italic">Philosophy.</span></h2>
          <p className="text-on-surface-variant text-xl max-w-3xl mx-auto leading-relaxed italic opacity-80">
            We believe that planning should be as exhilarating as the trip itself. Our ecosystem is built on three core pillars: Precision, Inspiration, and Harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {[
            { icon: 'auto_awesome', title: 'High-Fidelity AI', desc: 'Our engine processes millions of data points to curate experiences that resonate with your unique traveler DNA.' },
            { icon: 'hub', title: 'Harmonious Flow', desc: 'Real-time synchronization across devices ensures your group remains in perfect alignment throughout the journey.' },
            { icon: 'architecture', title: 'Architectural Design', desc: 'A user interface inspired by the world\'s finest concierge services—clean, minimal, and intensely powerful.' }
          ].map((p, i) => (
            <div key={i} className="group p-10 rounded-[40px] bg-surface-container-low border border-outline-variant/10 hover:translate-y-[-8px] transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined text-4xl font-fill">{p.icon}</span>
              </div>
              <h3 className="font-serif text-3xl font-bold mb-6">{p.title}</h3>
              <p className="text-on-surface-variant leading-relaxed opacity-80 italic">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engine Section: The "Bento" Showcase */}
      <section id="engine" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">Master every <span className="text-primary italic">dimension.</span></h2>
            <p className="text-on-surface-variant text-lg leading-relaxed italic opacity-80">A comprehensive suite of tools designed to handle the complexity of global navigation while you focus on the magic of discovery.</p>
          </div>
          <Link to="/cities" className="bg-surface-container-high text-on-surface px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-outline-variant/20 hover:bg-surface-bright transition-all">View Ecosystem</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[800px]">
          {/* Feature 1: Itinerary */}
          <div className="md:col-span-8 md:row-span-2 bg-surface-container-low rounded-[48px] border border-outline-variant/10 overflow-hidden relative group">
             <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-[15s] group-hover:scale-110" />
             <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-4">Core Engine</span>
                <h3 className="font-serif text-5xl font-bold mb-6">Cinematic Timelines</h3>
                <p className="text-on-surface-variant max-w-md text-lg italic leading-relaxed opacity-80">"Drag, drop, and witness your journey come to life in a stunning daily sequence optimized for both flow and adventure."</p>
             </div>
          </div>

          {/* Feature 2: Budget */}
          <div className="md:col-span-4 bg-primary-container rounded-[48px] p-12 flex flex-col justify-between group shadow-2xl">
             <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-on-primary-container group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl font-fill">payments</span>
             </div>
             <div>
                <h3 className="font-serif text-3xl font-bold text-on-primary-container mb-4">Financial Clarity</h3>
                <p className="text-on-primary-container/70 text-sm leading-relaxed italic">Real-time expense tracking and predictive budgeting for stress-free explorations.</p>
             </div>
          </div>

          {/* Feature 3: Checklist */}
          <div className="md:col-span-4 bg-surface-container-low rounded-[48px] border border-outline-variant/10 p-12 flex flex-col justify-between group">
             <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl font-fill">inventory_2</span>
             </div>
             <div>
                <h3 className="font-serif text-3xl font-bold mb-4">Smart Checklists</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed italic opacity-80">Dynamically generated packing lists based on your destination's climate and activities.</p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA: Final Destination */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto relative rounded-[64px] overflow-hidden bg-surface-container-lowest border border-outline-variant/10 p-20 md:p-32 text-center shadow-2xl shadow-primary/5">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]"></div>
          <div className="relative z-10">
            <h2 className="font-serif text-5xl md:text-8xl font-bold mb-10 tracking-tight">Your story is <br/><span className="text-primary italic">waiting.</span></h2>
            <p className="text-2xl text-on-surface-variant max-w-2xl mx-auto mb-16 italic opacity-80">
              Join the new generation of travelers who understand that the world is more than a map—it\'s an experience.
            </p>
            <Link to="/signup" className="inline-flex bg-primary text-on-primary px-16 py-6 rounded-[24px] text-2xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 uppercase tracking-widest">
              Begin Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer: Grand Finale */}
      <footer className="py-24 px-6 md:px-12 border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary text-4xl font-fill">explore</span>
              <span className="font-serif text-4xl font-bold tracking-tight">Traveloop</span>
            </div>
            <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed italic opacity-60">
              "Redefining the art of global exploration through intelligence and harmony."
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Ecosystem</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Cities</a>
              <a href="#" className="hover:text-primary transition-colors">Activities</a>
              <a href="#" className="hover:text-primary transition-colors">Itineraries</a>
              <a href="#" className="hover:text-primary transition-colors">Budgeting</a>
              <Link to="/admin/login" className="text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">shield_person</span>
                Admin Portal
              </Link>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Legal</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Privacy Protocol</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">
           <span>© 2024 Traveloop Technologies</span>
           <span>Designed for the Modern Explorer</span>
           <span>v4.0.0 Stable</span>
        </div>
      </footer>
    </div>
  );
}
