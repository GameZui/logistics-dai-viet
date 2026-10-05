import { useGameStore } from '../store/useGameStore';
import { useEmpireStore, totalStock } from '../store/useEmpireStore';

const SAVE_KEY = 'dai-viet-logistics-v1';
export function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, game: useGameStore.getState(), empire: useEmpireStore.getState() }));
    return true;
  } catch { return false; }
}
export function restoreGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    const { game, empire } = parsed;
    if (parsed.version !== 1 || !game || !empire || !Number.isFinite(game.cash) || game.cash < 0 ||
      !Number.isFinite(game.storageMax) || game.storageMax <= 0 || ![0, 1, 2].includes(game.gameSpeed) ||
      !Array.isArray(game.trucks) || game.trucks.length > 8 || !Array.isArray(game.docks) || game.docks.length !== 4 ||
      !Array.isArray(game.forklifts) || game.forklifts.length > 6 || !Array.isArray(empire.employees) || empire.employees.length > 12 ||
      !Array.isArray(empire.contracts) || empire.contracts.length > 5 || !Number.isInteger(empire.offerSerial) || empire.offerSerial < 5 || !Number.isInteger(empire.endlessEventIndex) || empire.endlessEventIndex < 0 || !Number.isFinite(empire.eventClock) || empire.eventClock < 0 || !Array.isArray(empire.unlockedHubs) ||
      !['rice', 'coffee', 'electronics'].every(key => empire.inventory?.[key] && ['raw', 'sorted', 'finished'].every(grade => Number.isInteger(empire.inventory[key][grade]) && empire.inventory[key][grade] >= 0)) ||
      !['sorterLevel', 'factoryLevel', 'warehouseLevel', 'chapter', 'elapsed'].every(key => Number.isFinite(empire[key]) && empire[key] >= 0)) return false;
    if (empire.sorterLevel > 3 || empire.factoryLevel > 3 || empire.warehouseLevel < 1 || empire.warehouseLevel > 3 ||
      !['rice', 'coffee', 'electronics'].includes(empire.productionGoods) ||
      !empire.unlockedHubs.every((id: string) => ['WH-01', 'WH-04', 'WH-03'].includes(id)) ||
      !empire.employees.every((employee: { id: string; name: string; role: string; level: number; energy: number }) => typeof employee.id === 'string' && typeof employee.name === 'string' && ['warehouse', 'driver', 'sorter', 'technician'].includes(employee.role) && Number.isInteger(employee.level) && employee.level >= 1 && employee.level <= 3 && Number.isFinite(employee.energy) && employee.energy >= 0 && employee.energy <= 100) ||
      !empire.contracts.every((contract: { id: string; goods: string; grade: string; status: string; quantity: number; remaining: number; reward: number; duration: number }) => typeof contract.id === 'string' && ['rice', 'coffee', 'electronics'].includes(contract.goods) && ['sorted', 'finished'].includes(contract.grade) && ['available', 'active', 'shipping', 'completed', 'failed'].includes(contract.status) && Number.isInteger(contract.quantity) && contract.quantity > 0 && Number.isFinite(contract.remaining) && contract.remaining >= 0 && Number.isFinite(contract.reward) && contract.reward >= 0 && Number.isFinite(contract.duration) && contract.duration > 0) ||
      !game.docks.every((dock: { id: string; status: string; number: number }) => typeof dock.id === 'string' && ['available', 'locked', 'loading', 'unloading'].includes(dock.status) && Number.isInteger(dock.number) && dock.number >= 1 && dock.number <= 4) ||
      !game.trucks.every((truck: { id: string; carrier: string; goods?: string; status: string; palletsTotal: number; palletsUnloaded: number; progress: number }) => typeof truck.id === 'string' && ['WareTrack', 'Nordline', 'Cargoviva', 'Bluepeak'].includes(truck.carrier) && (!truck.goods || ['rice', 'coffee', 'electronics'].includes(truck.goods)) && ['en_route', 'docking', 'unloading', 'completed', 'departed'].includes(truck.status) && Number.isInteger(truck.palletsTotal) && truck.palletsTotal > 0 && Number.isInteger(truck.palletsUnloaded) && truck.palletsUnloaded >= 0 && truck.palletsUnloaded <= truck.palletsTotal && Number.isFinite(truck.progress)) ||
      !game.forklifts.every((forklift: { id: string; x: number; z: number }) => typeof forklift.id === 'string' && Number.isFinite(forklift.x) && Number.isFinite(forklift.z))) return false;
    // Restore data fields only, keeping all current action functions intact.
    const gameData = Object.fromEntries(Object.entries(game).filter(([key]) => key in useGameStore.getState() && typeof useGameStore.getState()[key as keyof ReturnType<typeof useGameStore.getState>] !== 'function'));
    const empireData = Object.fromEntries(Object.entries(empire).filter(([key]) => key in useEmpireStore.getState() && typeof useEmpireStore.getState()[key as keyof ReturnType<typeof useEmpireStore.getState>] !== 'function'));
    useEmpireStore.setState(empireData);
    useGameStore.setState({ ...gameData, storageCount: totalStock(empire.inventory), selectedEntityId: null, selectedEntityType: null });
    return true;
  } catch { return false; }
}
