import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { TruckMesh } from './TruckMesh';
import { ForkliftMesh } from './ForkliftMesh';

export const FleetLayer = () => {
  const trucks = useGameStore((state) => state.trucks);
  const forklifts = useGameStore((state) => state.forklifts);
  const tickSimulation = useGameStore((state) => state.tickSimulation);

  useFrame((_, delta) => {
    tickSimulation(delta);
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
