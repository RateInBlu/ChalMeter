import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { ReviewReport } from '../types';
import { Flag, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  reviewId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ reviewId, onClose, onSuccess }) => {
  const [reason, setReason] = useState<ReviewReport['reason']>('Spam or Advertising');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!reviewId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      storageService.reportReview({
        reviewId,
        reason,
        details,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit flag');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0D1527] border border-slate-700 p-5 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Flag Review for Moderation</h3>
            <p className="text-[11px] text-slate-400">Maintain integrity in ChalMeter India</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 mb-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <p className="text-sm font-bold text-white">Report Logged</p>
            <p className="text-xs text-slate-400 mt-1">
              Thank you. The community moderation team has received your report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Reason for Flagging</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReviewReport['reason'])}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
              >
                <option value="Spam or Advertising">Spam, Promotional, or Bot text</option>
                <option value="Abusive / Personal Attack">Abusive language or Personal attack</option>
                <option value="Wrong Vehicle / Mistaken Plate">Plate number or vehicle mismatch</option>
                <option value="Fabricated / False Accusation">Fabricated or malicious accusation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Additional Context (Optional)</label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Briefly describe why this review violates civic guidelines..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-500 transition"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
