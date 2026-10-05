import { describe, expect, it, beforeEach } from 'vitest';
import { useFleetStore } from '../store/useFleetStore';
import { useGameStore } from '../store/useGameStore';
import { TRUCK_MODELS, TruckModel } from '../types/fleet';

const price = (model: TruckModel) => TRUCK_MODELS.find((item) => item.id === model)!.price;

describe('company fleet management', () => {
  beforeEach(() => {
    useGameStore.setState({ cash: 200000, gameSpeed: 1 });
    useFleetStore.setState({ trucks: [] });
  });

  it('buys a company truck and deducts its price', () => {
    const before = useGameStore.getState().cash;
    expect(useFleetStore.getState().buyTruck('container')).toBe(true);
    const fleet = useFleetStore.getState().trucks;
    expect(fleet).toHaveLength(1);
    expect(fleet[0].model).toBe('container');
    expect(fleet[0].plate).toMatch(/^[0-9]{2}[A-Z]-/);
    expect(useGameStore.getState().cash).toBe(before - price('container'));
  });

  it('refuses a purchase when cash is short', () => {
    useGameStore.setState({ cash: 1000 });
    expect(useFleetStore.getState().buyTruck('reefer')).toBe(false);
    expect(useFleetStore.getState().trucks).toHaveLength(0);
  });

  it('needs a driver before a truck can be dispatched', () => {
    useFleetStore.getState().buyTruck('tarpaulin');
    const id = useFleetStore.getState().trucks[0].id;
    expect(useFleetStore.getState().dispatchTruck(id, 30)).toBe(false);
    useFleetStore.getState().assignDriver(id, 'nv-1');
    expect(useFleetStore.getState().dispatchTruck(id, 30)).toBe(true);
    expect(useFleetStore.getState().trucks[0].status).toBe('delivering');
  });

  it('wears the truck down on a run and brings it back to the yard', () => {
    useFleetStore.getState().buyTruck('tarpaulin');
    const id = useFleetStore.getState().trucks[0].id;
    useFleetStore.getState().assignDriver(id, 'nv-1');
    useFleetStore.getState().dispatchTruck(id, 40);
    for (let index = 0; index < 100; index++) useFleetStore.getState().tickFleet(1);
    const truck = useFleetStore.getState().trucks[0];
    expect(truck.odometerKm).toBeGreaterThan(0);
    expect(truck.condition).toBeLessThan(100);
    expect(truck.status).toBe('available');
  });

  it('repairs a worn truck for cash and sells it back', () => {
    useFleetStore.getState().buyTruck('tarpaulin');
    const id = useFleetStore.getState().trucks[0].id;
    useFleetStore.setState((state) => ({ trucks: state.trucks.map((truck) => ({ ...truck, condition: 20 })) }));
    const beforeRepair = useGameStore.getState().cash;
    expect(useFleetStore.getState().repairTruck(id)).toBe(true);
    expect(useFleetStore.getState().trucks[0].condition).toBe(100);
    expect(useGameStore.getState().cash).toBeLessThan(beforeRepair);
    const beforeSell = useGameStore.getState().cash;
    expect(useFleetStore.getState().sellTruck(id)).toBe(true);
    expect(useFleetStore.getState().trucks).toHaveLength(0);
    expect(useGameStore.getState().cash).toBeGreaterThan(beforeSell);
  });
});
