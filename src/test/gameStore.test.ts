import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, HUBS } from '../store/useGameStore';
import { useEmpireStore } from '../store/useEmpireStore';

describe('useGameStore Logistics Logic', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('initializes with standard starting resources and Hub WH-01', () => {
    const state = useGameStore.getState();
    expect(state.cash).toBe(45000);
    expect(state.currentHub).toBe('WH-01');
    expect(state.docks.length).toBe(4);
    expect(state.docks[0].status).toBe('available');
    expect(state.docks[2].status).toBe('locked');
  });

  it('spawns a new truck into the fleet', () => {
    const store = useGameStore.getState();
    store.spawnTruck({ plate: 'TRK-9999', carrier: 'WareTrack' });
    const trucks = useGameStore.getState().trucks;
    const found = trucks.find((t) => t.plate === 'TRK-9999');
    expect(found).toBeDefined();
    expect(found?.status).toBe('en_route');
  });

  it('unloading pallet awards cash and increases storage count', () => {
    const store = useGameStore.getState();
    const initialCash = store.cash;
    const initialStorage = store.storageCount;

    store.spawnTruck({ id: 'test-truck-1', palletsTotal: 6 });
    store.unloadPallet('test-truck-1');

    const updated = useGameStore.getState();
    expect(updated.cash).toBe(initialCash + 300);
    expect(updated.storageCount).toBe(initialStorage + 1);
  });

  it('upgrading locked dock unlocks it and deducts cash', () => {
    const store = useGameStore.getState();
    const initialCash = store.cash;
    const success = store.upgradeDock('bay-3');
    expect(success).toBe(true);

    const updated = useGameStore.getState();
    const bay3 = updated.docks.find((d) => d.id === 'bay-3');
    expect(bay3?.status).toBe('available');
    expect(bay3?.level).toBe(1);
    expect(updated.cash).toBe(initialCash - 15000);
  });

  it('buying forklift adds a new unit to the fleet', () => {
    const store = useGameStore.getState();
    const initialCount = store.forklifts.length;
    const success = store.buyForklift();
    expect(success).toBe(true);

    const updated = useGameStore.getState();
    expect(updated.forklifts.length).toBe(initialCount + 1);
  });

  it('only switches to an unlocked hub', () => {
    const store = useGameStore.getState();
    store.setHub('WH-04');
    expect(useGameStore.getState().currentHub).toBe('WH-01');
    useEmpireStore.setState({ unlockedHubs: ['WH-01', 'WH-04'] });
    store.setHub('WH-04');
    expect(useGameStore.getState().currentHub).toBe('WH-04');
  });

  it('removes completed trucks after departure without mutating previous snapshots', () => {
    useGameStore.setState({
      lastSpawnTime: Date.now(),
      trucks: [{ id: 'departing', plate: 'TRK-1', carrier: 'WareTrack',
        status: 'completed', palletsTotal: 6, palletsUnloaded: 6,
        cargoType: 'Box', destination: 'Hub', eta: 0, valueReward: 100,
        progress: 6, motionTime: 15.95 }],
    });
    const previous = useGameStore.getState();
    previous.tickSimulation(0.1);
    expect(useGameStore.getState().trucks).toHaveLength(0);
    expect(previous.trucks[0].motionTime).toBe(15.95);
  });

  it('does not advance simulation while paused', () => {
    useGameStore.getState().spawnTruck();
    useGameStore.getState().setGameSpeed(0);
    const previous = useGameStore.getState();
    previous.tickSimulation(0.1);
    expect(useGameStore.getState()).toBe(previous);
  });

  it('limits manual dispatches to eight trucks', () => {
    for (let index = 0; index < 20; index++) useGameStore.getState().spawnTruck();
    expect(useGameStore.getState().trucks).toHaveLength(8);
  });

  it('waits for arrival and docking before assigning a forklift', () => {
    useGameStore.setState({ lastSpawnTime: Date.now() });
    useGameStore.getState().spawnTruck({ id: 'arrival' });
    for (let i = 0; i < 100; i++) useGameStore.getState().tickSimulation(0.1);
    expect(useGameStore.getState().trucks[0].status).toBe('docking');
    expect(useGameStore.getState().trucks[0].palletsUnloaded).toBe(0);
    expect(useGameStore.getState().forklifts.every(f => f.status === 'idle')).toBe(true);
    for (let i = 0; i < 110; i++) useGameStore.getState().tickSimulation(0.1);
    expect(useGameStore.getState().trucks[0].status).toBe('unloading');
    expect(useGameStore.getState().forklifts.filter(f => f.targetTruckId === 'arrival')).toHaveLength(1);
  });

  it('only awards inventory after deposit and releases the dock after departure', () => {
    useGameStore.setState({ lastSpawnTime: Date.now() });
    useGameStore.getState().spawnTruck({ id: 'cycle', palletsTotal: 1 });
    for (let i = 0; i < 250; i++) useGameStore.getState().tickSimulation(0.1);
    expect(useGameStore.getState().storageCount).toBe(610);
    for (let i = 0; i < 30; i++) useGameStore.getState().tickSimulation(0.1);
    const deposited = useGameStore.getState();
    expect(deposited.storageCount).toBe(611);
    expect(deposited.trucks[0].status).toBe('completed');
    expect(deposited.docks[0].currentTruckId).toBe('cycle');
    for (let i = 0; i < 170; i++) useGameStore.getState().tickSimulation(0.1);
    expect(useGameStore.getState().trucks).toHaveLength(0);
    expect(useGameStore.getState().docks[0].status).toBe('available');
  });
});
