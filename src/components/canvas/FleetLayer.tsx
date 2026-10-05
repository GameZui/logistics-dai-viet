import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { TruckMesh } from './TruckMesh';
import { ForkliftMesh } from './ForkliftMesh';

export const FleetLayer = () => {
  const trucks = useGameStore((state) => state.trucks);
  const forklifts = useGameStore((state) => state.forklifts);
  const tickSimulation = useGameStore((state) => state.tickSimulation);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.1);
    if (elapsed.current >= 0.1) {
      tickSimulation(elapsed.current);
      elapsed.current = 0;
    }
  });

  return (
    <group>
      {/* Trucks fleet */}
      {trucks.map((truck) => (
        <TruckMesh key={truck.id} truck={truck} />
      ))}

      {/* Forklifts fleet */}
      {forklifts.map((forklift, idx) => (
        <ForkliftMesh key={forklift.id} forklift={forklift} index={idx} />
      ))}
    </group>
  );
};
