import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Vehicle, UserProfile } from '../types';
import { BRAND } from '../constants/branding';
import { ChalMeterLogo } from '../components/ChalMeterLogo';
import { HSRPPlate } from '../components/HSRPPlate';
import { ScoreGauge } from '../components/ScoreGauge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { PrivacyBanner } from '../components/PrivacyBanner';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { DemoBadge, DemoToggleBar } from '../components/DemoIndicator';
import {
  Camera,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  TrendingUp,
  Search,
  Clock,
  ArrowRight,
  Database,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface HomeViewProps {
  onSelectVehicle: (vehicleId: string) => void;
  onScanClick: () => void;
  onSearchClick: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectVehicle,
  onScanClick,
  onSearchClick,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(storageService.getAllVehicles());
  const [showDemo, setShowDemo] = useState<boolean>(storageService.isShowingDemoData());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storageService.getCurrentUser());
  const [filter, setFilter] = useState<'all' | 'exemplary' | 'caution'>('all');
  const syncStatus = storageService.getSyncStatus();

  useEffect(() => {
    return storageService.subscribe(() => {
      setVehicles(storageService.getAllVehicles());
      setShowDemo(storageService.isShowingDemoData());
      setCurrentUser(storageService.getCurrentUser());
    });
  }, []);

  const liveVehiclesCount = storageService.getLiveVehiclesCount();
  const liveReviewsCount = storageService.getLiveReviewsCount();
  const totalReviews = vehicles.reduce((sum, v) => sum + v.totalReviews, 0);
  const exemplaryCount = vehicles.filter((v) => v.averageRating >= 4.0).length;

  const filteredVehicles = vehicles.filter((v) => {
    if (filter === 'exemplary') return v.averageRating >= 4.0;
    if (filter === 'caution') return v.averageRating <= 2.8;
    return true;
  });

  const handleToggleDemo = (newVal: boolean) => {
    storageService.setShowDemoData(newVal);
  };

  return (
    <div className="space-y-5 pb-6 text-left">
      {/* 1. TOP GREETING & CITIZEN PROFILE BAR */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#15243A] border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-3">
          {currentUser ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#A5ED45]/60 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#0B1424] border border-[#A5ED45]/40 flex items-center justify-center text-[#A5ED45] shrink-0 font-display font-black text-xs">
              CM
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Namaste,</span>
              <span className="text-xs font-bold text-white">
                {currentUser ? currentUser.name : 'Citizen Driver'}
              </span>
            </div>
            <p className="text-[11px] text-[#A5ED45] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser ? `${currentUser.badge} • ${currentUser.karmaPoints} Karma` : 'Verified Civic Observer'}</span>
            </p>
          </div>
        </div>

        {syncStatus.isConnected ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cloud Connected</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-medium">
            <span>Database Offline</span>
          </div>
        )}
      </div>

      {/* DATABASE DISCONNECTED / LOCAL STORAGE NOTICE */}
      {!syncStatus.isConnected && (
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <p className="font-bold text-amber-300">Community Database Not Connected</p>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Remote Supabase cloud sync is not configured. Live community ratings from other users are currently unavailable. Ratings and vehicles you add will be saved locally on this device.
            </p>
          </div>
        </div>
      )}

      {/* 2. CHALMETER HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#15243A] via-[#0E1A2E] to-[#0B1424] border border-[#A5ED45]/30 p-5 sm:p-7 shadow-2xl">
        {/* Subtle background glow arcs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#A5ED45]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          {/* Brand & Hindi Etymology Tag */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#A5ED45]/10 border border-[#A5ED45]/30 text-[#A5ED45] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>चाल + मीटर • {BRAND.countryCode}</span>
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {BRAND.taglineHindi}
            </span>
          </div>

          {/* Hero Hindi Catchphrase */}
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight leading-tight">
            “Aapki nazar, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A5ED45] to-[#36B879]">sadak ka hisaab.</span>”
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {BRAND.description}
          </p>

          {/* PROMINENT CENTRAL ACTION: SCAN VEHICLE */}
          <div className="mt-6 pt-2 flex flex-col items-center sm:items-start">
            <button
              onClick={onScanClick}
              className="group relative flex items-center gap-4 p-2 pr-6 rounded-full bg-[#0B1424] border-2 border-[#A5ED45] shadow-[0_0_25px_rgba(165,237,69,0.35)] hover:shadow-[0_0_35px_rgba(165,237,69,0.55)] active:scale-95 transition-all text-left"
              aria-label="Scan Vehicle Number Plate"
            >
              {/* Distinctive lime-green circular scanning element with pulse */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#A5ED45] to-[#36B879] text-[#0B1424] flex items-center justify-center shadow-lg relative shrink-0 group-hover:scale-105 transition-transform">
                <span className="absolute inset-0 rounded-full border-2 border-[#A5ED45] animate-ping opacity-40 pointer-events-none" />
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider group-hover:text-[#A5ED45] transition-colors">
                    SCAN VEHICLE
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#A5ED45] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Instant Indian HSRP Camera & OCR Detection
                </p>
              </div>
            </button>
          </div>

          {/* Secondary Actions Bar */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onSearchClick}
              className="px-4 py-2.5 rounded-xl bg-[#15243A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-[#A5ED45]" />
              <span>Search Registration Number</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('recent-profiles-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#15243A] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recent Profiles</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. DEMO DATA AUDIT BAR (DEVELOPMENT MODE ONLY) */}
      {Boolean(import.meta.env.DEV) && (
        <DemoToggleBar
          showDemo={showDemo}
          onToggle={handleToggleDemo}
          liveCount={liveVehiclesCount}
        />
      )}

      {/* 4. PWA INSTALL BANNER */}
      <PWAInstallButton variant="banner" />

      {/* 5. COMMUNITY ACTIVITY DASHBOARD */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl bg-[#15243A] border border-slate-700/80 p-3 sm:p-4 text-center shadow-lg">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Vehicles Rated
          </p>
          <p className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
            {vehicles.length}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {liveVehiclesCount} Live Database
          </span>
        </div>

        <div className="rounded-2xl bg-[#15243A] border border-slate-700/80 p-3 sm:p-4 text-center shadow-lg">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Contributions
          </p>
          <p className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
            {totalReviews}
          </p>
          <span className="text-[10px] text-blue-400 font-semibold">
            {liveReviewsCount} Citizen Reports
          </span>
        </div>

        <div className="rounded-2xl bg-[#15243A] border border-slate-700/80 p-3 sm:p-4 text-center shadow-lg">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Top Safe Conduct
          </p>
          <p className="text-xl sm:text-2xl font-black text-[#A5ED45] font-display mt-0.5">
            {exemplaryCount}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Score &gt; 80/100</span>
        </div>
      </section>

      {/* 6. RECENT VEHICLE PROFILES STREAM */}
      <div id="recent-profiles-section" className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A5ED45]" />
            <span>Recent Vehicle Profiles</span>
          </h2>

          <div className="flex gap-1 bg-[#15243A] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-[#0B1424] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({filteredVehicles.length})
            </button>
            <button
              onClick={() => setFilter('exemplary')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filter === 'exemplary'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-[#A5ED45]" />
              Safe
            </button>
            <button
              onClick={() => setFilter('caution')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filter === 'caution'
                  ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertOctagon className="w-3 h-3 text-red-400" />
              Watchlist
            </button>
          </div>
        </div>

        {/* List of Vehicles */}
        {filteredVehicles.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-[#15243A]/50 border border-slate-800 space-y-3 p-6">
            <p className="text-sm font-bold text-white">No vehicles found in this category</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {!showDemo
                ? 'No live vehicles submitted yet. Scan an Indian number plate to create the first live ChalMeter community record!'
                : 'No vehicles match the selected rating filter.'}
            </p>
            <button
              onClick={onScanClick}
              className="mt-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Scan & Rate a Vehicle</span>
            </button>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle.id)}
              className="group p-4 rounded-3xl bg-[#15243A] border border-slate-700/80 hover:border-[#A5ED45]/50 hover:bg-[#1A2D48] transition-all cursor-pointer shadow-lg relative overflow-hidden text-left"
            >
              {/* Top Row: Plate, Demo Badge, & Score Gauge */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HSRPPlate
                      plateNumber={vehicle.registrationNumber}
                      plateType={vehicle.plateType}
                      size="md"
                    />
                    <DemoBadge isDemo={vehicle.isDemo} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-white">
                      {vehicle.make} {vehicle.model}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{vehicle.colour}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#0B1424] text-slate-300 border border-slate-700">
                      {vehicle.vehicleType}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 -mt-2 -mr-1">
                  <ScoreGauge score={vehicle.averageRating} size={88} strokeWidth={8} showLabel={false} />
                </div>
              </div>

              {/* Tag Highlights & Confidence */}
              <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ConfidenceBadge
                    confidence={vehicle.confidenceScore}
                    reviewCount={vehicle.totalReviews}
                  />
                  <span className="text-xs text-slate-400">
                    {vehicle.totalReviews} {vehicle.totalReviews === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#A5ED45] font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>View ChalMeter Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 7. PRIVACY CHARTER */}
      <PrivacyBanner />
    </div>
  );
};
