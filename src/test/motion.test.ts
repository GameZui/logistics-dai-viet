import { describe, expect, it } from 'vitest';
import { truckPose, forkliftPose, ARRIVAL_SECONDS, DOCK_SECONDS, DEPARTURE_SECONDS } from '../utils/motion';

describe('vehicle routes', () => {
  it('keeps position and heading continuous through entry, backing, and departure', () => {
    for (const x of [-12, -4, 4, 12]) {
      const docked = truckPose('docking', ARRIVAL_SECONDS + DOCK_SECONDS, x);
      expect(docked.x).toBe(x);
      expect(docked.z).toBeCloseTo(0.6);
      expect(docked.angle).toBe(0);
      expect(truckPose('completed', 0, x)).toEqual(truckPose('unloading', 0, x));
      for (const [status, boundaries] of [['docking', [ARRIVAL_SECONDS * .65, ARRIVAL_SECONDS]], ['completed', [DEPARTURE_SECONDS * .35, DEPARTURE_SECONDS * .7]]] as const) {
        for (const boundary of boundaries) {
          const before = truckPose(status, boundary - .001, x);
          const after = truckPose(status, boundary + .001, x);
          expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeLessThan(.04);
          expect(Math.abs(after.angle - before.angle)).toBeLessThan(.01);
        }
      }
    }
  });
  it('lifts cargo at pickup and lowers it at the staging pad', () => {
    expect(forkliftPose(2, -12).carrying).toBe(false);
    expect(forkliftPose(5, -12).carrying).toBe(true);
    expect(forkliftPose(5, -12).lift).toBe(.45);
    expect(forkliftPose(8, -12).carrying).toBe(false);
    expect(forkliftPose(8, -12).lift).toBe(-0.45);
  });
});
