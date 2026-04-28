let ctx: AudioContext | null = null;
function ac() { if (!ctx) ctx = new AudioContext(); return ctx; }

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.12) {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime); o.stop(c.currentTime + dur);
  } catch {}
}

export function initAudio() { ac(); }
export function sfxジャンプ()    { tone(400, 0.08, 'square', 0.1); setTimeout(() => tone(600, 0.06, 'square', 0.08), 60); }
export function sfxCoin()    { tone(800, 0.06, 'sine', 0.12); setTimeout(() => tone(1100, 0.08, 'sine', 0.1), 50); }
export function sfxHit()     { tone(200, 0.15, 'sawtooth', 0.1); }
export function sfxPowerup() { [500, 700, 900, 1200].forEach((f, i) => setTimeout(() => tone(f, 0.1, 'sine', 0.1), i * 70)); }
export function sfxDie()     { [400, 300, 200, 100].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sawtooth', 0.1), i * 150)); }
export function sfxClear()   { [523, 659, 784, 880, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 100)); }
export function sfxStep()    { tone(150, 0.04, 'triangle', 0.04); }
