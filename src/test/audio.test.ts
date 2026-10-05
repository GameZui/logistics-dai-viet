import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playTruckHorn, playForkliftClank, playCoin, playFanfare, isSoundEnabled, setSoundEnabled } from '../utils/audio';

describe('Web Audio Synthesizer', () => {
  beforeEach(() => {
    setSoundEnabled(true);
  });

  it('manages sound toggle state correctly', () => {
    expect(isSoundEnabled()).toBe(true);
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('plays sounds without crashing when AudioContext is simulated or absent', () => {
    expect(() => playTruckHorn()).not.toThrow();
    expect(() => playForkliftClank()).not.toThrow();
    expect(() => playCoin()).not.toThrow();
    expect(() => playFanfare()).not.toThrow();
  });

  it('respects sound disabled setting', () => {
    setSoundEnabled(false);
    expect(() => playTruckHorn()).not.toThrow();
  });
});
