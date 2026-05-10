import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  stops: { id: string, city?: { name: string } }[];
  description?: string;
  isPublic?: boolean;
}

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const placeholder = `https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80`;
  const stopNames = trip.stops.map(s => s.city?.name).filter(Boolean).slice(0, 2).join(', ');
  const moreStops = trip.stops.length > 2 ? ` +${trip.stops.length - 2} more` : '';

  return (
    <div className="group relative bg-surface-container-lowest rounded-[32px] border border-outline-variant/10 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 transform hover:-translate-y-2">
      {/* Cover Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={trip.coverPhoto || placeholder}
          alt={trip.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-90" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {trip.isPublic && (
            <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30">
              🌐 Public
            </span>
          )}
        </div>

        {/* Delete Action */}
        {onDelete && (
          <button 
            onClick={(e) => { e.preventDefault(); onDelete(trip.id); }}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md text-white/50 hover:text-error hover:bg-error/10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        )}

        <div className="absolute bottom-6 left-6 right-6">
           <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
            {format(new Date(trip.startDate), 'MMM d')} — {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </p>
          <h3 className="font-serif text-3xl font-bold text-white line-clamp-1">{trip.name}</h3>
        </div>
      </div>

      <div className="p-8 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex -space-x-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high overflow-hidden">
                 <img src={`https://i.pravatar.cc/100?u=${trip.id}${i}`} alt="Traveler" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">+2 friends</span>
        </div>

        <div className="space-y-4 mb-8">
           <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <span>Progress</span>
              <span className="text-primary">{trip.stops.length > 0 ? '65%' : '0%'}</span>
           </div>
           <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(255,182,144,0.3)]" style={{ width: trip.stops.length > 0 ? '65%' : '0%' }}></div>
           </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">
              {stopNames ? `${stopNames}${moreStops}` : 'No stops added'}
            </span>
          </div>
          <Link 
            to={`/trips/${trip.id}`} 
            className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group/btn"
          >
            View Trip
            <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
