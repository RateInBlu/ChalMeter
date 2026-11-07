import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { UserProfile, Review } from '../types';
import { DemoBadge } from '../components/DemoIndicator';
import {
  User,
  ShieldCheck,
  Award,
  Download,
  LogOut,
  ThumbsUp,
  FileText,
  Shield,
  Sparkles,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAuth: () => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth, onSelectVehicle }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storageService.getCurrentUser());
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  useEffect(() => {
    const update = () => {
      const u = storageService.getCurrentUser();
      setCurrentUser(u);
      if (u) {
        setUserReviews(storageService.getReviewsByUser(u.id));
      } else {
        setUserReviews([]);
      }
    };
    update();
    return storageService.subscribe(update);
  }, []);

  const handleExportMyData = () => {
    if (!currentUser) return;
    const data = {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        badge: currentUser.badge,
        karmaPoints: currentUser.karmaPoints,
        joinedAt: currentUser.joinedAt,
      },
      myContributions: userReviews,
      exportedAt: new Date().toISOString(),
      platform: 'ChalMeter India',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chalmeter-profile-${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      storageService.signOut();
    }
  };

  return (
    <div className="space-y-6 pb-6 text-left max-w-xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
          <User className="w-6 h-6 text-lime-400" />
          <span>Civic Scout Profile</span>
        </h2>
        <p className="text-xs text-slate-400">
          Citizen trust karma, verified road safety incident reports, and driving reputation
        </p>
      </div>

      {/* USER PROFILE CARD */}
      <div className="space-y-5 animate-fade-in">
        {currentUser ? (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0D1527] to-[#080D1A] border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-lime-400/60 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-display">{currentUser.name}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30">
                      {currentUser.badge}
                    </span>
                    <DemoBadge isDemo={currentUser.isDemo} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Member since {new Date(currentUser.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Civic Karma</p>
                <p className="text-lg font-black text-lime-400 font-display mt-0.5">
                  {currentUser.karmaPoints}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Reports Filed</p>
                <p className="text-lg font-black text-white font-display mt-0.5">
                  {userReviews.length}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Trust Tier</p>
                <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified</span>
                </p>
              </div>
            </div>

            {/* Profile Action: Export Personal Data */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExportMyData}
                className="text-xs text-slate-400 hover:text-lime-300 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export My Contributions (JSON)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/10 text-lime-400 border border-lime-400/20 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Guest Session Active</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Sign in with Google or Email to record driving ratings, earn Civic Karma, and unlock full community witness reports.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs uppercase transition shadow active:scale-95"
            >
              Sign In to Profile
            </button>
          </div>
        )}

        {/* MY SUBMITTED REVIEWS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-lime-400" />
              <span>My Field Contributions ({userReviews.length})</span>
            </h3>
          </div>

          {userReviews.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                You haven't submitted any vehicle reviews yet. Tap the <strong>Scan</strong> button in the bottom navigation to rate your first vehicle!
              </p>
            </div>
          ) : (
            userReviews.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectVehicle(r.vehicleId)}
                className="p-3.5 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-plate text-white">{r.vehicleId}</span>
                    <DemoBadge isDemo={r.isDemo} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rated {r.rating}★ • {r.locationCity} ({new Date(r.createdAt).toLocaleDateString()})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ThumbsUp className="w-3.5 h-3.5 text-lime-400" />
                  <span>{r.helpfulCount}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CITIZEN CODE OF CONDUCT & PRIVACY CHARTER */}
        <div className="p-5 rounded-3xl bg-[#0D1527] border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-lime-400" />
            ChalMeter Citizen Trust Charter
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            ChalMeter ratings reflect verified on-road driving conduct observed in public spaces. Personal vehicle ownership records, driver identities, and home addresses are never queried, retained, or displayed.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-lime-400 shrink-0" />
              <span>Zero-PII Privacy Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-lime-400 shrink-0" />
              <span>Anti-Spam & 24h Cooldown</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
