import React from 'react';

interface ScoreGaugeProps {
  score: number; // 1.0 to 5.0
  size?: number; // diameter in px
  showLabel?: boolean;
  strokeWidth?: number;
  showOutOf100?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  showLabel = true,
  strokeWidth = 12,
  showOutOf100 = false,
}) => {
  // Normalize score between 1 and 5
  const clamped = Math.max(1, Math.min(5, score));
  // Convert 1-5 score to percentage 0% to 100%
  const percentage = (clamped - 1) / 4;
  const score100 = Math.round(clamped * 20);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // 240 degree gauge arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - percentage * arcLength;

  // Determine dynamic automotive color using ChalMeter palette
  let strokeColor = '#A5ED45'; // Electric Lime
  let glowColor = 'rgba(165, 237, 69, 0.4)';
  let verdict = 'Exemplary Conduct';
  let badgeClass = 'text-[#A5ED45] bg-[#A5ED45]/10 border-[#A5ED45]/30';

  if (clamped < 2.5) {
    strokeColor = '#D95D5D'; // Negative indicator
    glowColor = 'rgba(217, 93, 93, 0.4)';
    verdict = 'High Risk / Watchlist';
    badgeClass = 'text-[#D95D5D] bg-[#D95D5D]/10 border-[#D95D5D]/30';
  } else if (clamped < 3.5) {
    strokeColor = '#E8A63A'; // Warning indicator
    glowColor = 'rgba(232, 166, 58, 0.35)';
    verdict = 'Moderate / Inconsistent';
    badgeClass = 'text-[#E8A63A] bg-[#E8A63A]/10 border-[#E8A63A]/30';
  } else if (clamped < 4.5) {
    strokeColor = '#36B879'; // Positive indicator
    glowColor = 'rgba(54, 184, 121, 0.35)';
    verdict = 'Safe & Responsible';
    badgeClass = 'text-[#36B879] bg-[#36B879]/10 border-[#36B879]/30';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-[210deg] overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#15243A"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Meter Fill with Glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
            {showOutOf100 ? score100 : clamped.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-2.5 h-2.5"
                viewBox="0 0 20 20"
                fill={star <= Math.round(clamped) ? strokeColor : '#2A3C58'}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
            {showOutOf100 ? '/ 100 Index' : '/ 5.0 Stars'}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
          {verdict}
        </div>
      )}
    </div>
  );
};
