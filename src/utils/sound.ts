// Gentle, calm web audio cues and ambient study sound generator (zen, unobtrusive)
let audioCtx: AudioContext | null = null;
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;
let currentAmbientVolume = 0.08;
const MUTE_STORAGE_KEY = 'living_study_guide_muted';

export function isSoundMuted(): boolean {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
    }
  } catch {
    // Ignore restricted storage
  }
  return false;
}

export function setSoundMuted(muted: boolean): void {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
    }
  } catch {
    // Ignore restricted storage
  }
}

export function getAmbientVolume(): number {
  return currentAmbientVolume;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playTone = (type: 'approve' | 'flip' | 'correct' | 'wrong' | 'discard') => {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'approve') {
      // Warm pleasant chime (terracotta / emerald harmony)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'flip') {
      // Soft parchment tap
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      // Uplifting two-tone harmonic
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      // Gentle warning chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'discard') {
      // Soft low rustle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // Ignore audio failures if browser blocks autoplay
  }
};

/**
 * Ambient White Noise Synthesizer (Rain, Zen Stream, Library Room)
 * Uses Web Audio API buffer synthesis with zero external files.
 */
export const startAmbientSound = (
  type: 'rain' | 'zen' | 'library' = 'rain',
  volume = currentAmbientVolume
) => {
  try {
    stopAmbientSound();
    const safeVol = Math.max(0, Math.min(0.25, volume));
    currentAmbientVolume = safeVol;
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink / Brown noise filter for natural soft sound
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter frequency based on preset
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
    } else if (type === 'zen') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
    }

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(safeVol, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    whiteNoise.start();
    ambientSource = whiteNoise;
  } catch {
    // Graceful degradation
  }
};

export const stopAmbientSound = () => {
  try {
    if (ambientSource) {
      (ambientSource as AudioScheduledSourceNode).stop();
      ambientSource.disconnect();
      ambientSource = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
  } catch {
    // Ignore cleanup errors
  }
};

export const setAmbientVolume = (vol: number) => {
  const safeVol = Math.max(0, Math.min(0.25, vol));
  currentAmbientVolume = safeVol;
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(safeVol, audioCtx.currentTime);
  }
};
