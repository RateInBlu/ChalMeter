import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Vehicle, UserProfile } from '../types';
import { HSRPPlate } from '../components/HSRPPlate';
import { ScoreGauge } from '../components/ScoreGauge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { DemoBadge } from '../components/DemoIndicator';
import { Trophy, AlertOctagon, Award, ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';

interface LeaderboardViewProps {
  onSelectVehicle: (vehicleId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onSelectVehicle }) => {
  const [tab, setTab] = useState<'hall_of_fame' | 'watchlist' | 'scouts'>('hall_of_fame');
  const vehicles = storageService.getAllVehicles();
  const scouts: UserProfile[] = storageService.getLeaderboardScouts();

  const hallOfFame = [...vehicles]
    .filter((v) => v.totalReviews >= 2 && v.averageRating >= 4.0)
    .sort((a, b) => b.averageRating - a.averageRating);

  const watchlist = [...vehicles]
    .filter((v) => v.averageRating <= 3.2 && v.totalReviews >= 2)
    .sort((a, b) => a.averageRating - b.averageRating);

  return (
    <div className="space-y-5 pb-6 text-left max-w-xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
          <Trophy className="w-6 h-6 text-lime-400" />
          <span>ChalMeter National Index</span>
        </h2>
        <p className="text-xs text-slate-400">
          Rankings of verified driving etiquette & public road watchlists
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setTab('hall_of_fame')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            tab === 'hall_of_fame'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-lime-400" />
          <span>Hall of Fame</span>
        </button>

        <button
          onClick={() => setTab('watchlist')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            tab === 'watchlist'
              ? 'bg-red-950 text-red-300 border border-red-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <span>Watchlist (Rash)</span>
        </button>

        <button
          onClick={() => setTab('scouts')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            tab === 'scouts'
              ? 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Civic Scouts</span>
        </button>
      </div>

      {/* Tab 1: Hall of Fame */}
      {tab === 'hall_of_fame' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
            <p className="font-bold">🌟 India's Most Courteous Drivers</p>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Consistently reported for lane discipline, patient driving, and giving way to ambulances.
            </p>
          </div>

          {hallOfFame.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
              <p className="text-sm font-bold text-white">No vehicles in Hall of Fame yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Vehicles receive Hall of Fame standing when they accumulate at least 2 community ratings with an average score of 4.0★ or higher.
              </p>
            </div>
          ) : (
            hallOfFame.map((vehicle, idx) => (
              <div
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle.id)}
                className="p-4 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-emerald-500/50 hover:bg-[#121f38] transition cursor-pointer shadow-md flex items-center justify-between gap-3 relative overflow-hidden"
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-lime-400 to-emerald-500 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-xl">
                    #1 Safe Driver
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-lg text-slate-500 w-5 text-center">
                    #{idx + 1}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <HSRPPlate
                        plateNumber={vehicle.registrationNumber}
                        plateType={vehicle.plateType}
                        size="sm"
                      />
                      <DemoBadge isDemo={vehicle.isDemo} size="sm" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge
                        confidence={vehicle.confidenceScore}
                        reviewCount={vehicle.totalReviews}
                      />
                      <span className="text-[10px] text-slate-400">
                        {vehicle.totalReviews} positive reviews
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-base font-black text-lime-400 font-display">
                      ★ {vehicle.averageRating.toFixed(1)}
                    </span>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Watchlist */}
      {tab === 'watchlist' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
            <p className="font-bold">⚠️ Repeated Driving Offense Watchlist</p>
            <p className="text-[11px] text-red-300/80 mt-0.5">
              Vehicles flagged by multiple independent witnesses for aggressive overtaking, wrong-side driving, and blinding high beams.
            </p>
          </div>

          {watchlist.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
              <p className="text-sm font-bold text-white">No vehicles on the Watchlist</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Vehicles appear here when repeatedly reported for reckless driving, high beam misuse, or severe road violations.
              </p>
            </div>
          ) : (
            watchlist.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle.id)}
                className="p-4 rounded-2xl bg-[#0D1527] border border-red-500/30 hover:bg-[#1a121d] transition cursor-pointer shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-lg text-red-400 w-5 text-center">
                    !
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <HSRPPlate
                        plateNumber={vehicle.registrationNumber}
                        plateType={vehicle.plateType}
                        size="sm"
                      />
                      <DemoBadge isDemo={vehicle.isDemo} size="sm" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-[10px] text-red-300 font-semibold">
                      {vehicle.negativeReviewsCount} Rash Driving Incidents Logged
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-base font-black text-red-400 font-display">
                      ★ {vehicle.averageRating.toFixed(1)}
                    </span>
                    <p className="text-[9px] uppercase font-bold text-red-500">Caution</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Top Civic Scouts */}
      {tab === 'scouts' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
            <p className="font-bold">🛡️ Active Road Safety Scouts</p>
            <p className="text-[11px] text-blue-300/80 mt-0.5">
              Citizens with verified dashcam reports and highest community helpfulness ratings.
            </p>
          </div>

          {scouts.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-1">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">No community scouts ranked yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sign in, scan Indian number plates, and submit verified driving ratings to earn Civic Karma and be recognized on the national index!
              </p>
            </div>
          ) : (
            scouts.map((user, idx) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-base text-slate-400 w-5">
                    #{idx + 1}
                  </span>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-lime-400/50"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{user.name}</h4>
                      <DemoBadge isDemo={user.isDemo} size="sm" />
                    </div>
                    <p className="text-[10px] text-lime-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {user.badge}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {user.reviewsCount} verified observations
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-white font-display">
                    {user.karmaPoints}
                  </span>
                  <p className="text-[9px] uppercase font-bold text-lime-400">Karma</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
