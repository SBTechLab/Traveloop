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
  compact?: boolean;
}

const COST_LABELS: Record<number, string> = { 1: 'Budget', 2: 'Affordable', 3: 'Moderate', 4: 'Expensive', 5: 'Luxury' };
const COST_COLORS: Record<number, string> = { 1: 'bg-green-500/20 text-green-400', 2: 'bg-emerald-500/20 text-emerald-400', 3: 'bg-yellow-500/20 text-yellow-400', 4: 'bg-orange-500/20 text-orange-400', 5: 'bg-red-500/20 text-red-400' };

function Stars({ value }: { value: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

export default function CityCard({ city, onAddToTrip }: CityCardProps) {
  const navigate = useNavigate();
  const costKey = Math.round(city.costIndex) as 1|2|3|4|5;
  const placeholder = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600';

  return (
    <div className="card overflow-hidden group hover:border-primary/40 hover:shadow-xl transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img src={city.coverPhoto || placeholder} alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <span className={`absolute top-3 left-3 badge ${COST_COLORS[costKey] || COST_COLORS[3]}`}>
          {COST_LABELS[costKey] || 'Moderate'}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-100 text-base">{city.name}</h3>
          <span className="text-xs text-gray-500 ml-2">{city.country}</span>
        </div>
        <Stars value={city.popularity} />
        {city.description && <p className="text-gray-500 text-xs mt-2 line-clamp-2">{city.description}</p>}

        <div className="flex gap-2 mt-3">
          <button onClick={() => navigate(`/cities/${city.id}/activities`)} className="btn-secondary text-xs py-1.5 flex-1">
            🎯 Activities
          </button>
          {onAddToTrip && (
            <button onClick={() => onAddToTrip(city)} className="btn-primary text-xs py-1.5 flex-1">
              + Add to Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
