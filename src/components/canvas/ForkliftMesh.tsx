import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Forklift } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { PalletStackMesh } from './PalletStackMesh';
import { FloatingPinMarker } from './FloatingPinMarker';
import * as THREE from 'three';

interface ForkliftMeshProps {
  forklift: Forklift;
  index: number;
}

export const ForkliftMesh = ({ forklift, index }: ForkliftMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const selectEntity = useGameStore((state) => state.selectEntity);
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const trucks = useGameStore((state) => state.trucks);
  const docks = useGameStore((state) => state.docks);

  const isSelected = selectedEntityId === forklift.id;

  // Tìm xe tải đang dỡ hàng gần nhất
  const activeTruck = trucks.find((t) => t.status === 'unloading');
  const targetDock = activeTruck ? docks.find((d) => d.id === activeTruck.dockId) : null;
  const targetDockX = targetDock ? -12 + (targetDock.number - 1) * 8 : -2 + index * 4;

  // Waypoints animation:
  // Phase 1: Move to truck tail (Z: -2, X: targetDockX)
  // Phase 2: Pick pallet, carry to storage staging (Z: 4, X: targetDockX - 2)
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current;
    const t = clock.getElapsedTime() * 0.8 + index * 2;
    const cycle = (Math.sin(t) + 1) / 2; // 0 to 1

    if (activeTruck) {
      // Forklift travels between dock tail (Z: -2) and storage bay (Z: 5)
      const targetZ = THREE.MathUtils.lerp(-2.2, 5.0, cycle);
      const targetX = targetDockX + (cycle > 0.5 ? -1.8 : 0);
      current.position.x = THREE.MathUtils.lerp(current.position.x, targetX, delta * 3);
      current.position.z = THREE.MathUtils.lerp(current.position.z, targetZ, delta * 3);

      // Rotate towards movement direction
      const targetRotY = Math.sin(t) > 0 ? 0 : Math.PI;
      current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, targetRotY, delta * 4);
    } else {
      // Idle parked position
      const parkX = -6 + index * 4;
      const parkZ = 4.5;
      current.position.lerp(new THREE.Vector3(parkX, 0, parkZ), delta * 2);
      current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, 0, delta * 2);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[forklift.x, 0, forklift.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectEntity(forklift.id, 'forklift');
      }}
    >
      {/* Floating Marker */}
      <FloatingPinMarker
        label={forklift.name}
        subLabel={activeTruck ? 'Unloading' : 'Idle'}
        variant="amber"
        position={[0, 3.2, 0]}
        selected={isSelected}
        onClick={() => selectEntity(forklift.id, 'forklift')}
      />

      {/* Main Yellow/Orange Body Chassis */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[1.5, 0.9, 2.0]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Heavy Black Rear Counterweight */}
      <mesh position={[0, 0.7, -0.9]} castShadow>
        <boxGeometry args={[1.45, 0.85, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Operator Overhead Protective Cage */}
      <group position={[0, 1.6, -0.1]}>
        {/* 4 Pillars */}
        {[-0.6, 0.6].map((cx) =>
          [-0.6, 0.6].map((cz) => (
            <mesh key={`cage-${cx}-${cz}`} position={[cx, 0, cz]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
          ))
        )}
        {/* Cage Roof */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.35, 0.08, 1.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} />
        </mesh>
      </group>

      {/* Seat & Steering */}
      <mesh position={[0, 1.2, -0.15]}>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.35, 0.25]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Vertical Mast & Lift Forks (Khung nâng phía trước) */}
      <group position={[0, 0.9, 1.1]}>
        {/* Left & Right Mast Columns */}
        {[-0.45, 0.45].map((mx) => (
          <mesh key={mx} position={[mx, 0.4, 0]} castShadow>
            <boxGeometry args={[0.12, 1.9, 0.12]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
        ))}
        {/* Crossbar */}
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.0, 0.1, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Horizontal Fork Carriage */}
        <mesh position={[0, 0.1, 0.08]}>
          <boxGeometry args={[0.8, 0.12, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* L-Shaped Metal Forks */}
        {[-0.25, 0.25].map((fx) => (
          <group key={fx} position={[fx, -0.2, 0.45]}>
            <mesh position={[0, -0.4, -0.4]} castShadow>
              <boxGeometry args={[0.1, 0.8, 0.06]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.75, 0]} castShadow>
              <boxGeometry args={[0.1, 0.06, 0.9]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Cargo Pallet being carried on forks */}
        <PalletStackMesh position={[0, -0.4, 0.65]} scale={0.7} />
      </group>

      {/* 4 Rubber Tires */}
      {[-0.78, 0.78].map((wx) =>
        [-0.6, 0.65].map((wz, wi) => (
          <mesh
            key={`fl-wheel-${wx}-${wz}-${wi}`}
            position={[wx, 0.32, wz]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
};
