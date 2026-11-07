import React, { useState } from 'react';
import { FlaskConical, Info, ShieldCheck, Database } from 'lucide-react';

interface DemoBadgeProps {
  isDemo?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ isDemo = false, size = 'sm', className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isDemo) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 ${
          size === 'sm' ? 'text-[9px]' : 'text-[10px]'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live Database
      </span>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm ${
          size === 'sm' ? 'text-[9px]' : 'text-[10px]'
        }`}
      >
        <FlaskConical className="w-2.5 h-2.5 text-amber-400" />
        <span>DEMO DATA</span>
        <Info className="w-2.5 h-2.5 text-amber-400/80" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2 rounded-xl bg-slate-900 border border-amber-500/40 shadow-2xl text-[10px] text-slate-300 z-50 pointer-events-none backdrop-blur-md">
          <p className="font-bold text-amber-300 mb-0.5 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" />
            Audit Flag: Sample Catalog
          </p>
          <p className="leading-tight">
            This is a pre-seeded demonstration record for UI evaluation. Live community ratings are stored in the verified database partition.
          </p>
        </div>
      )}
    </div>
  );
};

interface DemoToggleBarProps {
  showDemo: boolean;
  onToggle: (show: boolean) => void;
  liveCount: number;
}

export const DemoToggleBar: React.FC<DemoToggleBarProps> = ({ showDemo, onToggle, liveCount }) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${showDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        <span className="text-slate-300 font-medium">
          {showDemo ? (
            <span>
              Sandbox View: <strong className="text-amber-300">Demo + Live ({liveCount})</strong>
            </span>
          ) : (
            <span>
              Database View: <strong className="text-emerald-400">Live Community Records Only ({liveCount})</strong>
            </span>
          )}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(!showDemo)}
        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
          showDemo
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
        }`}
      >
        {showDemo ? 'Filter Demo Data' : 'Show Demo Samples'}
      </button>
    </div>
  );
};
