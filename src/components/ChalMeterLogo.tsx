import React from 'react';

interface ChalMeterLogoProps {
  variant?: 'full' | 'icon' | 'monochrome' | 'light' | 'dark' | 'splash';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const ChalMeterLogo: React.FC<ChalMeterLogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  // Size dimensions
  const dimensions = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 68, text: 'text-4xl', sub: 'text-sm' },
  }[size];

  const isLight = variant === 'light';
  const isMono = variant === 'monochrome';
  const isSplash = variant === 'splash';

  // SVG Speedometer + Road Icon
  const LogoIcon = ({ iconSize }: { iconSize: number }) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform hover:scale-105"
      role="img"
      aria-label="ChalMeter Icon"
    >
      <defs>
        {/* Background rounded badge gradient */}
        <linearGradient id="chalmeter-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15243A" />
          <stop offset="100%" stopColor="#0B1424" />
        </linearGradient>

        {/* Speedometer outer arc gradient */}
        <linearGradient id="meter-arc" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D95D5D" />
          <stop offset="50%" stopColor="#E8A63A" />
          <stop offset="85%" stopColor="#A5ED45" />
          <stop offset="100%" stopColor="#36B879" />
        </linearGradient>

        {/* Road surface gradient */}
        <linearGradient id="road-grad" x1="50%" y1="100%" x2="50%" y2="20%">
          <stop offset="0%" stopColor="#1E314F" />
          <stop offset="100%" stopColor="#0B1424" />
        </linearGradient>

        {/* Needle glow */}
        <filter id="needle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A5ED45" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Rounded badge container */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="26"
        fill={isLight ? '#0B1424' : 'url(#chalmeter-bg)'}
        stroke={isMono ? '#FFFFFF' : '#A5ED45'}
        strokeWidth="2.5"
        strokeOpacity={isMono ? '0.4' : '0.6'}
      />

      {/* Speedometer Dial Outer Arc */}
      <path
        d="M 22 68 A 38 38 0 1 1 78 68"
        fill="none"
        stroke={isMono ? '#FFFFFF' : 'url(#meter-arc)'}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="4 2"
      />

      {/* Inner Stylised Curved Indian Road Perspective */}
      <path
        d="M 32 78 L 44 42 Q 50 36 56 42 L 68 78 Z"
        fill="url(#road-grad)"
        stroke={isMono ? '#888' : '#2A4368'}
        strokeWidth="1.5"
      />

      {/* Road Centre Dashed Lane Marking (White) */}
      <path
        d="M 50 74 L 50 64 M 50 58 L 50 50 M 50 46 L 50 40"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Small Moving Directional Vehicle Marker */}
      <g transform="translate(50, 52) rotate(4)">
        <polygon points="-4,5 4,5 2,-5 -2,-5" fill="#FFFFFF" />
        <circle cx="0" cy="-6" r="1.5" fill="#A5ED45" />
      </g>

      {/* Center Pivot Hub */}
      <circle cx="50" cy="68" r="7" fill={isMono ? '#FFFFFF' : '#0B1424'} stroke={isMono ? '#FFFFFF' : '#A5ED45'} strokeWidth="3" />

      {/* Electric Lime Scoring Needle pointing into top safe zone (around 65° angle) */}
      <g filter="url(#needle-glow)">
        <line
          x1="50"
          y1="68"
          x2="72"
          y2="34"
          stroke={isMono ? '#FFFFFF' : '#A5ED45'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="72" cy="34" r="2.5" fill="#FFFFFF" />
      </g>
    </svg>
  );

  // Icon only variant
  if (variant === 'icon') {
    return <LogoIcon iconSize={dimensions.icon} />;
  }

  // Splash Screen Branding
  if (isSplash) {
    return (
      <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
        <LogoIcon iconSize={88} />
        <div className="mt-5">
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white flex items-center justify-center gap-1">
            <span>Chal</span>
            <span className="text-[#A5ED45]">Meter</span>
          </h1>
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mt-1">
            चाल + मीटर • IND
          </p>
          <p className="text-sm font-semibold text-lime-400/90 mt-2 font-display">
            Aapki Chal. Aapka Score.
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your Driving. Your Reputation.
          </p>
        </div>
      </div>
    );
  }

  // Horizontal Full Logo (Default)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 text-left ${className}`}>
      <LogoIcon iconSize={dimensions.icon} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display font-black tracking-tight ${dimensions.text} ${
              isLight ? 'text-[#0B1424]' : 'text-white'
            }`}
          >
            Chal<span className={isMono ? 'text-white' : 'text-[#A5ED45]'}>Meter</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-900/60 text-blue-200 border border-blue-500/30">
            IND
          </span>
        </div>

        {showTagline && (
          <p
            className={`font-medium ${dimensions.sub} mt-1 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Aapki Chal. Aapka Score.
          </p>
        )}
      </div>
    </div>
  );
};
