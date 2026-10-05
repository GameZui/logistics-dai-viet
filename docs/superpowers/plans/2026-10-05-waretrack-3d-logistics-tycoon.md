# WareTrack 3D Logistics Tycoon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hoàn chỉnh tựa game 3D Web mô phỏng quản lý kho bãi & vận tải WareTrack (Logistics & Warehouse Tycoon Simulator) với đồ họa 3D isometric hiện đại, chuyển động bốc dỡ pallet thời gian thực và giao diện điều hành Glassmorphism SaaS như video mẫu.

**Architecture:** Ứng dụng kết hợp kiến trúc React Three Fiber (R3F) cho 3D Viewport tương tác (xe tải, xe nâng, nhà kho, ghim 3D HTML) và Zustand cho State Machine điều phối chu trình kinh tế / bốc dỡ hàng; toàn bộ giao diện HUD áp dụng Glassmorphism theo sát thiết kế WareTrack.

**Tech Stack:** React 19, TypeScript, Vite, Three.js, @react-three/fiber, @react-three/drei, Zustand, Tailwind CSS / Modern CSS, Lucide React, Vitest.

**Spec:** [docs/superpowers/specs/2026-10-05-waretrack-3d-logistics-tycoon-design.md](file:///d:/NZ03/logictich/docs/superpowers/specs/2026-10-05-waretrack-3d-logistics-tycoon-design.md)

## Global Constraints
- Nền tảng: Web Desktop & Mobile, chạy mượt mà trên trình duyệt qua Vite dev/preview server.
- Đồ họa: 3D Procedural code (Three.js) kết hợp vật liệu MeshStandardMaterial màu sắc pastel hiện đại, bóng đổ mềm, không phụ thuộc file asset 3D ngoài.
- Tốc độ khung hình: Duy trì >= 60 FPS, không gây lag luồng UI chính.

---

### Task 1: Thiết lập Project Scaffold (Vite + React + Three.js + Zustand + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/index.css`
- Test: `src/test/setup.ts`, `src/test/smoke.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Project build config và test environment sẵn sàng.

- [ ] **Step 1: Khởi tạo package.json với dependencies cần thiết**

```json
{
  "name": "waretrack-3d",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@react-three/drei": "^10.0.0",
    "@react-three/fiber": "^9.0.0",
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.0",
    "three": "^0.174.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/three": "^0.174.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Tạo vite.config.ts, tsconfig.json, tailwind.config.js và cấu hình Vitest**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts'
  }
});
```

- [ ] **Step 3: Viết smoke test kiểm tra môi trường**

```typescript
// src/test/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Scaffold Smoke Test', () => {
  it('environment runs properly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Chạy npm install và xác nhận test pass**

Run: `npm install` và `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tailwind.config.js src/test/
git commit -m "chore: setup project scaffold with Vite, React, Three.js, and Vitest"
```

---

### Task 2: Xây dựng Zustand Game Store & Logistics Simulation Logic

**Files:**
- Create: `src/types/game.ts`, `src/store/useGameStore.ts`
- Test: `src/test/gameStore.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `useGameStore` cung cấp:
  * `cash`: number, `reputation`: number, `storageCount`: number, `storageMax`: number
  * `docks`: DockBay[] (Bay 1..4, status: available/busy/locked)
  * `trucks`: Truck[] (id, plate, carrier, status, palletsTotal, palletsUnloaded, dockId, eta)
  * `forklifts`: Forklift[] (id, name, speed, status, currentCargo, targetDockId)
  * `actions`: `tickSimulation(delta)`, `assignTruckToDock()`, `upgradeDock()`, `buyForklift()`, `setGameSpeed(speed)`

- [ ] **Step 1: Viết test cho Store logic (sinh xe, cập dock, dỡ hàng, cộng tiền)**

```typescript
// src/test/gameStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/useGameStore';

describe('useGameStore Logistics Logic', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('initializes with standard starting resources and Bay 1 open', () => {
    const state = useGameStore.getState();
    expect(state.cash).toBeGreaterThan(0);
    expect(state.docks.length).toBeGreaterThanOrEqual(2);
    expect(state.docks[0].status).toBe('available');
  });

  it('completing pallet unload increases cash and storage pallets', () => {
    const store = useGameStore.getState();
    const initialCash = store.cash;
    store.spawnTruck('test-truck');
    const truck = useGameStore.getState().trucks.find(t => t.id === 'test-truck');
    expect(truck).toBeDefined();
    
    // Simulate pallet unload action
    store.unloadPallet('test-truck');
    expect(useGameStore.getState().storageCount).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Định nghĩa TypeScript Interfaces trong `src/types/game.ts`**

```typescript
// src/types/game.ts
export type DockStatus = 'available' | 'loading' | 'unloading' | 'locked';
export type TruckStatus = 'en_route' | 'docking' | 'unloading' | 'completed' | 'departed';
export type Carrier = 'WareTrack' | 'Nordline' | 'Cargoviva' | 'Bluepeak';

export interface DockBay {
  id: string;
  number: number;
  status: DockStatus;
  currentTruckId?: string;
  hasLeveller: boolean;
  level: number;
}

export interface Truck {
  id: string;
  plate: string;
  carrier: Carrier;
  status: TruckStatus;
  dockId?: string;
  palletsTotal: number;
  palletsUnloaded: number;
  cargoType: string;
  destination: string;
  eta: number; // in seconds
  valueReward: number;
  progress: number;
}

export interface Forklift {
  id: string;
  name: string;
  status: 'idle' | 'moving_to_truck' | 'picking' | 'carrying' | 'depositing';
  speed: number;
  capacity: number;
  targetDockId?: string;
  carryingPallet: boolean;
  x: number;
  z: number;
}

export interface HubLocation {
  id: string;
  name: string;
  code: string;
  description: string;
  baseMultiplier: number;
}
```

- [ ] **Step 3: Triển khai Zustand Store trong `src/store/useGameStore.ts`**

```typescript
// src/store/useGameStore.ts
import { create } from 'zustand';
import { DockBay, Truck, Forklift, Carrier, HubLocation } from '../types/game';

interface GameState {
  cash: number;
  reputation: number;
  storageCount: number;
  storageMax: number;
  gameSpeed: number; // 0: pause, 1: 1x, 2: 2x, 3: 3x
  selectedEntityId: string | null;
  selectedEntityType: 'truck' | 'dock' | 'forklift' | null;
  currentHub: string;
  docks: DockBay[];
  trucks: Truck[];
  forklifts: Forklift[];
  
  // Actions
  resetGame: () => void;
  selectEntity: (id: string | null, type: 'truck' | 'dock' | 'forklift' | null) => void;
  setGameSpeed: (speed: number) => void;
  setHub: (hubId: string) => void;
  spawnTruck: (customId?: string) => void;
  unloadPallet: (truckId: string) => void;
  upgradeDock: (dockId: string) => void;
  buyForklift: () => void;
  tickSimulation: (delta: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  cash: 50000,
  reputation: 96.6,
  storageCount: 610,
  storageMax: 1800,
  gameSpeed: 1,
  selectedEntityId: null,
  selectedEntityType: null,
  currentHub: 'WH-01',
  docks: [
    { id: 'bay-1', number: 1, status: 'available', hasLeveller: true, level: 1 },
    { id: 'bay-2', number: 2, status: 'available', hasLeveller: false, level: 1 },
    { id: 'bay-3', number: 3, status: 'locked', hasLeveller: false, level: 0 },
    { id: 'bay-4', number: 4, status: 'locked', hasLeveller: false, level: 0 },
  ],
  trucks: [],
  forklifts: [
    { id: 'fl-1', name: 'FL-01', status: 'idle', speed: 4, capacity: 1, carryingPallet: false, x: 0, z: 0 },
    { id: 'fl-2', name: 'FL-02', status: 'idle', speed: 4, capacity: 1, carryingPallet: false, x: -3, z: 0 },
  ],

  resetGame: () => {
    // Reset to defaults
    set({
      cash: 50000,
      reputation: 96.6,
      storageCount: 610,
      storageMax: 1800,
      trucks: [],
    });
  },

  selectEntity: (id, type) => set({ selectedEntityId: id, selectedEntityType: type }),
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  setHub: (hubId) => set({ currentHub: hubId }),

  spawnTruck: (customId) => {
    const carriers: Carrier[] = ['WareTrack', 'Nordline', 'Cargoviva', 'Bluepeak'];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const plate = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTruck: Truck = {
      id: customId || `trk-${Date.now()}`,
      plate,
      carrier,
      status: 'en_route',
      palletsTotal: 6,
      palletsUnloaded: 0,
      cargoType: 'Cardboard Box (M)',
      destination: 'Southfield Cross-Dock',
      eta: 60,
      valueReward: 1500,
      progress: 0,
    };
    set((state) => ({ trucks: [...state.trucks, newTruck] }));
  },

  unloadPallet: (truckId) => {
    set((state) => {
      const trucks = state.trucks.map((t) => {
        if (t.id === truckId && t.palletsUnloaded < t.palletsTotal) {
          const nextUnloaded = t.palletsUnloaded + 1;
          const isDone = nextUnloaded >= t.palletsTotal;
          return {
            ...t,
            palletsUnloaded: nextUnloaded,
            status: isDone ? ('completed' as const) : ('unloading' as const),
          };
        }
        return t;
      });

      return {
        trucks,
        storageCount: Math.min(state.storageMax, state.storageCount + 1),
        cash: state.cash + 250,
      };
    });
  },

  upgradeDock: (dockId) => {
    set((state) => {
      const cost = 12000;
      if (state.cash < cost) return state;
      return {
        cash: state.cash - cost,
        docks: state.docks.map((d) =>
          d.id === dockId
            ? { ...d, status: d.status === 'locked' ? 'available' : d.status, level: d.level + 1, hasLeveller: true }
            : d
        ),
      };
    });
  },

  buyForklift: () => {
    set((state) => {
      const cost = 20000;
      if (state.cash < cost) return state;
      const nextId = `fl-${state.forklifts.length + 1}`;
      const nextName = `FL-0${state.forklifts.length + 1}`;
      return {
        cash: state.cash - cost,
        forklifts: [
          ...state.forklifts,
          { id: nextId, name: nextName, status: 'idle', speed: 4.5, capacity: 1, carryingPallet: false, x: 2, z: 0 },
        ],
      };
    });
  },

  tickSimulation: (delta) => {
    const { gameSpeed } = get();
    if (gameSpeed === 0) return;
    const effectiveDelta = delta * gameSpeed;

    set((state) => {
      // Logic điều phối xe tải cập dock và xe nâng bốc dỡ
      let nextTrucks = [...state.trucks];
      let nextDocks = [...state.docks];
      let nextCash = state.cash;
      let nextStorage = state.storageCount;

      // 1. Phân bổ xe 'en_route' vào dock 'available'
      for (let truck of nextTrucks) {
        if (truck.status === 'en_route' && !truck.dockId) {
          const freeDock = nextDocks.find((d) => d.status === 'available');
          if (freeDock) {
            truck.dockId = freeDock.id;
            truck.status = 'docking';
            freeDock.status = 'loading';
            freeDock.currentTruckId = truck.id;
          }
        }
      }

      // 2. Cập nhật tiến độ bốc dỡ
      nextTrucks = nextTrucks.map((truck) => {
        if (truck.status === 'docking') {
          return { ...truck, status: 'unloading' as const };
        }
        if (truck.status === 'unloading') {
          const speedMultiplier = 1;
          const nextProgress = truck.progress + effectiveDelta * 0.4 * speedMultiplier;
          const unloadedCount = Math.min(truck.palletsTotal, Math.floor(nextProgress));
          const justUnloaded = unloadedCount - truck.palletsUnloaded;

          if (justUnloaded > 0) {
            nextCash += justUnloaded * 250;
            nextStorage = Math.min(state.storageMax, nextStorage + justUnloaded);
          }

          if (unloadedCount >= truck.palletsTotal) {
            // Free the dock
            const dock = nextDocks.find((d) => d.id === truck.dockId);
            if (dock) {
              dock.status = 'available';
              dock.currentTruckId = undefined;
            }
            return {
              ...truck,
              palletsUnloaded: truck.palletsTotal,
              status: 'completed' as const,
              dockId: undefined,
            };
          }

          return {
            ...truck,
            progress: nextProgress,
            palletsUnloaded: unloadedCount,
          };
        }
        return truck;
      }).filter((t) => t.status !== 'completed' || Math.random() > 0.02); // Tự dọn xe đã xong

      return {
        trucks: nextTrucks,
        docks: nextDocks,
        cash: nextCash,
        storageCount: nextStorage,
      };
    });
  },
}));
```

- [ ] **Step 4: Chạy test kiểm tra Store logic**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/game.ts src/store/useGameStore.ts src/test/gameStore.test.ts
git commit -m "feat: implement game types and core Zustand simulation store"
```

---

### Task 3: Dựng Không gian 3D Isometric & Nhà kho Procedural (Three.js / R3F)

**Files:**
- Create: `src/components/canvas/GameCanvas.tsx`, `src/components/canvas/WarehouseFacility.tsx`, `src/components/canvas/GroundAndRoads.tsx`, `src/components/canvas/IsometricCamera.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useGameStore` (docks state, camera controls)
- Produces: 3D scene render hoàn chỉnh với mặt sân bê tông, vạch sơn, nhà kho với các cổng dock cuốn, mái che, ánh sáng đổ bóng mềm.

- [ ] **Step 1: Tạo IsometricCamera điều khiển mượt mà góc nhìn**

```typescript
// src/components/canvas/IsometricCamera.tsx
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { useRef } from 'react';

export const IsometricCamera = () => {
  const controlsRef = useRef(null);

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[25, 20, 25]}
        zoom={32}
        near={-50}
        far={200}
      />
      <OrbitControls
        ref={controlsRef}
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minZoom={18}
        maxZoom={55}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 2, 0]}
      />
    </>
  );
};
```

- [ ] **Step 2: Tạo GroundAndRoads (Mặt sân, đường nội bộ, vạch kẻ vàng/trắng, rào chắn, cây xanh)**

```typescript
// src/components/canvas/GroundAndRoads.tsx
export const GroundAndRoads = () => {
  return (
    <group>
      {/* Tarmac ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#dbe5ee" roughness={0.9} />
      </mesh>

      {/* Main road / driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12]} receiveShadow>
        <planeGeometry args={[80, 12]} />
        <meshStandardMaterial color="#c2d1e0" roughness={0.8} />
      </mesh>

      {/* White dashed road lane divider */}
      {[-30, -20, -10, 0, 10, 20, 30].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 12]}>
          <planeGeometry args={[4, 0.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Stylized trees */}
      {[-25, -15, 18, 28].map((x, i) => (
        <group key={i} position={[x, 0, 20]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 3, 8]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <sphereGeometry args={[1.4, 16, 16]} />
            <meshStandardMaterial color="#48bb78" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
```

- [ ] **Step 3: Tạo Nhà kho WarehouseFacility với các Cổng Dock (Bay 1..4) và cửa cuốn mở lên xuống**

```typescript
// src/components/canvas/WarehouseFacility.tsx
import { useGameStore } from '../../store/useGameStore';

export const WarehouseFacility = () => {
  const docks = useGameStore((state) => state.docks);
  const selectEntity = useGameStore((state) => state.selectEntity);

  return (
    <group position={[0, 0, -5]}>
      {/* Main Building Body */}
      <mesh position={[0, 5, -6]} castShadow receiveShadow>
        <boxGeometry args={[44, 10, 18]} />
        <meshStandardMaterial color="#2b6cb0" roughness={0.4} />
      </mesh>

      {/* Warehouse White Roof / Canopy */}
      <mesh position={[0, 10.2, -6]} receiveShadow>
        <boxGeometry args={[45, 0.5, 19]} />
        <meshStandardMaterial color="#edf2f7" roughness={0.5} />
      </mesh>

      {/* Docks array */}
      {docks.map((dock, idx) => {
        const posX = -12 + idx * 8;
        const isLocked = dock.status === 'locked';

        return (
          <group
            key={dock.id}
            position={[posX, 0, 3]}
            onClick={(e) => {
              e.stopPropagation();
              selectEntity(dock.id, 'dock');
            }}
          >
            {/* Dock Opening Frame */}
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[5, 6, 0.6]} />
              <meshStandardMaterial color={isLocked ? '#a0aec0' : '#4a5568'} />
            </mesh>

            {/* Dock Door (Roll-up door) */}
            <mesh position={[0, dock.status === 'unloading' ? 4.5 : 2.5, 0.1]}>
              <boxGeometry args={[4.4, dock.status === 'unloading' ? 2 : 5, 0.2]} />
              <meshStandardMaterial color={isLocked ? '#cbd5e0' : '#e2e8f0'} roughness={0.3} />
            </mesh>

            {/* Bay Number Sign */}
            <mesh position={[0, 6.3, 0.4]}>
              <boxGeometry args={[1.8, 0.8, 0.1]} />
              <meshStandardMaterial color="#3182ce" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
```

- [ ] **Step 4: Tạo GameCanvas tích hợp ánh sáng Directional Light mềm, Ambient Light và Shadow**

```typescript
// src/components/canvas/GameCanvas.tsx
import { Canvas } from '@react-three/fiber';
import { IsometricCamera } from './IsometricCamera';
import { GroundAndRoads } from './GroundAndRoads';
import { WarehouseFacility } from './WarehouseFacility';

export const GameCanvas = () => {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#e8f0f8]">
      <Canvas shadows>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <IsometricCamera />
        <GroundAndRoads />
        <WarehouseFacility />
      </Canvas>
    </div>
  );
};
```

- [ ] **Step 5: Kiểm tra render canvas trên App.tsx và Commit**

```bash
git add src/components/canvas/ src/App.tsx
git commit -m "feat: implement 3D isometric warehouse facility, ground, and camera"
```

---

### Task 4: Dựng Mô hình 3D Xe tải (Trucks), Xe nâng (Forklifts) & Pallet Hàng hóa

**Files:**
- Create: `src/components/canvas/TruckMesh.tsx`, `src/components/canvas/ForkliftMesh.tsx`, `src/components/canvas/PalletStackMesh.tsx`, `src/components/canvas/FleetLayer.tsx`
- Modify: `src/components/canvas/GameCanvas.tsx`

**Interfaces:**
- Consumes: `useGameStore` (trucks list, forklifts list, pallets count)
- Produces: Mô hình xe tải với branding chân thực, xe nâng di chuyển nâng pallet, kiện pallet gỗ có thùng hàng.

- [ ] **Step 1: Tạo PalletStackMesh (Pallet gỗ + hộp carton/thùng nhựa bọc màng co)**

```typescript
// src/components/canvas/PalletStackMesh.tsx
export const PalletStackMesh = ({ count = 1, position = [0, 0, 0] }: { count?: number; position?: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Wood Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#c68a4c" roughness={0.9} />
      </mesh>
      {/* Boxes on pallet */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.0, 0.8, 1.0]} />
        <meshStandardMaterial color="#d69e2e" roughness={0.7} />
      </mesh>
    </group>
  );
};
```

- [ ] **Step 2: Tạo TruckMesh (Đầu kéo, thùng hàng, thương hiệu, bánh xe, hiệu ứng lùi vào dock)**

```typescript
// src/components/canvas/TruckMesh.tsx
import { Truck } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TruckMesh = ({ truck }: { truck: Truck }) => {
  const groupRef = useRef<THREE.Group>(null);
  const selectEntity = useGameStore((state) => state.selectEntity);
  const docks = useGameStore((state) => state.docks);

  // Tính tọa độ mục tiêu dựa trên trạng thái
  let targetX = 0;
  let targetZ = 12;

  if (truck.dockId) {
    const dock = docks.find((d) => d.id === truck.dockId);
    if (dock) {
      targetX = -12 + (dock.number - 1) * 8;
      targetZ = truck.status === 'unloading' ? 0.8 : 4;
    }
  }

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 3);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3);
    }
  });

  const carrierColor = truck.carrier === 'WareTrack' ? '#3182ce' : truck.carrier === 'Cargoviva' ? '#dd6b20' : '#319795';

  return (
    <group
      ref={groupRef}
      position={[targetX, 0, targetZ + 10]}
      onClick={(e) => {
        e.stopPropagation();
        selectEntity(truck.id, 'truck');
      }}
    >
      {/* Cabin */}
      <mesh position={[0, 1.4, 3.2]} castShadow>
        <boxGeometry args={[2.2, 2.4, 2.2]} />
        <meshStandardMaterial color={carrierColor} roughness={0.3} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.8, 4.32]}>
        <boxGeometry args={[1.8, 1.0, 0.1]} />
        <meshStandardMaterial color="#1a202c" roughness={0.1} />
      </mesh>
      {/* Container Trailer */}
      <mesh position={[0, 2.0, -0.6]} castShadow>
        <boxGeometry args={[2.4, 3.2, 6.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {[-1.2, 1.2].map((x) =>
        [-2.5, -0.5, 3.0].map((z, i) => (
          <mesh key={`${x}-${z}-${i}`} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
        ))
      )}
    </group>
  );
};
```

- [ ] **Step 3: Tạo ForkliftMesh (Xe nâng vàng, khung nâng di động, chuyển động dỡ hàng)**

```typescript
// src/components/canvas/ForkliftMesh.tsx
import { Forklift } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { PalletStackMesh } from './PalletStackMesh';

export const ForkliftMesh = ({ forklift }: { forklift: Forklift }) => {
  const selectEntity = useGameStore((state) => state.selectEntity);

  return (
    <group
      position={[forklift.x, 0, forklift.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectEntity(forklift.id, 'forklift');
      }}
    >
      {/* Main Yellow Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.4, 1.0, 1.8]} />
        <meshStandardMaterial color="#ecc94b" roughness={0.4} />
      </mesh>
      {/* Cabin Cage */}
      <mesh position={[0, 1.6, 0.1]} castShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#2d3748" wireframe />
      </mesh>
      {/* Mast & Forks */}
      <mesh position={[0, 1.0, 1.0]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.15]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[0, 0.15, 1.4]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      {forklift.carryingPallet && <PalletStackMesh position={[0, 0.3, 1.5]} />}
    </group>
  );
};
```

- [ ] **Step 4: Tạo FleetLayer kết nối Game Loop R3F và đưa vào Canvas**

```typescript
// src/components/canvas/FleetLayer.tsx
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
      {trucks.map((truck) => (
        <TruckMesh key={truck.id} truck={truck} />
      ))}
      {forklifts.map((forklift) => (
        <ForkliftMesh key={forklift.id} forklift={forklift} />
      ))}
    </group>
  );
};
```

- [ ] **Step 5: Kiểm tra tương tác và Commit**

```bash
git add src/components/canvas/TruckMesh.tsx src/components/canvas/ForkliftMesh.tsx src/components/canvas/PalletStackMesh.tsx src/components/canvas/FleetLayer.tsx
git commit -m "feat: add procedural 3D truck, forklift, and pallet stack components"
```

---

### Task 5: 3D Floating Pin Markers (Ghim nổi HTML trực quan như WareTrack)

**Files:**
- Create: `src/components/canvas/FloatingPinMarker.tsx`
- Modify: `src/components/canvas/TruckMesh.tsx`, `src/components/canvas/WarehouseFacility.tsx`

**Interfaces:**
- Consumes: `@react-three/drei`'s `<Html>` component
- Produces: Ghim nổi 3D thể hiện mã xe (`TRK-2481 En route`, `In 2 Booked`), icon pulse và thanh tiến độ dỡ hàng mini gắn trên từng xe và dock.

- [ ] **Step 1: Tạo component FloatingPinMarker với HTML overlay và styling Glassmorphism**

```typescript
// src/components/canvas/FloatingPinMarker.tsx
import { Html } from '@react-three/drei';
import { MapPin, Truck, CheckCircle2 } from 'lucide-react';

interface FloatingPinMarkerProps {
  label: string;
  subLabel?: string;
  variant?: 'blue' | 'yellow' | 'green';
  position?: [number, number, number];
  onClick?: () => void;
}

export const FloatingPinMarker = ({
  label,
  subLabel,
  variant = 'blue',
  position = [0, 4.2, 0],
  onClick,
}: FloatingPinMarkerProps) => {
  const bgColors = {
    blue: 'bg-blue-600/90 text-white border-blue-400',
    yellow: 'bg-amber-500/90 text-white border-amber-300',
    green: 'bg-emerald-600/90 text-white border-emerald-400',
  };

  return (
    <Html position={position} center distanceFactor={22} zIndexRange={[100, 0]}>
      <div
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md border text-xs font-semibold whitespace-nowrap cursor-pointer transition-transform hover:scale-110 select-none ${bgColors[variant]}`}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>{label}</span>
        {subLabel && <span className="opacity-80 text-[10px]">· {subLabel}</span>}
      </div>
    </Html>
  );
};
```

- [ ] **Step 2: Gắn FloatingPinMarker vào TruckMesh và Dock Bays**

Truck hiển thị ghim:
`TRK-xxxx · Unloading 2/6` hoặc `TRK-xxxx · En route`
Dock hiển thị:
`In 1 · Booked` hoặc `In 2 · Available`

- [ ] **Step 3: Test hiển thị ghim khi xoay camera 3D**

Run: `npm run dev`
Expected: Các ghim nổi di chuyển chính xác theo nóc xe tải và luôn hướng về phía camera người chơi.

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/FloatingPinMarker.tsx
git commit -m "feat: add 3D floating HTML pin markers for trucks and dock bays"
```

---

### Task 6: Giao diện HUD Dashboard (Top Bar, KPI Cards, Timeline Tracker & Fleet Table)

**Files:**
- Create: `src/components/ui/TopNavBar.tsx`, `src/components/ui/TopKpiCards.tsx`, `src/components/ui/ShipmentTimeline.tsx`, `src/components/ui/FleetDockTable.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useGameStore`
- Produces: Toàn bộ lớp UI Dashboard Glassmorphism chuẩn phong cách WareTrack.

- [ ] **Step 1: Tạo TopNavBar (Logo WareTrack 3D, Hub Selector, Clock, Speed Controller, Manager)**

```typescript
// src/components/ui/TopNavBar.tsx
import { Box, Play, Pause, FastForward, Bell, ChevronDown } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const TopNavBar = () => {
  const { currentHub, setHub, gameSpeed, setGameSpeed } = useGameStore();

  const hubs = [
    { id: 'WH-01', name: 'Riverside Hub', meta: '78% full · 1/2 docked' },
    { id: 'WH-04', name: 'Southfield Cross-Dock', meta: '38% full · 2/6 docked' },
    { id: 'WH-03', name: 'Eastport Cold Chain', meta: '71% full · 2/3 docked' },
  ];

  return (
    <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-blue-500/30 shadow-md">
          <Box className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-slate-800 tracking-tight">WareTrack</span>
      </div>

      {/* Hub Selector */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-200/80">
        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-md">{currentHub}</span>
        <select
          value={currentHub}
          onChange={(e) => setHub(e.target.value)}
          className="bg-transparent font-semibold text-sm text-slate-800 outline-none cursor-pointer"
        >
          {hubs.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.meta})
            </option>
          ))}
        </select>
      </div>

      {/* Speed Controls & Profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-sm border border-slate-200/80">
          <button
            onClick={() => setGameSpeed(gameSpeed === 0 ? 1 : 0)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${gameSpeed === 0 ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {gameSpeed === 0 ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setGameSpeed(1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${gameSpeed === 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            1x
          </button>
          <button
            onClick={() => setGameSpeed(2)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${gameSpeed === 2 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            2x
          </button>
        </div>

        <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md pl-2 pr-4 py-1.5 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            AC
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-none">Alex Chen</div>
            <div className="text-[10px] text-slate-500 font-medium">Operations Manager</div>
          </div>
        </div>
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Tạo TopKpiCards (Stock on hand, Trucks on site, On-time delivery rate, Cash)**

```typescript
// src/components/ui/TopKpiCards.tsx
import { Package, Truck, Clock, DollarSign } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const TopKpiCards = () => {
  const { cash, storageCount, storageMax, docks, reputation } = useGameStore();
  const busyDocks = docks.filter((d) => d.status !== 'available' && d.status !== 'locked').length;

  return (
    <div className="absolute top-20 left-4 z-40 flex items-center gap-3 pointer-events-auto">
      {/* Cash */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Treasury</div>
          <div className="text-base font-extrabold text-slate-900">${cash.toLocaleString()}</div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Stock on hand</div>
          <div className="text-base font-extrabold text-slate-900">
            {storageCount} <span className="text-xs font-normal text-slate-500">/ {storageMax}</span>
          </div>
        </div>
      </div>

      {/* Docks Busy */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trucks on site</div>
          <div className="text-base font-extrabold text-slate-900">
            {busyDocks} <span className="text-xs font-normal text-slate-500">/ {docks.length} bays</span>
          </div>
        </div>
      </div>

      {/* On-Time Delivery */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">On-time delivery</div>
          <div className="text-base font-extrabold text-slate-900">{reputation.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Tạo ShipmentTimeline (Tracking tiến trình dỡ hàng thời gian thực)**

Hiển thị 5 bước: `Order Confirmed` -> `Picked` -> `Loaded` -> `In Transit` -> `Unloading` với icon nổi bật và mã vận đơn.

- [ ] **Step 4: Tạo FleetDockTable (Tab Docks, Forklifts, Trucks với trạng thái Loading/Available/En Route)**

Bảng điều khiển góc dưới bên phải cho phép bấm vào bất kỳ dòng nào để camera lướt tới đối tượng đó.

- [ ] **Step 5: Test giao diện tổng thể và Commit**

```bash
git add src/components/ui/
git commit -m "feat: add complete Glassmorphism HUD overlay with top bar, KPIs, timeline and fleet table"
```

---

### Task 7: Inspector Drawer, Cửa hàng Nâng cấp, Hợp đồng & Chuyển Hub

**Files:**
- Create: `src/components/ui/InspectorDrawer.tsx`, `src/components/ui/UpgradeModal.tsx`, `src/components/ui/DispatchButton.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `selectedEntityId`, `selectedEntityType`, `upgradeDock`, `buyForklift`, `spawnTruck`
- Produces: Bảng chi tiết bên phải khi click vào vật thể 3D, hỗ trợ nâng cấp dock, mua thêm xe nâng, gọi thêm xe tải bốc hàng.

- [ ] **Step 1: Viết test cho hành động nâng cấp và gọi xe mới**

```typescript
// src/test/upgradeLogic.test.ts
import { describe, it, expect } from 'vitest';
import { useGameStore } from '../store/useGameStore';

describe('Upgrades & Dispatch Logic', () => {
  it('unlocks locked dock bay when upgraded', () => {
    const store = useGameStore.getState();
    store.resetGame();
    store.upgradeDock('bay-3');
    const bay3 = useGameStore.getState().docks.find((d) => d.id === 'bay-3');
    expect(bay3?.status).toBe('available');
  });
});
```

- [ ] **Step 2: Triển khai InspectorDrawer hiển thị thông số chi tiết**

Khi người chơi click vào Xe tải:
* Tên chuyến xe (`TRK-2481 Cargoviva`), Điểm đến, Tốc độ, ETA, Danh sách kiện hàng.
* Nút: **"Ưu tiên dỡ hàng ngay"** (Gán xe nâng dỡ gấp).
Khi click vào Cổng Dock:
* Trạng thái Dock, Cấp độ, Bàn nâng Dock Leveller.
* Nút: **"Nâng cấp / Mở khóa Dock"**.

- [ ] **Step 3: Triển khai Nút Gọi xe / Nhận Hợp đồng mới (Dispatch / Contract Action)**

Nút nổi tiện ích cho phép gọi chuyến xe tải mới đến kho ngay lập tức để thử nghiệm bốc dỡ.

- [ ] **Step 4: Chạy test và Commit**

```bash
git add src/components/ui/InspectorDrawer.tsx src/test/upgradeLogic.test.ts
git commit -m "feat: implement InspectorDrawer, dock upgrades and truck dispatching"
```

---

### Task 8: Tinh chỉnh Hoàn thiện (Audio/Visual FX, Sound, Polish & Verification)

**Files:**
- Modify: `src/App.tsx`, `src/index.css`
- Create: `src/utils/audio.ts` (Web Audio API sound effects tổng hợp: tiếng xe bíp lùi bến, tiếng xúc hàng, tiếng ting cộng tiền)

**Interfaces:**
- Consumes: Tất cả components trước đó
- Produces: Một con game hoàn chỉnh, chạy mượt mà, có âm thanh vui tai và visual giống hệt video WareTrack.

- [ ] **Step 1: Tạo sound FX sinh động bằng Web Audio API (không cần tải file mp3 ngoài)**

```typescript
// src/utils/audio.ts
export const playSound = (type: 'cash' | 'dock' | 'unload' | 'click') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'cash') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Ignore audio error if not permitted
  }
};
```

- [ ] **Step 2: Chạy kiểm thử toàn diện (Unit Tests & Build Check)**

Run: `npm run test` và `npm run build`
Expected: 0 errors, build bundle thành công.

- [ ] **Step 3: Khởi chạy dev server và dùng browser subagent kiểm tra trực quan**

Kiểm tra:
* 3D Canvas xoay mượt mà, bóng đổ đẹp.
* Xe tải xuất hiện, lùi vào dock, xe nâng chạy ra bốc pallet và pallet biến mất vào kho.
* Tiền cộng lên, số lượng pallet tăng.
* Click vào xe/dock mở drawer chi tiết bên phải.
* Chuyển đổi giữa các Hub.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: complete WareTrack 3D logistics tycoon game with sound and visual polish"
```
