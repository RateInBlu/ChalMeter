import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Vehicle, Review, UserProfile } from '../types';
import { getTagById } from '../data/drivingTags';
import { HSRPPlate } from '../components/HSRPPlate';
import { ScoreGauge } from '../components/ScoreGauge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ReportModal } from '../components/ReportModal';
import { DemoBadge } from '../components/DemoIndicator';
import { BRAND } from '../constants/branding';
import {
  ArrowLeft,
  ThumbsUp,
  Flag,
  Video,
  Lock,
  PlusCircle,
  Share2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  Info,
} from 'lucide-react';

interface VehicleDetailViewProps {
  vehicleId: string;
  onBack: () => void;
  onRateVehicle: (vehicle: Vehicle) => void;
  onOpenAuth: () => void;
}

export const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({
  vehicleId,
  onBack,
  onRateVehicle,
  onOpenAuth,
}) => {
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(storageService.getVehicleById(vehicleId));
  const [reviews, setReviews] = useState<Review[]>(storageService.getReviewsForVehicle(vehicleId));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storageService.getCurrentUser());
  const [flaggingReviewId, setFlaggingReviewId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    return storageService.subscribe(() => {
      setVehicle(storageService.getVehicleById(vehicleId));
      setReviews(storageService.getReviewsForVehicle(vehicleId));
      setCurrentUser(storageService.getCurrentUser());
    });
  }, [vehicleId]);

  if (!vehicle) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400">Vehicle not found in database.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const handleShare = () => {
    const text = `Check out ChalMeter score for ${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model}) - Score: ${Math.round(vehicle.averageRating * 20)}/100 (${vehicle.averageRating}/5.0)`;
    if (navigator.share) {
      navigator.share({ title: `${BRAND.name} India`, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    storageService.toggleHelpful(reviewId);
  };

  const handleFlagClick = (reviewId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setFlaggingReviewId(reviewId);
  };

  const positivePercent =
    vehicle.totalReviews > 0
      ? Math.round((vehicle.positiveReviewsCount / vehicle.totalReviews) * 100)
      : 100;

  const chalMeterScore = Math.round(vehicle.averageRating * 20);

  return (
    <div className="space-y-6 pb-6 text-left max-w-xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#15243A] border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#15243A] border border-slate-700 transition"
        >
          <Share2 className="w-4 h-4 text-[#A5ED45]" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
        </button>
      </div>

      {/* Hero Vehicle Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#15243A] via-[#0E1A2E] to-[#0B1424] border border-[#A5ED45]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#A5ED45]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <HSRPPlate
                plateNumber={vehicle.registrationNumber}
                plateType={vehicle.plateType}
                size="lg"
              />
              <DemoBadge isDemo={vehicle.isDemo} size="sm" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {vehicle.colour} • {vehicle.vehicleType}
              </p>
            </div>

            {/* DUAL CONFIDENCE METRICS */}
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <ConfidenceBadge
                  confidence={vehicle.confidenceScore}
                  reviewCount={vehicle.totalReviews}
                  showExplanation={false}
                />

                <span className="text-[11px] text-slate-300 px-2 py-0.5 rounded-full bg-[#0B1424] border border-slate-700">
                  {vehicle.totalReviews} Independent {vehicle.totalReviews === 1 ? 'Rating' : 'Ratings'}
                </span>
              </div>

              {/* Identification Confidence vs Community Rating Confidence */}
              <div className="p-2.5 rounded-xl bg-[#0B1424]/90 border border-slate-800 text-[10px] text-slate-300 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plate Format Verification:</span>
                  <span className="text-[#36B879] font-bold">100% Validated Indian HSRP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Community Confidence:</span>
                  <span className="text-white font-bold">{vehicle.confidenceScore} ({vehicle.totalReviews} peer observations)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Speedometer Circular Score Gauge (out of 100) */}
          <div className="shrink-0 flex flex-col items-center">
            <ScoreGauge score={vehicle.averageRating} size={135} strokeWidth={11} showLabel={true} showOutOf100={true} />
            <span className="text-[10px] text-[#A5ED45] font-semibold mt-1 font-mono">
              ChalMeter Reputation Index
            </span>
          </div>
        </div>

        {/* Conduct Ratio Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#36B879] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {positivePercent}% Commendable Conduct
            </span>
            <span className="font-bold text-[#D95D5D] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {100 - positivePercent}% Rash or Hazard Reports
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#0B1424] overflow-hidden flex border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#A5ED45] transition-all duration-700"
              style={{ width: `${positivePercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-700"
              style={{ width: `${100 - positivePercent}%` }}
            />
          </div>
        </div>

        {/* Rate Action Button */}
        <div className="mt-5">
          <button
            onClick={() => onRateVehicle(vehicle)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#A5ED45] to-[#36B879] text-slate-950 font-display font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-[0_0_20px_rgba(165,237,69,0.35)] flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Rate This Vehicle's Driving Conduct</span>
          </button>
        </div>
      </div>

      {/* Fairness & Legal Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-[#15243A]/80 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong>Community Observation Notice:</strong> All scores and reviews reflect citizen-contributed driving observations on public roads. Road user reputation is crowd-evaluated; entries do not represent official administrative penalties or VAHAN records.
        </p>
      </div>

      {/* Top Behaviour Tags Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Positive Tags */}
        <div className="p-4 rounded-3xl bg-[#15243A] border border-slate-700/80 space-y-2">
          <h3 className="text-xs font-bold text-[#36B879] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Top Commendable Habits
          </h3>
          {vehicle.topPositiveTags.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No positive tags recorded yet.</p>
          ) : (
            <div className="space-y-1.5">
              {vehicle.topPositiveTags.map(({ tagId, count }) => {
                const tag = getTagById(tagId);
                return (
                  <div
                    key={tagId}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#0B1424] text-xs"
                  >
                    <span className="text-slate-200 font-medium">{tag?.name || tagId}</span>
                    <span className="text-[#A5ED45] font-bold bg-[#A5ED45]/10 px-2 py-0.5 rounded">
                      +{count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Negative Tags */}
        <div className="p-4 rounded-3xl bg-[#15243A] border border-slate-700/80 space-y-2">
          <h3 className="text-xs font-bold text-[#D95D5D] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Reported Concerns
          </h3>
          {vehicle.topNegativeTags.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Zero negative incidents reported!</p>
          ) : (
            <div className="space-y-1.5">
              {vehicle.topNegativeTags.map(({ tagId, count }) => {
                const tag = getTagById(tagId);
                return (
                  <div
                    key={tagId}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#0B1424] text-xs"
                  >
                    <span className="text-slate-200 font-medium">{tag?.name || tagId}</span>
                    <span className="text-[#D95D5D] font-bold bg-[#D95D5D]/10 px-2 py-0.5 rounded">
                      -{count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED COMMUNITY REVIEWS SECTION (GATED BY AUTHENTICATION) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Community Witness Logs</span>
            <span className="px-2 py-0.2 rounded-full bg-[#15243A] text-xs text-slate-300 font-semibold">
              {reviews.length}
            </span>
          </h2>
          <span className="text-[11px] text-slate-400">
            {currentUser ? 'Verified Citizen View' : 'Public Preview'}
          </span>
        </div>

        {/* GATED ACCESS NOTICE IF NOT AUTHENTICATED */}
        {!currentUser ? (
          <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-[#15243A]/90 p-6 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A5ED45]/10 text-[#A5ED45] flex items-center justify-center mx-auto border border-[#A5ED45]/20">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-display">
                Detailed Incident Logs Restricted
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                To prevent web scraping and protect citizen discussions, full dashcam timestamps, witness narratives, and location road names are available exclusively to verified community members.
              </p>
            </div>

            <div className="opacity-25 filter blur-[3px] select-none pointer-events-none p-3 rounded-2xl bg-[#0B1424] border border-slate-800">
              <p className="text-xs font-bold text-white">Witness Report on Outer Ring Road</p>
              <p className="text-[11px] text-slate-300 mt-1">
                Yielded immediately to emergency vehicle, patient during heavy evening congestion...
              </p>
            </div>

            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#A5ED45] to-[#36B879] text-slate-950 font-display font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg"
            >
              Sign In to View All {reviews.length} Reports
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#15243A] border border-slate-800 text-slate-400 text-xs">
                No reports submitted for this vehicle yet. Be the first to rate!
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-3xl bg-[#15243A] border border-slate-700/70 shadow-lg space-y-3 text-left"
                >
                  {/* Top user row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.userName}`}
                        alt={rev.userName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                          {rev.userBadge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0B1424] text-[#A5ED45] border border-[#A5ED45]/30 font-semibold">
                              {rev.userBadge}
                            </span>
                          )}
                          <DemoBadge isDemo={rev.isDemo} size="sm" />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating display */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0B1424] border border-slate-800">
                      <span className="text-xs font-black text-white font-display">{rev.rating}</span>
                      <span className="text-[#A5ED45] text-xs">★</span>
                    </div>
                  </div>

                  {/* Context chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B1424] border border-slate-800">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {rev.locationCity}, {rev.locationState}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B1424] border border-slate-800">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {rev.timeOfDay} • {rev.roadType}
                    </span>
                    {rev.isDashcamVerified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 font-semibold">
                        <Video className="w-3 h-3 text-blue-400" />
                        Dashcam Verified
                      </span>
                    )}
                  </div>

                  {/* Tag Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((tId) => {
                      const tag = getTagById(tId);
                      const isPos = tId.startsWith('pos_');
                      return (
                        <span
                          key={tId}
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-lg border ${
                            isPos
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-950/40 text-red-300 border-red-500/30'
                          }`}
                        >
                          {tag?.name || tId}
                        </span>
                      );
                    })}
                  </div>

                  {/* Comment */}
                  {rev.comment && (
                    <p className="text-xs text-slate-200 leading-relaxed bg-[#0B1424]/70 p-3 rounded-2xl border border-slate-800/80">
                      “{rev.comment}”
                    </p>
                  )}

                  {/* Footer actions: Helpful and Report */}
                  <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(rev.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                        storageService.isReviewHelpfulVoted(rev.id)
                          ? 'bg-[#A5ED45]/20 text-[#A5ED45] border border-[#A5ED45]/40 font-bold'
                          : 'bg-[#0B1424] hover:bg-slate-800 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFlagClick(rev.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-red-400 transition"
                      title="Report Inaccurate Observation"
                    >
                      <Flag className="w-3 h-3" />
                      <span className="text-[10px]">Report</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {flaggingReviewId && (
        <ReportModal
          reviewId={flaggingReviewId}
          onClose={() => setFlaggingReviewId(null)}
          onSuccess={() => setFlaggingReviewId(null)}
        />
      )}
    </div>
  );
};
