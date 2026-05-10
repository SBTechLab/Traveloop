import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Explore' },
  { to: '/trips', label: 'Trips' },
  { to: '/cities', label: 'Discover' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 no-print">
      <div className="flex justify-between items-center px-4 md:px-12 h-16 w-full max-w-[1280px] mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="font-serif text-xl font-bold text-primary hover:opacity-90 transition-opacity">
            Traveloop
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-sans text-sm font-semibold tracking-wider transition-colors duration-200 pb-1 ${
                  location.pathname === link.to
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            to="/trips/new"
            className="hidden md:flex items-center bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-semibold tracking-wide hover:opacity-90 active:scale-95 transition-all"
          >
            Create Trip
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors px-3 py-2 rounded-lg hover:bg-error/10"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="text-sm font-semibold">Logout</span>
            </button>
          )}

          {/* User Avatar */}
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary transition-all">
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )
            }
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30 px-4 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === link.to
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/trips/new"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 w-full mt-3 bg-primary-container text-on-primary-container px-4 py-3 rounded-lg text-sm font-semibold tracking-wide"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Create Trip
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-error hover:bg-error-container/20 transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-16 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30">
        {[
          { to: '/', icon: 'explore', label: 'Explore' },
          { to: '/trips', icon: 'travel_explore', label: 'Trips' },
          { to: '/cities', icon: 'map', label: 'Discover' },
          { to: '/profile', icon: 'person', label: 'Profile' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
              location.pathname === item.to
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
