import React from 'react';
import { Canvas } from '@react-three/fiber';
import { IsometricCamera } from './IsometricCamera';
import { GroundAndRoads } from './GroundAndRoads';
import { WarehouseFacility } from './WarehouseFacility';
import { FleetLayer } from './FleetLayer';
import { useGameStore } from '../../store/useGameStore';

interface GameCanvasProps {
  children?: React.ReactNode;
}

export const GameCanvas = ({ children }: GameCanvasProps) => {
  const selectEntity = useGameStore((state) => state.selectEntity);

  return (
    <div
      className="w-full h-full absolute inset-0 bg-[#e8f1fa]"
      onClick={() => selectEntity(null, null)}
    >
      <Canvas shadows orthographic>
        <color attach="background" args={['#e8f1fa']} />
        <fog attach="fog" args={['#e8f1fa', 40, 160]} />

        {/* Ambient & Directional Lighting with Soft Shadows */}
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[35, 45, 25]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={120}
          shadow-camera-near={10}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
          shadow-bias={-0.0005}
        />
        {/* Soft Secondary Fill Light */}
        <directionalLight position={[-25, 20, -20]} intensity={0.4} color="#bfdbfe" />

        <IsometricCamera />
        <GroundAndRoads />
        <WarehouseFacility />
        <FleetLayer />
        {children}
      </Canvas>
    </div>
  );
};

