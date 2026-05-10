import React from 'react';
import { useNavigate } from 'react-router-dom';

interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
  coverPhoto?: string;
  description?: string;
}

interface CityCardProps {
  city: City;
  onAddToTrip?: (city: City) => void;
}

const COST_SYMBOLS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$', 5: '$$$$$' };

export default function CityCard({ city, onAddToTrip }: CityCardProps) {
  const navigate = useNavigate();
  const costKey = Math.min(5, Math.max(1, Math.round(city.costIndex)));
  const placeholder = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600';

  return (
    <div className="group relative bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/30 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={city.coverPhoto || placeholder} 
          alt={city.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4 bg-surface-container-highest/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-primary text-sm font-fill">star</span>
          <span className="text-xs font-bold text-on-surface">{(city.popularity || 4.5).toFixed(1)}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-serif text-2xl font-bold text-on-surface">{city.name}</h3>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{city.country}</p>
          </div>
          <span className="text-primary font-bold">{COST_SYMBOLS[costKey] || '$$$'}</span>
        </div>
        
        <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 h-10">
          {city.description || `Explore the hidden gems and vibrant culture of ${city.name}, ${city.country}.`}
        </p>

        <div className="flex gap-2 mb-6">
          <span className="px-2 py-1 bg-surface-container-highest text-on-surface text-[10px] font-bold rounded uppercase tracking-wider">{city.region || 'World'}</span>
          <span className="px-2 py-1 bg-surface-container-highest text-on-surface text-[10px] font-bold rounded uppercase tracking-wider">Top Choice</span>
        </div>

        <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => navigate(`/cities/${city.id}/activities`)}
            className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl text-xs font-bold hover:bg-surface-bright transition-all active:scale-95"
          >
            Details
          </button>
          {onAddToTrip && (
            <button 
              onClick={() => onAddToTrip(city)}
              className="flex-[2] bg-primary-container text-on-primary-container py-3 rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Add to Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
