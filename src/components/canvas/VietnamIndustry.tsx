import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { WorldLabel as Text } from './WorldLabel';
import * as THREE from 'three';
import { useEmpireStore, GOODS } from '../../store/useEmpireStore';
import { useGameStore } from '../../store/useGameStore';
import { Employee } from '../../types/empire';

const Person = React.memo(({ employee, index }: { employee: Employee; index: number }) => {
  const group = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const clock = useRef(index);
  const baseX = employee.role === 'technician' ? 29 + index % 3 * 2 : employee.role === 'sorter' ? -8 + index % 4 * 4 : -18 + index % 4 * 2;
  const baseZ = employee.role === 'technician' ? -12 : employee.role === 'sorter' ? -12.3 : -11;
  useFrame((_, delta) => {
    const speed = useGameStore.getState().gameSpeed;
    if (!speed || !group.current) return;
    clock.current += Math.min(delta, .05) * speed;
    const t = clock.current;
    const walking = employee.role === 'warehouse';
    if (walking) {
      group.current.position.x = baseX + Math.sin(t * .35) * 1.5;
      group.current.rotation.y = Math.cos(t * .35) >= 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    arms.current?.children.forEach((arm, i) => { arm.rotation.x = Math.sin(t * (walking ? 5 : 2) + i * Math.PI) * (walking ? .4 : .25); });
    legs.current?.children.forEach((leg, i) => { leg.rotation.x = walking ? Math.sin(t * 5 + i * Math.PI) * .35 : 0; });
  });
  if (employee.role === 'driver') return null;
  return <group ref={group} position={[baseX, 0, baseZ]}>
    <mesh position={[0, 1.2, 0]} castShadow><boxGeometry args={[.58, .7, .34]} /><meshStandardMaterial color="#187663" /></mesh>
    <mesh position={[0, 1.22, .19]}><boxGeometry args={[.42, .52, .035]} /><meshStandardMaterial color={employee.role === 'technician' ? '#6db5dc' : '#f9a33d'} /></mesh>
    <mesh position={[0, 1.79, 0]}><sphereGeometry args={[.23, 10, 8]} /><meshStandardMaterial color="#dbac82" /></mesh>
    <mesh position={[0, 1.95, 0]}><sphereGeometry args={[.255, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#ffcc59" /></mesh>
    <group ref={arms}>{[-1, 1].map(side => <group key={side} position={[side * .36, 1.45, 0]}><mesh position={[0, -.25, 0]}><boxGeometry args={[.15, .55, .17]} /><meshStandardMaterial color="#187663" /></mesh><mesh position={[0, -.54, 0]}><sphereGeometry args={[.09, 8, 6]} /><meshStandardMaterial color="#dbac82" /></mesh></group>)}</group>
    <group ref={legs}>{[-1, 1].map(side => <group key={side} position={[side * .16, .86, 0]}><mesh position={[0, -.36, 0]}><boxGeometry args={[.2, .72, .23]} /><meshStandardMaterial color="#233b48" /></mesh><mesh position={[0, -.77, .07]}><boxGeometry args={[.22, .16, .36]} /><meshStandardMaterial color="#18242b" /></mesh></group>)}</group>
  </group>;
});

const Conveyor = ({ level }: { level: number }) => {
  const boxes = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const clock = useRef(0);
  const colors = useRef(Object.values(GOODS).map(goods => new THREE.Color(goods.color)));
  useFrame((_, delta) => {
    const empire = useEmpireStore.getState();
    const enabled = empire.sortEnabled && empire.employees.some(e => e.role === 'warehouse') && Object.values(empire.inventory).some(stock => stock.raw > 0);
    if (enabled) clock.current += Math.min(delta, .05) * useGameStore.getState().gameSpeed * (1 + level * .25);
    if (!boxes.current) return;
    for (let index = 0; index < 12; index++) {
      const travel = (clock.current * 1.5 + index * 1.8) % 22;
      const lane = index % 3 - 1;
      dummy.current.position.set(-10 + Math.min(18, travel), 1.4, travel > 18 ? lane * Math.min(2.4, (travel - 18) * .6) : 0);
      dummy.current.rotation.y = travel > 18 ? lane * Math.PI / 2 : 0;
      dummy.current.updateMatrix();
      boxes.current.setMatrixAt(index, dummy.current.matrix);
      boxes.current.setColorAt(index, colors.current[index % 3]);
    }
    boxes.current.instanceMatrix.needsUpdate = true;
    if (boxes.current.instanceColor) boxes.current.instanceColor.needsUpdate = true;
  });
  return <group position={[0, 0, -14]}>
    <mesh position={[0, .95, 0]} receiveShadow><boxGeometry args={[22, .2, 1.8]} /><meshStandardMaterial color="#394b51" roughness={.9} /></mesh>
    {[-10, -6, -2, 2, 6, 10].map(x => <group key={x} position={[x, .45, 0]}>{[-.65, .65].map(z => <mesh key={z} position={[0, 0, z]}><boxGeometry args={[.15, .9, .15]} /><meshStandardMaterial color="#78958e" metalness={.5} /></mesh>)}</group>)}
    {[-.95, .95].map(z => <mesh key={z} position={[0, 1.1, z]}><boxGeometry args={[22, .12, .1]} /><meshStandardMaterial color="#bdc9c8" metalness={.4} /></mesh>)}
    {Array.from({ length: 22 }, (_, i) => <mesh key={i} position={[-10.5 + i, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.065, .065, 1.7, 6]} /><meshStandardMaterial color="#607375" /></mesh>)}
    <group position={[0, 1.7, 0]}>{[-1.05, 1.05].map(z => <mesh key={z} position={[0, 0, z]}><boxGeometry args={[.7, 1.5, .25]} /><meshStandardMaterial color="#176858" /></mesh>)}<mesh position={[0, .8, 0]}><boxGeometry args={[.8, .25, 2.3]} /><meshStandardMaterial color="#176858" /></mesh><mesh position={[0, .3, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.08, 1.8]} /><meshBasicMaterial color="#5affb9" transparent opacity={.65} /></mesh></group>
    {[-1, 0, 1].map((lane, i) => <group key={lane} position={[8, 0, lane * 2.4]}><mesh position={[0, .9, 0]}><boxGeometry args={[3, .2, 1.6]} /><meshStandardMaterial color={Object.values(GOODS)[i].color} /></mesh><Text position={[0, .12, .95]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.38} color="#234037">{['GẠO', 'CÀ PHÊ', 'LINH KIỆN'][i]}</Text></group>)}
    <instancedMesh ref={boxes} args={[undefined, undefined, 12]} castShadow frustumCulled={false}><boxGeometry args={[.85, .6, .7]} /><meshStandardMaterial roughness={.85} /></instancedMesh>
    <Text position={[-6, 2.2, 0]} fontSize={.48} color="#176858">{`PHÂN LOẠI TỰ ĐỘNG · CẤP ${level}`}</Text>
  </group>;
};

const FactoryBuilding = ({ level }: { level: number }) => {
  const press = useRef<THREE.Mesh>(null);
  const clock = useRef(0);
  useFrame((_, delta) => {
    const state = useEmpireStore.getState();
    if (!state.productionEnabled || !state.employees.some(e => e.role === 'technician') || state.inventory[state.productionGoods].sorted < 2) return;
    clock.current += Math.min(delta, .05) * useGameStore.getState().gameSpeed;
    if (press.current) press.current.position.y = 2 + Math.sin(clock.current * 3) * .25;
  });
  return <group position={[32, 0, -17]}>
    <mesh position={[0, .05, 0]} receiveShadow><boxGeometry args={[13, .1, 13]} /><meshStandardMaterial color="#dbe4dc" /></mesh>
    <mesh position={[0, 3, -6]} castShadow><boxGeometry args={[13, 6, .3]} /><meshStandardMaterial color="#e9dec4" /></mesh>
    <mesh position={[0, 6.2, -3]} castShadow><boxGeometry args={[14, .35, 7]} /><meshStandardMaterial color="#277b67" /></mesh>
    {[-6, 6].map(x => <mesh key={x} position={[x, 3, 3]}><boxGeometry args={[.25, 6, .25]} /><meshStandardMaterial color="#6d8c83" /></mesh>)}
    <Text position={[0, 5.1, 3.2]} fontSize={.65} color="#176858">{`XƯỞNG ĐẠI VIỆT · ${level}`}</Text>
    <RoundedBox position={[0, 1.05, 0]} args={[4, 2, 3]} radius={.12} smoothness={2} castShadow><meshStandardMaterial color="#e5bd59" /></RoundedBox>
    <mesh ref={press} position={[0, 2, 0]}><boxGeometry args={[2.3, .4, 2.5]} /><meshStandardMaterial color="#38545a" metalness={.4} /></mesh>
    <mesh position={[0, 3, 0]}><boxGeometry args={[.3, 2.3, .3]} /><meshStandardMaterial color="#789994" /></mesh>
    {[-4.5, 4.5].map(x => <group key={x} position={[x, 0, 0]}><mesh position={[0, .75, 0]}><boxGeometry args={[2, 1.5, 3]} /><meshStandardMaterial color="#92bcb1" /></mesh><mesh position={[0, 1.6, 0]}><boxGeometry args={[1.1, .2, 2]} /><meshStandardMaterial color="#304b50" /></mesh></group>)}
    {Array.from({ length: level * 2 }, (_, i) => <mesh key={i} position={[-4 + i % 3 * 1.4, .5, 4 + Math.floor(i / 3)]} castShadow><boxGeometry args={[1, 1, .8]} /><meshStandardMaterial color="#cca46f" /></mesh>)}
  </group>;
};

const LocalScenery = React.memo(() => <group>
  {/* Chòi Bảo Vệ Cổng Chính & Quầy Trà Đá Miễn Phí */}
  <group position={[-30, 0, 0]}>
    {/* Thân nhà bảo vệ tường vàng mái ngói đỏ */}
    <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[4.2, 3, 3.2]} /><meshStandardMaterial color="#fef08a" roughness={0.7} /></mesh>
    <mesh position={[0, 3.25, 0]} rotation={[0.04, 0, 0.05]} castShadow><boxGeometry args={[5.2, 0.35, 4.2]} /><meshStandardMaterial color="#b91c1c" roughness={0.6} /></mesh>
    {/* Cửa sổ kính trượt */}
    <mesh position={[0, 1.9, 1.62]}><boxGeometry args={[2.4, 0.95, 0.06]} /><meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.7} /></mesh>
    <Text position={[0, 2.7, 1.63]} fontSize={0.32} color="#991b1b">PHÒNG BẢO VỆ</Text>

    {/* BÀN TRÀ ĐÁ MIỄN PHÍ TRƯỚC HIÊN */}
    <group position={[1.8, 0, 2.2]}>
      {/* Bàn nhựa/gỗ nhỏ */}
      <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.2, 0.08, 0.9]} /><meshStandardMaterial color="#92400e" /></mesh>
      {[-0.45, 0.45].map(bx => [-0.35, 0.35].map(bz => (
        <mesh key={`tbl-${bx}-${bz}`} position={[bx, 0.22, bz]}><cylinderGeometry args={[0.03, 0.03, 0.45, 6]} /><meshStandardMaterial color="#1e293b" /></mesh>
      )))}
      {/* Bình nhựa giữ nhiệt 'TRÀ ĐÁ MIỄN PHÍ' */}
      <mesh position={[-0.25, 0.8, 0]} castShadow><cylinderGeometry args={[0.22, 0.22, 0.55, 16]} /><meshStandardMaterial color="#0284c7" roughness={0.4} /></mesh>
      <mesh position={[-0.25, 1.1, 0]}><cylinderGeometry args={[0.23, 0.23, 0.08, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <Text position={[-0.25, 0.82, 0.24]} fontSize={0.09} color="#ffffff">TRÀ ĐÁ MIỄN PHÍ</Text>
      {/* Ấm tích pha trà nóng bọc mây */}
      <mesh position={[0.28, 0.65, 0]} castShadow><cylinderGeometry args={[0.14, 0.16, 0.32, 12]} /><meshStandardMaterial color="#fcd34d" roughness={0.9} /></mesh>
      {/* Ghế nhựa đỏ */}
      <mesh position={[0, 0.26, 0.8]} castShadow><boxGeometry args={[0.42, 0.06, 0.42]} /><meshStandardMaterial color="#dc2626" /></mesh>
    </group>

    {/* Biển Báo Giao Thông Tải Trọng 10T & Lối Vào */}
    <group position={[3.6, 0, 2.0]}>
      <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.035, 0.035, 2.8, 8]} /><meshStandardMaterial color="#64748b" metalness={0.7} /></mesh>
      <mesh position={[0, 2.6, 0]}><cylinderGeometry args={[0.48, 0.48, 0.04, 24]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[0, 2.6, 0.025]}><ringGeometry args={[0.38, 0.47, 24]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <Text position={[0, 2.6, 0.03]} fontSize={0.32} color="#0f172a">10T</Text>
    </group>
  </group>

  {/* Cột Cờ Tổ Quốc Bay Phấp Phới Tại Cổng */}
  <group position={[-27, 0, 3]}>
    {/* Cột cờ Inox & Quả cầu đỉnh cột */}
    <mesh position={[0, 4.2, 0]}><cylinderGeometry args={[0.06, 0.1, 8.4, 12]} /><meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} /></mesh>
    <mesh position={[0, 8.45, 0]}><sphereGeometry args={[0.15, 12, 10]} /><meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.1} /></mesh>
    {/* Bệ đỡ cột cờ tam cấp */}
    <mesh position={[0, 0.2, 0]} receiveShadow><boxGeometry args={[1.6, 0.4, 1.6]} /><meshStandardMaterial color="#94a3b8" roughness={0.8} /></mesh>
    {/* Lá cờ đỏ sao vàng */}
    <group position={[1.4, 7.2, 0]}>
      <mesh castShadow><planeGeometry args={[2.7, 1.8]} /><meshStandardMaterial color="#dc2626" side={THREE.DoubleSide} roughness={0.6} /></mesh>
      <Text position={[0, 0, 0.02]} fontSize={1.1} color="#facc15">★</Text>
    </group>
  </group>

  {/* Dãy Xe Máy Nhân Viên Đi Làm */}
  {[-34, -31.5, -29].map((x, i) => <group key={x} position={[x, 0, 6.5]} rotation={[0, 0.35, 0]}>
    <mesh position={[0, 0.72, 0]}><boxGeometry args={[0.35, 0.58, 1.6]} /><meshStandardMaterial color={['#1e3a8a', '#dc2626', '#15803d'][i]} /></mesh>
    <mesh position={[0, 1.1, -0.2]}><boxGeometry args={[0.42, 0.12, 0.8]} /><meshStandardMaterial color="#0f172a" /></mesh>
    {[-0.65, 0.65].map(z => <mesh key={z} position={[0, 0.35, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.35, 0.35, 0.12, 12]} /><meshStandardMaterial color="#1e293b" /></mesh>)}
  </group>)}

  {/* Hàng Cây Chuối Cảnh & Cây Bàng Nhiệt Đới */}
  {[-37, 43].map(x => <group key={x} position={[x, 0, -4]}>
    <mesh position={[0, 3, 0]} rotation={[0, 0, -0.06]}><cylinderGeometry args={[0.18, 0.3, 6, 8]} /><meshStandardMaterial color="#78350f" /></mesh>
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[Math.sin(i * 0.8) * 1.5, 6, Math.cos(i * 0.8) * 1.5]} rotation={[0.35, i * 0.8, 0.25]}>
        <boxGeometry args={[0.65, 0.08, 3.4]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
    ))}
  </group>)}
</group>);

export const VietnamIndustry = () => {
  const employees = useEmpireStore(s => s.employees);
  const sorter = useEmpireStore(s => s.sorterLevel);
  const factory = useEmpireStore(s => s.factoryLevel);
  const warehouse = useEmpireStore(s => s.warehouseLevel);
  return <group><LocalScenery />{employees.map((employee, index) => <Person key={employee.id} employee={employee} index={index} />)}
    {sorter > 0 && <Conveyor level={sorter} />}{factory > 0 && <FactoryBuilding level={factory} />}
    {warehouse > 1 && <group position={[-32, 0, -18]}><mesh position={[0, 2, 0]} castShadow><boxGeometry args={[12, 4, 10]} /><meshStandardMaterial color="#e4dcc7" /></mesh><mesh position={[0, 4.15, 0]} castShadow><boxGeometry args={[13, .3, 11]} /><meshStandardMaterial color="#34836a" /></mesh><Text position={[0, 3, 5.05]} fontSize={.5} color="#176858">KHO MỞ RỘNG</Text></group>}
  </group>;
};
