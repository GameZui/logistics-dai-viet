import { describe, expect, it, beforeEach } from 'vitest';
import { pointOnRoute, locationById, LOCATIONS, ROUTES } from '../utils/vietnamMap';
import { useLogisticsStore } from '../store/useLogisticsStore';
import { useGameStore } from '../store/useGameStore';

describe('Vietnam map network', () => {
  it('every route joins two known locations with a positive distance', () => {
    for (const route of ROUTES) {
      expect(locationById(route.from)).toBeDefined();
      expect(locationById(route.to)).toBeDefined();
      expect(route.distanceKm).toBeGreaterThan(0);
    }
  });

  it('every hub location points at a real branch id', () => {
    for (const location of LOCATIONS.filter((item) => item.kind === 'hub')) {
      expect(location.hubId).toBeDefined();
    }
  });

  it('a route point starts at the origin and ends at the destination', () => {
    const from = locationById('ha-noi')!;
    const to = locationById('hai-phong')!;
    const start = pointOnRoute(from, to, 0);
    const end = pointOnRoute(from, to, 1);
    expect(start.x).toBeCloseTo(from.x);
    expect(start.y).toBeCloseTo(from.y);
    expect(end.x).toBeCloseTo(to.x);
    expect(end.y).toBeCloseTo(to.y);
  });
});

describe('national fleet tracking', () => {
  beforeEach(() => {
    useGameStore.setState({ gameSpeed: 1 });
    useLogisticsStore.setState({ trucks: [] });
  });

  it('advances a shipment along its leg', () => {
    useLogisticsStore.getState().spawnShipment('binh-duong', 'can-tho', 'Gạo');
    const first = useLogisticsStore.getState().trucks[0];
    expect(first.cargo).toBe('Gạo');
    expect(first.progress).toBe(0);
    useLogisticsStore.getState().tickMap(1);
    const moved = useLogisticsStore.getState().trucks[0];
    expect(moved.progress).toBeGreaterThan(0);
    expect(moved.progress).toBeLessThanOrEqual(1);
  });

  it('never adds, removes or teleports trucks while cycling the network', () => {
    useLogisticsStore.getState().spawnShipment('binh-duong', 'can-tho', 'Gạo');
    const id = useLogisticsStore.getState().trucks[0].id;
    for (let index = 0; index < 900; index++) useLogisticsStore.getState().tickMap(1);
    const trucks = useLogisticsStore.getState().trucks;
    expect(trucks).toHaveLength(1);
    expect(trucks[0].id).toBe(id);
    expect(locationById(trucks[0].from)).toBeDefined();
    expect(locationById(trucks[0].to)).toBeDefined();
    expect(trucks[0].progress).toBeGreaterThanOrEqual(0);
    expect(trucks[0].progress).toBeLessThanOrEqual(1);
  });

  it('moves smoothly along the highways without teleporting', () => {
    useLogisticsStore.getState().spawnShipment('binh-duong', 'can-tho', 'Gạo');
    let previous: { x: number; y: number } | null = null;
    for (let index = 0; index < 1200; index++) {
      useLogisticsStore.getState().tickMap(0.1);
      const truck = useLogisticsStore.getState().trucks[0];
      const from = locationById(truck.from)!;
      const to = locationById(truck.to)!;
      const point = pointOnRoute(from, to, truck.progress);
      if (previous) {
        expect(Math.hypot(point.x - previous.x, point.y - previous.y)).toBeLessThan(5);
      }
      previous = { x: point.x, y: point.y };
    }
  });

  it('freezes the fleet while the game is paused', () => {
    useLogisticsStore.getState().spawnShipment('binh-duong', 'can-tho', 'Gạo');
    const before = useLogisticsStore.getState().trucks;
    useGameStore.setState({ gameSpeed: 0 });
    useLogisticsStore.getState().tickMap(1);
    expect(useLogisticsStore.getState().trucks).toBe(before);
  });
});
