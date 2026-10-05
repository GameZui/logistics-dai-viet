import { describe, expect, it, beforeEach } from 'vitest';
import { useEmpireStore } from '../store/useEmpireStore';
import { useGameStore } from '../store/useGameStore';
import { useFleetStore } from '../store/useFleetStore';
import { isOwnTruck, ownerLabel, carrierLabel } from '../utils/labels';

describe('fleet ownership', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useFleetStore.setState({ trucks: [] });
    localStorage.clear();
  });

  it('treats Đại Việt as our fleet and the other carriers as partners', () => {
    expect(isOwnTruck('WareTrack')).toBe(true);
    expect(isOwnTruck('Nordline')).toBe(false);
    expect(ownerLabel('WareTrack')).toContain('của bạn');
    expect(ownerLabel('Nordline')).toContain('đối tác');
    expect(carrierLabel('Nordline')).toBe('Bắc Nam');
  });

  it('sends contract deliveries out with our own truck once one is ready', () => {
    useGameStore.setState({ cash: 200000 });
    expect(useFleetStore.getState().buyTruck('tarpaulin')).toBe(true);
    const own = useFleetStore.getState().trucks[0];
    useFleetStore.getState().assignDriver(own.id, 'nv-1');

    useEmpireStore.getState().build('sorter');
    useEmpireStore.getState().tickEmpire(20);
    useEmpireStore.getState().acceptContract('hd-gao');
    expect(useEmpireStore.getState().shipContract('hd-gao')).toBe(true);

    const truck = useGameStore.getState().trucks.find((item) => item.direction === 'outbound');
    expect(truck).toBeDefined();
    expect(truck!.carrier).toBe('WareTrack');
    expect(truck!.plate).toBe(own.plate);
    expect(useFleetStore.getState().trucks[0].status).toBe('delivering');
  });
});

