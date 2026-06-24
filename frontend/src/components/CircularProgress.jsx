import React, { useEffect, useState } from 'react';

const CircularProgress = ({ score = 0, size = 160, strokeWidth = 12 }) => {
  const [offset, setOffset] = useState(0);
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate progress ring
    const progressOffset = circumference - (score / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  // Color mapping based on score
  const getColor = (val) => {
    if (val >= 90) return 'stroke-emerald-400'; // Excellent
    if (val >= 75) return 'stroke-indigo-400';  // Good
    if (val >= 50) return 'stroke-amber-400';   // Moderate
    return 'stroke-rose-400';                   // Poor
  };

  const getTextColor = (val) => {
    if (val >= 90) return 'text-emerald-400';
    if (val >= 75) return 'text-indigo-400';
    if (val >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getCategory = (val) => {
    if (val >= 90) return 'Excellent';
    if (val >= 75) return 'Good';
    if (val >= 50) return 'Moderate';
    return 'Poor';
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Circle */}
        <circle
          className="stroke-slate-200 dark:stroke-slate-800/40"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        {/* Animated Progress Circle */}
        <circle
          className={`${getColor(score)} transition-all duration-1000 ease-out`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      {/* Label inside circle */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-4xl font-extrabold tracking-tight ${getTextColor(score)}`}>
          {score}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          {getCategory(score)}
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
