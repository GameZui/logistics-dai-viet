import React from 'react';
import { Plus, Minus, RotateCcw, Home } from 'lucide-react';

export const CameraControlsWidget = () => {
  return (
    <div className="absolute bottom-16 left-4 z-30 pointer-events-auto flex flex-col items-center bg-white/95 p-1.5 rounded-2xl shadow-sm border border-slate-200/90 space-y-1">
      <button
        onClick={() => {
          // Trigger keyboard zoom or dispatch event
          window.dispatchEvent(new CustomEvent('camera-zoom-in'));
        }}
        title="Phóng to"
        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('camera-zoom-out'));
        }}
        title="Thu nhỏ"
        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-4 h-[1px] bg-slate-200 my-0.5" />

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('camera-reset'));
        }}
        title="Khôi phục góc nhìn"
        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('camera-home'));
        }}
        title="Nhìn toàn cảnh"
        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>
    </div>
  );
};
