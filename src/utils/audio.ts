// Procedural Web Audio Synthesizer for Vietnamese Logistics Tycoon
let soundEnabled = true;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

// Còi xe tải "Pim... Pim..." đặc trưng Việt Nam
export function playTruckHorn(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Hai tiếng còi liên tiếp: pim... pim...
  [0, 0.18].forEach((offset) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(340, now + offset);
    osc2.frequency.setValueAtTime(425, now + offset);

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.08, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now + offset);
    osc2.start(now + offset);
    osc1.stop(now + offset + 0.14);
    osc2.stop(now + offset + 0.14);
  });
}

// Tiếng lách cách cơ khí khi càng xe nâng bốc/hạ pallet
export function playForkliftClank(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

// Tiếng "Ting... Ting..." tiền cước xe & ký hợp đồng
export function playCoin(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [987.77, 1318.51].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);

    gain.gain.setValueAtTime(0.09, now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.26);
  });
}

// Âm thanh vinh danh khi hoàn thành chương / thăng cấp mùa vụ
export function playFanfare(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    const dur = idx === notes.length - 1 ? 0.6 : 0.18;
    gain.gain.setValueAtTime(0.12, now + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + dur + 0.02);
  });
}
