import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';
import { VehicleType, PlateType, Review } from '../types';
import { POSITIVE_BEHAVIOUR_TAGS, NEGATIVE_BEHAVIOUR_TAGS } from '../data/drivingTags';
import { HSRPPlate } from '../components/HSRPPlate';
import { BRAND } from '../constants/branding';
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Video,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  Shield,
  HeartHandshake,
  Columns,
  ArrowRightLeft,
  CornerDownRight,
  ZapOff,
  Split,
  Ban,
  Volume2,
  AlertOctagon,
} from 'lucide-react';

interface RateViewProps {
  vehicleData: {
    registrationNumber: string;
    make: string;
    model: string;
    colour: string;
    vehicleType: VehicleType;
    plateType: PlateType;
  };
  onSuccess: (vehicleId: string) => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

export const RateView: React.FC<RateViewProps> = ({
  vehicleData,
  onSuccess,
  onCancel,
  onOpenAuth,
}) => {
  const currentUser = storageService.getCurrentUser();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['pos_courteous_driving']);
  const [comment, setComment] = useState('');
  const [locationCity, setLocationCity] = useState('New Delhi');
  const [locationState, setLocationState] = useState('Delhi');
  const [roadType, setRoadType] = useState<Review['roadType']>('City Street');
  const [timeOfDay, setTimeOfDay] = useState<Review['timeOfDay']>('Daytime');
  const [isDashcamVerified, setIsDashcamVerified] = useState(false);
  const [isSafelyParkedConfirmed, setIsSafelyParkedConfirmed] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const ratingDescriptions: Record<number, { text: string; color: string; desc: string }> = {
    1: {
      text: 'Dangerous / Hazardous',
      color: 'text-red-400',
      desc: 'Severely compromised public road safety, rash or reckless conduct.',
    },
    2: {
      text: 'Careless / Poor',
      color: 'text-orange-400',
      desc: 'Inconsiderate driving, abrupt maneuvers or nuisance honking.',
    },
    3: {
      text: 'Average / Neutral',
      color: 'text-yellow-400',
      desc: 'Standard driving flow without notable courtesy or severe offense.',
    },
    4: {
      text: 'Courteous & Safe',
      color: 'text-emerald-400',
      desc: 'Respectful driving, clean lane discipline and prompt indicator use.',
    },
    5: {
      text: 'Exemplary / Model Driver',
      color: 'text-[#A5ED45]',
      desc: 'Outstanding civic etiquette, gave way to ambulances, yielded to pedestrians.',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!isSafelyParkedConfirmed) {
      setErrorMessage(
        'Please confirm that you personally witnessed this behaviour and are safely parked before submitting.'
      );
      return;
    }

    if (selectedTags.length === 0) {
      setErrorMessage('Please select at least one driving behaviour category.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upsert vehicle profile
      const vehicle = await storageService.upsertVehicle({
        id: vehicleData.registrationNumber,
        registrationNumber: vehicleData.registrationNumber,
        stateCode: vehicleData.registrationNumber.slice(0, 2).toUpperCase(),
        make: vehicleData.make,
        model: vehicleData.model,
        colour: vehicleData.colour,
        vehicleType: vehicleData.vehicleType,
        plateType: vehicleData.plateType,
      });

      // 2. Add review with spam & duplicate check
      await storageService.addReview({
        vehicleId: vehicle.id,
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
        locationCity,
        locationState,
        roadType,
        timeOfDay,
        isDashcamVerified,
      });

      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A5ED45', '#36B879', '#10B981', '#38BDF8'],
        });
      } catch {
        // Safe fallback
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(vehicle.id);
      }, 500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  // Helper to render icon for behaviour tags
  const renderTagIcon = (tagId: string) => {
    switch (tagId) {
      case 'pos_courteous_driving':
      case 'pos_courteous_lane':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'pos_lane_discipline':
        return <Columns className="w-3.5 h-3.5" />;
      case 'pos_indicator_use':
        return <ArrowRightLeft className="w-3.5 h-3.5" />;
      case 'pos_giving_way':
      case 'pos_pedestrian_friendly':
        return <CornerDownRight className="w-3.5 h-3.5" />;
      case 'pos_safe_distance':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'pos_safe_overtaking':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'neg_aggressive_driving':
      case 'neg_rash_driving':
        return <ZapOff className="w-3.5 h-3.5" />;
      case 'neg_tailgating':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'neg_lane_cutting':
      case 'neg_no_indicator':
        return <Split className="w-3.5 h-3.5" />;
      case 'neg_wrong_side':
        return <Ban className="w-3.5 h-3.5" />;
      case 'neg_unnecessary_honking':
      case 'neg_excessive_honking':
        return <Volume2 className="w-3.5 h-3.5" />;
      case 'neg_dangerous_overtaking':
        return <AlertOctagon className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 pb-28 text-left max-w-xl mx-auto">
      {/* Header with Cancel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
            <span>Rate Driving Conduct</span>
          </h2>
          <p className="text-xs text-slate-400">
            {BRAND.name} • {BRAND.taglineHindi}
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Target Vehicle Card */}
      <div className="p-4 rounded-3xl bg-[#15243A] border border-slate-700/80 shadow-xl flex items-center justify-between gap-3">
        <div className="space-y-1">
          <HSRPPlate
            plateNumber={vehicleData.registrationNumber}
            plateType={vehicleData.plateType}
            size="md"
          />
          <div className="text-xs text-slate-300 font-medium pt-1">
            {vehicleData.make} {vehicleData.model} • {vehicleData.colour}
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-xl bg-[#0B1424] text-slate-300 border border-slate-700">
          {vehicleData.vehicleType}
        </span>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Submission Alert</p>
            <p className="text-[11px] text-red-300">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Review Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: 1-5 STAR RATING BUTTONS */}
        <div className="p-5 rounded-3xl bg-[#15243A] border border-slate-700/80 shadow-xl space-y-3">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            Overall Driving Conduct Score (1–5 Stars)
          </label>

          {/* Large touch-friendly star buttons */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isSelected = starVal === rating;
              const isFilled = starVal <= rating;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  className={`flex-1 py-3 sm:py-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'bg-[#0B1424] border-[#A5ED45] shadow-[0_0_15px_rgba(165,237,69,0.35)] scale-105'
                      : 'bg-[#0B1424]/80 border-slate-800 hover:border-slate-700 text-slate-500'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                      isFilled
                        ? rating >= 4
                          ? 'text-[#A5ED45] fill-[#A5ED45]'
                          : rating === 3
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-red-400 fill-red-400'
                        : 'text-slate-600'
                    }`}
                  />
                  <span className="text-xs font-black text-white font-display">
                    {starVal}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Rating verdict */}
          <div className="p-2.5 rounded-xl bg-[#0B1424] border border-slate-800 text-center">
            <p className={`text-xs font-bold ${ratingDescriptions[rating].color}`}>
              {ratingDescriptions[rating].text}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {ratingDescriptions[rating].desc}
            </p>
          </div>
        </div>

        {/* STEP 2: BEHAVIOUR CATEGORY CHIPS */}
        <div className="p-5 rounded-3xl bg-[#15243A] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Observed Driving Behaviour
            </label>
            <span className="text-[10px] text-[#A5ED45] font-semibold">
              Selected ({selectedTags.length})
            </span>
          </div>

          {/* Positive category tags */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#36B879] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Positive Driving Etiquette
            </span>
            <div className="grid grid-cols-2 gap-2">
              {POSITIVE_BEHAVIOUR_TAGS.slice(0, 6).map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2 active:scale-95 text-left border ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm font-semibold'
                        : 'bg-[#0B1424] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={active ? 'text-[#36B879]' : 'text-slate-500'}>
                      {renderTagIcon(tag.id)}
                    </span>
                    <span className="truncate">{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Negative category tags */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-[#D95D5D] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Rash or Hazardous Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              {NEGATIVE_BEHAVIOUR_TAGS.slice(0, 6).map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2 active:scale-95 text-left border ${
                      active
                        ? 'bg-red-500/20 text-red-300 border-red-400 shadow-sm font-semibold'
                        : 'bg-[#0B1424] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={active ? 'text-[#D95D5D]' : 'text-slate-500'}>
                      {renderTagIcon(tag.id)}
                    </span>
                    <span className="truncate">{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 3: CONTEXT & OPTIONAL REVIEW */}
        <div className="p-5 rounded-3xl bg-[#15243A] border border-slate-700/80 shadow-xl space-y-4">
          <label className="block text-xs font-bold text-white uppercase tracking-wider">
            Incident Context & Review (Optional)
          </label>

          {/* Location & Road */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" /> City
              </label>
              <select
                value={locationCity}
                onChange={(e) => {
                  setLocationCity(e.target.value);
                  if (e.target.value === 'New Delhi') setLocationState('Delhi');
                  else if (e.target.value === 'Mumbai' || e.target.value === 'Pune') setLocationState('Maharashtra');
                  else if (e.target.value === 'Bengaluru') setLocationState('Karnataka');
                  else if (e.target.value === 'Gurugram') setLocationState('Haryana');
                  else if (e.target.value === 'Chennai') setLocationState('Tamil Nadu');
                  else if (e.target.value === 'Hyderabad') setLocationState('Telangana');
                  else if (e.target.value === 'Noida') setLocationState('Uttar Pradesh');
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1424] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#A5ED45]"
              >
                <option value="New Delhi">New Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Gurugram">Gurugram</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Noida">Noida</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Jaipur">Jaipur</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Time of Incident
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as Review['timeOfDay'])}
                className="w-full px-3 py-2 rounded-xl bg-[#0B1424] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#A5ED45]"
              >
                <option value="Morning Rush">Morning Rush (7am - 11am)</option>
                <option value="Daytime">Daytime (11am - 5pm)</option>
                <option value="Evening Peak">Evening Peak (5pm - 9pm)</option>
                <option value="Late Night">Late Night (9pm - 7am)</option>
              </select>
            </div>
          </div>

          {/* Road Type */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Road Infrastructure</label>
            <select
              value={roadType}
              onChange={(e) => setRoadType(e.target.value as Review['roadType'])}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1424] border border-slate-700 text-xs text-white focus:outline-none focus:border-[#A5ED45]"
            >
              <option value="City Street">City Street / Arterial Road</option>
              <option value="Expressway">Access-Controlled Expressway</option>
              <option value="National Highway">National / State Highway (NH/SH)</option>
              <option value="Traffic Intersection">Traffic Signal / Roundabout</option>
              <option value="Narrow By-lane">Narrow Residential By-lane</option>
            </select>
          </div>

          {/* Dashcam verification toggle */}
          <div
            onClick={() => setIsDashcamVerified(!isDashcamVerified)}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              isDashcamVerified
                ? 'bg-blue-950/40 border-blue-400/80 text-blue-200'
                : 'bg-[#0B1424]/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDashcamVerified ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dashcam Witness Verified</p>
                <p className="text-[10px] text-slate-400">
                  Backed by dashcam footage (+30 Karma boost)
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                isDashcamVerified ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-600'
              }`}
            >
              {isDashcamVerified && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Comment textarea */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Observations & Narrative (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Yielded to an ambulance near the flyover, signaled 50m in advance..."
              className="w-full p-3 rounded-xl bg-[#0B1424] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#A5ED45] resize-none"
            />
          </div>
        </div>

        {/* STEP 4: MANDATORY SAFE-PARKING & OBSERVATION ATTESTATION */}
        <div
          onClick={() => setIsSafelyParkedConfirmed(!isSafelyParkedConfirmed)}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
            isSafelyParkedConfirmed
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${
              isSafelyParkedConfirmed
                ? 'bg-[#36B879] border-emerald-400 text-white'
                : 'border-slate-600'
            }`}
          >
            {isSafelyParkedConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white">Witness Safety Confirmation</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              I confirm that I personally observed this driving behaviour and that I am safely parked before submitting this report.
            </p>
          </div>
        </div>

        {/* Auth prompt if guest */}
        {!currentUser && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">Sign-in Required to Submit</p>
              <p className="text-[11px] text-amber-300/80">
                Sign in with Google or an email profile to submit your rating.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Submit button */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={isSubmitting || !isSafelyParkedConfirmed}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#A5ED45] to-[#36B879] text-slate-950 font-display font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-[0_0_25px_rgba(165,237,69,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? `Submitting to ${BRAND.name}...` : 'Submit Driving Rating'}</span>
          </button>

          <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#A5ED45]" />
            Protected by anti-spam rate limiting & duplicate verification.
          </p>
        </div>
      </form>
    </div>
  );
};
