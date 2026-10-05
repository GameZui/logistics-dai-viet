import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Text } from '@react-three/drei';

export const WarehouseFacility = () => {
  const docks = useGameStore((state) => state.docks);
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const selectEntity = useGameStore((state) => state.selectEntity);
  const currentHub = useGameStore((state) => state.currentHub);

  return (
    <group position={[0, 0, -6]}>
      {/* Main Facility Building Body */}
      <mesh position={[0, 5, -8]} castShadow receiveShadow>
        <boxGeometry args={[48, 10, 20]} />
        <meshStandardMaterial color="#2563eb" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Modern White Facade Accent Band */}
      <mesh position={[0, 9.6, -7.9]} receiveShadow>
        <boxGeometry args={[48.2, 0.9, 20.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Roof Canopy overhang */}
      <mesh position={[0, 10.4, -4.5]} receiveShadow>
        <boxGeometry args={[50, 0.6, 28]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      {/* Hub Brand Badge on Facade */}
      <group position={[0, 7.8, 2.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <Text
          position={[0, 0, 0.08]}
          fontSize={0.8}
          color="#1e40af"
          anchorX="center"
          anchorY="middle"
        >
          {currentHub}
        </Text>
      </group>

      {/* Pallet Staging Racks on the Left & Right Wings (Kệ chứa pallet hàng hóa) */}
      {[-20, 20].map((wingX) => (
        <group key={`wing-${wingX}`} position={[wingX, 0, -0.5]}>
          {/* Steel Vertical Rack Columns */}
          {[-2, 2].map((colX) =>
            [-3, 1].map((colZ) => (
              <mesh key={`col-${colX}-${colZ}`} position={[colX, 2.5, colZ]} castShadow>
                <boxGeometry args={[0.2, 5, 0.2]} />
                <meshStandardMaterial color="#ea580c" roughness={0.4} metalness={0.6} />
              </mesh>
            ))
          )}
          {/* Horizontal Shelves */}
          {[1.2, 2.8, 4.4].map((shelfY) => (
            <mesh key={`shelf-${shelfY}`} position={[0, shelfY, -1]}>
              <boxGeometry args={[4.4, 0.1, 4.2]} />
              <meshStandardMaterial color="#f97316" metalness={0.5} />
            </mesh>
          ))}
          {/* Stacked Pallets on shelves */}
          {[
            { x: -1, y: 1.5, z: -1, color: '#eab308' },
            { x: 1, y: 1.5, z: -1, color: '#3b82f6' },
            { x: -1, y: 3.1, z: -1, color: '#10b981' },
            { x: 1, y: 3.1, z: -1, color: '#d97706' },
          ].map((pallet, pi) => (
            <group key={`p-${pi}`} position={[pallet.x, pallet.y, pallet.z]}>
              {/* Wood pallet */}
              <mesh position={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[1.3, 0.15, 1.3]} />
                <meshStandardMaterial color="#b45309" roughness={0.8} />
              </mesh>
              {/* Cargo container/boxes */}
              <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[1.1, 0.75, 1.1]} />
                <meshStandardMaterial color={pallet.color} roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Dock Bays Array (Bay 1..4) */}
      {docks.map((dock, idx) => {
        const posX = -12 + idx * 8;
        const isLocked = dock.status === 'locked';
        const isSelected = selectedEntityId === dock.id;
        const isUnloading = dock.status === 'unloading' || dock.status === 'loading';

        return (
          <group
            key={dock.id}
            position={[posX, 0, 2]}
            onClick={(e) => {
              e.stopPropagation();
              selectEntity(dock.id, 'dock');
            }}
          >
            {/* Dock Opening Frame */}
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[5.4, 6.2, 0.8]} />
              <meshStandardMaterial
                color={isSelected ? '#60a5fa' : isLocked ? '#94a3b8' : '#334155'}
                roughness={0.5}
              />
            </mesh>

            {/* Inner Recess / Tunnel */}
            <mesh position={[0, 2.9, -0.2]}>
              <boxGeometry args={[4.6, 5.6, 0.5]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>

            {/* Motorized Roll-up Door (Slides up when active) */}
            <mesh position={[0, isUnloading ? 5.1 : 2.8, 0.15]}>
              <boxGeometry args={[4.5, isUnloading ? 1.6 : 5.4, 0.2]} />
              <meshStandardMaterial
                color={isLocked ? '#cbd5e1' : '#f1f5f9'}
                roughness={0.4}
                metalness={0.2}
              />
            </mesh>

            {/* Rubber Dock Bumpers (Left & Right pads) */}
            <mesh position={[-2.4, 1.2, 0.5]} castShadow>
              <boxGeometry args={[0.3, 1.8, 0.4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[2.4, 1.2, 0.5]} castShadow>
              <boxGeometry args={[0.3, 1.8, 0.4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>

            {/* Dock Leveller Ramp Plate (Bàn nâng tự động) */}
            <mesh position={[0, 0.08, 0.9]} receiveShadow>
              <boxGeometry args={[3.2, 0.12, 1.8]} />
              <meshStandardMaterial
                color={dock.hasLeveller ? '#0284c7' : '#64748b'}
                metalness={0.4}
                roughness={0.6}
              />
            </mesh>

            {/* Bay Header Badge with Number */}
            <group position={[0, 6.4, 0.5]}>
              <mesh>
                <boxGeometry args={[2.2, 0.85, 0.15]} />
                <meshStandardMaterial
                  color={isLocked ? '#64748b' : '#1d4ed8'}
                  roughness={0.3}
                />
              </mesh>
              <Text
                position={[0, 0, 0.1]}
                fontSize={0.5}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {`BAY 0${dock.number}`}
              </Text>
            </group>

            {/* Status Signal Light (Green = Available, Red = Busy/Unloading, Grey = Locked) */}
            <group position={[2.4, 3.8, 0.45]}>
              <mesh>
                <boxGeometry args={[0.3, 0.6, 0.1]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, 0.12, 0.06]}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial
                  color={isLocked ? '#64748b' : isUnloading ? '#ef4444' : '#22c55e'}
                  emissive={isLocked ? '#000000' : isUnloading ? '#dc2626' : '#16a34a'}
                  emissiveIntensity={1.2}
                />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};
