import React from 'react';
import { ShieldCheck, EyeOff, Trash2 } from 'lucide-react';

export const PrivacyBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
        <span>
          <strong className="text-slate-200">Zero Owner PII</strong>: Photographs are wiped after plate OCR. No owner name or registration records are accessed.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1427] border border-slate-800 p-4 shadow-lg text-left">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Civic Privacy & Data Integrity Charter
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs text-slate-300">
        <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">No Owner Personal Identity</p>
            <p className="text-[11px] text-slate-400">ChalMeter rates public road driving behavior only. Never queries VAHAN owner identity or contact info.</p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <Trash2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Zero Photo Retention</p>
            <p className="text-[11px] text-slate-400">Captured camera frames are analyzed in-memory for plate OCR and promptly destroyed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
