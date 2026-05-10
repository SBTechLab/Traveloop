import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/trips', label: 'My Trips', icon: '✈️' },
  { to: '/cities', label: 'Explore', icon: '🌍' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
              Traveloop
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  location.pathname === link.to
                    ? 'bg-primary/20 text-primary-300'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${location.pathname === '/admin' ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10'}`}>
                <span>⚡</span>Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                {user?.profilePhoto
                  ? <img src={`${user.profilePhoto}`} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="hidden sm:block text-sm text-gray-300 font-medium">{user?.name}</span>
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10" title="Logout">
              ⬅️ Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
