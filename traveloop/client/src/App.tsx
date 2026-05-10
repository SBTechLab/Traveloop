import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './store/AuthContext';
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

// Protected route wrapper
function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl animate-pulse" />
        <p className="text-gray-500 text-sm">Loading Traveloop...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Outlet />
    </div>
  );
}

// Public auth route (redirect if logged in)
function AuthLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl mb-6">🗺️</p>
        <h1 className="text-4xl font-bold text-gray-100 mb-3">404 — Lost in Transit</h1>
        <p className="text-gray-500 mb-8">This destination doesn't exist on our map.</p>
        <a href="/" className="btn-primary px-6 py-3">Back to Dashboard</a>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/share/:shareSlug" element={<SharedItinerary />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
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
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #374151', borderRadius: '12px' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
