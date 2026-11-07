import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Vehicle, INDIAN_STATE_CODES } from '../types';
import { HSRPPlate } from '../components/HSRPPlate';
import { ScoreGauge } from '../components/ScoreGauge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { DemoBadge } from '../components/DemoIndicator';
import { Search, Filter, Camera, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface SearchViewProps {
  onSelectVehicle: (vehicleId: string) => void;
  onScanClick: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onSelectVehicle, onScanClick }) => {
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [results, setResults] = useState<Vehicle[]>(storageService.getAllVehicles());

  useEffect(() => {
    return storageService.subscribe(() => {
      setResults(storageService.searchVehicles(query, selectedState, selectedType));
    });
  }, [query, selectedState, selectedType]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setResults(storageService.searchVehicles(text, selectedState, selectedType));
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setResults(storageService.searchVehicles(query, state, selectedType));
  };

  const popularStates = ['ALL', 'DL', 'MH', 'KA', 'HR', 'TN', 'UP', 'TS', 'BH'];

  return (
    <div className="space-y-5 pb-6 text-left max-w-xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
          <Search className="w-6 h-6 text-lime-400" />
          <span>Vehicle Registry Search</span>
        </h2>
        <p className="text-xs text-slate-400">
          Search by Indian registration plate number, brand, or model
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute left-3.5 top-3.5 text-lime-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="e.g. DL 01, MH 12, Nexon, Thar..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-plate text-white placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-lime-400 shadow-xl"
        />
        {query && (
          <button
            onClick={() => handleQueryChange('')}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* State Filter Carousel */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3 h-3" /> State / RTO Jurisdiction
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {popularStates.map((st) => (
            <button
              key={st}
              onClick={() => handleStateChange(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                selectedState === st
                  ? 'bg-lime-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All India' : `${st} - ${INDIAN_STATE_CODES[st] || st}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found {results.length} registered vehicles</span>
          {query && (
            <span className="text-lime-400 font-medium">Matching "{query}"</span>
          )}
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <p className="text-sm font-semibold text-white">No vehicle found with this plate</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              This vehicle might not have been indexed by the community yet. Be the first to scan and rate its conduct!
            </p>
            <button
              onClick={onScanClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
            >
              <Camera className="w-4 h-4" />
              <span>Scan & Add Vehicle</span>
            </button>
          </div>
        ) : (
          results.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle.id)}
              className="group p-4 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-lime-500/40 hover:bg-[#121d36] transition cursor-pointer shadow-md flex items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <HSRPPlate
                    plateNumber={vehicle.registrationNumber}
                    plateType={vehicle.plateType}
                    size="sm"
                  />
                  <DemoBadge isDemo={vehicle.isDemo} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-white">
                    {vehicle.make} {vehicle.model}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{vehicle.colour}</span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <ConfidenceBadge
                    confidence={vehicle.confidenceScore}
                    reviewCount={vehicle.totalReviews}
                  />
                  <span className="text-[11px] text-slate-400">
                    {vehicle.totalReviews} reports
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ScoreGauge score={vehicle.averageRating} size={70} strokeWidth={6} showLabel={false} />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-lime-400 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Indian Plate Format Guide */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
          Indian Registration (HSRP) Standard
        </h4>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Standard plates follow: <code className="text-lime-300 font-mono">DL 01 AB 1234</code> (State Code + District RTO + Series Alphabet + 4-digit unique number). Defense/Central personnel use the <code className="text-blue-300 font-mono">22 BH 1234 AA</code> Bharat Series.
        </p>
      </div>
    </div>
  );
};
