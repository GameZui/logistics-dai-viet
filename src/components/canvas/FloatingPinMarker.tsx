import React from 'react';
import { Html } from '@react-three/drei';

interface FloatingPinMarkerProps {
  label: string;
  subLabel?: string;
  variant?: 'blue' | 'amber' | 'emerald' | 'indigo';
  position?: [number, number, number];
  progress?: number; // 0 to 1
  onClick?: (e: React.MouseEvent) => void;
  selected?: boolean;
}

export const FloatingPinMarker = React.memo(({
  label,
  subLabel,
  variant = 'blue',
  position = [0, 4.4, 0],
  progress,
  onClick,
  selected = false,
}: FloatingPinMarkerProps) => {
  const badgeColors = {
    blue: 'bg-blue-600/90 text-white border-blue-400/80 shadow-blue-500/25',
    amber: 'bg-amber-500/90 text-white border-amber-300/80 shadow-amber-500/25',
    emerald: 'bg-emerald-600/90 text-white border-emerald-400/80 shadow-emerald-500/25',
    indigo: 'bg-indigo-600/90 text-white border-indigo-400/80 shadow-indigo-500/25',
  };

  return (
    <Html
      position={position}
      center
      zIndexRange={[20, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        className={`flex flex-col items-center group cursor-pointer transition-all duration-200 select-none ${
          selected ? 'scale-115' : 'hover:scale-105'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full shadow-lg backdrop-blur-md border text-xs font-semibold whitespace-nowrap transition-shadow ${
            badgeColors[variant]
          } ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-600' : ''}`}
        >
          {/* Pulsing indicator */}
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="tracking-tight">{label}</span>
          {subLabel && (
            <span className="opacity-85 text-[11px] font-normal pl-0.5 border-l border-white/30 ml-0.5">
              {subLabel}
            </span>
          )}
        </div>

        {/* Progress bar if present */}
        {typeof progress === 'number' && progress > 0 && progress < 1 && (
          <div className="w-20 h-1.5 bg-black/30 backdrop-blur-sm rounded-full overflow-hidden mt-1 border border-white/20">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Pin stem pointer */}
        <div className="w-1.5 h-1.5 bg-blue-600 rotate-45 -mt-1 shadow-sm border-r border-b border-blue-400" />
      </div>
    </Html>
  );
});
