import React, { useState } from 'react';
import { ConfidenceLevel } from '../types';
import { ShieldAlert, ShieldCheck, Shield, Info } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  reviewCount: number;
  showExplanation?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  reviewCount,
  showExplanation = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const config = {
    LOW: {
      label: 'Low Confidence',
      badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
      icon: ShieldAlert,
      dots: 1,
      description: 'Based on 1–2 initial reports. Requires more independent community observations to establish an authoritative pattern.',
    },
    MEDIUM: {
      label: 'Medium Confidence',
      badgeClass: 'bg-blue-950/40 text-blue-300 border-blue-500/30',
      icon: Shield,
      dots: 2,
      description: `Based on ${reviewCount} community reports across multiple times and roads. Consistent driving patterns are emerging.`,
    },
    HIGH: {
      label: 'High Confidence',
      badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
      icon: ShieldCheck,
      dots: 3,
      description: `Authoritative score backed by ${reviewCount}+ independent community reviews and multi-user cross-verification.`,
    },
  }[confidence];

  const Icon = config.icon;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${config.badgeClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>

        {/* 3-dot confidence meter */}
        <div className="flex items-center gap-0.5 ml-1">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dots >= 1 ? 'bg-current' : 'bg-white/20'}`} />
          <span className={`w-1.5 h-1.5 rounded-full ${config.dots >= 2 ? 'bg-current' : 'bg-white/20'}`} />
          <span className={`w-1.5 h-1.5 rounded-full ${config.dots >= 3 ? 'bg-current' : 'bg-white/20'}`} />
        </div>

        <Info className="w-3 h-3 text-slate-400 hover:text-white" />
      </button>

      {/* Popover Tooltip */}
      {(showTooltip || showExplanation) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl text-[11px] text-slate-300 z-50 pointer-events-auto backdrop-blur-md">
          <div className="font-bold text-white mb-1 flex items-center justify-between">
            <span>Score Confidence Algorithm</span>
            <span className="text-[10px] text-slate-400">{reviewCount} reviews</span>
          </div>
          <p className="leading-relaxed">{config.description}</p>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
            Weighted by time distribution, reviewer karma, and dashcam verification.
          </div>
        </div>
      )}
    </div>
  );
};
