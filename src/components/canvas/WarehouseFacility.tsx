import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { WorldLabel as Text } from './WorldLabel';
import { PalletStackMesh } from './PalletStackMesh';

export const WarehouseFacility = () => {
  const docks = useGameStore((state) => state.docks);
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const selectEntity = useGameStore((state) => state.selectEntity);
  const currentHub = useGameStore((state) => state.currentHub);

  return (
    <group position={[0, 0, -6]}>
      {/* Main Facility Building Body */}
      <mesh position={[0, 8.7, -17]} castShadow receiveShadow>
        <boxGeometry args={[48, 2.6, 2]} />
        <meshStandardMaterial color="#cbd5df" roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Facade panel joints and a restrained blue brand band. */}
      {Array.from({ length: 17 }, (_, index) => (
        <mesh key={`panel-${index}`} position={[-24 + index * 3, 5, 2.02]}>
          <boxGeometry args={[0.055, 1.2, 0.045]} />
          <meshStandardMaterial color="#a6b5c3" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 8.5, 2.08]}>
        <boxGeometry args={[48, 1.2, 0.15]} />
        <meshStandardMaterial color="#176858" roughness={0.5} />
      </mesh>
      {[-14, 0, 14].map((x) => (
        <group key={`vent-${x}`} position={[x, 11.1, -12]}>
          <mesh castShadow>
            <boxGeometry args={[3.4, 0.8, 2.8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.85, 12]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}

      {/* Modern White Facade Accent Band */}
      <mesh position={[0, 9.6, -17]} receiveShadow>
        <boxGeometry args={[48.2, 0.9, 2.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Roof Canopy overhang */}
      <mesh position={[0, 10.4, -15]} receiveShadow>
        <boxGeometry args={[50, 0.6, 7]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.015, -8]} receiveShadow><boxGeometry args={[48, 0.03, 20]} /><meshStandardMaterial color="#e3e8e9" roughness={0.95} /></mesh>
      {[-24, 24].map(x => <mesh key={`side-${x}`} position={[x, 3.5, -8]} castShadow><boxGeometry args={[0.25, 7, 20]} /><meshStandardMaterial color="#cbd5df" /></mesh>)}
      <mesh position={[0, 3.5, -18]}><boxGeometry args={[48, 7, 0.25]} /><meshStandardMaterial color="#cbd5df" /></mesh>
      {docks.map(dock => <group key={`staging-${dock.id}`} position={[-12 + (dock.number - 1) * 8 + 2.65, 0.04, -4]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.3, 3.3]} /><meshStandardMaterial color="#c2ddd8" /></mesh>
        {Array.from({ length: Math.min(3, dock.storedPallets ?? 0) }, (_, i) => <PalletStackMesh key={i} position={[-0.94, i * 0.8, 1.48]} scale={0.7} />)}
      </group>)}

      {/* Hub Brand Signboard on Facade - Biển hiệu 3D chữ nổi Tổng Kho Đại Việt */}
      <group position={[0, 8.4, 2.15]}>
        {/* Khung biển hiệu màu đỏ thắm & viền vàng kim */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[18, 1.6, 0.12]} />
          <meshStandardMaterial color="#991b1b" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[17.6, 1.4, 0.04]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
        {/* Tên Doanh Nghiệp Chữ Nổi Vàng Kim */}
        <Text
          position={[0, 0.22, 0.11]}
          fontSize={0.65}
          color="#fef08a"
          anchorX="center"
          anchorY="middle"
        >
          TỔNG KHO VẬN TẢI & LOGISTICS ĐẠI VIỆT
        </Text>
        <Text
          position={[0, -0.32, 0.11]}
          fontSize={0.28}
          color="#fef9c3"
          anchorX="center"
          anchorY="middle"
        >
          ★ KẾT NỐI BA MIỀN · VẠN DẶM BÌNH AN · CHỮ TÍN HÀNG ĐẦU ★
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
            <mesh position={[0, 6, 0]} castShadow>
              <boxGeometry args={[5.4, 0.4, 0.8]} />
              <meshStandardMaterial
                color={isSelected ? '#60a5fa' : isLocked ? '#94a3b8' : '#334155'}
                roughness={0.5}
              />
            </mesh>

            {/* Inner Recess / Tunnel */}
            {[-2.5, 2.5].map(x => <mesh key={x} position={[x, 3, 0]} castShadow><boxGeometry args={[0.4, 6, 0.8]} /><meshStandardMaterial color="#334155" /></mesh>)}

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
                {`CỬA 0${dock.number}`}
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
