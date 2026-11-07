import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'pill';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 border border-lime-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Install ChalMeter App</h4>
              <p className="text-xs text-slate-300">Fast 1-tap plate scanner on your Android home screen.</p>
            </div>
          </div>
          <button
            onClick={install}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#A3E635] text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#bef264] transition shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Install PWA
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-slate-950 text-xs font-bold hover:bg-lime-300 transition shadow-sm active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (since iOS does not emit beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        {variant === 'banner' ? (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Add ChalMeter to iPhone</p>
                <p className="text-[11px] text-slate-400">Fast native feel on iOS</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              How to Install
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-800/80 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-lime-400" />
            <span>Install on iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0D1527] border border-slate-700 p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-lime-400/20 border border-lime-400/30 flex items-center justify-center text-lime-400 mb-4">
                <Download className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">Install ChalMeter on iPhone</h3>
              <p className="text-xs text-slate-300 mt-1">
                Install directly without going through the App Store:
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Step 1</p>
                    <p className="text-slate-300">Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-lime-500/20 text-lime-400">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Step 2</p>
                    <p className="text-slate-300">Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-lime-300 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
