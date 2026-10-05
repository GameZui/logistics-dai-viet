import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { WorldLabel as Text } from './WorldLabel';
import * as THREE from 'three';
import { useEmpireStore, GOODS } from '../../store/useEmpireStore';
import { useGameStore } from '../../store/useGameStore';
import { Employee } from '../../types/empire';
import { separateWorker } from '../../utils/crowd';

// Shared registry of where every crew member currently stands, so workers keep
// a gap from one another instead of walking straight through each other.
const workerPositions = new Map<string, { id: string; x: number; z: number }>();

const Person = React.memo(({ employee, index }: { employee: Employee; index: number }) => {
  const group = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const boxInHand = useRef<THREE.Group>(null);
  const clipboard = useRef<THREE.Group>(null);
  const clock = useRef(index * 2.37);

  useFrame((_, delta) => {
    const speed = useGameStore.getState().gameSpeed;
    if (!speed || !group.current) return;
    clock.current += Math.min(delta, 0.05) * speed;
    const t = clock.current;

    let posX = 0;
    let posZ = 0;
    let rotY = 0;
    let isWalking = true;
    let isCarrying = false;
    let isInspecting = false;
    let hasClipboard = false;

    if (employee.role === 'sorter') {
      // Chu kỳ 11 giây thực tế cho nhân viên phân loại:
      // 0 -> 3.5s: Đi từ bàn phân loại xuống bãi hàng thô lấy kiện hàng
      // 3.5s -> 4.8s: Cúi người nhấc kiện hàng lên
      // 4.8s -> 8.2s: Ôm kiện hàng đi về bàn phân loại / băng chuyền
      // 8.2s -> 11s: Đặt hàng lên bàn kiểm tra, quét mã vạch và phân loại
      const cycle = (t * 0.85 + index * 3.4) % 11;
      const laneX = -4.5 + (index % 4) * 3;

      if (cycle < 3.5) {
        // Đi xuống bãi tập kết hàng thô (Z = -5.5)
        const p = cycle / 3.5;
        posX = laneX;
        posZ = -12 + p * 6.5;
        rotY = 0; // Quay mặt về phía trước
        isWalking = true;
        isCarrying = false;
      } else if (cycle < 4.8) {
        // Cúi lấy kiện hàng
        posX = laneX;
        posZ = -5.5;
        rotY = 0;
        isWalking = false;
        isCarrying = true;
      } else if (cycle < 8.2) {
        // Ôm hàng đi ngược lên bàn phân loại (Z = -12)
        const p = (cycle - 4.8) / 3.4;
        posX = laneX;
        posZ = -5.5 - p * 6.5;
        rotY = Math.PI; // Quay mặt về phía bàn phân loại
        isWalking = true;
        isCarrying = true;
      } else {
        // Đứng tại bàn phân loại kiểm tra và quét mã vạch
        posX = laneX;
        posZ = -12;
        rotY = Math.PI;
        isWalking = false;
        isCarrying = false;
        isInspecting = true;
      }
    } else if (employee.role === 'warehouse') {
      // Thủ kho: Đi kiểm kê, cầm tập hồ sơ phiếu xuất nhập kho, phân bổ các khu vực khác nhau
      hasClipboard = true;
      const subRole = index % 3;

      if (subRole === 0) {
        // Thủ kho chính (Chú Hùng): Đi lại kiểm tra hàng trước các bến dỡ xe tải
        const phase = (t * 0.35) % (Math.PI * 2);
        posX = -8 + Math.sin(phase) * 6;
        posZ = -4.2 + Math.cos(phase) * 1.5;
        rotY = Math.cos(phase) >= 0 ? Math.PI / 2 : -Math.PI / 2;
        isWalking = true;
      } else if (subRole === 1) {
        // Thủ kho phụ 1: Đi kiểm tra dãy kệ hàng bên cánh trái
        const phase = (t * 0.4 + 1.2) % (Math.PI * 2);
        posX = -18 + Math.cos(phase) * 1.2;
        posZ = -4.5 + Math.sin(phase) * 3.5;
        rotY = Math.cos(phase) >= 0 ? 0 : Math.PI;
        isWalking = true;
      } else {
        // Thủ kho phụ 2: Đứng kiểm định cân nặng tại bàn phân loại trung tâm
        const phase = (t * 0.5) % (Math.PI * 2);
        posX = 2.5 + Math.sin(phase) * 0.6;
        posZ = -11.5 + Math.cos(phase) * 0.4;
        rotY = Math.PI;
        isWalking = Math.abs(Math.sin(phase)) > 0.3;
        isInspecting = true;
      }
    } else if (employee.role === 'technician') {
      // Kỹ thuật viên: Điều khiển và bảo trì máy xưởng Đại Việt
      const phase = (t * 0.45 + index * 1.8) % (Math.PI * 2);
      posX = 29.5 + Math.sin(phase) * 2.5;
      posZ = -15 + Math.cos(phase) * 1.6;
      rotY = Math.sin(phase) >= 0 ? Math.PI / 2 : -Math.PI / 2;
      isWalking = Math.abs(Math.sin(phase)) > 0.2;
      isInspecting = !isWalking;
    }

    // Keep a gap from the other crew members so nobody walks through anybody.
    const settled = separateWorker(posX, posZ, workerPositions.values());
    workerPositions.set(employee.id, { id: employee.id, x: settled.x, z: settled.z });

    group.current.position.set(settled.x, 0, settled.z);
    group.current.rotation.y = rotY;

    if (boxInHand.current) {
      boxInHand.current.visible = isCarrying;
    }
    if (clipboard.current) {
      clipboard.current.visible = hasClipboard;
    }

    arms.current?.children.forEach((arm, i) => {
      if (isCarrying) {
        // Hai tay ôm kiện hàng ngang ngực
        arm.rotation.x = -1.15 + Math.sin(t * 4) * 0.04;
      } else if (isInspecting) {
        // Tay làm động tác kiểm tra / cầm máy quét mã vạch
        arm.rotation.x = -0.85 + Math.sin(t * 3.5 + i) * 0.15;
      } else if (hasClipboard && i === 1) {
        // Tay phải kẹp tập hồ sơ phiếu kho
        arm.rotation.x = -0.7;
      } else {
        arm.rotation.x = isWalking ? Math.sin(t * 5 + i * Math.PI) * 0.4 : Math.sin(t * 2) * 0.08;
      }
    });

    legs.current?.children.forEach((leg, i) => {
      leg.rotation.x = isWalking ? Math.sin(t * 5 + i * Math.PI) * 0.4 : 0;
    });
  });

  if (employee.role === 'driver') return null;

  return (
    <group ref={group} position={[-12, 0, -8]}>
      {/* Thân áo bảo hộ lao động */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.58, 0.7, 0.34]} />
        <meshStandardMaterial color="#187663" />
      </mesh>
      {/* Áo phản quang nhận diện: Kỹ thuật viên (xanh), Phân loại (cam), Thủ kho (vàng) */}
      <mesh position={[0, 1.22, 0.19]}>
        <boxGeometry args={[0.44, 0.52, 0.035]} />
        <meshStandardMaterial
          color={
            employee.role === 'technician' ? '#38bdf8' : employee.role === 'sorter' ? '#f97316' : '#eab308'
          }
        />
      </mesh>
      {/* Đầu */}
      <mesh position={[0, 1.79, 0]}>
        <sphereGeometry args={[0.23, 10, 8]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Mũ bảo hộ lao động vàng */}
      <mesh position={[0, 1.95, 0]}>
        <sphereGeometry args={[0.255, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffcc59" />
      </mesh>

      {/* Kiện hàng ôm trên tay khi đang mang đi phân loại */}
      <group ref={boxInHand} position={[0, 1.35, 0.45]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.36, 0.36]} />
          <meshStandardMaterial color="#d97706" roughness={0.8} />
        </mesh>
        {/* Nhãn tem trắng trên kiện hàng */}
        <mesh position={[0, 0, 0.19]}>
          <planeGeometry args={[0.2, 0.14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Tập hồ sơ / Phiếu xuất nhập kho kẹp nách thủ kho */}
      <group ref={clipboard} position={[0.38, 1.1, 0.1]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.38, 0.28]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0.022, 0.02, 0]}>
          <boxGeometry args={[0.01, 0.32, 0.24]} />
          <meshBasicMaterial color="#fef9c3" />
        </mesh>
      </group>

      {/* Hai cánh tay */}
      <group ref={arms}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.36, 1.45, 0]}>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.15, 0.55, 0.17]} />
              <meshStandardMaterial color="#187663" />
            </mesh>
            <mesh position={[0, -0.54, 0]}>
              <sphereGeometry args={[0.09, 8, 6]} />
              <meshStandardMaterial color="#fcd34d" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Hai chân bước đi */}
      <group ref={legs}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.16, 0.86, 0]}>
            <mesh position={[0, -0.36, 0]}>
              <boxGeometry args={[0.2, 0.72, 0.23]} />
              <meshStandardMaterial color="#233b48" />
            </mesh>
            <mesh position={[0, -0.77, 0.07]}>
              <boxGeometry args={[0.22, 0.16, 0.36]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});

// Khu vực Bàn Phân Loại Hàng Hóa Thủ Công (Hiển thị khi chưa nâng cấp băng chuyền cơ giới)
const ManualSortingStation = React.memo(() => (
  <group position={[0, 0, -12.5]}>
    {/* 2 Bàn gỗ phân loại kiểm định tải trọng */}
    {[-3, 3].map((tx) => (
      <group key={`sort-tbl-${tx}`} position={[tx, 0, 0]}>
        {/* Mặt bàn gỗ thông dày dặn */}
        <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.12, 1.6]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
        {/* 4 Chân bàn thép đen */}
        {[-1.4, 1.4].map((bx) =>
          [-0.65, 0.65].map((bz) => (
            <mesh key={`leg-${bx}-${bz}`} position={[bx, 0.5, bz]} castShadow>
              <boxGeometry args={[0.12, 1.0, 0.12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} />
            </mesh>
          ))
        )}
        {/* Cân điện tử công nghiệp 150kg trên bàn */}
        <mesh position={[-0.8, 1.15, 0]} castShadow>
          <boxGeometry args={[0.9, 0.1, 0.7]} />
          <meshStandardMaterial color="#334155" metalness={0.5} />
        </mesh>
        <mesh position={[-0.8, 1.25, -0.28]}>
          <boxGeometry args={[0.3, 0.12, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Khay nhựa phân loại nông sản & linh kiện */}
        <mesh position={[0.7, 1.2, 0]} castShadow>
          <boxGeometry args={[1.2, 0.22, 1.1]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>
    ))}

    {/* Pallet mẫu 3 loại hàng phân loại: Gạo ST25, Cà phê Buôn Ma Thuột, Linh kiện */}
    {[-7.5, 0, 7.5].map((px, i) => (
      <group key={`sample-pallet-${px}`} position={[px, 0, 0]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[1.4, 0.16, 1.4]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 0.9, 1.2]} />
          <meshStandardMaterial color={['#d9b879', '#8f563f', '#4b91bd'][i]} roughness={0.7} />
        </mesh>
        <Text position={[0, 1.2, 0]} fontSize={0.32} color="#15803d">
          {['GẠO ST25', 'CÀ PHÊ', 'LINH KIỆN'][i]}
        </Text>
      </group>
    ))}

    {/* Biển treo khu vực phân loại thủ công */}
    <group position={[0, 3.8, 0]}>
      <mesh>
        <boxGeometry args={[10, 0.8, 0.1]} />
        <meshStandardMaterial color="#187663" roughness={0.4} />
      </mesh>
      <Text position={[0, 0.05, 0.07]} fontSize={0.42} color="#fef08a" anchorX="center" anchorY="middle">
        KHU PHÂN LOẠI HÀNG HÓA THỦ CÔNG · ĐẠI VIỆT
      </Text>
    </group>
  </group>
));

const Conveyor = React.memo(({ level }: { level: number }) => {
  const boxes = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const clock = useRef(0);
  const colorsInitialized = useRef(false);

  useFrame((_, delta) => {
    const empire = useEmpireStore.getState();
    const enabled = empire.sortEnabled && empire.employees.some(e => e.role === 'warehouse') && Object.values(empire.inventory).some(stock => stock.raw > 0);
    if (!boxes.current) return;

    // Chỉ khởi tạo màu 1 lần duy nhất trên GPU để không gây giật lag WebGL
    if (!colorsInitialized.current) {
      const palette = Object.values(GOODS).map(g => new THREE.Color(g.color));
      for (let i = 0; i < 12; i++) {
        boxes.current.setColorAt(i, palette[i % 3]);
      }
      if (boxes.current.instanceColor) boxes.current.instanceColor.needsUpdate = true;
      colorsInitialized.current = true;
    }

    if (enabled) {
      clock.current += Math.min(delta, 0.05) * useGameStore.getState().gameSpeed * (1 + level * 0.25);
      for (let index = 0; index < 12; index++) {
        const travel = (clock.current * 1.5 + index * 1.8) % 22;
        const lane = index % 3 - 1;
        dummy.current.position.set(-10 + Math.min(18, travel), 1.4, travel > 18 ? lane * Math.min(2.4, (travel - 18) * 0.6) : 0);
        dummy.current.rotation.y = travel > 18 ? lane * Math.PI / 2 : 0;
        dummy.current.updateMatrix();
        boxes.current.setMatrixAt(index, dummy.current.matrix);
      }
      boxes.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, -14]}>
      <mesh position={[0, 0.95, 0]} receiveShadow>
        <boxGeometry args={[22, 0.2, 1.8]} />
        <meshStandardMaterial color="#394b51" roughness={0.9} />
      </mesh>
      {[-10, -6, -2, 2, 6, 10].map(x => (
        <group key={x} position={[x, 0.45, 0]}>
          {[-0.65, 0.65].map(z => (
            <mesh key={z} position={[0, 0, z]}>
              <boxGeometry args={[0.15, 0.9, 0.15]} />
              <meshStandardMaterial color="#78958e" metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {[-0.95, 0.95].map(z => (
        <mesh key={z} position={[0, 1.1, z]}>
          <boxGeometry args={[22, 0.12, 0.1]} />
          <meshStandardMaterial color="#bdc9c8" metalness={0.4} />
        </mesh>
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i} position={[-10.5 + i, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 1.7, 6]} />
          <meshStandardMaterial color="#607375" />
        </mesh>
      ))}
      <group position={[0, 1.7, 0]}>
        {[-1.05, 1.05].map(z => (
          <mesh key={z} position={[0, 0, z]}>
            <boxGeometry args={[0.7, 1.5, 0.25]} />
            <meshStandardMaterial color="#176858" />
          </mesh>
        ))}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.8, 0.25, 2.3]} />
          <meshStandardMaterial color="#176858" />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 1.8]} />
          <meshBasicMaterial color="#5affb9" transparent opacity={0.65} />
        </mesh>
      </group>
      {[-1, 0, 1].map((lane, i) => (
        <group key={lane} position={[8, 0, lane * 2.4]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[3, 0.2, 1.6]} />
            <meshStandardMaterial color={Object.values(GOODS)[i].color} />
          </mesh>
          <Text position={[0, 0.12, 0.95]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.38} color="#234037">
            {['GẠO', 'CÀ PHÊ', 'LINH KIỆN'][i]}
          </Text>
        </group>
      ))}
      <instancedMesh ref={boxes} args={[undefined, undefined, 12]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.85, 0.6, 0.7]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <Text position={[-6, 2.2, 0]} fontSize={0.48} color="#176858">
        {`PHÂN LOẠI TỰ ĐỘNG · CẤP ${level}`}
      </Text>
    </group>
  );
});

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
    {/* Thân xe & yên ngồi */}
    <mesh position={[0, 0.74, 0.05]} castShadow><boxGeometry args={[0.5, 0.5, 1.7]} /><meshStandardMaterial color={['#1e3a8a', '#dc2626', '#15803d'][i]} /></mesh>
    <mesh position={[0, 1.02, -0.35]} castShadow><boxGeometry args={[0.46, 0.16, 0.8]} /><meshStandardMaterial color="#0f172a" /></mesh>
    {/* Đầu xe, ghi-đông và đèn pha */}
    <mesh position={[0, 1.02, 0.82]} castShadow><boxGeometry args={[0.44, 0.5, 0.24]} /><meshStandardMaterial color={['#1e3a8a', '#dc2626', '#15803d'][i]} /></mesh>
    <mesh position={[0, 1.3, 0.78]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.62, 8]} /><meshStandardMaterial color="#0f172a" metalness={0.6} /></mesh>
    <mesh position={[0, 1.02, 0.96]}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.5} /></mesh>
    {/* Bánh trước & bánh sau */}
    {[-0.72, 0.72].map(z => <mesh key={z} position={[0, 0.34, z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.34, 0.34, 0.14, 14]} /><meshStandardMaterial color="#1e293b" /></mesh>)}
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

export const VietnamIndustry = React.memo(() => {
  const employees = useEmpireStore((s) => s.employees);
  const sorter = useEmpireStore((s) => s.sorterLevel);
  const factory = useEmpireStore((s) => s.factoryLevel);
  const warehouse = useEmpireStore((s) => s.warehouseLevel);

  return (
    <group>
      <LocalScenery />
      {employees.map((employee, index) => (
        <Person key={employee.id} employee={employee} index={index} />
      ))}
      {sorter > 0 ? <Conveyor level={sorter} /> : <ManualSortingStation />}
      {factory > 0 && <FactoryBuilding level={factory} />}
      {warehouse > 1 && (
        <group position={[-32, 0, -18]}>
          <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[12, 4, 10]} />
            <meshStandardMaterial color="#e4dcc7" />
          </mesh>
          <mesh position={[0, 4.15, 0]} castShadow>
            <boxGeometry args={[13, 0.3, 11]} />
            <meshStandardMaterial color="#34836a" />
          </mesh>
          <Text position={[0, 3, 5.05]} fontSize={0.5} color="#176858">
            KHO MỞ RỘNG
          </Text>
        </group>
      )}
    </group>
  );
});
