import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getTrips, getCities, getBudget } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [upcomingBudget, setUpcomingBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([getTrips(), getCities()])
      .then(async ([tripsRes, citiesRes]) => {
        const allTrips = tripsRes.data;
        setTrips(allTrips.slice(0, 3));
        setCities(citiesRes.data.slice(0, 6));
        const upcoming = allTrips.find((t: any) => new Date(t.startDate) >= now);
        if (upcoming) {
          try { const b = await getBudget(upcoming.id); setUpcomingBudget({ ...b.data, tripName: upcoming.name }); } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalBudget = upcomingBudget
    ? upcomingBudget.transportCost + upcomingBudget.stayCost + upcomingBudget.mealsCost + upcomingBudget.miscCost
    : 0;

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: '✈️', color: 'from-primary/20 to-primary/5' },
    { label: 'Destinations', value: trips.reduce((a: number, t: any) => a + (t.stops?.length || 0), 0), icon: '📍', color: 'from-accent/20 to-accent/5' },
    { label: 'Activities', value: trips.reduce((a: number, t: any) => a + (t.stops?.reduce((b: number, s: any) => b + (s.stopActivities?.length || 0), 0) || 0), 0), icon: '🎯', color: 'from-amber-500/20 to-amber-500/5' },
  ];

  return (
    <div className="page-container">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-gray-900 to-accent/20 border border-gray-800 p-8 mb-8 animate-fade-in">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-primary-300 font-medium mb-1">👋 Welcome back,</p>
          <h1 className="text-4xl font-bold text-gray-100 mb-3">{user?.name}!</h1>
          <p className="text-gray-400 mb-6 max-w-xl">Ready to plan your next adventure? The world is waiting for you.</p>
          <Link to="/trips/new" className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-base">
            <span>✈️</span> Plan New Trip
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`card p-5 bg-gradient-to-br ${stat.color}`}>
            <p className="text-3xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Budget Highlight */}
      {upcomingBudget && (
        <div className="card p-5 mb-8 border-accent/30 bg-accent/5 animate-fade-in">
          <h3 className="text-sm font-medium text-accent-400 mb-3">💰 Budget for upcoming trip: <span className="text-gray-200">{upcomingBudget.tripName}</span></h3>
          <div className="flex items-center gap-6 flex-wrap">
            {[['Transport', upcomingBudget.transportCost, '🚂'], ['Stay', upcomingBudget.stayCost, '🏨'], ['Meals', upcomingBudget.mealsCost, '🍽️'], ['Misc', upcomingBudget.miscCost, '🛍️']].map(([l, v, i]) => (
              <div key={l as string}>
                <p className="text-xs text-gray-500">{i} {l}</p>
                <p className="text-base font-semibold text-gray-200">${(v as number).toLocaleString()}</p>
              </div>
            ))}
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-accent">${totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Trips */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-100">Recent Trips</h2>
          <Link to="/trips" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">View all →</Link>
        </div>
        {loading ? <LoadingSkeleton type="card" count={3} /> : trips.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">✈️</p>
            <p className="text-gray-400 mb-4">You haven't planned any trips yet.</p>
            <Link to="/trips/new" className="btn-primary inline-block">Plan Your First Trip</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        )}
      </div>

      {/* Recommended Destinations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-100">🌍 Recommended Destinations</h2>
          <Link to="/cities" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">Explore all →</Link>
        </div>
        {loading ? <LoadingSkeleton type="card" count={6} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cities.map(city => <CityCard key={city.id} city={city} />)}
          </div>
        )}
      </div>
    </div>
  );
}
