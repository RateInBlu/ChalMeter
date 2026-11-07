import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ChalMeterLogo } from './ChalMeterLogo';
import { Bell, Sparkles, LogOut, LogIn, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, setActiveView }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storageService.getCurrentUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    return storageService.subscribe(() => {
      setCurrentUser(storageService.getCurrentUser());
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1424]/95 backdrop-blur-md border-b border-[#15243A] pt-safe">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* ChalMeter Logo */}
        <button
          onClick={() => setActiveView('home')}
          className="text-left group focus:outline-none flex items-center gap-2"
          aria-label="ChalMeter Home"
        >
          <ChalMeterLogo variant="full" size="md" showTagline={false} />
        </button>

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[#15243A]/80 hover:bg-[#15243A] text-slate-300 hover:text-white border border-slate-700/60 transition relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A5ED45]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#15243A] border border-slate-700 shadow-2xl p-3 z-50 text-left animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#A5ED45]" />
                    Community Updates
                  </span>
                  <span className="text-[10px] text-[#A5ED45] font-mono">Live</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#0B1424] border border-slate-800 text-slate-300">
                    <p className="font-semibold text-white text-[11px]">Civic Milestone</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Over 100+ Indian vehicles now crowd-rated on ChalMeter.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0B1424] border border-slate-800 text-slate-300">
                    <p className="font-semibold text-white text-[11px]">Safe Driving Rewarded</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Dashcam verified ratings earn +30 Karma in your civic profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* User Account / Contribution Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#15243A]/80 border border-slate-700/80 hover:border-[#A5ED45]/50 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#A5ED45]/40"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-[#A5ED45] font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    {currentUser.karmaPoints} pts
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#15243A] border border-slate-700 shadow-2xl p-2 z-50 text-left animate-fade-in">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A5ED45]/10 text-[#A5ED45] text-[10px] font-bold border border-[#A5ED45]/30">
                      {currentUser.badge} • {currentUser.karmaPoints} Karma
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 mt-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A5ED45]" />
                    My Contribution Profile
                  </button>

                  <button
                    onClick={() => {
                      storageService.signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 transition flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15243A] hover:bg-slate-800 text-xs font-bold text-white transition border border-slate-700 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-[#A5ED45]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
