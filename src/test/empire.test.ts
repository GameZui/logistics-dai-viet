import { describe, expect, it, beforeEach } from 'vitest';
import { useEmpireStore, totalStock, chapterReady } from '../store/useEmpireStore';
import { useGameStore } from '../store/useGameStore';
import { saveGame, restoreGame } from '../utils/saveGame';

describe('Đại Việt empire systems', () => {
  beforeEach(() => { useGameStore.getState().resetGame(); localStorage.clear(); });
  it('sorts stock without creating or losing cargo', () => {
    const initial = totalStock(useEmpireStore.getState().inventory);
    expect(useEmpireStore.getState().build('sorter')).toBe(true);
    useEmpireStore.getState().tickEmpire(10);
    const state = useEmpireStore.getState();
    expect(state.sorted).toBe(15);
    expect(totalStock(state.inventory)).toBe(initial);
    expect(state.inventory.rice.sorted).toBe(5);
    expect(state.inventory.coffee.sorted).toBe(5);
    expect(state.inventory.electronics.sorted).toBe(5);
    expect(useGameStore.getState().cash).toBe(33000);
  });
  it('requires a technician and consumes two sorted pallets per finished pallet', () => {
    useEmpireStore.setState({
      inventory: {
        rice: { raw: 0, sorted: 10, finished: 0 },
        coffee: { raw: 0, sorted: 0, finished: 0 },
        electronics: { raw: 0, sorted: 0, finished: 0 },
        fruit: { raw: 0, sorted: 0, finished: 0 },
        seafood: { raw: 0, sorted: 0, finished: 0 },
        garments: { raw: 0, sorted: 0, finished: 0 },
      },
    });
    useEmpireStore.getState().build('factory');
    useEmpireStore.getState().tickEmpire(4);
    expect(useEmpireStore.getState().produced).toBe(0);
    useEmpireStore.getState().hire('technician');
    useEmpireStore.getState().tickEmpire(4);
    expect(useEmpireStore.getState().inventory.rice).toEqual({ raw: 0, sorted: 6, finished: 2 });
    expect(useGameStore.getState().storageCount).toBe(8);
  });
  it('does not spend money on unaffordable construction or duplicate chapter claims', () => {
    useGameStore.setState({ cash: 100 });
    expect(useEmpireStore.getState().build('sorter')).toBe(false);
    expect(useGameStore.getState().cash).toBe(100);
    expect(useEmpireStore.getState().claimChapter()).toBe(false);
    useEmpireStore.getState().receiveCargo('rice', 12);
    useGameStore.setState({ cash: 10000 });
    useEmpireStore.getState().hire('sorter');
    expect(chapterReady(useEmpireStore.getState())).toBe(true);
    expect(useEmpireStore.getState().claimChapter()).toBe(true);
    expect(useEmpireStore.getState().chapter).toBe(1);
    expect(useEmpireStore.getState().claimChapter()).toBe(false);
  });
  it('fails an expired contract with one penalty', () => {
    useEmpireStore.getState().acceptContract('hd-gao');
    useEmpireStore.getState().tickEmpire(241);
    const cash = useGameStore.getState().cash;
    expect(useEmpireStore.getState().contracts[0].status).toBe('failed');
    expect(useGameStore.getState().reputation).toBeCloseTo(93.6);
    useEmpireStore.getState().tickEmpire(1);
    expect(useGameStore.getState().cash).toBe(cash);
  });
  it('dispatches real outbound cargo and pays only after the truck leaves', () => {
    useEmpireStore.getState().build('sorter');
    useEmpireStore.getState().tickEmpire(20);
    useEmpireStore.getState().acceptContract('hd-gao');
    const cash = useGameStore.getState().cash;
    const stock = totalStock(useEmpireStore.getState().inventory);
    expect(useEmpireStore.getState().shipContract('hd-gao')).toBe(true);
    expect(totalStock(useEmpireStore.getState().inventory)).toBe(stock - 8);
    expect(useGameStore.getState().trucks[0].direction).toBe('outbound');
    expect(useGameStore.getState().cash).toBe(cash);
    for (let index = 0; index < 170; index++) useGameStore.getState().tickSimulation(.1);
    expect(useEmpireStore.getState().contracts[0].status).toBe('completed');
    expect(useEmpireStore.getState().contractsCompleted).toBe(1);
    expect(useGameStore.getState().cash).toBe(cash + 6500);
    useEmpireStore.getState().tickEmpire(1);
    expect(useGameStore.getState().cash).toBe(cash + 6500);
  });
  it('keeps cargo when no outbound dock is available', () => {
    useEmpireStore.getState().build('sorter');
    useEmpireStore.getState().tickEmpire(20);
    useEmpireStore.getState().acceptContract('hd-gao');
    useGameStore.setState({ docks: useGameStore.getState().docks.map(dock => ({ ...dock, status: 'locked' })) });
    const stock = totalStock(useEmpireStore.getState().inventory);
    expect(useEmpireStore.getState().shipContract('hd-gao')).toBe(false);
    expect(totalStock(useEmpireStore.getState().inventory)).toBe(stock);
  });
  it('charges wages once per shift and reduces morale when unpaid', () => {
    useGameStore.setState({ cash: 100 });
    useEmpireStore.getState().tickEmpire(180);
    expect(useGameStore.getState().cash).toBe(0);
    expect(useEmpireStore.getState().employees.every(employee => employee.energy === 80)).toBe(true);
  });
  it('restores inventory, construction and actions after saving', () => {
    useEmpireStore.getState().build('sorter');
    useEmpireStore.getState().hire('technician');
    useEmpireStore.getState().tickEmpire(10);
    const stock = totalStock(useEmpireStore.getState().inventory);
    expect(saveGame()).toBe(true);
    useGameStore.getState().resetGame();
    expect(restoreGame()).toBe(true);
    expect(useEmpireStore.getState().sorterLevel).toBe(1);
    expect(useEmpireStore.getState().employees).toHaveLength(4);
    expect(useGameStore.getState().storageCount).toBe(stock);
    expect(typeof useEmpireStore.getState().build).toBe('function');
    expect(typeof useGameStore.getState().tickSimulation).toBe('function');
  });
  it('unlocks a branch only after enough contracts and cash', () => {
    expect(useEmpireStore.getState().unlockHub('WH-04')).toBe(false);
    useEmpireStore.setState({ contractsCompleted: 2 });
    expect(useEmpireStore.getState().unlockHub('WH-04')).toBe(true);
    expect(useGameStore.getState().cash).toBe(20000);
    expect(useEmpireStore.getState().unlockHub('WH-04')).toBe(false);
  });

  it('does not pay a shipment that misses its deadline before leaving', () => {
    useEmpireStore.getState().build('sorter');
    useEmpireStore.getState().tickEmpire(20);
    useEmpireStore.getState().acceptContract('hd-gao');
    useEmpireStore.setState(s => ({ contracts: s.contracts.map(c => c.id === 'hd-gao' ? { ...c, remaining: 1 } : c) }));
    useEmpireStore.getState().shipContract('hd-gao');
    for (let index = 0; index < 180; index++) useGameStore.getState().tickSimulation(.1);
    expect(useEmpireStore.getState().contracts[0].status).toBe('failed');
    expect(useEmpireStore.getState().contractsCompleted).toBe(0);
  });

  it('rejects corrupt saves without replacing the current game', () => {
    saveGame();
    const parsed = JSON.parse(localStorage.getItem('dai-viet-logistics-v1')!);
    parsed.empire.employees[0].role = 'invalid';
    localStorage.setItem('dai-viet-logistics-v1', JSON.stringify(parsed));
    const previous = useGameStore.getState();
    expect(restoreGame()).toBe(false);
    expect(useGameStore.getState()).toBe(previous);
  });

  it('cannot repeatedly buy the same truck priority or upgrade beyond level three', () => {
    useGameStore.getState().spawnTruck({ id: 'priority', isVip: false });
    useGameStore.setState(s => ({ trucks: s.trucks.map(truck => ({ ...truck, isVip: false })) }));
    const initialCash = useGameStore.getState().cash;
    useGameStore.getState().prioritizeTruck('priority');
    useGameStore.getState().prioritizeTruck('priority');
    expect(useGameStore.getState().cash).toBe(initialCash - 500);
    expect(useGameStore.getState().upgradeDock('bay-1')).toBe(true);
    expect(useGameStore.getState().upgradeDock('bay-1')).toBe(true);
    const cash = useGameStore.getState().cash;
    expect(useGameStore.getState().upgradeDock('bay-1')).toBe(false);
    expect(useGameStore.getState().cash).toBe(cash);
  });
});
