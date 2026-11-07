import React from 'react';
import { PlateType } from '../types';

interface HSRPPlateProps {
  plateNumber: string;
  plateType?: PlateType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRivets?: boolean;
  className?: string;
}

export const HSRPPlate: React.FC<HSRPPlateProps> = ({
  plateNumber,
  plateType = 'White (Private)',
  size = 'md',
  showRivets = true,
  className = '',
}) => {
  // Styles depending on Indian plate category
  let bgClass = 'bg-white text-slate-950 border-slate-900';
  let indBg = 'bg-[#003893] text-white';
  let indText = 'text-white';
  let sealStroke = '#FFFFFF';

  if (plateType.includes('Yellow')) {
    bgClass = 'bg-[#FFDF00] text-slate-950 border-slate-950';
    indBg = 'bg-[#003893] text-white';
  } else if (plateType.includes('Green')) {
    bgClass = 'bg-[#008744] text-white border-white/40';
    indBg = 'bg-[#005a2e] text-white';
  } else if (plateType.includes('Black')) {
    bgClass = 'bg-slate-950 text-[#FFDF00] border-slate-700';
    indBg = 'bg-[#003893] text-white';
  }

  // Size scalers
  const sizeClasses = {
    sm: 'text-xs h-8 px-1.5 py-0.5 rounded shadow-sm gap-1',
    md: 'text-base h-11 px-2.5 py-1 rounded-md shadow-md gap-2',
    lg: 'text-xl h-14 px-3.5 py-1.5 rounded-lg shadow-lg gap-2.5',
    xl: 'text-2xl h-16 px-4 py-2 rounded-xl shadow-xl gap-3',
  };

  const fontSizes = {
    sm: 'text-xs tracking-wider',
    md: 'text-base tracking-widest',
    lg: 'text-xl tracking-widest',
    xl: 'text-2xl tracking-widest',
  };

  return (
    <div
      className={`inline-flex items-center border-2 border-slate-900/80 font-plate select-all shadow-inner relative transition-transform ${bgClass} ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.4)',
      }}
    >
      {/* Corner security rivets */}
      {showRivets && size !== 'sm' && (
        <>
          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
        </>
      )}

      {/* Blue IND Strip */}
      <div
        className={`flex flex-col items-center justify-center h-full px-1.5 -my-1 rounded-sm ${indBg}`}
        style={{ minWidth: size === 'sm' ? '18px' : size === 'md' ? '26px' : '34px' }}
      >
        {/* Ashoka Chakra symbol */}
        <svg
          viewBox="0 0 24 24"
          className={size === 'sm' ? 'w-2 h-2 mb-0.5' : 'w-3.5 h-3.5 mb-0.5'}
          fill="none"
          stroke={sealStroke}
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" fill={sealStroke} />
          <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.5" />
          <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.5" />
          <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" strokeWidth="1.5" />
          <line x1="4.9" y1="19.1" x2="19.1" y2="4.9" strokeWidth="1.5" />
        </svg>
        <span
          className={`font-black uppercase tracking-tighter leading-none ${indText}`}
          style={{ fontSize: size === 'sm' ? '7px' : size === 'md' ? '9px' : '11px' }}
        >
          IND
        </span>
      </div>

      {/* Registration Plate characters */}
      <span className={`font-black uppercase tracking-widest whitespace-nowrap pl-1 ${fontSizes[size]}`}>
        {plateNumber.toUpperCase()}
      </span>
    </div>
  );
};
