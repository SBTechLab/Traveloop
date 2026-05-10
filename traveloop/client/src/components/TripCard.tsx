import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  stops: { id: string }[];
  description?: string;
  isPublic?: boolean;
}

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const placeholder = `https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80`;

  return (
    <div className="card overflow-hidden group hover:border-primary/50 hover:shadow-primary/10 hover:shadow-2xl transition-all duration-300 animate-fade-in">
      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={trip.coverPhoto || placeholder}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
        {trip.isPublic && (
          <span className="absolute top-3 right-3 badge bg-accent/20 text-accent border border-accent/30">🌐 Public</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-100 text-lg mb-1 line-clamp-1">{trip.name}</h3>
        {trip.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{trip.description}</p>}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span>📅 {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>
          <span>📍 {trip.stops.length} {trip.stops.length === 1 ? 'stop' : 'stops'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/trips/${trip.id}`} className="btn-primary text-sm py-1.5 flex-1 text-center">View</Link>
          <Link to={`/trips/${trip.id}/build`} className="btn-secondary text-sm py-1.5 px-3">Edit</Link>
          {onDelete && (
            <button
              onClick={() => onDelete(trip.id)}
              className="btn-secondary text-sm py-1.5 px-3 hover:text-red-400 hover:border-red-500/50"
            >🗑️</button>
          )}
        </div>
      </div>
    </div>
  );
}
