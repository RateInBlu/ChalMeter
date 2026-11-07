import React from 'react';
import { Home, Search, Camera, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1424]/95 backdrop-blur-lg border-t border-[#15243A] pb-safe">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-between relative">
        {/* Home */}
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition ${
            activeView === 'home' ? 'text-[#A5ED45] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${activeView === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setActiveView('search')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition ${
            activeView === 'search' ? 'text-[#A5ED45] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Search"
        >
          <Search className={`w-5 h-5 ${activeView === 'search' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Search</span>
        </button>

        {/* Central Scan Vehicle Button (Signature Lime-Green Element) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => setActiveView('scan')}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition shadow-2xl relative group active:scale-95 border-2 border-[#0B1424] ${
              activeView === 'scan'
                ? 'bg-gradient-to-tr from-[#A5ED45] to-[#36B879] text-slate-950 shadow-[0_0_25px_rgba(165,237,69,0.7)] scale-105'
                : 'bg-gradient-to-tr from-[#A5ED45] to-[#8CD62C] text-slate-950 shadow-[0_0_20px_rgba(165,237,69,0.45)] hover:brightness-110'
            }`}
            aria-label="Scan Vehicle"
          >
            <Camera className="w-6 h-6 stroke-[2.5] drop-shadow-sm text-[#0B1424]" />
            <span className="text-[8px] font-black uppercase tracking-wider text-[#0B1424] -mt-0.5 font-display">
              SCAN
            </span>
          </button>
        </div>

        {/* Community (Index / Leaderboard) */}
        <button
          onClick={() => setActiveView('leaderboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition ${
            activeView === 'leaderboard' ? 'text-[#A5ED45] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Community"
        >
          <Trophy className={`w-5 h-5 ${activeView === 'leaderboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Community</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveView('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition ${
            activeView === 'profile' ? 'text-[#A5ED45] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Profile"
        >
          <User className={`w-5 h-5 ${activeView === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
