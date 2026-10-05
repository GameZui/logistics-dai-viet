import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Truck } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { FloatingPinMarker } from './FloatingPinMarker';
import { PalletStackMesh } from './PalletStackMesh';
import { RoundedBox } from '@react-three/drei';
import { WorldLabel as Text } from './WorldLabel';
import * as THREE from 'three';
import { truckPose } from '../../utils/motion';
import { carrierNames } from '../../utils/labels';
import { GOODS } from '../../store/useEmpireStore';
import { playTruckHorn } from '../../utils/audio';

interface TruckMeshProps {
  truck: Truck;
}

export const TruckMesh = React.memo(({ truck }: TruckMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialPosition = useRef<[number, number, number]>([
    truck.dockId ? -12 + ((Number(truck.dockId.split('-')[1]) || 1) - 1) * 8 : 25,
    0, truck.status === 'unloading' ? 0.6 : 14,
  ]);
  const selectEntity = useGameStore((state) => state.selectEntity);
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);

  const isSelected = selectedEntityId === truck.id;

  // Determine target position & rotation based on status & assigned dock
  const dockNum = truck.dockId ? Number(truck.dockId.replace(/\D/g, '')) || 1 : 1;
  const dockX = truck.dockId ? -12 + (dockNum - 1) * 8 : 0;
  const motionTime = useRef(truck.motionTime ?? 0);
  const motionStatus = useRef(truck.status);
  const wheelsRef = useRef<THREE.Group>(null);
  const doorsRef = useRef<THREE.Group>(null);

  // Animation interpolation & Audio trigger
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = useGameStore.getState().gameSpeed;
    if (speed === 0) return;
    const current = groupRef.current;
    if (motionStatus.current !== truck.status) {
      if (truck.status === 'docking' || truck.status === 'completed') {
        playTruckHorn();
      }
      motionStatus.current = truck.status;
      motionTime.current = truck.motionTime ?? 0;
    }
    motionTime.current = Math.min(Math.max(motionTime.current, truck.motionTime ?? 0) + delta * speed,
      (truck.motionTime ?? 0) + 0.15 * speed);
    const pose = truckPose(truck.status, motionTime.current, dockX, truck.queueSlot);
    const distance = Math.hypot(pose.x - current.position.x, pose.z - current.position.z);
    current.position.set(pose.x, 0, pose.z);
    current.rotation.y = pose.angle;
    wheelsRef.current?.children.forEach((wheel) => { wheel.rotation.x += distance / 0.48; });
    doorsRef.current?.children.forEach((door, index) => {
      const target = truck.status === 'unloading' ? (index === 0 ? -1 : 1) * Math.PI / 2 : 0;
      door.rotation.y = THREE.MathUtils.damp(door.rotation.y, target, 5, delta * speed);
    });
  });

  // Authentic Vietnamese Carrier Styling
  const carrierThemes = {
    WareTrack: { primary: '#1d4ed8', secondary: '#1e40af', accent: '#dc2626', name: 'Đại Việt' },
    Cargoviva: { primary: '#ea580c', secondary: '#c2410c', accent: '#facc15', name: 'Phương Nam' },
    Nordline: { primary: '#059669', secondary: '#047857', accent: '#fbbf24', name: 'Bắc Nam' },
    Bluepeak: { primary: '#0284c7', secondary: '#0369a1', accent: '#f59e0b', name: 'Hải Âu' },
  };

  const theme = carrierThemes[truck.carrier] || carrierThemes.WareTrack;
  const isUnloading = truck.status === 'unloading';
  const progressRatio = truck.palletsTotal > 0 ? truck.palletsUnloaded / truck.palletsTotal : 0;
  // Type: tarpaulin (mui bạt xanh nông sản) or container inox
  const isTarpaulin = truck.goods === 'rice' || truck.goods === 'coffee' || truck.goods === 'fruit';

  return (
    <group
      ref={groupRef}
      position={initialPosition.current}
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
            ? 'Chờ vào bãi'
            : truck.status === 'docking' ? 'Đang vào dock' : 'Đang rời bãi'
        }
        variant={truck.status === 'unloading' ? 'emerald' : truck.isVip ? 'amber' : 'blue'}
        progress={truck.status === 'unloading' ? progressRatio : undefined}
        selected={isSelected}
        onClick={() => selectEntity(truck.id, 'truck')}
      />

      {/* CABIN XE TẢI PHONG CÁCH THACO / HINO VIỆT NAM */}
      <group position={[0, 0, 3.6]}>
        {/* Main Cabin Body với góc bo tròn mềm mại */}
        <RoundedBox args={[2.3, 2.3, 2.3]} radius={0.22} smoothness={3} position={[0, 1.45, 0]} castShadow>
          <meshStandardMaterial color={theme.primary} roughness={0.3} metalness={0.25} />
        </RoundedBox>

        {/* Mui lướt gió khí động học trên nóc cabin */}
        <mesh position={[0, 2.7, -0.15]} castShadow>
          <boxGeometry args={[2.15, 0.45, 1.9]} />
          <meshStandardMaterial color={theme.secondary} roughness={0.35} />
        </mesh>

        {/* Kính chắn gió trước vát cong */}
        <mesh position={[0, 1.75, 1.18]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[2.05, 1.05, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.85} />
        </mesh>

        {/* Decal Kính Lái: "VẠN DẶM BÌNH AN" */}
        <Text position={[0, 2.2, 1.18]} fontSize={0.22} color="#fef08a" anchorX="center" anchorY="middle">
          ★ VẠN DẶM BÌNH AN ★
        </Text>

        {/* Lưới tản nhiệt mạ crom & Logo mặt ca-lăng */}
        <mesh position={[0, 0.85, 1.18]}>
          <boxGeometry args={[1.7, 0.65, 0.07]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-0.2, 0, 0.2].map((gy) => (
          <mesh key={gy} position={[0, 0.85 + gy, 1.22]}>
            <boxGeometry args={[1.5, 0.04, 0.02]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Cụm đèn pha Halogen vàng ấm & đèn sương mù */}
        {[-0.82, 0.82].map((hx) => (
          <group key={hx} position={[hx, 0.65, 1.19]}>
            <mesh>
              <boxGeometry args={[0.36, 0.28, 0.07]} />
              <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.6} />
            </mesh>
            {/* Đèn sương mù gầm cản */}
            <mesh position={[0, -0.32, 0.02]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}

        {/* Cản trước kim loại chịu lực (Front Bumper) */}
        <mesh position={[0, 0.35, 1.2]} castShadow>
          <boxGeometry args={[2.32, 0.3, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* BIỂN SỐ VÀNG PHẢN QUANG VIỆT NAM (Cản Trước) */}
        <group position={[0, 0.35, 1.28]}>
          <mesh>
            <boxGeometry args={[0.75, 0.22, 0.03]} />
            <meshStandardMaterial color="#facc15" metalness={0.2} roughness={0.4} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.12} color="#111827" anchorX="center" anchorY="middle">
            {truck.plate}
          </Text>
        </group>

        {/* Gương chiếu hậu đôi gập 2 tầng */}
        {[-1.25, 1.25].map((mx) => (
          <group key={mx} position={[mx, 1.65, 0.75]}>
            {/* Gọng đỡ gương */}
            <mesh position={[mx > 0 ? -0.1 : 0.1, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Mặt gương chính & phụ */}
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.1, 0.42, 0.22]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, -0.18, 0]}>
              <boxGeometry args={[0.09, 0.16, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* THÙNG XE: MUI BẠT XANH NÔNG SẢN HOẶC THÙNG KÍN DẬP SÓNG */}
      <group position={[0, 0, -1.0]}>
        {/* Sàn khung xe & lườn gầm */}
        <mesh position={[0, 0.44, 0]} receiveShadow>
          <boxGeometry args={[2.5, 0.1, 6.8]} />
          <meshStandardMaterial color="#334155" metalness={0.6} />
        </mesh>

        {/* Rào bửng bảo vệ chống va chạm lườn sườn xe */}
        {[-1.28, 1.28].map((rx) => (
          <group key={rx} position={[rx, 0.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.12, 5.2]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <boxGeometry args={[0.04, 0.08, 5.2]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
          </group>
        ))}

        {isTarpaulin ? (
          /* THÙNG MUI BẠT XANH CHUYÊN NÔNG SẢN VIỆT NAM */
          <group>
            {/* Khung bửng thép dập phía dưới cao 1.1m */}
            {[-1.21, 1.21].map((x) => (
              <mesh key={x} position={[x, 1.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.08, 1.3, 6.8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
              </mesh>
            ))}
            {/* Vách trước ngăn cabin */}
            <mesh position={[0, 2.1, 3.36]} castShadow>
              <boxGeometry args={[2.5, 3.3, 0.08]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Mui bạt vải xanh phủ bên trên bo vòm */}
            <group position={[0, 2.7, 0]}>
              {/* Vách bạt 2 bên dập nếp vải */}
              {[-1.2, 1.2].map((bx) => (
                <mesh key={bx} position={[bx, 0, 0]} castShadow>
                  <boxGeometry args={[0.06, 2.0, 6.78]} />
                  <meshStandardMaterial color="#15803d" roughness={0.85} />
                </mesh>
              ))}
              {/* Nóc bạt vát vòm nhẹ */}
              <mesh position={[0, 1.05, 0]} castShadow>
                <boxGeometry args={[2.5, 0.16, 6.8]} />
                <meshStandardMaterial color="#166534" roughness={0.9} />
              </mesh>
              {/* Dây chằng bạt chéo qua thùng xe */}
              {[-2.2, -1.1, 0, 1.1, 2.2].map((cz) => (
                <mesh key={cz} position={[0, 0.05, cz]}>
                  <boxGeometry args={[2.52, 1.9, 0.04]} />
                  <meshStandardMaterial color="#eab308" roughness={0.6} />
                </mesh>
              ))}
            </group>
          </group>
        ) : (
          /* THÙNG INOX DẬP SÓNG CONTAINER */
          <group>
            {[-1.21, 1.21].map((x) => (
              <mesh key={x} position={[x, 2.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.08, 3.3, 6.8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.3} />
              </mesh>
            ))}
            <mesh position={[0, 2.1, 3.36]} castShadow>
              <boxGeometry args={[2.5, 3.3, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[0, 3.8, 0]}>
              <boxGeometry args={[2.54, 0.14, 6.84]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        )}

        {/* Tên Thương Hiệu & Logo dán 2 bên sườn thùng */}
        {[-1.27, 1.27].map((lx) => (
          <group key={lx} position={[lx, 2.3, 0]} rotation={[0, lx > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <Text fontSize={0.62} color={theme.accent} anchorX="center" anchorY="middle">
              {carrierNames[truck.carrier]}
            </Text>
            <Text position={[0, -0.45, 0]} fontSize={0.24} color="#ffffff" anchorX="center" anchorY="middle">
              VẬN TẢI ĐƯỜNG DÀI BẮC - TRUNG - NAM
            </Text>
          </group>
        ))}

        {/* Cửa đuôi thùng xe mở ra khi cập dock */}
        <group ref={doorsRef} position={[0, 2.1, -3.42]}>
          {/* Cánh trái */}
          <group position={[-1.2, 0, 0]}>
            <mesh position={[0.6, 0, 0]}>
              <boxGeometry args={[1.2, 3.2, 0.08]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} />
            </mesh>
            {/* Chốt tay khóa cửa Inox */}
            <mesh position={[1.05, 0, -0.06]}>
              <boxGeometry args={[0.05, 1.4, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
          {/* Cánh phải */}
          <group position={[1.2, 0, 0]}>
            <mesh position={[-0.6, 0, 0]}>
              <boxGeometry args={[1.2, 3.2, 0.08]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.3} />
            </mesh>
            {/* Chốt tay khóa cửa Inox */}
            <mesh position={[-1.05, 0, -0.06]}>
              <boxGeometry args={[0.05, 1.4, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* BIỂN SỐ VÀNG ĐUÔI XE & ĐÈN HẬU */}
        <group position={[0, 0.5, -3.45]}>
          <mesh>
            <boxGeometry args={[0.75, 0.22, 0.02]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.12} color="#111827" anchorX="center" anchorY="middle">
            {truck.plate}
          </Text>
          {[-1.0, 1.0].map((tx) => (
            <mesh key={tx} position={[tx, 0, 0]}>
              <boxGeometry args={[0.32, 0.16, 0.03]} />
              <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.6} />
            </mesh>
          ))}
        </group>

        {/* Pallets hàng hóa thực tế bên trong thùng xe khi đang bốc dỡ */}
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
                  color={GOODS[truck.goods ?? 'rice']?.color ?? '#d9b879'}
                  type={truck.goods === 'rice' || truck.goods === 'coffee' ? 'sack' : 'box'}
                />
              );
            }
          )}
      </group>

      {/* BÁNH XE TẢI LỐP CAO SU VỚI LA-ZĂNG BẠC CHỊU TẢI */}
      <group ref={wheelsRef}>
        {[-1.25, 1.25].map((wx) =>
          [-3.6, -1.8, 3.0, 4.4].map((wz, wi) => (
            <group key={`wheel-${wx}-${wz}-${wi}`} position={[wx, 0.48, wz]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.48, 0.48, 0.36, 20]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
              {/* La-zăng đúc hợp kim */}
              <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? 0.06 : -0.06, 0, 0]}>
                <cylinderGeometry args={[0.28, 0.28, 0.38, 14]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.2} />
              </mesh>
              {/* Trục ốc bánh xe */}
              <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? 0.12 : -0.12, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
            </group>
          ))
        )}
      </group>
    </group>
  );
}, (prev, next) => (
  prev.truck.id === next.truck.id &&
  prev.truck.status === next.truck.status &&
  prev.truck.palletsUnloaded === next.truck.palletsUnloaded &&
  prev.truck.palletsTotal === next.truck.palletsTotal &&
  prev.truck.dockId === next.truck.dockId &&
  prev.truck.goods === next.truck.goods &&
  prev.truck.isVip === next.truck.isVip
));
