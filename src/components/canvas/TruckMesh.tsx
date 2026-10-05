import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Truck } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { FloatingPinMarker } from './FloatingPinMarker';
import { PalletStackMesh } from './PalletStackMesh';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface TruckMeshProps {
  truck: Truck;
}

export const TruckMesh = ({ truck }: TruckMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const selectEntity = useGameStore((state) => state.selectEntity);
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const docks = useGameStore((state) => state.docks);

  const isSelected = selectedEntityId === truck.id;

  // Determine target position & rotation based on status & assigned dock
  const dock = docks.find((d) => d.id === truck.dockId);
  const dockX = dock ? -12 + (dock.number - 1) * 8 : 0;

  // Animation interpolation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current;
    const lerpSpeed = delta * 2.5;

    if (truck.status === 'en_route') {
      // Driving on the access road towards dock entrance
      const targetPos = new THREE.Vector3(dockX + 6, 0, 14);
      current.position.lerp(targetPos, lerpSpeed);
      current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, Math.PI / 2, lerpSpeed * 2);
    } else if (truck.status === 'docking') {
      // Reversing into dock bay
      const targetPos = new THREE.Vector3(dockX, 0, 2.5);
      current.position.lerp(targetPos, lerpSpeed * 1.5);
      current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, 0, lerpSpeed * 3);
    } else if (truck.status === 'unloading') {
      // Parked flush against dock bumpers
      const targetPos = new THREE.Vector3(dockX, 0, 0.6);
      current.position.lerp(targetPos, lerpSpeed * 2);
      current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, 0, lerpSpeed * 3);
    } else if (truck.status === 'completed') {
      // Driving away forward
      const targetPos = new THREE.Vector3(dockX, 0, 14);
      current.position.lerp(targetPos, lerpSpeed);
      current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, -Math.PI / 2, lerpSpeed);
    }
  });

  // Carrier styling
  const carrierThemes = {
    WareTrack: { primary: '#2563eb', secondary: '#1d4ed8', text: '#ffffff' },
    Cargoviva: { primary: '#ea580c', secondary: '#c2410c', text: '#ffffff' },
    Nordline: { primary: '#0d9488', secondary: '#0f766e', text: '#ffffff' },
    Bluepeak: { primary: '#3b82f6', secondary: '#1e3a8a', text: '#ffffff' },
  };

  const theme = carrierThemes[truck.carrier] || carrierThemes.WareTrack;
  const isUnloading = truck.status === 'unloading';
  const progressRatio = truck.palletsTotal > 0 ? truck.palletsUnloaded / truck.palletsTotal : 0;

  return (
    <group
      ref={groupRef}
      position={[dockX + (truck.status === 'en_route' ? 25 : 0), 0, 14]}
      onClick={(e) => {
        e.stopPropagation();
        selectEntity(truck.id, 'truck');
      }}
    >
      {/* 3D Floating Pin Marker */}
      <FloatingPinMarker
        label={truck.plate}
        subLabel={
          truck.status === 'unloading'
            ? `${truck.palletsUnloaded}/${truck.palletsTotal}`
            : truck.status === 'en_route'
            ? 'En route'
            : 'Docked'
        }
        variant={truck.status === 'unloading' ? 'emerald' : truck.isVip ? 'amber' : 'blue'}
        progress={truck.status === 'unloading' ? progressRatio : undefined}
        selected={isSelected}
        onClick={() => selectEntity(truck.id, 'truck')}
      />

      {/* TRUCK CABIN (Đầu kéo xe tải) */}
      <group position={[0, 0, 3.6]}>
        {/* Main Cabin Body */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[2.3, 2.4, 2.4]} />
          <meshStandardMaterial color={theme.primary} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Aerodynamic Roof Fairing */}
        <mesh position={[0, 2.7, -0.2]} castShadow>
          <boxGeometry args={[2.2, 0.4, 2.0]} />
          <meshStandardMaterial color={theme.secondary} roughness={0.4} />
        </mesh>

        {/* Front Windshield */}
        <mesh position={[0, 1.7, 1.22]}>
          <boxGeometry args={[2.0, 1.1, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Front Grille */}
        <mesh position={[0, 0.7, 1.22]}>
          <boxGeometry args={[1.8, 0.8, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Headlights */}
        {[-0.8, 0.8].map((hx) => (
          <mesh key={hx} position={[hx, 0.6, 1.23]}>
            <boxGeometry args={[0.35, 0.25, 0.06]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.8} />
          </mesh>
        ))}

        {/* Side Mirrors */}
        {[-1.25, 1.25].map((mx) => (
          <group key={mx} position={[mx, 1.6, 0.8]}>
            <mesh>
              <boxGeometry args={[0.1, 0.5, 0.25]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* CONTAINER TRAILER (Thùng hàng dài phía sau) */}
      <group position={[0, 0, -1.0]}>
        {/* Main Box Trailer */}
        <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 3.4, 6.8]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Trailer Roof Trim */}
        <mesh position={[0, 3.85, 0]}>
          <boxGeometry args={[2.54, 0.15, 6.84]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* Carrier Logo on both sides of container */}
        {[-1.27, 1.27].map((lx) => (
          <group key={lx} position={[lx, 2.3, 0]} rotation={[0, lx > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <Text
              fontSize={0.65}
              color={theme.primary}
              font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
              anchorX="center"
              anchorY="middle"
            >
              {truck.carrier}
            </Text>
          </group>
        ))}

        {/* Trailer Rear Doors (Cửa đuôi thùng xe mở ra khi cập dock) */}
        <group position={[0, 2.1, -3.42]}>
          {/* Left Door */}
          <mesh
            position={[-0.6, 0, 0]}
            rotation={[0, isUnloading ? -Math.PI / 2.2 : 0, 0]}
          >
            <boxGeometry args={[1.2, 3.2, 0.08]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.2} />
          </mesh>
          {/* Right Door */}
          <mesh
            position={[0.6, 0, 0]}
            rotation={[0, isUnloading ? Math.PI / 2.2 : 0, 0]}
          >
            <boxGeometry args={[1.2, 3.2, 0.08]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.2} />
          </mesh>
        </group>

        {/* Pallets remaining inside trailer */}
        {isUnloading &&
          Array.from({ length: Math.max(0, truck.palletsTotal - truck.palletsUnloaded) }).map(
            (_, pi) => {
              const row = Math.floor(pi / 2);
              const col = pi % 2;
              return (
                <PalletStackMesh
                  key={`in-truck-${pi}`}
                  position={[col === 0 ? -0.55 : 0.55, 0.6, -2.4 + row * 1.4]}
                  scale={0.75}
                />
              );
            }
          )}
      </group>

      {/* WHEELS & UNDERCARRIAGE (Bánh xe) */}
      {[-1.25, 1.25].map((wx) =>
        [-3.6, -1.8, 3.0, 4.4].map((wz, wi) => (
          <group key={`wheel-${wx}-${wz}-${wi}`} position={[wx, 0.48, wz]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.48, 0.48, 0.35, 18]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Wheel Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? 0.05 : -0.05, 0, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 0.36, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};
