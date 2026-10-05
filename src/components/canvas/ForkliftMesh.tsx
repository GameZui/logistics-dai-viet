import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Forklift } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { PalletStackMesh } from './PalletStackMesh';
import { FloatingPinMarker } from './FloatingPinMarker';
import * as THREE from 'three';
import { forkliftPose } from '../../utils/motion';
import { RoundedBox } from '@react-three/drei';
import { useEmpireStore, GOODS } from '../../store/useEmpireStore';
import { playForkliftClank } from '../../utils/audio';

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
  const employees = useEmpireStore(state => state.employees);
  const driver = employees.filter(employee => employee.role === 'driver')[index];

  const isSelected = selectedEntityId === forklift.id;

  const activeTruck = trucks.find((t) => t.id === forklift.targetTruckId && t.status === 'unloading');
  const targetDock = activeTruck ? docks.find((d) => d.id === activeTruck.dockId) : null;
  const targetDockX = targetDock ? -12 + (targetDock.number - 1) * 8 : -2 + index * 4;
  const animationTime = useRef(forklift.taskTime ?? 0);
  const taskRef = useRef(forklift.targetTruckId);
  const statusRef = useRef(forklift.status);
  const liftRef = useRef<THREE.Group>(null);
  const cargoRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const initialPosition = useRef<[number, number, number]>([forklift.x, 0, forklift.z]);

  // Render the assigned task between simulation ticks without updating React per frame.
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = useGameStore.getState().gameSpeed;
    if (speed === 0 || !driver) return;
    const current = groupRef.current;
    delta = Math.min(delta, 0.05) * speed;

    // Trigger clank sound when picking/depositing
    if (statusRef.current !== forklift.status) {
      if (forklift.status === 'picking' || forklift.status === 'depositing') {
        playForkliftClank();
      }
      statusRef.current = forklift.status;
    }

    // Rotating amber warning beacon light
    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta * 8;
    }

    let targetX = current.position.x;
    let targetZ = current.position.z;
    let lift = 0;
    let carrying = false;
    if (activeTruck) {
      if (taskRef.current !== forklift.targetTruckId || (forklift.taskTime ?? 0) < animationTime.current - 1) {
        animationTime.current = forklift.taskTime ?? 0;
        taskRef.current = forklift.targetTruckId;
      }
      const rate = (targetDock?.hasLeveller ? 1.25 : 1) * (1 + Math.max(0, (targetDock?.level ?? 1) - 1) * .15) * (activeTruck.isVip ? 1.2 : 1) * (forklift.speed / 4.5) * (1 + (driver.level - 1) * .15) * (.5 + driver.energy / 200);
      animationTime.current = Math.min(Math.max(animationTime.current, forklift.taskTime ?? 0) + delta * rate,
        (forklift.taskTime ?? 0) + 0.15 * speed * rate);
      const pose = forkliftPose(animationTime.current, targetDockX);
      targetX = pose.x;
      targetZ = pose.z;
      lift = pose.lift;
      carrying = pose.carrying;
      current.rotation.y += Math.atan2(Math.sin(pose.angle - current.rotation.y),
        Math.cos(pose.angle - current.rotation.y)) * (1 - Math.exp(-6 * delta));
    } else {
      animationTime.current = 0;
    }
    current.position.x = THREE.MathUtils.damp(current.position.x, targetX, 8, delta);
    current.position.z = THREE.MathUtils.damp(current.position.z, targetZ, 8, delta);
    if (liftRef.current) liftRef.current.position.y = lift;
    if (cargoRef.current) cargoRef.current.visible = carrying;
  });

  return (
    <group
      ref={groupRef}
      position={initialPosition.current}
      onClick={(e) => {
        e.stopPropagation();
        selectEntity(forklift.id, 'forklift');
      }}
    >
      {/* Floating Marker */}
      <FloatingPinMarker
        label={forklift.name}
        subLabel={activeTruck ? forklift.status === 'carrying' ? 'Chở hàng' : forklift.status === 'picking' ? 'Lấy hàng' : forklift.status === 'depositing' ? 'Đặt hàng' : 'Đến lấy hàng' : 'Sẵn sàng'}
        variant="amber"
        position={[0, 3.2, 0]}
        selected={isSelected}
        onClick={() => selectEntity(forklift.id, 'forklift')}
      />

      {/* THÂN XE NÂNG MÀU VÀNG CÔNG NGHIỆP BO TRÒN */}
      <RoundedBox args={[1.5, 0.9, 2.0]} radius={0.16} smoothness={3} position={[0, 0.65, 0]} castShadow>
        <meshStandardMaterial color="#f59e0b" roughness={0.35} metalness={0.15} />
      </RoundedBox>

      {/* Đối trọng gang đen bo tròn phía sau */}
      <mesh position={[0, 0.7, -0.9]} castShadow>
        <boxGeometry args={[1.45, 0.85, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* KHUNG LỒNG THÉP BẢO VỆ TÀI XẾ (OPERATOR ROPS CAGE) */}
      <group position={[0, 1.6, -0.1]}>
        {/* 4 Cột chống thép ống */}
        {[-0.6, 0.6].map((cx) =>
          [-0.6, 0.6].map((cz) => (
            <mesh key={`cage-${cx}-${cz}`} position={[cx, 0, cz]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 1.2, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
          ))
        )}
        {/* Mái vòm thép */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.35, 0.08, 1.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} />
        </mesh>

        {/* ĐÈN XOAY CHỚP VÀNG CẢNH BÁO TRÊN NÓC XE */}
        <group position={[0, 0.72, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh ref={beaconRef} position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.14, 12]} />
            <meshStandardMaterial
              color="#f97316"
              emissive="#f97316"
              emissiveIntensity={forklift.status === 'carrying' ? 1.2 : 0.4}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      </group>

      {/* KHOANG LÁI: GHẾ DA TÀI XẾ & VÔ LĂNG & CÔNG NHÂN */}
      {/* Ghế ngồi bọc da đen */}
      <group position={[0, 1.25, -0.2]}>
        {/* Đệm ghế */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.16, 0.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Tựa lưng ghế */}
        <mesh position={[0, 0.28, -0.2]}>
          <boxGeometry args={[0.5, 0.45, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* Cần gạt nâng hạ mini */}
      {[-0.2, 0.2].map((kx) => (
        <mesh key={kx} position={[kx, 1.25, 0.15]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
      ))}

      {/* Vô lăng lái xe nâng */}
      <mesh position={[0, 1.35, 0.25]} rotation={[0.45, 0, 0]}>
        <torusGeometry args={[0.16, 0.025, 8, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Nhân viên lái xe nâng (Đồng phục xanh lá bảo hộ lao động) */}
      {driver && (
        <group position={[0, 1.48, -0.15]}>
          {/* Thân áo */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.6, 0.32]} />
            <meshStandardMaterial color="#047857" />
          </mesh>
          {/* Áo phản quang màu cam */}
          <mesh position={[0, 0, 0.17]}>
            <boxGeometry args={[0.36, 0.45, 0.02]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          {/* Đầu */}
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
          {/* Mũ bảo hộ lao động vàng */}
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.23, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
        </group>
      )}

      {/* KHUNG NÂNG & CÀNG NÂNG (MAST & FORKS) */}
      <group position={[0, 0.9, 1.1]}>
        {/* Cột nâng bên trái & phải */}
        {[-0.45, 0.45].map((mx) => (
          <mesh key={mx} position={[mx, 0.4, 0]} castShadow>
            <boxGeometry args={[0.12, 1.9, 0.12]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
        ))}
        {/* Thanh giằng ngang */}
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.0, 0.1, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Giá nâng di động */}
        <group ref={liftRef}>
          <mesh position={[0, 0.1, 0.08]}>
            <boxGeometry args={[0.82, 0.12, 0.08]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Càng nâng chữ L bằng thép chịu lực */}
          {[-0.25, 0.25].map((fx) => (
            <group key={fx} position={[fx, 0.35, 0.45]}>
              <mesh position={[0, -0.4, -0.4]} castShadow>
                <boxGeometry args={[0.1, 0.8, 0.06]} />
                <meshStandardMaterial color="#0f172a" metalness={0.85} />
              </mesh>
              <mesh position={[0, -0.75, 0]} castShadow>
                <boxGeometry args={[0.1, 0.06, 0.9]} />
                <meshStandardMaterial color="#0f172a" metalness={0.85} />
              </mesh>
            </group>
          ))}

          {/* Pallet hàng hóa đang được bốc */}
          <group ref={cargoRef} visible={false}>
            <PalletStackMesh
              position={[0, -0.4, 0.65]}
              scale={0.7}
              color={GOODS[activeTruck?.goods ?? 'rice']?.color ?? '#d9b879'}
              type={activeTruck?.goods === 'rice' || activeTruck?.goods === 'coffee' ? 'sack' : 'box'}
            />
          </group>
        </group>
      </group>

      {/* 4 BÁNH XE NÂNG CAO SU */}
      {[-0.78, 0.78].map((wx) =>
        [-0.6, 0.65].map((wz, wi) => (
          <mesh
            key={`fl-wheel-${wx}-${wz}-${wi}`}
            position={[wx, 0.32, wz]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
};
