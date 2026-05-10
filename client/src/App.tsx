import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider, useTheme } from './store/ThemeContext';
import Navbar from './components/Navbar';
import { LoginPage, SignupPage } from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import TripList from './pages/TripList';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import BudgetPage from './pages/BudgetPage';
import PackingChecklist from './pages/PackingChecklist';
import SharedItinerary from './pages/SharedItinerary';
import ProfilePage from './pages/ProfilePage';
import TripNotes from './pages/TripNotes';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import HomePage from './pages/HomePage';
import { Shield } from 'lucide-react';

// Protected route wrapper
function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-primary-container rounded-xl animate-pulse" />
        <p className="text-on-surface-variant font-sans text-sm">Loading Traveloop...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16 pb-20 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}

// Public auth route (redirect if logged in)
function AuthLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// Dedicated Admin Layout
function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user || !user.isAdmin) return <Navigate to="/admin/login" replace />;

  const handleAdminLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-surface pt-16">
      {/* Admin Topbar */}
      <nav className="bg-surface/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-lg text-gray-100">Traveloop Admin Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-400">Welcome, {user.name}</span>
            <button onClick={handleAdminLogout} className="text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
              Secure Logout
            </button>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-8xl text-primary-container mb-6 block">travel_explore</span>
        <h1 className="font-serif text-4xl font-bold text-on-surface mb-3">404 — Lost in Transit</h1>
        <p className="text-on-surface-variant mb-8">This destination doesn't exist on our map.</p>
        <Link to="/" className="btn-primary px-6 py-3">Back to Dashboard</Link>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping" />
    </div>
  );

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={user ? <DashboardWrapper /> : <HomePage />} />

      {/* Public routes */}
      <Route path="/share/:shareSlug" element={<SharedItinerary />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/trips" element={<TripList />} />
        <Route path="/trips/new" element={<CreateTrip />} />
        <Route path="/trips/:id" element={<ItineraryView />} />
        <Route path="/trips/:id/build" element={<ItineraryBuilder />} />
        <Route path="/trips/:id/budget" element={<BudgetPage />} />
        <Route path="/trips/:id/packing" element={<PackingChecklist />} />
        <Route path="/trips/:id/notes" element={<TripNotes />} />
        <Route path="/cities" element={<CitySearch />} />
        <Route path="/cities/:cityId/activities" element={<ActivitySearch />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Wrapper to include Navbar for the root dashboard view
function DashboardWrapper() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16 pb-20 md:pb-0">
        <Dashboard />
      </div>
    </div>
  );
}

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { 
              background: theme === 'dark' ? '#152031' : '#eceef0', 
              color: theme === 'dark' ? '#d8e3fb' : '#191c1e', 
              border: `1px solid ${theme === 'dark' ? '#2a3548' : '#c6c6cd'}`, 
              borderRadius: '12px' 
            },
            success: { iconTheme: { primary: theme === 'dark' ? '#ffb690' : '#9d4300', secondary: theme === 'dark' ? '#552100' : '#ffffff' } },
            error: { iconTheme: { primary: theme === 'dark' ? '#ffb4ab' : '#ba1a1a', secondary: theme === 'dark' ? '#690005' : '#ffffff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
