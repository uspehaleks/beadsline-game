// Звуковые эффекты для игры Beads Line
// Используем Web Audio API для генерации звуков без внешних файлов

let audioContext: AudioContext | null = null;
let soundEnabled: boolean | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

// Включить/выключить звуки
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('beads_sound_enabled', String(enabled));
  }
}

export function isSoundEnabled(): boolean {
  if (soundEnabled === null) {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('beads_sound_enabled');
      soundEnabled = saved !== null ? saved === 'true' : true;
    } else {
      soundEnabled = true;
    }
  }
  return soundEnabled;
}

// Генерация звука выстрела
export function playShootSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

// Генерация звука попадания/вставки
export function playInsertSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

// Генерация звука уничтожения шариков (match)
export function playMatchSound(comboLevel: number = 1) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = 500 + (comboLevel * 100);
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
  oscillator.type = 'triangle';
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

// Генерация звука крипто-шарика
export function playCryptoMatchSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Более яркий звук для крипто
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc1.frequency.setValueAtTime(800, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
  osc1.type = 'sine';
  
  osc2.frequency.setValueAtTime(1000, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2);
  osc2.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.3);
  osc2.stop(ctx.currentTime + 0.3);
}

// Генерация звука комбо
export function playComboSound(comboLevel: number) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const numNotes = Math.min(comboLevel, frequencies.length);
  
  for (let i = 0; i < numNotes; i++) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const startTime = ctx.currentTime + (i * 0.08);
    oscillator.frequency.setValueAtTime(frequencies[i], startTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.12, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.15);
  }
}

// Генерация звука потери жизни
export function playLifeLostSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(300, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  oscillator.type = 'sawtooth';
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.4);
}

// Генерация звука победы (фанфары)
export function playWinSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Fanfare melody - triumphant brass-like sound
  const fanfare = [
    { freq: 523.25, delay: 0, duration: 0.15 },      // C5
    { freq: 523.25, delay: 0.15, duration: 0.15 },   // C5
    { freq: 523.25, delay: 0.3, duration: 0.15 },    // C5
    { freq: 659.25, delay: 0.5, duration: 0.3 },     // E5
    { freq: 523.25, delay: 0.85, duration: 0.15 },   // C5
    { freq: 659.25, delay: 1.05, duration: 0.15 },   // E5
    { freq: 783.99, delay: 1.25, duration: 0.6 },    // G5 (long)
  ];
  
  fanfare.forEach(({ freq, delay, duration }) => {
    // Main tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    const startTime = ctx.currentTime + delay;
    osc1.frequency.setValueAtTime(freq, startTime);
    osc1.type = 'triangle';
    
    gain1.gain.setValueAtTime(0.25, startTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc1.start(startTime);
    osc1.stop(startTime + duration);
    
    // Harmonic for brass-like sound
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    osc2.type = 'sine';
    
    gain2.gain.setValueAtTime(0.1, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.8);
    
    osc2.start(startTime);
    osc2.stop(startTime + duration);
  });
  
  // Final chord flourish
  const chordNotes = [523.25, 659.25, 783.99, 1046.5]; // C major chord
  chordNotes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const startTime = ctx.currentTime + 1.9;
    osc.frequency.setValueAtTime(freq, startTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
    
    osc.start(startTime);
    osc.stop(startTime + 0.8);
  });
}

// Генерация звука проигрыша
export function playGameOverSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.6);
  oscillator.type = 'sawtooth';
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.6);
}

// Инициализация звуков (вызывать при первом взаимодействии пользователя)
let initialized = false;
export function initSounds() {
  if (initialized) return;
  initialized = true;
  isSoundEnabled();
  getAudioContext();
}
