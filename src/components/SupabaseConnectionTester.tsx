import React, { useState } from 'react';
import { testSupabaseConnection } from '../services/supabaseClient';
import { SupabaseHealthCheckResult } from '../types';
import { Database, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

/**
 * Supabase Connection Diagnostics (Internal / Development Only)
 * Read-only status evaluator for environment variables.
 * Credential inputs and localStorage storage mechanisms have been permanently removed for security.
 */
export const SupabaseConnectionTester: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<SupabaseHealthCheckResult | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setResult(null);
    const check = await testSupabaseConnection();
    setResult(check);
    setIsTesting(false);
  };

  return (
    <div className="p-5 rounded-3xl bg-[#0D1527] border border-slate-800 space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Supabase Environment Diagnostics
            </h4>
            <p className="text-[11px] text-slate-400">
              Evaluates environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleTest}
        disabled={isTesting}
        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
      >
        {isTesting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Checking Configuration...</span>
          </>
        ) : (
          <span>Run Environment Diagnostic</span>
        )}
      </button>

      {result && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 ${
            result.status === 'CONNECTED'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.status === 'CONNECTED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>Status: {result.status}</span>
          </div>
          <p className="text-[11px] text-slate-300">{result.message}</p>
        </div>
      )}
    </div>
  );
};
