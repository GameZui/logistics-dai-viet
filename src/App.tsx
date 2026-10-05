import React from 'react';
import { GameCanvas } from './components/canvas/GameCanvas';

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#e8f1fa]">
      <GameCanvas />
    </div>
  );
}
