(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/utils.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/queryClient.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_VERSION",
    ()=>APP_VERSION,
    "apiRequest",
    ()=>apiRequest,
    "getQueryFn",
    ()=>getQueryFn,
    "queryClient",
    ()=>queryClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [client] (ecmascript)");
;
const APP_VERSION = "1.2.3";
// Check and clear cache if version changed - только в браузере
if ("TURBOPACK compile-time truthy", 1) {
    const STORAGE_VERSION_KEY = "beadsline_app_version";
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (storedVersion && storedVersion !== APP_VERSION) {
        // Version changed - clear caches
        localStorage.clear();
        sessionStorage.clear();
        if ('caches' in window) {
            caches.keys().then((names)=>names.forEach((name)=>caches.delete(name)));
        }
        console.log(`App updated: ${storedVersion} -> ${APP_VERSION}`);
    }
    localStorage.setItem(STORAGE_VERSION_KEY, APP_VERSION);
}
async function throwIfResNotOk(res) {
    if (!res.ok) {
        const text = await res.text() || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }
}
async function apiRequest(method, url, data) {
    const res = await fetch(url, {
        method,
        headers: data ? {
            "Content-Type": "application/json"
        } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include"
    });
    await throwIfResNotOk(res);
    return res;
}
const getQueryFn = ({ on401: unauthorizedBehavior })=>async ({ queryKey })=>{
        const res = await fetch(queryKey.join("/"), {
            credentials: "include"
        });
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
            return null;
        }
        await throwIfResNotOk(res);
        return await res.json();
    };
const queryClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$client$5d$__$28$ecmascript$29$__["QueryClient"]({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({
                on401: "throw"
            }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: false
        },
        mutations: {
            retry: false
        }
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/sounds.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initSounds",
    ()=>initSounds,
    "isSoundEnabled",
    ()=>isSoundEnabled,
    "playBombSound",
    ()=>playBombSound,
    "playComboSound",
    ()=>playComboSound,
    "playCryptoMatchSound",
    ()=>playCryptoMatchSound,
    "playGameOverSound",
    ()=>playGameOverSound,
    "playInsertSound",
    ()=>playInsertSound,
    "playLaserSound",
    ()=>playLaserSound,
    "playLifeLostSound",
    ()=>playLifeLostSound,
    "playMagnetSound",
    ()=>playMagnetSound,
    "playMatchSound",
    ()=>playMatchSound,
    "playRainbowSound",
    ()=>playRainbowSound,
    "playRewindSound",
    ()=>playRewindSound,
    "playShieldSound",
    ()=>playShieldSound,
    "playShootSound",
    ()=>playShootSound,
    "playSlowdownSound",
    ()=>playSlowdownSound,
    "playWinSound",
    ()=>playWinSound,
    "setSoundEnabled",
    ()=>setSoundEnabled
]);
// Звуковые эффекты для игры Beads Line
// Используем Web Audio API для генерации звуков без внешних файлов
let audioContext = null;
let soundEnabled = null;
function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            return null;
        }
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(()=>{});
    }
    return audioContext;
}
function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('beads_sound_enabled', String(enabled));
    }
}
function isSoundEnabled() {
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
function playShootSound() {
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
function playInsertSound() {
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
function playMatchSound(comboLevel = 1) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const baseFreq = 500 + comboLevel * 100;
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
function playCryptoMatchSound() {
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
function playComboSound(comboLevel) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const frequencies = [
        523.25,
        659.25,
        783.99,
        1046.5
    ]; // C5, E5, G5, C6
    const numNotes = Math.min(comboLevel, frequencies.length);
    for(let i = 0; i < numNotes; i++){
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        const startTime = ctx.currentTime + i * 0.08;
        oscillator.frequency.setValueAtTime(frequencies[i], startTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.12, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
    }
}
function playLifeLostSound() {
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
function playWinSound() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    // Fanfare melody - triumphant brass-like sound
    const fanfare = [
        {
            freq: 523.25,
            delay: 0,
            duration: 0.15
        },
        {
            freq: 523.25,
            delay: 0.15,
            duration: 0.15
        },
        {
            freq: 523.25,
            delay: 0.3,
            duration: 0.15
        },
        {
            freq: 659.25,
            delay: 0.5,
            duration: 0.3
        },
        {
            freq: 523.25,
            delay: 0.85,
            duration: 0.15
        },
        {
            freq: 659.25,
            delay: 1.05,
            duration: 0.15
        },
        {
            freq: 783.99,
            delay: 1.25,
            duration: 0.6
        }
    ];
    fanfare.forEach(({ freq, delay, duration })=>{
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
    const chordNotes = [
        523.25,
        659.25,
        783.99,
        1046.5
    ]; // C major chord
    chordNotes.forEach((freq)=>{
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
function playGameOverSound() {
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
function playSlowdownSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
}
function playBombSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.frequency.setValueAtTime(80, ctx.currentTime);
    noise.type = 'square';
    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.2);
}
function playRainbowSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [
        523.25,
        587.33,
        659.25,
        783.99,
        880
    ]; // C5-A5
    notes.forEach((freq, i)=>{
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startTime = ctx.currentTime + i * 0.05;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
    });
}
function playRewindSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
}
function playShieldSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.frequency.setValueAtTime(1200, ctx.currentTime);
    osc1.type = 'sine';
    osc2.frequency.setValueAtTime(1800, ctx.currentTime);
    osc2.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
}
function playMagnetSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}
function playLaserSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
}
// Инициализация звуков (вызывать при первом взаимодействии пользователя)
let initialized = false;
function initSounds() {
    if (initialized) return;
    initialized = true;
    isSoundEnabled();
    getAudioContext();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/gameConfig.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GAME_CONFIG",
    ()=>GAME_CONFIG,
    "calculateDynamicSpeed",
    ()=>calculateDynamicSpeed
]);
const GAME_CONFIG = {
    path: {
        type: 'spiral',
        segments: 600,
        spiralTurns: 3.0,
        outerRadius: 0.42,
        innerRadius: 0.15
    },
    balls: {
        radius: 14,
        spacing: 0.024,
        initialCount: 5,
        targetCount: 50,
        shooterSpeed: 18,
        collisionRadius: 2.2
    },
    spawn: {
        period: 1800,
        buffer: 0.012,
        resumeThreshold: 35
    },
    speed: {
        base: 0.010,
        max: 0.016,
        accelerationStart: 0.8
    },
    gameplay: {
        maxTotalBalls: 60,
        addBallsInterval: 4000,
        addBallsCount: 3
    },
    crypto: {
        dropRate: 0.08,
        points: {
            btc: 500,
            eth: 300,
            usdt: 200
        }
    },
    scoring: {
        basePoints: 100,
        comboMultiplier: 1.5,
        maxComboStack: 10
    }
};
function calculateDynamicSpeed(pathProgress) {
    const { base, max, accelerationStart } = GAME_CONFIG.speed;
    const clampedProgress = Math.max(0, Math.min(1, pathProgress));
    if (clampedProgress < accelerationStart) {
        return base;
    }
    const accelerationProgress = (clampedProgress - accelerationStart) / (1 - accelerationStart);
    const speed = base + (max - base) * accelerationProgress;
    return Math.min(speed, max);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/gameEngine.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BALL_COLOR_MAP",
    ()=>BALL_COLOR_MAP,
    "BALL_RADIUS",
    ()=>BALL_RADIUS,
    "CRYPTO_COLOR_MAP",
    ()=>CRYPTO_COLOR_MAP,
    "CRYPTO_SYMBOL_MAP",
    ()=>CRYPTO_SYMBOL_MAP,
    "DEBUG_GAME_LOGIC",
    ()=>DEBUG_GAME_LOGIC,
    "SHOOTER_BALL_SPEED",
    ()=>SHOOTER_BALL_SPEED,
    "activateBomb",
    ()=>activateBomb,
    "activateLaser",
    ()=>activateLaser,
    "activateMagnet",
    ()=>activateMagnet,
    "activateRainbow",
    ()=>activateRainbow,
    "activateRewind",
    ()=>activateRewind,
    "activateRollback",
    ()=>activateRollback,
    "activateShield",
    ()=>activateShield,
    "activateSlowdown",
    ()=>activateSlowdown,
    "addNewBallsToChain",
    ()=>addNewBallsToChain,
    "applyBombEffect",
    ()=>applyBombEffect,
    "applyLaserEffect",
    ()=>applyLaserEffect,
    "applyMagnetEffect",
    ()=>applyMagnetEffect,
    "applyRewindEffect",
    ()=>applyRewindEffect,
    "calculatePoints",
    ()=>calculatePoints,
    "checkCollision",
    ()=>checkCollision,
    "checkGameOver",
    ()=>checkGameOver,
    "checkPathCollision",
    ()=>checkPathCollision,
    "checkWin",
    ()=>checkWin,
    "clearDebugLogs",
    ()=>clearDebugLogs,
    "consumeBomb",
    ()=>consumeBomb,
    "consumeLaser",
    ()=>consumeLaser,
    "consumeMagnet",
    ()=>consumeMagnet,
    "consumeRainbow",
    ()=>consumeRainbow,
    "consumeRewind",
    ()=>consumeRewind,
    "consumeShield",
    ()=>consumeShield,
    "createBallFromChain",
    ()=>createBallFromChain,
    "createInitialBalls",
    ()=>createInitialBalls,
    "createInitialGameState",
    ()=>createInitialGameState,
    "createRainbowBall",
    ()=>createRainbowBall,
    "createRandomBall",
    ()=>createRandomBall,
    "debugLog",
    ()=>debugLog,
    "debugLogs",
    ()=>debugLogs,
    "findAllMatches",
    ()=>findAllMatches,
    "findMatchingBalls",
    ()=>findMatchingBalls,
    "generatePath",
    ()=>generatePath,
    "generatePathForLevel",
    ()=>generatePathForLevel,
    "getAvailableCrypto",
    ()=>getAvailableCrypto,
    "getBallSpacing",
    ()=>getBallSpacing,
    "getBoostState",
    ()=>getBoostState,
    "getCryptoSpawnedCount",
    ()=>getCryptoSpawnedCount,
    "getCurrentLevel",
    ()=>getCurrentLevel,
    "getDebugLogs",
    ()=>getDebugLogs,
    "getEconomyConfig",
    ()=>getEconomyConfig,
    "getGameplayConfig",
    ()=>getGameplayConfig,
    "getIsLevelCompleted",
    ()=>getIsLevelCompleted,
    "getNextOperationId",
    ()=>getNextOperationId,
    "getPositionOnPath",
    ()=>getPositionOnPath,
    "getShooterPosition",
    ()=>getShooterPosition,
    "getSpeedMultiplier",
    ()=>getSpeedMultiplier,
    "getUsdtFundEnabled",
    ()=>getUsdtFundEnabled,
    "insertBallInChain",
    ()=>insertBallInChain,
    "isRollbackActive",
    ()=>isRollbackActive,
    "moveBallsForward",
    ()=>moveBallsForward,
    "processRollback",
    ()=>processRollback,
    "removeBalls",
    ()=>removeBalls,
    "resetBoostState",
    ()=>resetBoostState,
    "resetCryptoSpawnedCount",
    ()=>resetCryptoSpawnedCount,
    "setAvailableCrypto",
    ()=>setAvailableCrypto,
    "setCurrentLevel",
    ()=>setCurrentLevel,
    "setEconomyConfig",
    ()=>setEconomyConfig,
    "setGameplayConfig",
    ()=>setGameplayConfig,
    "setLevelCompleted",
    ()=>setLevelCompleted,
    "setUsdtFundEnabled",
    ()=>setUsdtFundEnabled,
    "spawnBallAtStart",
    ()=>spawnBallAtStart,
    "updateBallPositions",
    ()=>updateBallPositions,
    "updateBoostTimers",
    ()=>updateBoostTimers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gameConfig.ts [client] (ecmascript)");
;
const DEBUG_GAME_LOGIC = true;
const MAX_DEBUG_LOGS = 200;
const debugLogs = [];
let pendingLogs = [];
let operationCounter = 0;
function getNextOperationId() {
    return ++operationCounter;
}
let flushTimeout = null;
function flushLogsToServer() {
    if (pendingLogs.length === 0) return;
    const logsToSend = [
        ...pendingLogs
    ];
    pendingLogs = [];
    fetch('/api/debug-logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            logs: logsToSend
        })
    }).catch(()=>{});
}
function debugLog(...args) {
    if ("TURBOPACK compile-time truthy", 1) {
        const msg = `[${new Date().toLocaleTimeString()}] ` + args.map((a)=>typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        debugLogs.push(msg);
        if (debugLogs.length > MAX_DEBUG_LOGS) {
            debugLogs.shift();
        }
        pendingLogs.push(msg);
        if (flushTimeout) clearTimeout(flushTimeout);
        flushTimeout = setTimeout(flushLogsToServer, 100);
        console.log('[GAME]', ...args);
    }
}
function clearDebugLogs() {
    debugLogs.length = 0;
}
function getDebugLogs() {
    return [
        ...debugLogs
    ];
}
const BALL_RADIUS = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.radius;
const SHOOTER_BALL_SPEED = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.shooterSpeed;
const COLLISION_RADIUS_MULTIPLIER = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.collisionRadius;
const ALL_BALL_COLORS = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'cyan',
    'magenta',
    'amber',
    'lime',
    'violet'
];
const CRYPTO_TYPES = [
    'btc',
    'eth',
    'usdt'
];
const DEFAULT_GAMEPLAY = {
    balls: {
        initialCount: 5,
        targetCount: 50,
        maxTotalBalls: 60
    },
    spawn: {
        period: 1800,
        resumeThreshold: 35
    },
    speed: {
        base: 0.010,
        max: 0.016,
        accelerationStart: 0.8
    },
    colors: {
        count: 5
    }
};
let currentGameplay = DEFAULT_GAMEPLAY;
function setGameplayConfig(config) {
    const defaults = DEFAULT_GAMEPLAY;
    currentGameplay = {
        balls: {
            initialCount: config.balls?.initialCount ?? defaults.balls.initialCount,
            targetCount: config.balls?.targetCount ?? defaults.balls.targetCount,
            maxTotalBalls: config.balls?.maxTotalBalls ?? defaults.balls.maxTotalBalls
        },
        spawn: {
            period: config.spawn?.period ?? defaults.spawn.period,
            resumeThreshold: config.spawn?.resumeThreshold ?? defaults.spawn.resumeThreshold
        },
        speed: {
            base: config.speed?.base ?? defaults.speed.base,
            max: config.speed?.max ?? defaults.speed.max,
            accelerationStart: config.speed?.accelerationStart ?? defaults.speed.accelerationStart
        },
        colors: {
            count: config.colors?.count ?? defaults.colors.count,
            activeColors: config.colors?.activeColors
        }
    };
}
function getGameplayConfig() {
    return currentGameplay;
}
function getActiveBallColors() {
    if (currentGameplay.colors.activeColors && currentGameplay.colors.activeColors.length >= 2) {
        const filtered = currentGameplay.colors.activeColors.filter((c)=>ALL_BALL_COLORS.includes(c));
        if (filtered.length >= 2) {
            return filtered;
        }
    }
    const count = Math.max(2, Math.min(10, currentGameplay.colors.count));
    return ALL_BALL_COLORS.slice(0, count);
}
const DEFAULT_ECONOMY = {
    points: {
        normal: 5,
        btc: 500,
        eth: 300,
        usdt: 200
    },
    combo: {
        multiplier: 1.5,
        maxChain: 10
    },
    crypto: {
        spawnChance: 0.08
    },
    cryptoRewards: {
        btcPerBall: 0.00000005,
        ethPerBall: 0.0000001,
        usdtPerBall: 0.01
    },
    dailyLimits: {
        btcMaxSatsPerDay: 300,
        ethMaxWeiPerDay: 3000000000000000,
        usdtMaxPerDay: 3.0
    },
    pools: {
        btcBalanceSats: 100000,
        ethBalanceWei: 1000000000000000,
        usdtBalance: 100
    },
    perGameLimits: {
        btcMaxBeadsPerGame: 15,
        ethMaxBeadsPerGame: 15,
        usdtMaxBeadsPerGame: 15
    }
};
let currentEconomy = DEFAULT_ECONOMY;
function toNumber(val, fallback) {
    if (val === undefined || val === null) return fallback;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? fallback : num;
}
function setEconomyConfig(config) {
    const defaults = DEFAULT_ECONOMY;
    currentEconomy = {
        points: {
            normal: toNumber(config.points?.normal, defaults.points.normal),
            btc: toNumber(config.points?.btc, defaults.points.btc),
            eth: toNumber(config.points?.eth, defaults.points.eth),
            usdt: toNumber(config.points?.usdt, defaults.points.usdt)
        },
        combo: {
            multiplier: toNumber(config.combo?.multiplier, defaults.combo.multiplier),
            maxChain: toNumber(config.combo?.maxChain, defaults.combo.maxChain)
        },
        crypto: {
            spawnChance: toNumber(config.crypto?.spawnChance, defaults.crypto.spawnChance)
        },
        cryptoRewards: {
            btcPerBall: toNumber(config.cryptoRewards?.btcPerBall, defaults.cryptoRewards.btcPerBall),
            ethPerBall: toNumber(config.cryptoRewards?.ethPerBall, defaults.cryptoRewards.ethPerBall),
            usdtPerBall: toNumber(config.cryptoRewards?.usdtPerBall, defaults.cryptoRewards.usdtPerBall)
        },
        dailyLimits: {
            btcMaxSatsPerDay: toNumber(config.dailyLimits?.btcMaxSatsPerDay, defaults.dailyLimits.btcMaxSatsPerDay),
            ethMaxWeiPerDay: toNumber(config.dailyLimits?.ethMaxWeiPerDay, defaults.dailyLimits.ethMaxWeiPerDay),
            usdtMaxPerDay: toNumber(config.dailyLimits?.usdtMaxPerDay, defaults.dailyLimits.usdtMaxPerDay)
        },
        pools: {
            btcBalanceSats: toNumber(config.pools?.btcBalanceSats, defaults.pools.btcBalanceSats),
            ethBalanceWei: toNumber(config.pools?.ethBalanceWei, defaults.pools.ethBalanceWei),
            usdtBalance: toNumber(config.pools?.usdtBalance, defaults.pools.usdtBalance)
        },
        perGameLimits: {
            btcMaxBeadsPerGame: toNumber(config.perGameLimits?.btcMaxBeadsPerGame, defaults.perGameLimits.btcMaxBeadsPerGame),
            ethMaxBeadsPerGame: toNumber(config.perGameLimits?.ethMaxBeadsPerGame, defaults.perGameLimits.ethMaxBeadsPerGame),
            usdtMaxBeadsPerGame: toNumber(config.perGameLimits?.usdtMaxBeadsPerGame, defaults.perGameLimits.usdtMaxBeadsPerGame)
        }
    };
}
function getEconomyConfig() {
    return currentEconomy;
}
let boostState = {
    slowdownActive: false,
    slowdownEndTime: 0,
    slowdownMultiplier: 1.0,
    rainbowActive: false,
    pendingBomb: false,
    pendingRewind: false,
    shieldActive: false,
    magnetActive: false,
    magnetRadius: 0,
    pendingLaser: false,
    laserPierceCount: 0
};
function resetBoostState() {
    boostState = {
        slowdownActive: false,
        slowdownEndTime: 0,
        slowdownMultiplier: 1.0,
        rainbowActive: false,
        pendingBomb: false,
        pendingRewind: false,
        shieldActive: false,
        magnetActive: false,
        magnetRadius: 0,
        pendingLaser: false,
        laserPierceCount: 0
    };
    debugLog('[BOOST] State reset');
}
function getBoostState() {
    return {
        ...boostState
    };
}
function activateSlowdown(durationMs, multiplier = 0.5) {
    boostState.slowdownActive = true;
    boostState.slowdownEndTime = Date.now() + durationMs;
    boostState.slowdownMultiplier = multiplier;
    debugLog(`[BOOST] Slowdown activated: ${durationMs}ms, multiplier=${multiplier}`);
}
function activateRainbow() {
    boostState.rainbowActive = true;
    debugLog('[BOOST] Rainbow activated - next ball is wild');
}
function consumeRainbow() {
    if (boostState.rainbowActive) {
        boostState.rainbowActive = false;
        debugLog('[BOOST] Rainbow consumed');
        return true;
    }
    return false;
}
function activateBomb() {
    boostState.pendingBomb = true;
    debugLog('[BOOST] Bomb activated - next hit will explode');
}
function consumeBomb() {
    if (boostState.pendingBomb) {
        boostState.pendingBomb = false;
        debugLog('[BOOST] Bomb consumed');
        return true;
    }
    return false;
}
function activateRewind() {
    boostState.pendingRewind = true;
    debugLog('[BOOST] Rewind activated - chain will move back');
}
function consumeRewind() {
    if (boostState.pendingRewind) {
        boostState.pendingRewind = false;
        debugLog('[BOOST] Rewind consumed');
        return true;
    }
    return false;
}
function activateShield() {
    boostState.shieldActive = true;
    debugLog('[BOOST] Shield activated - protects from one life loss');
}
function consumeShield() {
    if (boostState.shieldActive) {
        boostState.shieldActive = false;
        debugLog('[BOOST] Shield consumed - blocked life loss');
        return true;
    }
    return false;
}
function activateMagnet(radius = 3) {
    boostState.magnetActive = true;
    boostState.magnetRadius = radius;
    debugLog(`[BOOST] Magnet activated - attracts same color balls within ${radius} positions`);
}
function consumeMagnet() {
    if (boostState.magnetActive) {
        const radius = boostState.magnetRadius;
        boostState.magnetActive = false;
        boostState.magnetRadius = 0;
        debugLog('[BOOST] Magnet consumed');
        return {
            active: true,
            radius
        };
    }
    return {
        active: false,
        radius: 0
    };
}
function activateLaser(pierceCount = 3) {
    boostState.pendingLaser = true;
    boostState.laserPierceCount = pierceCount;
    debugLog(`[BOOST] Laser activated - next shot pierces ${pierceCount} balls`);
}
function consumeLaser() {
    if (boostState.pendingLaser) {
        const count = boostState.laserPierceCount;
        boostState.pendingLaser = false;
        boostState.laserPierceCount = 0;
        debugLog('[BOOST] Laser consumed');
        return {
            active: true,
            pierceCount: count
        };
    }
    return {
        active: false,
        pierceCount: 0
    };
}
function applyMagnetEffect(balls, insertIndex, radius) {
    const insertedBall = balls[insertIndex];
    if (!insertedBall) return balls;
    const targetColor = insertedBall.color;
    const targetProgress = insertedBall.pathProgress;
    const newBalls = [
        ...balls
    ];
    const spacing = 0.02;
    let movedCount = 0;
    for(let i = Math.max(0, insertIndex - radius); i <= Math.min(balls.length - 1, insertIndex + radius); i++){
        if (i !== insertIndex && newBalls[i].color === targetColor) {
            const distance = Math.abs(i - insertIndex);
            const newProgress = i < insertIndex ? targetProgress - distance * spacing : targetProgress + distance * spacing;
            newBalls[i] = {
                ...newBalls[i],
                pathProgress: Math.max(0, Math.min(1, newProgress))
            };
            movedCount++;
        }
    }
    debugLog(`[BOOST] Magnet pulled ${movedCount} same-color balls toward index ${insertIndex}`);
    return newBalls;
}
function applyLaserEffect(balls, hitIndices) {
    const removedBalls = hitIndices.map((i)=>balls[i]).filter(Boolean);
    const newBalls = balls.filter((_, i)=>!hitIndices.includes(i));
    debugLog(`[BOOST] Laser pierced through ${hitIndices.length} balls`);
    return {
        newBalls,
        removedBalls,
        removedIndices: hitIndices
    };
}
function updateBoostTimers() {
    if (boostState.slowdownActive && Date.now() >= boostState.slowdownEndTime) {
        boostState.slowdownActive = false;
        boostState.slowdownMultiplier = 1.0;
        debugLog('[BOOST] Slowdown expired');
    }
}
function getSpeedMultiplier() {
    return boostState.slowdownActive ? boostState.slowdownMultiplier : 1.0;
}
function applyBombEffect(balls, hitIndex, radius = 5) {
    const toRemove = [];
    const hitBall = balls[hitIndex];
    if (!hitBall) {
        return {
            newBalls: balls,
            removedBalls: [],
            removedIndices: []
        };
    }
    for(let i = Math.max(0, hitIndex - radius); i <= Math.min(balls.length - 1, hitIndex + radius); i++){
        toRemove.push(i);
    }
    const removedBalls = toRemove.map((i)=>balls[i]);
    const newBalls = balls.filter((_, i)=>!toRemove.includes(i));
    debugLog(`[BOOST] Bomb exploded at index ${hitIndex}: removed ${toRemove.length} balls`);
    return {
        newBalls,
        removedBalls,
        removedIndices: toRemove
    };
}
function applyRewindEffect(balls, rewindPercent = 0.15) {
    const rewindAmount = rewindPercent;
    const newBalls = balls.map((ball)=>({
            ...ball,
            pathProgress: Math.max(0, ball.pathProgress - rewindAmount)
        }));
    debugLog(`[BOOST] Rewind applied: moved balls back by ${rewindPercent * 100}%`);
    return newBalls;
}
function createRainbowBall(id, baseBall) {
    const activeColors = getActiveBallColors();
    const randomColor = activeColors[Math.floor(Math.random() * activeColors.length)];
    return {
        id,
        x: baseBall?.x ?? 0,
        y: baseBall?.y ?? 0,
        color: randomColor,
        radius: BALL_RADIUS,
        pathProgress: baseBall?.pathProgress ?? 0,
        isRainbow: true
    };
}
let currentLevelConfig = null;
function setCurrentLevel(level) {
    currentLevelConfig = level;
}
function getCurrentLevel() {
    return currentLevelConfig;
}
function getBallSpacing() {
    return currentLevelConfig?.ballSpacing ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
}
function generateSpiralPath(width, height, pathConfig) {
    const segments = pathConfig.segments || 600;
    const spiralTurns = pathConfig.spiralTurns || 3.0;
    const outerRadius = pathConfig.outerRadius || 0.42;
    const innerRadius = pathConfig.innerRadius || 0.15;
    const centerX = width / 2;
    const centerY = height * 0.48;
    const maxRadius = Math.min(width, height) * outerRadius;
    const minRadius = Math.min(width, height) * innerRadius;
    // Generate high-resolution raw spiral points
    const rawSegments = segments * 4;
    const rawPoints = [];
    for(let i = 0; i <= rawSegments; i++){
        const t = i / rawSegments;
        const angle = t * Math.PI * 2 * spiralTurns;
        const radius = maxRadius - (maxRadius - minRadius) * t;
        const x = centerX + radius * Math.cos(angle - Math.PI / 2);
        const y = centerY + radius * Math.sin(angle - Math.PI / 2);
        rawPoints.push({
            x,
            y
        });
    }
    // Calculate cumulative arc lengths
    const arcLengths = [
        0
    ];
    for(let i = 1; i < rawPoints.length; i++){
        const dx = rawPoints[i].x - rawPoints[i - 1].x;
        const dy = rawPoints[i].y - rawPoints[i - 1].y;
        arcLengths.push(arcLengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    const totalLength = arcLengths[arcLengths.length - 1];
    // Resample by arc length for uniform speed
    const points = [];
    for(let i = 0; i <= segments; i++){
        const targetLength = i / segments * totalLength;
        // Binary search for the segment containing targetLength
        let low = 0;
        let high = arcLengths.length - 1;
        while(low < high - 1){
            const mid = Math.floor((low + high) / 2);
            if (arcLengths[mid] <= targetLength) {
                low = mid;
            } else {
                high = mid;
            }
        }
        // Interpolate between rawPoints[low] and rawPoints[high]
        const segmentLength = arcLengths[high] - arcLengths[low];
        const t = segmentLength > 0 ? (targetLength - arcLengths[low]) / segmentLength : 0;
        const x = rawPoints[low].x + t * (rawPoints[high].x - rawPoints[low].x);
        const y = rawPoints[low].y + t * (rawPoints[high].y - rawPoints[low].y);
        points.push({
            x,
            y
        });
    }
    return points;
}
function generateZigzagPath(width, height, pathConfig) {
    const points = [];
    const segments = pathConfig.segments || 500;
    const amplitude = pathConfig.amplitude || 0.25;
    const frequency = pathConfig.frequency || 6;
    const margin = width * 0.1;
    const pathWidth = width - margin * 2;
    const pathHeight = height * 0.7;
    const startY = height * 0.1;
    for(let i = 0; i <= segments; i++){
        const t = i / segments;
        const y = startY + t * pathHeight;
        const zigzagPhase = t * frequency * Math.PI;
        const zigzagOffset = Math.sin(zigzagPhase) * pathWidth * amplitude;
        const x = width / 2 + zigzagOffset;
        points.push({
            x,
            y
        });
    }
    return points;
}
function generateWavePath(width, height, pathConfig) {
    const points = [];
    const segments = pathConfig.segments || 550;
    const amplitude = pathConfig.amplitude || 0.18;
    const frequency = pathConfig.frequency || 3;
    const margin = width * 0.1;
    const pathHeight = height * 0.75;
    const startY = height * 0.1;
    for(let i = 0; i <= segments; i++){
        const t = i / segments;
        const y = startY + t * pathHeight;
        const waveOffset = Math.sin(t * frequency * Math.PI * 2) * width * amplitude;
        const x = width / 2 + waveOffset;
        points.push({
            x,
            y
        });
    }
    return points;
}
function generateSShapePath(width, height, pathConfig) {
    const points = [];
    const segments = pathConfig.segments || 500;
    const amplitude = pathConfig.amplitude || 0.30;
    const pathHeight = height * 0.75;
    const startY = height * 0.1;
    for(let i = 0; i <= segments; i++){
        const t = i / segments;
        const y = startY + t * pathHeight;
        const sOffset = Math.sin(t * Math.PI * 2) * width * amplitude;
        const x = width / 2 + sOffset;
        points.push({
            x,
            y
        });
    }
    return points;
}
function generateHeartPath(width, height, pathConfig) {
    const points = [];
    const segments = pathConfig.segments || 600;
    const centerX = width / 2;
    const centerY = height * 0.5;
    const scale = Math.min(width, height) * 0.38;
    for(let i = 0; i <= segments; i++){
        const t = i / segments;
        const angle = t * Math.PI * 2 - Math.PI / 2;
        const heartX = 16 * Math.pow(Math.sin(angle), 3);
        const heartY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
        const x = centerX + heartX * scale / 16;
        const y = centerY + heartY * scale / 16;
        points.push({
            x,
            y
        });
    }
    return points;
}
function generateInfinityPath(width, height, pathConfig) {
    const points = [];
    const segments = pathConfig.segments || 650;
    const centerX = width / 2;
    const centerY = height * 0.5;
    const scaleX = width * 0.35;
    const scaleY = height * 0.2;
    for(let i = 0; i <= segments; i++){
        const t = i / segments;
        const angle = t * Math.PI * 2;
        const x = centerX + scaleX * Math.sin(angle);
        const y = centerY + scaleY * Math.sin(angle * 2);
        points.push({
            x,
            y
        });
    }
    return points;
}
function generatePathForLevel(width, height, levelConfig) {
    const level = levelConfig || currentLevelConfig;
    if (!level) {
        return generateSpiralPath(width, height, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].path);
    }
    switch(level.path.type){
        case 'spiral':
            return generateSpiralPath(width, height, level.path);
        case 'zigzag':
            return generateZigzagPath(width, height, level.path);
        case 'wave':
            return generateWavePath(width, height, level.path);
        case 'sShape':
            return generateSShapePath(width, height, level.path);
        case 'heart':
            return generateHeartPath(width, height, level.path);
        case 'infinity':
            return generateInfinityPath(width, height, level.path);
        default:
            return generateSpiralPath(width, height, level.path);
    }
}
function generatePath(width, height) {
    return generatePathForLevel(width, height);
}
function getShooterPosition(width, height) {
    const level = currentLevelConfig;
    if (!level) {
        return {
            x: width / 2,
            y: height * 0.48
        };
    }
    switch(level.path.type){
        case 'spiral':
            return {
                x: width / 2,
                y: height * 0.48
            };
        case 'zigzag':
        case 'wave':
        case 'sShape':
            return {
                x: width / 2,
                y: height * 0.92
            };
        case 'heart':
            return {
                x: width / 2,
                y: height * 0.55
            };
        case 'infinity':
            return {
                x: width / 2,
                y: height * 0.75
            };
        default:
            return {
                x: width / 2,
                y: height * 0.48
            };
    }
}
function getPositionOnPath(path, progress) {
    if (progress < 0) {
        return path[0] || {
            x: 0,
            y: 0
        };
    }
    const clampedProgress = Math.min(1, progress);
    const index = clampedProgress * (path.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    if (lowerIndex === upperIndex || upperIndex >= path.length) {
        return path[lowerIndex] || path[path.length - 1];
    }
    const fraction = index - lowerIndex;
    const lower = path[lowerIndex];
    const upper = path[upperIndex];
    return {
        x: lower.x + (upper.x - lower.x) * fraction,
        y: lower.y + (upper.y - lower.y) * fraction
    };
}
// Default to disabled for safety - will be set by API response
let availableCrypto = {
    btc: false,
    eth: false,
    usdt: false
};
let usdtFundEnabled = false;
let cryptoSpawnedThisGame = {
    btc: 0,
    eth: 0,
    usdt: 0
};
// Flag to disable crypto balls on completed levels (motivate playing new levels)
let isLevelCompleted = false;
function setLevelCompleted(completed) {
    isLevelCompleted = completed;
    debugLog(`[CRYPTO] Level completed flag set to: ${completed} - crypto balls ${completed ? 'DISABLED' : 'ENABLED'}`);
}
function getIsLevelCompleted() {
    return isLevelCompleted;
}
function setAvailableCrypto(crypto) {
    availableCrypto = crypto;
}
function getAvailableCrypto() {
    return availableCrypto;
}
function setUsdtFundEnabled(enabled) {
    usdtFundEnabled = enabled;
}
function getUsdtFundEnabled() {
    return usdtFundEnabled;
}
function resetCryptoSpawnedCount() {
    cryptoSpawnedThisGame = {
        btc: 0,
        eth: 0,
        usdt: 0
    };
}
function getCryptoSpawnedCount() {
    return {
        ...cryptoSpawnedThisGame
    };
}
function getColorCounts(balls, includeAll = false) {
    const counts = new Map();
    for (const ball of balls){
        // For shooter color selection, count ALL balls' colors (including crypto)
        // For chain spawning balance, only count regular balls
        if (includeAll || !ball.crypto && !ball.isUsdtFund) {
            counts.set(ball.color, (counts.get(ball.color) || 0) + 1);
        }
    }
    return counts;
}
function selectBalancedColor(balls, forShooter = false) {
    const activeColors = getActiveBallColors();
    // For shooter: count ALL colors (including crypto balls) to match what's visible on screen
    // For chain spawning: only count regular balls for balance
    const colorCounts = getColorCounts(balls, forShooter);
    const totalBalls = balls.filter((b)=>!b.crypto && !b.isUsdtFund).length;
    const targetPerColor = Math.max(1, Math.floor(totalBalls / activeColors.length));
    if (forShooter) {
        const colorsInChain = activeColors.filter((c)=>(colorCounts.get(c) || 0) > 0);
        if (colorsInChain.length === 0) {
            return activeColors[Math.floor(Math.random() * activeColors.length)];
        }
        // Инвертируем веса: цвета с меньшим количеством появляются НАМНОГО чаще
        const maxCount = Math.max(...colorsInChain.map((c)=>colorCounts.get(c) || 1));
        const weights = [];
        for (const color of colorsInChain){
            const count = colorCounts.get(color) || 1;
            // Вес = (maxCount + 1 - count)^2, минимум 1 - квадратичная формула для большего приоритета
            const baseWeight = Math.max(1, maxCount + 1 - count);
            const weight = baseWeight * baseWeight; // Квадрат для более агрессивного приоритета
            weights.push({
                color,
                weight
            });
        }
        const totalWeight = weights.reduce((sum, w)=>sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        for (const { color, weight } of weights){
            random -= weight;
            if (random <= 0) {
                return color;
            }
        }
        return colorsInChain[0];
    }
    // Для спавна в цепочку: когда мало шаров (<=15) И в цепочке уже есть разнообразие цветов (минимум 3)
    // Это предотвращает одноцветный спавн в начале игры
    const colorsInChain = activeColors.filter((c)=>(colorCounts.get(c) || 0) > 0);
    if (totalBalls <= 15 && colorsInChain.length >= 3) {
        // Используем ту же квадратичную формулу что и для shooter
        const maxCount = Math.max(...colorsInChain.map((c)=>colorCounts.get(c) || 1));
        const weights = [];
        for (const color of colorsInChain){
            const count = colorCounts.get(color) || 1;
            const baseWeight = Math.max(1, maxCount + 1 - count);
            const weight = baseWeight * baseWeight;
            weights.push({
                color,
                weight
            });
        }
        const totalWeight = weights.reduce((sum, w)=>sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        for (const { color, weight } of weights){
            random -= weight;
            if (random <= 0) {
                return color;
            }
        }
        return colorsInChain[0];
    }
    // Обычный спавн когда много шаров - балансированное распределение
    const weights = [];
    for (const color of activeColors){
        const count = colorCounts.get(color) || 0;
        const deficit = Math.max(0, targetPerColor - count);
        let weight = 1 + deficit * 2;
        if (count === 0 && totalBalls > 10) {
            weight = 5;
        }
        weights.push({
            color,
            weight
        });
    }
    const totalWeight = weights.reduce((sum, w)=>sum + w.weight, 0);
    let random = Math.random() * totalWeight;
    for (const { color, weight } of weights){
        random -= weight;
        if (random <= 0) {
            return color;
        }
    }
    return activeColors[0];
}
function createBallFromChain(id, chainBalls, pathProgress = 0) {
    const color = selectBalancedColor(chainBalls, true);
    return {
        id,
        x: 0,
        y: 0,
        color,
        radius: BALL_RADIUS,
        pathProgress
    };
}
function createRandomBall(id, pathProgress = 0, chainBalls = [], forShooter = false) {
    const activeColors = getActiveBallColors();
    // Smart shooter generation when few balls remain
    if (forShooter && chainBalls.length > 0 && chainBalls.length <= 15) {
        // Collect unique ball types in chain (color + crypto/usdtFund combination)
        const ballTypes = [];
        const seenKeys = new Set();
        for (const ball of chainBalls){
            const key = ball.isUsdtFund ? `usdt-fund-${ball.color}` : ball.crypto ? `crypto-${ball.crypto}-${ball.color}` : `regular-${ball.color}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                ballTypes.push({
                    color: ball.color,
                    crypto: ball.crypto,
                    isUsdtFund: ball.isUsdtFund
                });
            }
        }
        if (ballTypes.length > 0) {
            // Weight by count of each type in chain (more balls = higher chance)
            const typeWeights = ballTypes.map((type)=>{
                const count = chainBalls.filter((b)=>{
                    if (type.isUsdtFund) return b.isUsdtFund && b.color === type.color;
                    if (type.crypto) return b.crypto === type.crypto && b.color === type.color;
                    return !b.crypto && !b.isUsdtFund && b.color === type.color;
                }).length;
                return {
                    type,
                    weight: count
                };
            });
            const totalWeight = typeWeights.reduce((sum, tw)=>sum + tw.weight, 0);
            let random = Math.random() * totalWeight;
            for (const { type, weight } of typeWeights){
                random -= weight;
                if (random <= 0) {
                    debugLog(`[SHOOTER-SMART] Balls:${chainBalls.length} Types:${ballTypes.length} -> ${type.isUsdtFund ? 'USDT-Fund' : type.crypto || type.color}`);
                    return {
                        id,
                        x: 0,
                        y: 0,
                        color: type.color,
                        crypto: type.crypto,
                        isUsdtFund: type.isUsdtFund,
                        radius: BALL_RADIUS,
                        pathProgress
                    };
                }
            }
            // Fallback to first type
            const fallback = ballTypes[0];
            return {
                id,
                x: 0,
                y: 0,
                color: fallback.color,
                crypto: fallback.crypto,
                isUsdtFund: fallback.isUsdtFund,
                radius: BALL_RADIUS,
                pathProgress
            };
        }
    }
    // forShooter=true: pick only from colors in chain (for shooter/next ball)
    // forShooter=false: balanced distribution from all active colors (for chain spawning)
    const color = chainBalls.length > 0 ? selectBalancedColor(chainBalls, forShooter) : activeColors[Math.floor(Math.random() * activeColors.length)];
    const spawnChance = currentEconomy.crypto.spawnChance;
    const limits = currentEconomy.perGameLimits;
    // Skip crypto spawning on completed levels - only regular balls
    if (isLevelCompleted) {
        return {
            id,
            x: 0,
            y: 0,
            color,
            radius: BALL_RADIUS,
            pathProgress
        };
    }
    const isUsdtFundBall = usdtFundEnabled && Math.random() < spawnChance;
    if (isUsdtFundBall) {
        debugLog(`[CRYPTO] Spawning USDT Fund ball: ${id}`);
        return {
            id,
            x: 0,
            y: 0,
            color,
            isUsdtFund: true,
            radius: BALL_RADIUS,
            pathProgress
        };
    }
    const availableTypes = CRYPTO_TYPES.filter((type)=>{
        if (!availableCrypto[type]) return false;
        const limit = limits[`${type}MaxBeadsPerGame`] || 15;
        return cryptoSpawnedThisGame[type] < limit;
    });
    const hasCryptoAvailable = availableTypes.length > 0;
    const cryptoRoll = Math.random();
    const isCrypto = hasCryptoAvailable && cryptoRoll < spawnChance;
    let crypto = undefined;
    if (isCrypto) {
        crypto = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        cryptoSpawnedThisGame[crypto]++;
        debugLog(`[CRYPTO] Spawned ${crypto} ball: ${id}, roll=${cryptoRoll.toFixed(3)}, chance=${spawnChance}, spawned=${JSON.stringify(cryptoSpawnedThisGame)}`);
    }
    return {
        id,
        x: 0,
        y: 0,
        color,
        crypto,
        radius: BALL_RADIUS,
        pathProgress
    };
}
function createInitialBalls(count) {
    const balls = [];
    const spacing = getBallSpacing();
    // Start balls at small positive offset to ensure smooth movement from start
    const startOffset = spacing * 0.5;
    for(let i = 0; i < count; i++){
        const ball = createRandomBall(`ball-${i}`, startOffset + i * spacing, balls);
        balls.push(ball);
    }
    return balls;
}
function createInitialGameState() {
    debugLog('=== GAME STARTED ===', 'initialBalls:', currentGameplay.balls.initialCount);
    debugLog(`[CRYPTO CONFIG] spawnChance=${currentEconomy.crypto.spawnChance}, availableCrypto=${JSON.stringify(availableCrypto)}, usdtFundEnabled=${usdtFundEnabled}`);
    cryptoSpawnedThisGame = {
        btc: 0,
        eth: 0,
        usdt: 0
    };
    resetBoostState();
    const balls = createInitialBalls(currentGameplay.balls.initialCount);
    return {
        balls,
        shooterBall: createRandomBall('shooter', 0, balls, true),
        nextBall: createRandomBall('next', 0, balls, true),
        score: 0,
        combo: 0,
        maxCombo: 0,
        timeLeft: 0,
        cryptoCollected: {
            btc: 0,
            eth: 0,
            usdt: 0
        },
        usdtFundCollected: 0,
        isPlaying: false,
        isGameOver: false,
        won: false,
        shotsTotal: 0,
        shotsHit: 0,
        lives: 3,
        extraLivesBought: 0,
        totalBallsSpawned: currentGameplay.balls.initialCount
    };
}
const SPAWN_ANIM_DURATION = 300; // ms for portal emergence animation
function updateBallPositions(balls, path) {
    const now = Date.now();
    return balls.map((ball)=>{
        let visualProgress = ball.pathProgress;
        // Apply spawn animation: interpolate from portal (0) to true position
        if (ball.spawnAnimStart) {
            const elapsed = now - ball.spawnAnimStart;
            if (elapsed < SPAWN_ANIM_DURATION) {
                // Ease-out cubic for smooth deceleration
                const t = elapsed / SPAWN_ANIM_DURATION;
                const eased = 1 - Math.pow(1 - t, 3);
                // Interpolate from position 0 (portal) to true pathProgress
                visualProgress = eased * ball.pathProgress;
            }
        }
        const position = getPositionOnPath(path, visualProgress);
        return {
            ...ball,
            x: position.x,
            y: position.y
        };
    });
}
function moveBallsForward(balls, deltaTime) {
    const speedMultiplier = getSpeedMultiplier();
    return balls.map((ball)=>{
        const dynamicSpeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculateDynamicSpeed"])(ball.pathProgress);
        const moveAmount = dynamicSpeed * deltaTime * 0.001 * speedMultiplier;
        return {
            ...ball,
            pathProgress: ball.pathProgress + moveAmount
        };
    });
}
let rollbackLogCounter = 0;
let rollbackActiveUntil = 0;
let rollbackHadGap = false; // Track if we've seen a real gap during this rollback
function activateRollback(_isEarlyGame = false) {
    rollbackActiveUntil = Date.now() + 800; // Shorter rollback window
    rollbackHadGap = false; // Reset gap tracking for new rollback session
}
function isRollbackActive() {
    return Date.now() < rollbackActiveUntil;
}
function processRollback(balls, deltaTime, _spawnFinished = false) {
    const now = Date.now();
    const rollbackActive = now < rollbackActiveUntil;
    if (!rollbackActive) {
        return balls;
    }
    // With fewer than 2 balls, no gaps possible - immediately deactivate
    if (balls.length < 2) {
        rollbackActiveUntil = 0;
        return balls;
    }
    const spacing = getBallSpacing();
    // Fast rollback speed - close gaps quickly like in classic Zuma
    const rollbackSpeed = 0.5;
    const maxCorrectionPerFrame = rollbackSpeed * deltaTime * 0.001;
    const newBalls = [
        ...balls
    ];
    let hasGap = false;
    let maxGapExcess = 0;
    // Find gaps in the chain where balls were removed
    // Front part (higher pathProgress) rolls backward to meet back part
    for(let i = 1; i < newBalls.length; i++){
        const prevBall = newBalls[i - 1];
        const currentBall = newBalls[i];
        const gap = currentBall.pathProgress - prevBall.pathProgress;
        const targetGap = spacing;
        // Detect any gap larger than normal spacing (10% threshold for responsiveness)
        if (gap > targetGap * 1.10) {
            const excess = gap - targetGap;
            maxGapExcess = Math.max(maxGapExcess, excess);
            hasGap = true;
            rollbackHadGap = true; // Mark that we've seen a gap during this session
            // Calculate correction - move quickly to close gap
            const correction = Math.min(excess * 0.6, maxCorrectionPerFrame);
            // Move this ball AND ALL balls behind it backward together
            // This keeps the chain cohesive while closing the gap
            for(let j = i; j < newBalls.length; j++){
                newBalls[j] = {
                    ...newBalls[j],
                    pathProgress: newBalls[j].pathProgress - correction
                };
            }
        }
    }
    // Immediately deactivate if no gaps found (edge matches or already closed)
    if (!hasGap) {
        rollbackActiveUntil = 0;
        rollbackHadGap = false;
    }
    // Log every 60 frames (~1 second at 60fps) if there are gaps
    rollbackLogCounter++;
    if (rollbackLogCounter >= 60 && maxGapExcess > 0) {
        rollbackLogCounter = 0;
        debugLog(`[ROLLBACK] maxExcess=${maxGapExcess.toFixed(4)}, spacing=${spacing.toFixed(4)}`);
    }
    return newBalls;
}
function ballsMatch(ball1, ball2) {
    // Rainbow balls match any non-crypto ball
    if (ball1.isRainbow && !ball2.crypto) {
        debugLog(`ballsMatch rainbow: ball1 is rainbow, matches ${ball2.color}`);
        return true;
    }
    if (ball2.isRainbow && !ball1.crypto) {
        debugLog(`ballsMatch rainbow: ball2 is rainbow, matches ${ball1.color}`);
        return true;
    }
    if (ball1.crypto && ball2.crypto) {
        const result = ball1.crypto === ball2.crypto;
        debugLog(`ballsMatch crypto: ${ball1.crypto} vs ${ball2.crypto} = ${result}`);
        return result;
    }
    if (!ball1.crypto && !ball2.crypto) {
        const result = ball1.color === ball2.color;
        debugLog(`ballsMatch color: ${ball1.color} vs ${ball2.color} = ${result}`);
        return result;
    }
    debugLog(`ballsMatch mixed: ball1.crypto=${ball1.crypto} ball2.crypto=${ball2.crypto} = false`);
    return false;
}
function findMatchingBalls(balls, insertIndex, insertedBall) {
    const opId = getNextOperationId();
    if (insertIndex < 0 || insertIndex >= balls.length) {
        debugLog(`[OP${opId}] findMatchingBalls: invalid index ${insertIndex}, balls.length=${balls.length}`);
        return [];
    }
    const matches = [
        insertIndex
    ];
    const targetBall = balls[insertIndex];
    debugLog(`[OP${opId}] findMatchingBalls START: insertIndex=${insertIndex}, targetBall.id=${targetBall.id}, color=${targetBall.color}, crypto=${targetBall.crypto}, isRainbow=${targetBall.isRainbow}`);
    const chainSnapshot = balls.slice(0, Math.min(15, balls.length)).map((b, i)=>`${i}:${b.color?.slice(0, 2)}[${b.id?.slice(-6)}]`).join(' ');
    debugLog(`[OP${opId}] Chain snapshot (first 15): ${chainSnapshot}`);
    // For rainbow balls, we need to find the color of adjacent balls to match against
    // Rainbow ball acts as a wildcard for the color of its neighbors
    let matchColor = targetBall.color;
    let matchCrypto = targetBall.crypto;
    if (targetBall.isRainbow) {
        // Find the color from the left or right neighbor
        const leftNeighbor = insertIndex > 0 ? balls[insertIndex - 1] : null;
        const rightNeighbor = insertIndex < balls.length - 1 ? balls[insertIndex + 1] : null;
        // Prefer non-crypto neighbor's color
        if (leftNeighbor && !leftNeighbor.crypto && !leftNeighbor.isRainbow) {
            matchColor = leftNeighbor.color;
            matchCrypto = undefined;
            debugLog(`  Rainbow using LEFT neighbor color: ${matchColor}`);
        } else if (rightNeighbor && !rightNeighbor.crypto && !rightNeighbor.isRainbow) {
            matchColor = rightNeighbor.color;
            matchCrypto = undefined;
            debugLog(`  Rainbow using RIGHT neighbor color: ${matchColor}`);
        } else {
            debugLog(`  Rainbow has no valid neighbor to match, no match possible`);
            return [];
        }
    }
    // Helper function for rainbow-aware matching
    const matchesTarget = (ball)=>{
        if (ball.isRainbow) return true; // Rainbow balls always match in a group
        if (matchCrypto) {
            return ball.crypto === matchCrypto;
        }
        return !ball.crypto && ball.color === matchColor;
    };
    let left = insertIndex - 1;
    while(left >= 0 && matchesTarget(balls[left])){
        debugLog(`  LEFT match at ${left}: id=${balls[left].id}, color=${balls[left].color}, crypto=${balls[left].crypto}`);
        matches.unshift(left);
        left--;
    }
    let right = insertIndex + 1;
    while(right < balls.length && matchesTarget(balls[right])){
        debugLog(`  RIGHT match at ${right}: id=${balls[right].id}, color=${balls[right].color}, crypto=${balls[right].crypto}`);
        matches.push(right);
        right++;
    }
    const result = matches.length >= 3 ? matches : [];
    const matchedIds = matches.map((i)=>balls[i]?.id?.slice(-8) || '?').join(',');
    debugLog(`[OP${opId}] findMatchingBalls END: found ${matches.length} matches, indices=[${matches.join(',')}], ids=[${matchedIds}], returning ${result.length >= 3 ? 'MATCH' : 'NO MATCH'}`);
    return result;
}
function calculatePoints(matchedBalls, combo) {
    let points = 0;
    const cryptoCollected = {
        btc: 0,
        eth: 0,
        usdt: 0
    };
    let usdtFundCollected = 0;
    const economy = currentEconomy;
    for (const ball of matchedBalls){
        if (ball.isUsdtFund) {
            // USDT fund balls: no points, only crypto reward
            usdtFundCollected++;
        } else if (ball.crypto) {
            // Crypto balls: no points, only crypto reward
            cryptoCollected[ball.crypto]++;
        } else {
            // Regular balls: give points (Beads)
            points += economy.points.normal;
        }
    }
    const comboMultiplier = Math.pow(economy.combo.multiplier, Math.min(combo, economy.combo.maxChain));
    points = Math.round(points * comboMultiplier);
    return {
        points,
        cryptoCollected,
        usdtFundCollected
    };
}
function insertBallInChain(balls, shooterBall, insertIndex) {
    debugLog(`insertBallInChain: shooterBall.color=${shooterBall.color}, crypto=${shooterBall.crypto}, insertIndex=${insertIndex}, chainLength=${balls.length}`);
    const newBalls = [
        ...balls
    ];
    const spacing = getBallSpacing();
    const insertProgress = insertIndex < balls.length ? balls[insertIndex].pathProgress : (balls[balls.length - 1]?.pathProgress || 0) + spacing;
    const insertedBall = {
        ...shooterBall,
        id: `ball-${Date.now()}`,
        pathProgress: insertProgress
    };
    debugLog(`  Created insertedBall: id=${insertedBall.id}, color=${insertedBall.color}, crypto=${insertedBall.crypto}`);
    for(let i = insertIndex; i < newBalls.length; i++){
        newBalls[i] = {
            ...newBalls[i],
            pathProgress: newBalls[i].pathProgress + spacing
        };
    }
    newBalls.splice(insertIndex, 0, insertedBall);
    debugLog(`  Chain after insert: [${newBalls.slice(Math.max(0, insertIndex - 2), insertIndex + 3).map((b)=>`${b.color}${b.crypto ? '(' + b.crypto + ')' : ''}`).join(', ')}]`);
    return newBalls;
}
function removeBalls(balls, indices) {
    const opId = getNextOperationId();
    const sortedIndices = [
        ...indices
    ].sort((a, b)=>b - a);
    const newBalls = [
        ...balls
    ];
    debugLog(`[OP${opId}] removeBalls: removing ${indices.length} balls at indices [${indices.join(',')}]`);
    const removedInfo = indices.map((i)=>{
        const b = balls[i];
        const shortId = b?.id?.slice(-8) || '?';
        return `idx${i}:${b?.color}${b?.crypto ? '(' + b.crypto + ')' : ''}[${shortId}]`;
    });
    debugLog(`[OP${opId}] Balls being removed: [${removedInfo.join(', ')}]`);
    for (const index of sortedIndices){
        newBalls.splice(index, 1);
    }
    debugLog(`[OP${opId}] Chain after removal: length=${newBalls.length}`);
    return newBalls;
}
function findAllMatches(balls) {
    if (balls.length < 3) return [];
    const allMatches = [];
    const processed = new Set();
    for(let i = 0; i < balls.length; i++){
        if (processed.has(i)) continue;
        const currentBall = balls[i];
        const group = [
            i
        ];
        let j = i + 1;
        while(j < balls.length && ballsMatch(balls[j], currentBall)){
            group.push(j);
            j++;
        }
        if (group.length >= 3) {
            group.forEach((idx)=>processed.add(idx));
            allMatches.push({
                indices: group,
                matchedBalls: group.map((idx)=>balls[idx])
            });
        }
    }
    return allMatches;
}
function checkCollision(projectileX, projectileY, balls, path) {
    const collisionDistance = BALL_RADIUS * COLLISION_RADIUS_MULTIPLIER;
    let closestIndex = -1;
    let closestDistance = Infinity;
    for(let i = 0; i < balls.length; i++){
        const ball = balls[i];
        if (ball.pathProgress < 0) continue;
        const dx = projectileX - ball.x;
        const dy = projectileY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < collisionDistance && distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
        }
    }
    if (closestIndex === -1) return null;
    const hitBall = balls[closestIndex];
    const projectileProgress = findClosestProgressOnPath(projectileX, projectileY, path);
    const insertBefore = projectileProgress < hitBall.pathProgress;
    return {
        index: closestIndex,
        insertBefore
    };
}
function checkPathCollision(projectileX, projectileY, prevX, prevY, balls, path) {
    const directHit = checkCollision(projectileX, projectileY, balls, path);
    if (directHit) return directHit;
    const dx = projectileX - prevX;
    const dy = projectileY - prevY;
    const stepDistance = Math.sqrt(dx * dx + dy * dy);
    if (stepDistance > BALL_RADIUS) {
        const steps = Math.ceil(stepDistance / (BALL_RADIUS * 0.5));
        for(let i = 1; i < steps; i++){
            const t = i / steps;
            const checkX = prevX + dx * t;
            const checkY = prevY + dy * t;
            const hit = checkCollision(checkX, checkY, balls, path);
            if (hit) return hit;
        }
    }
    return null;
}
function findClosestProgressOnPath(x, y, path) {
    let closestIndex = 0;
    let closestDistance = Infinity;
    for(let i = 0; i < path.length; i++){
        const dx = x - path[i].x;
        const dy = y - path[i].y;
        const dist = dx * dx + dy * dy;
        if (dist < closestDistance) {
            closestDistance = dist;
            closestIndex = i;
        }
    }
    return closestIndex / (path.length - 1);
}
function addNewBallsToChain(balls, count) {
    const newBalls = [
        ...balls
    ];
    const spacing = getBallSpacing();
    for(let i = 0; i < count; i++){
        const lastProgress = newBalls.length > 0 ? newBalls[newBalls.length - 1].pathProgress : 0;
        const newBall = createRandomBall(`new-${Date.now()}-${i}`, lastProgress + spacing, newBalls);
        newBalls.push(newBall);
    }
    return newBalls;
}
function spawnBallAtStart(balls) {
    const spacing = getBallSpacing();
    const newBall = createRandomBall(`spawn-${Date.now()}`, 0, balls);
    const shiftedBalls = balls.map((ball)=>({
            ...ball,
            pathProgress: ball.pathProgress + spacing
        }));
    return [
        newBall,
        ...shiftedBalls
    ];
}
function checkGameOver(balls) {
    return balls.some((ball)=>ball.pathProgress >= 1);
}
function checkWin(balls) {
    return balls.length === 0;
}
const BALL_COLOR_MAP = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    purple: '#a855f7',
    cyan: '#00e5ff',
    magenta: '#ff2bf2',
    amber: '#ffc400',
    lime: '#b6ff00',
    violet: '#8c3bff'
};
const CRYPTO_COLOR_MAP = {
    btc: '#f7931a',
    eth: '#627eea',
    usdt: '#26a17b'
};
const CRYPTO_SYMBOL_MAP = {
    btc: '₿',
    eth: 'Ξ',
    usdt: '₮'
};
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/telegram.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStartParam",
    ()=>getStartParam,
    "getTelegramUser",
    ()=>getTelegramUser,
    "getTelegramWebApp",
    ()=>getTelegramWebApp,
    "hapticFeedback",
    ()=>hapticFeedback,
    "initTelegramApp",
    ()=>initTelegramApp,
    "isTelegramWebApp",
    ()=>isTelegramWebApp,
    "openTelegramInvoice",
    ()=>openTelegramInvoice,
    "showTelegramAlert",
    ()=>showTelegramAlert
]);
function getTelegramWebApp() {
    if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.Telegram?.WebApp) {
        return window.Telegram.WebApp;
    }
    return null;
}
function getTelegramUser() {
    const webApp = getTelegramWebApp();
    if (webApp?.initDataUnsafe?.user) {
        return webApp.initDataUnsafe.user;
    }
    return null;
}
function initTelegramApp() {
    const webApp = getTelegramWebApp();
    if (webApp) {
        webApp.ready();
        webApp.expand();
    }
}
function hapticFeedback(type) {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
        if (type === 'selection') {
            webApp.HapticFeedback.selectionChanged();
        } else if ([
            'success',
            'error',
            'warning'
        ].includes(type)) {
            webApp.HapticFeedback.notificationOccurred(type);
        } else {
            webApp.HapticFeedback.impactOccurred(type);
        }
    }
}
function isTelegramWebApp() {
    return getTelegramWebApp() !== null;
}
function openTelegramInvoice(invoiceUrl, callback) {
    const webApp = getTelegramWebApp();
    if (webApp?.openInvoice) {
        webApp.openInvoice(invoiceUrl, callback);
        return true;
    }
    return false;
}
function showTelegramAlert(message, callback) {
    const webApp = getTelegramWebApp();
    if (webApp?.showAlert) {
        webApp.showAlert(message, callback);
        return true;
    }
    return false;
}
function getStartParam() {
    // First try Telegram's native start_param (works for direct Mini App links)
    const webApp = getTelegramWebApp();
    if (webApp?.initDataUnsafe?.start_param) {
        return webApp.initDataUnsafe.start_param;
    }
    // Fallback: check URL hash for referral code (works for web_app button)
    // Format: #ref=REFERRAL_CODE
    if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove #
        const params = new URLSearchParams(hash);
        const refCode = params.get('ref');
        if (refCode) {
            return refCode;
        }
    }
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/levelConfig.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LEVELS",
    ()=>LEVELS,
    "getDifficultyBgColor",
    ()=>getDifficultyBgColor,
    "getDifficultyColor",
    ()=>getDifficultyColor,
    "getDifficultyLabel",
    ()=>getDifficultyLabel,
    "getLevelById",
    ()=>getLevelById,
    "getUnlockedLevels",
    ()=>getUnlockedLevels,
    "isLevelUnlocked",
    ()=>isLevelUnlocked
]);
const LEVELS = [
    {
        id: 1,
        name: "Classic Spiral",
        nameRu: "Классическая спираль",
        description: "The original spiral path",
        descriptionRu: "Классический спиральный путь",
        path: {
            type: 'spiral',
            segments: 600,
            spiralTurns: 3.0,
            outerRadius: 0.42,
            innerRadius: 0.15
        },
        difficulty: 'easy',
        initialBalls: 5,
        targetBalls: 50,
        maxBalls: 60,
        speed: {
            base: 0.020,
            max: 0.030
        },
        colors: 5,
        unlockCondition: null
    },
    {
        id: 2,
        name: "Zigzag Path",
        nameRu: "Зигзаг",
        description: "Sharp turns challenge your aim",
        descriptionRu: "Резкие повороты бросают вызов вашей точности",
        path: {
            type: 'zigzag',
            segments: 500,
            amplitude: 0.35,
            frequency: 4
        },
        difficulty: 'easy',
        initialBalls: 5,
        targetBalls: 45,
        maxBalls: 55,
        speed: {
            base: 0.012,
            max: 0.018
        },
        colors: 5,
        unlockCondition: 1
    },
    {
        id: 3,
        name: "Gentle Wave",
        nameRu: "Плавная волна",
        description: "Smooth wave pattern",
        descriptionRu: "Плавный волнообразный путь",
        path: {
            type: 'wave',
            segments: 550,
            amplitude: 0.18,
            frequency: 3
        },
        difficulty: 'easy',
        initialBalls: 6,
        targetBalls: 50,
        maxBalls: 60,
        speed: {
            base: 0.013,
            max: 0.019
        },
        colors: 5,
        unlockCondition: 2
    },
    {
        id: 4,
        name: "S-Curve",
        nameRu: "S-образный",
        description: "Double curve path",
        descriptionRu: "Путь в форме буквы S",
        path: {
            type: 'sShape',
            segments: 500,
            amplitude: 0.30
        },
        difficulty: 'medium',
        initialBalls: 6,
        targetBalls: 55,
        maxBalls: 65,
        speed: {
            base: 0.014,
            max: 0.021
        },
        colors: 6,
        unlockCondition: 3
    },
    {
        id: 5,
        name: "Tight Spiral",
        nameRu: "Тугая спираль",
        description: "More turns, less space",
        descriptionRu: "Больше витков, меньше места",
        path: {
            type: 'spiral',
            segments: 700,
            spiralTurns: 4.5,
            outerRadius: 0.40,
            innerRadius: 0.12
        },
        difficulty: 'medium',
        initialBalls: 7,
        targetBalls: 60,
        maxBalls: 70,
        speed: {
            base: 0.014,
            max: 0.022
        },
        colors: 6,
        unlockCondition: 4,
        ballSpacing: 0.013,
        spawnPeriod: 1200
    },
    {
        id: 6,
        name: "Heart Path",
        nameRu: "Сердце",
        description: "Love-shaped challenge",
        descriptionRu: "Путь в форме сердца",
        path: {
            type: 'heart',
            segments: 600
        },
        difficulty: 'medium',
        initialBalls: 7,
        targetBalls: 55,
        maxBalls: 65,
        speed: {
            base: 0.013,
            max: 0.020
        },
        colors: 6,
        unlockCondition: 5
    },
    {
        id: 7,
        name: "Infinity Loop",
        nameRu: "Бесконечность",
        description: "Figure-eight path",
        descriptionRu: "Путь в форме восьмёрки",
        path: {
            type: 'infinity',
            segments: 650
        },
        difficulty: 'hard',
        initialBalls: 8,
        targetBalls: 65,
        maxBalls: 75,
        speed: {
            base: 0.015,
            max: 0.023
        },
        colors: 7,
        unlockCondition: 6
    },
    {
        id: 8,
        name: "Extreme Zigzag",
        nameRu: "Экстремальный зигзаг",
        description: "Fast and furious turns",
        descriptionRu: "Быстрые и яростные повороты",
        path: {
            type: 'zigzag',
            segments: 600,
            amplitude: 0.30,
            frequency: 8
        },
        difficulty: 'hard',
        initialBalls: 8,
        targetBalls: 70,
        maxBalls: 80,
        speed: {
            base: 0.016,
            max: 0.024
        },
        colors: 7,
        unlockCondition: 7
    },
    {
        id: 9,
        name: "Chaos Wave",
        nameRu: "Хаос волна",
        description: "Complex wave pattern",
        descriptionRu: "Сложный волновой паттерн",
        path: {
            type: 'wave',
            segments: 700,
            amplitude: 0.25,
            frequency: 5
        },
        difficulty: 'hard',
        initialBalls: 10,
        targetBalls: 75,
        maxBalls: 85,
        speed: {
            base: 0.017,
            max: 0.026
        },
        colors: 8,
        unlockCondition: 8
    },
    {
        id: 10,
        name: "Ultimate Spiral",
        nameRu: "Ультимативная спираль",
        description: "The final challenge",
        descriptionRu: "Финальное испытание",
        path: {
            type: 'spiral',
            segments: 800,
            spiralTurns: 5.5,
            outerRadius: 0.44,
            innerRadius: 0.10
        },
        difficulty: 'hard',
        initialBalls: 12,
        targetBalls: 80,
        maxBalls: 90,
        speed: {
            base: 0.015,
            max: 0.024
        },
        colors: 8,
        unlockCondition: 9
    }
];
function getLevelById(id) {
    return LEVELS.find((level)=>level.id === id);
}
function getUnlockedLevels(completedLevels) {
    return LEVELS.filter((level)=>{
        if (level.unlockCondition === null) return true;
        return completedLevels.includes(level.unlockCondition);
    });
}
function isLevelUnlocked(levelId, completedLevels) {
    const level = getLevelById(levelId);
    if (!level) return false;
    if (level.unlockCondition === null) return true;
    return completedLevels.includes(level.unlockCondition);
}
function getDifficultyColor(difficulty) {
    switch(difficulty){
        case 'easy':
            return 'text-green-500';
        case 'medium':
            return 'text-yellow-500';
        case 'hard':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }
}
function getDifficultyBgColor(difficulty) {
    switch(difficulty){
        case 'easy':
            return 'bg-green-500/20';
        case 'medium':
            return 'bg-yellow-500/20';
        case 'hard':
            return 'bg-red-500/20';
        default:
            return 'bg-gray-500/20';
    }
}
function getDifficultyLabel(difficulty) {
    switch(difficulty){
        case 'easy':
            return 'Лёгкий';
        case 'medium':
            return 'Средний';
        case 'hard':
            return 'Сложный';
        default:
            return difficulty;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/contexts/UserContext.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserProvider",
    ()=>UserProvider,
    "useUser",
    ()=>useUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
const UserContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    isLoading: true,
    error: null,
    refreshUser: async ()=>{}
});
function UserProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const initUser = async ()=>{
        try {
            setIsLoading(true);
            setError(null);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["isTelegramWebApp"])()) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["initTelegramApp"])();
            }
            // Проверяем, есть ли параметр forceAdmin в URL
            const urlParams = ("TURBOPACK compile-time truthy", 1) ? new URLSearchParams(window.location.search) : "TURBOPACK unreachable";
            const isAdminForced = urlParams.get('forceAdmin') === 'true' || urlParams.get('forceAdmin') === '1';
            // Если forceAdmin=true, сначала устанавливаем сессию на сервере
            if (("TURBOPACK compile-time value", "development") === 'development' && isAdminForced) {
                await fetch('/api/auth/me?forceAdmin=true', {
                    method: 'GET',
                    credentials: 'include'
                });
            }
            // First check if there's an existing session (e.g., admin login)
            try {
                const meResponse = await fetch('/api/auth/me', {
                    credentials: 'include'
                });
                if (meResponse.ok) {
                    const existingUser = await meResponse.json();
                    setUser(existingUser);
                    return;
                }
            } catch  {
            // No existing session, continue with normal auth
            }
            const telegramUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getTelegramUser"])();
            const startParam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getStartParam"])();
            if (telegramUser) {
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiRequest"])('POST', '/api/auth/telegram', {
                    telegramId: telegramUser.id.toString(),
                    username: telegramUser.username || `user_${telegramUser.id}`,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name,
                    photoUrl: telegramUser.photo_url,
                    startParam: startParam || undefined
                });
                const data = await response.json();
                setUser(data);
            } else {
                // Попробуем получить данные пользователя без Telegram, если сессия существует
                try {
                    const meResponse = await fetch('/api/auth/me', {
                        credentials: 'include'
                    });
                    if (meResponse.ok) {
                        const userData = await meResponse.json();
                        setUser(userData);
                    } else {
                        // Для локальной разработки создаем фейкового пользователя, если нет сессии
                        if ("TURBOPACK compile-time truthy", 1) {
                            const fakeUser = {
                                id: 'dev-user-12345',
                                telegramId: '123456789',
                                username: 'dev_tester',
                                firstName: 'Dev',
                                lastName: 'Tester',
                                photoUrl: null,
                                totalPoints: 5000,
                                gamesPlayed: 10,
                                bestScore: 1500,
                                btcBalance: 0.001,
                                ethBalance: 0.01,
                                usdtBalance: 10.5,
                                btcBalanceSats: 100000,
                                btcTodaySats: 0,
                                ethBalanceWei: 10000000000000000,
                                ethTodayWei: 0,
                                usdtToday: "0.00",
                                referralCode: 'DEVTEST',
                                referredBy: null,
                                directReferralsCount: 0,
                                completedLevels: [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ],
                                signupBonusReceived: true,
                                ratingScore: 1200,
                                totalScore: 5000,
                                totalWins: 5,
                                currentWinStreak: 2,
                                bestWinStreak: 5,
                                totalCombo5Plus: 10,
                                characterGender: 'male',
                                characterName: 'Dev Player',
                                characterEnergy: 100,
                                characterHealthState: 'normal',
                                characterMood: 'happy',
                                bonusLives: 0,
                                btcTodayDate: new Date().toISOString().split('T')[0],
                                ethTodayDate: new Date().toISOString().split('T')[0],
                                usdtTodayDate: new Date().toISOString().split('T')[0],
                                lastActivityAt: new Date(),
                                createdAt: new Date(),
                                deletedAt: null,
                                isAdmin: isAdminForced // Устанавливаем isAdmin в true, если forceAdmin=true
                            };
                            setUser(fakeUser);
                        } else //TURBOPACK unreachable
                        ;
                    }
                } catch (err) {
                    console.error('Error fetching user without Telegram:', err);
                    // Для локальной разработки создаем фейкового пользователя при ошибке
                    if ("TURBOPACK compile-time truthy", 1) {
                        const fakeUser = {
                            id: 'dev-user-12345',
                            telegramId: '123456789',
                            username: 'dev_tester',
                            firstName: 'Dev',
                            lastName: 'Tester',
                            photoUrl: null,
                            totalPoints: 5000,
                            gamesPlayed: 10,
                            bestScore: 1500,
                            btcBalance: 0.001,
                            ethBalance: 0.01,
                            usdtBalance: 10.5,
                            btcBalanceSats: 100000,
                            btcTodaySats: 0,
                            ethBalanceWei: 10000000000000000,
                            ethTodayWei: 0,
                            usdtToday: "0.00",
                            referralCode: 'DEVTEST',
                            referredBy: null,
                            directReferralsCount: 0,
                            completedLevels: [
                                1,
                                2,
                                3,
                                4,
                                5
                            ],
                            signupBonusReceived: true,
                            btcTodayDate: new Date().toISOString().split('T')[0],
                            ethTodayDate: new Date().toISOString().split('T')[0],
                            usdtTodayDate: new Date().toISOString().split('T')[0],
                            lastActivityAt: new Date(),
                            createdAt: new Date(),
                            ratingScore: 1200,
                            totalScore: 5000,
                            totalWins: 5,
                            currentWinStreak: 2,
                            bestWinStreak: 5,
                            totalCombo5Plus: 10,
                            characterGender: 'male',
                            characterName: 'Dev Player',
                            characterEnergy: 100,
                            characterHealthState: 'normal',
                            characterMood: 'happy',
                            bonusLives: 0,
                            deletedAt: null,
                            isAdmin: isAdminForced // Устанавливаем isAdmin в true, если forceAdmin=true
                        };
                        setUser(fakeUser);
                    } else //TURBOPACK unreachable
                    ;
                }
            }
        } catch (err) {
            console.error('Failed to initialize user:', err);
            setError('Failed to initialize user');
        } finally{
            setIsLoading(false);
        }
    };
    const refreshUser = async ()=>{
        try {
            // Проверяем, есть ли параметр forceAdmin в URL
            const urlParams = ("TURBOPACK compile-time truthy", 1) ? new URLSearchParams(window.location.search) : "TURBOPACK unreachable";
            const isAdminForced = urlParams.get('forceAdmin') === 'true' || urlParams.get('forceAdmin') === '1';
            // Если forceAdmin=true и мы в режиме разработки, сначала устанавливаем сессию на сервере
            if (("TURBOPACK compile-time value", "development") === 'development' && isAdminForced) {
                await fetch('/api/auth/me?forceAdmin=true', {
                    method: 'GET',
                    credentials: 'include'
                });
            }
            // Use /api/auth/me endpoint which checks session and returns current user data including admin status
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                // Если /api/auth.me возвращает 401, это может означать, что сессия была сброшена
                // В этом случае не пытаемся получить данные по старому user.id
                // Вместо этого, если в режиме разработки и есть forceAdmin, создаем фейкового администратора
                if (("TURBOPACK compile-time value", "development") === 'development' && isAdminForced) {
                    const fakeUser = {
                        id: 'dev-user-12345',
                        telegramId: '123456789',
                        username: 'dev_tester',
                        firstName: 'Dev',
                        lastName: 'Tester',
                        photoUrl: null,
                        totalPoints: 5000,
                        gamesPlayed: 10,
                        bestScore: 1500,
                        btcBalance: 0.001,
                        ethBalance: 0.01,
                        usdtBalance: 10.5,
                        btcBalanceSats: 100000,
                        btcTodaySats: 0,
                        ethBalanceWei: 10000000000000000,
                        ethTodayWei: 0,
                        usdtToday: "0.00",
                        referralCode: 'DEVTEST',
                        referredBy: null,
                        directReferralsCount: 0,
                        completedLevels: [
                            1,
                            2,
                            3,
                            4,
                            5
                        ],
                        signupBonusReceived: true,
                        ratingScore: 1200,
                        totalScore: 5000,
                        totalWins: 5,
                        currentWinStreak: 2,
                        bestWinStreak: 5,
                        totalCombo5Plus: 10,
                        characterGender: 'male',
                        characterName: 'Dev Player',
                        characterEnergy: 100,
                        characterHealthState: 'normal',
                        characterMood: 'happy',
                        bonusLives: 0,
                        btcTodayDate: new Date().toISOString().split('T')[0],
                        ethTodayDate: new Date().toISOString().split('T')[0],
                        usdtTodayDate: new Date().toISOString().split('T')[0],
                        lastActivityAt: new Date(),
                        createdAt: new Date(),
                        deletedAt: null,
                        isAdmin: true // Устанавливаем isAdmin в true, если forceAdmin=true
                    };
                    setUser(fakeUser);
                }
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserProvider.useEffect": ()=>{
            initUser();
        }
    }["UserProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserContext.Provider, {
        value: {
            user,
            isLoading,
            error,
            refreshUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/UserContext.tsx",
        lineNumber: 277,
        columnNumber: 5
    }, this);
}
_s(UserProvider, "caAZa649wyY9nHJT6au393y4yCs=");
_c = UserProvider;
function useUser() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(UserContext);
}
_s1(useUser, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "UserProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/CharacterCreation.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CharacterCreation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-user-round.js [client] (ecmascript) <export default as UserCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-toast.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
function CharacterCreation({ onComplete }) {
    _s();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('gender');
    const [selectedGender, setSelectedGender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useToast"])();
    const createCharacterMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "CharacterCreation.useMutation[createCharacterMutation]": async ({ name, gender })=>{
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiRequest"])('POST', '/api/character', {
                    name,
                    gender
                });
                return response.json();
            }
        }["CharacterCreation.useMutation[createCharacterMutation]"],
        onSuccess: {
            "CharacterCreation.useMutation[createCharacterMutation]": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                    queryKey: [
                        '/api/character'
                    ]
                });
                toast({
                    title: 'Персонаж создан!',
                    description: `Добро пожаловать, ${name}!`
                });
                onComplete();
            }
        }["CharacterCreation.useMutation[createCharacterMutation]"],
        onError: {
            "CharacterCreation.useMutation[createCharacterMutation]": ()=>{
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось создать персонажа',
                    variant: 'destructive'
                });
            }
        }["CharacterCreation.useMutation[createCharacterMutation]"]
    });
    const handleGenderSelect = (gender)=>{
        setSelectedGender(gender);
        setStep('name');
    };
    const handleSubmit = ()=>{
        if (!selectedGender || !name.trim()) return;
        createCharacterMutation.mutate({
            name: name.trim(),
            gender: selectedGender
        });
    };
    const handleBack = ()=>{
        setStep('gender');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    y: 20
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                className: "text-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center gap-2 mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                className: "w-6 h-6 text-primary"
                            }, void 0, false, {
                                fileName: "[project]/pages/CharacterCreation.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold",
                                children: "Создание персонажа"
                            }, void 0, false, {
                                fileName: "[project]/pages/CharacterCreation.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                className: "w-6 h-6 text-primary"
                            }, void 0, false, {
                                fileName: "[project]/pages/CharacterCreation.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/CharacterCreation.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground",
                        children: step === 'gender' ? 'Выберите своего персонажа' : 'Как вас зовут?'
                    }, void 0, false, {
                        fileName: "[project]/pages/CharacterCreation.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/CharacterCreation.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                children: [
                    step === 'gender' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            x: -20
                        },
                        animate: {
                            opacity: 1,
                            x: 0
                        },
                        exit: {
                            opacity: 0,
                            x: 20
                        },
                        className: "flex flex-col sm:flex-row gap-4 w-full max-w-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: `flex-1 cursor-pointer transition-all hover-elevate ${selectedGender === 'male' ? 'ring-2 ring-primary' : ''}`,
                                onClick: ()=>handleGenderSelect('male'),
                                "data-testid": "button-gender-male",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "flex flex-col items-center justify-center p-8 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                className: "w-12 h-12 text-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 93,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/CharacterCreation.tsx",
                                            lineNumber: 92,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg font-medium",
                                            children: "Он"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/CharacterCreation.tsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/CharacterCreation.tsx",
                                    lineNumber: 91,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/CharacterCreation.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: `flex-1 cursor-pointer transition-all hover-elevate ${selectedGender === 'female' ? 'ring-2 ring-primary' : ''}`,
                                onClick: ()=>handleGenderSelect('female'),
                                "data-testid": "button-gender-female",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "flex flex-col items-center justify-center p-8 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-24 h-24 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__["UserCircle2"], {
                                                className: "w-12 h-12 text-pink-500"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 108,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/CharacterCreation.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg font-medium",
                                            children: "Она"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/CharacterCreation.tsx",
                                            lineNumber: 110,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/CharacterCreation.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/CharacterCreation.tsx",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this)
                        ]
                    }, "gender", true, {
                        fileName: "[project]/pages/CharacterCreation.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    step === 'name' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            x: 20
                        },
                        animate: {
                            opacity: 1,
                            x: 0
                        },
                        exit: {
                            opacity: 0,
                            x: -20
                        },
                        className: "w-full max-w-md",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Card"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "p-6 space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-20 h-20 rounded-full flex items-center justify-center ${selectedGender === 'male' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`,
                                            children: selectedGender === 'male' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                className: "w-10 h-10 text-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 133,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__["UserCircle2"], {
                                                className: "w-10 h-10 text-pink-500"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 135,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/CharacterCreation.tsx",
                                            lineNumber: 127,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/CharacterCreation.tsx",
                                        lineNumber: 126,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "character-name",
                                                className: "text-sm font-medium",
                                                children: "Имя персонажа"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 141,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "character-name",
                                                value: name,
                                                onChange: (e)=>setName(e.target.value),
                                                placeholder: "Введите имя...",
                                                maxLength: 20,
                                                className: "text-center text-lg",
                                                "data-testid": "input-character-name",
                                                onKeyDown: (e)=>{
                                                    if (e.key === 'Enter' && name.trim()) {
                                                        handleSubmit();
                                                    }
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 144,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground text-center",
                                                children: [
                                                    name.length,
                                                    "/20 символов"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 158,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/CharacterCreation.tsx",
                                        lineNumber: 140,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                onClick: handleBack,
                                                className: "flex-1",
                                                "data-testid": "button-back",
                                                children: "Назад"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 164,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: handleSubmit,
                                                disabled: !name.trim() || createCharacterMutation.isPending,
                                                className: "flex-1",
                                                "data-testid": "button-create-character",
                                                children: createCharacterMutation.isPending ? 'Создание...' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        "Создать",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                            className: "w-4 h-4 ml-1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/CharacterCreation.tsx",
                                                            lineNumber: 183,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/CharacterCreation.tsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/CharacterCreation.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/CharacterCreation.tsx",
                                lineNumber: 125,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/pages/CharacterCreation.tsx",
                            lineNumber: 124,
                            columnNumber: 13
                        }, this)
                    }, "name", false, {
                        fileName: "[project]/pages/CharacterCreation.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/CharacterCreation.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/CharacterCreation.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(CharacterCreation, "qUEk95zaHORdYE9Hc6T8ruX2dVg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = CharacterCreation;
var _c;
__turbopack_context__.k.register(_c, "CharacterCreation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/index.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainMenu$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MainMenu.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameScreen$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GameScreen.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Leaderboard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Leaderboard.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LevelSelect$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LevelSelect.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BoostShop$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/BoostShop.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AccessoryShop$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AccessoryShop.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CharacterCustomize$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CharacterCustomize.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CommunityInviteDialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CommunityInviteDialog.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BeadsBox$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/BeadsBox.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$CharacterCreation$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/pages/CharacterCreation.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$UserContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/UserContext.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/skeleton.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$levelConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/levelConfig.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-toast.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const [currentScreen, setCurrentScreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('menu');
    const [selectedLevel, setSelectedLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$levelConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["LEVELS"][0]);
    const [showCommunityInvite, setShowCommunityInvite] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showBeadsBox, setShowBeadsBox] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leaderboardFilter, setLeaderboardFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [useCryptoTicket, setUseCryptoTicket] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { user, isLoading: isUserLoading, refreshUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$UserContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useUser"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useToast"])();
    // Fetch crypto tickets
    const { data: cryptoTicketsData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            '/api/user/crypto-tickets/count'
        ],
        enabled: !!user
    });
    const { data: characterExists, isLoading: isCharacterLoading, refetch: refetchCharacter } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            '/api/character/exists'
        ],
        enabled: !!user
    });
    const { data: leaderboard = [], isLoading: isLeaderboardLoading, isFetching: isLeaderboardFetching } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            '/api/leaderboard',
            leaderboardFilter
        ],
        queryFn: {
            "Home.useQuery": async ()=>{
                if (leaderboardFilter === 'friends') {
                    const response = await fetch('/api/leaderboard/friends', {
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Failed to fetch friends leaderboard');
                    return response.json();
                }
                const response = await fetch(`/api/leaderboard?period=${leaderboardFilter}`, {
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                return response.json();
            }
        }["Home.useQuery"],
        enabled: currentScreen === 'leaderboard'
    });
    const submitScoreMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "Home.useMutation[submitScoreMutation]": async ({ gameState, levelId })=>{
                if (!user) return;
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiRequest"])('POST', '/api/scores', {
                    score: gameState.score,
                    cryptoBtc: gameState.cryptoCollected.btc,
                    cryptoEth: gameState.cryptoCollected.eth,
                    cryptoUsdt: gameState.cryptoCollected.usdt,
                    maxCombo: gameState.maxCombo,
                    accuracy: gameState.shotsTotal > 0 ? Math.round(gameState.shotsHit / gameState.shotsTotal * 100) : 0,
                    duration: 45 - gameState.timeLeft,
                    won: gameState.won,
                    levelId
                });
                return response.json();
            }
        }["Home.useMutation[submitScoreMutation]"],
        onSuccess: {
            "Home.useMutation[submitScoreMutation]": (data)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                    queryKey: [
                        '/api/leaderboard'
                    ]
                });
                refreshUser();
                // Show community invite after first game for Telegram users
                if (data?.gamesPlayed === 1) {
                    setTimeout({
                        "Home.useMutation[submitScoreMutation]": ()=>setShowCommunityInvite(true)
                    }["Home.useMutation[submitScoreMutation]"], 2000);
                }
            }
        }["Home.useMutation[submitScoreMutation]"]
    });
    const handleGameEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleGameEnd]": (gameState)=>{
            submitScoreMutation.mutate({
                gameState,
                levelId: selectedLevel.id
            });
        }
    }["Home.useCallback[handleGameEnd]"], [
        submitScoreMutation,
        selectedLevel.id
    ]);
    const handlePlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handlePlay]": ()=>{
            setCurrentScreen('levelSelect');
        }
    }["Home.useCallback[handlePlay]"], []);
    const handleSelectLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleSelectLevel]": async (level, withCryptoTicket)=>{
            if (withCryptoTicket) {
                // Consume crypto ticket before starting game
                try {
                    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["apiRequest"])('POST', '/api/user/crypto-tickets/use', {
                        levelId: level.id
                    });
                    if (!response.ok) {
                        const data = await response.json();
                        console.error('Failed to use crypto ticket:', data.error);
                        toast({
                            title: "Крипто-билет недоступен",
                            description: "Игра начнётся без крипто-режима",
                            variant: "destructive"
                        });
                        // Don't use ticket if consumption failed
                        setSelectedLevel(level);
                        setUseCryptoTicket(false);
                        setCurrentScreen('game');
                        return;
                    }
                    // Ticket consumed successfully
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["queryClient"].invalidateQueries({
                        queryKey: [
                            '/api/user/crypto-tickets/count'
                        ]
                    });
                    setSelectedLevel(level);
                    setUseCryptoTicket(true);
                    setCurrentScreen('game');
                } catch (error) {
                    console.error('Error using crypto ticket:', error);
                    toast({
                        title: "Ошибка активации билета",
                        description: "Игра начнётся без крипто-режима",
                        variant: "destructive"
                    });
                    // Proceed without ticket on error
                    setSelectedLevel(level);
                    setUseCryptoTicket(false);
                    setCurrentScreen('game');
                }
            } else {
                setSelectedLevel(level);
                setUseCryptoTicket(false);
                setCurrentScreen('game');
            }
        }
    }["Home.useCallback[handleSelectLevel]"], [
        toast
    ]);
    const handleViewLeaderboard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleViewLeaderboard]": ()=>{
            setCurrentScreen('leaderboard');
        }
    }["Home.useCallback[handleViewLeaderboard]"], []);
    const handleMainMenu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleMainMenu]": ()=>{
            setCurrentScreen('menu');
        }
    }["Home.useCallback[handleMainMenu]"], []);
    const handleShop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleShop]": ()=>{
            setCurrentScreen('shop');
        }
    }["Home.useCallback[handleShop]"], []);
    const handleAccessoryShop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleAccessoryShop]": ()=>{
            setCurrentScreen('accessoryShop');
        }
    }["Home.useCallback[handleAccessoryShop]"], []);
    const handleCustomize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleCustomize]": ()=>{
            setCurrentScreen('customize');
        }
    }["Home.useCallback[handleCustomize]"], []);
    const handleBeadsBox = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleBeadsBox]": ()=>{
            setShowBeadsBox(true);
        }
    }["Home.useCallback[handleBeadsBox]"], []);
    const handleCharacterCreated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleCharacterCreated]": ()=>{
            refetchCharacter();
        }
    }["Home.useCallback[handleCharacterCreated]"], [
        refetchCharacter
    ]);
    if (isUserLoading || isCharacterLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingScreen, {}, void 0, false, {
            fileName: "[project]/pages/index.tsx",
            lineNumber: 170,
            columnNumber: 12
        }, this);
    }
    if (user && characterExists && !characterExists.exists) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$CharacterCreation$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
            onComplete: handleCharacterCreated
        }, void 0, false, {
            fileName: "[project]/pages/index.tsx",
            lineNumber: 174,
            columnNumber: 12
        }, this);
    }
    const renderScreen = ()=>{
        switch(currentScreen){
            case 'levelSelect':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LevelSelect$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["LevelSelect"], {
                    completedLevels: user?.completedLevels ?? [],
                    onSelectLevel: handleSelectLevel,
                    onBack: handleMainMenu,
                    cryptoTickets: cryptoTicketsData?.count ?? 0
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 181,
                    columnNumber: 11
                }, this);
            case 'game':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameScreen$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["GameScreen"], {
                    level: selectedLevel,
                    isLevelCompleted: (user?.completedLevels ?? []).includes(selectedLevel.id),
                    onGameEnd: handleGameEnd,
                    onViewLeaderboard: handleViewLeaderboard,
                    onMainMenu: handleMainMenu,
                    useCryptoTicket: useCryptoTicket
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 191,
                    columnNumber: 11
                }, this);
            case 'leaderboard':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Leaderboard$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Leaderboard"], {
                    entries: leaderboard,
                    currentUserId: user?.id,
                    isLoading: isLeaderboardLoading,
                    isFetching: isLeaderboardFetching,
                    onBack: handleMainMenu,
                    filter: leaderboardFilter,
                    onFilterChange: setLeaderboardFilter
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 203,
                    columnNumber: 11
                }, this);
            case 'shop':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BoostShop$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["BoostShop"], {
                    onBack: handleMainMenu
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 216,
                    columnNumber: 11
                }, this);
            case 'accessoryShop':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AccessoryShop$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["AccessoryShop"], {
                    onBack: handleMainMenu
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 221,
                    columnNumber: 11
                }, this);
            case 'customize':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CharacterCustomize$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CharacterCustomize"], {
                    onBack: handleMainMenu
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 226,
                    columnNumber: 11
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainMenu$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["MainMenu"], {
                    user: user,
                    onPlay: handlePlay,
                    onLeaderboard: handleViewLeaderboard,
                    onShop: handleShop,
                    onAccessoryShop: handleAccessoryShop,
                    onCustomize: handleCustomize,
                    onBeadsBox: handleBeadsBox,
                    isLoading: submitScoreMutation.isPending
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 231,
                    columnNumber: 11
                }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            renderScreen(),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CommunityInviteDialog$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CommunityInviteDialog"], {
                open: showCommunityInvite,
                onOpenChange: setShowCommunityInvite
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            showBeadsBox && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BeadsBox$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["BeadsBox"], {
                onClose: ()=>setShowBeadsBox(false)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 253,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(Home, "kNWU62bckbExROCM42LucVyoQc8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$UserContext$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = Home;
function LoadingScreen() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col items-center justify-center p-4 bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-16 h-16 mb-6 rounded-full bg-primary/20 animate-pulse flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-10 h-10 rounded-full bg-primary/40 animate-pulse"
                }, void 0, false, {
                    fileName: "[project]/pages/index.tsx",
                    lineNumber: 263,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                className: "h-8 w-48 mb-2"
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                className: "h-4 w-32"
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 266,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/index.tsx",
        lineNumber: 261,
        columnNumber: 5
    }, this);
}
_c1 = LoadingScreen;
var _c, _c1;
__turbopack_context__.k.register(_c, "Home");
__turbopack_context__.k.register(_c1, "LoadingScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_03f8898b._.js.map