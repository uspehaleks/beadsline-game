module.exports = [
"[project]/lib/queryClient.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

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
var __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__ = __turbopack_context__.i("[externals]/@tanstack/react-query [external] (@tanstack/react-query, esm_import, [project]/node_modules/@tanstack/react-query)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const APP_VERSION = "1.2.3";
// Check and clear cache if version changed - только в браузере
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
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
const queryClient = new __TURBOPACK__imported__module__$5b$externals$5d2f40$tanstack$2f$react$2d$query__$5b$external$5d$__$2840$tanstack$2f$react$2d$query$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$29$__["QueryClient"]({
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/utils.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$clsx$29$__ = __turbopack_context__.i("[externals]/clsx [external] (clsx, esm_import, [project]/node_modules/clsx)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$29$__ = __turbopack_context__.i("[externals]/tailwind-merge [external] (tailwind-merge, esm_import, [project]/node_modules/tailwind-merge)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$clsx$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$clsx$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$tailwind$2d$merge__$5b$external$5d$__$28$tailwind$2d$merge$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$clsx__$5b$external$5d$__$28$clsx$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$clsx$29$__["clsx"])(inputs));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/telegram.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
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
    if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.Telegram?.WebApp) //TURBOPACK unreachable
    ;
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return null;
}
}),
"[project]/lib/sounds.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/gameConfig.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/gameEngine.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gameConfig.ts [ssr] (ecmascript)");
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
const BALL_RADIUS = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.radius;
const SHOOTER_BALL_SPEED = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.shooterSpeed;
const COLLISION_RADIUS_MULTIPLIER = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.collisionRadius;
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
    return currentLevelConfig?.ballSpacing ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
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
        return generateSpiralPath(width, height, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].path);
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
        const dynamicSpeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculateDynamicSpeed"])(ball.pathProgress);
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
}),
"[project]/lib/levelConfig.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/hooks/use-toast.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    const [state, setState] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"](()=>{
        listeners.push(setState);
        return ()=>{
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
;
}),
"[project]/hooks/useGameState.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGameState",
    ()=>useGameState
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gameEngine.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gameConfig.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/sounds.ts [ssr] (ecmascript)");
;
;
;
;
;
const CHAIN_REACTION_DELAY = 150;
// Debug log buffer - accumulates logs and sends them in batches
const debugLogBuffer = [];
let debugLogTimeout = null;
function sendDebugLog(message) {
    const timestamp = new Date().toISOString().slice(11, 23);
    debugLogBuffer.push(`[${timestamp}] ${message}`);
    // Debounce sending - wait 500ms after last log before sending batch
    if (debugLogTimeout) clearTimeout(debugLogTimeout);
    debugLogTimeout = setTimeout(()=>{
        if (debugLogBuffer.length > 0) {
            const logsToSend = [
                ...debugLogBuffer
            ];
            debugLogBuffer.length = 0;
            fetch('/api/debug-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: logsToSend
                })
            }).catch(()=>{}); // Ignore errors
        }
    }, 500);
}
function useGameState({ canvasWidth, canvasHeight, onGameEnd, level, bonusLives = 0, onUseBonusLife }) {
    const [gameState, setGameState] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createInitialGameState"]);
    const [path, setPath] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [projectile, setProjectile] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [shooterAngle, setShooterAngle] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(-Math.PI / 2);
    const [elapsedTime, setElapsedTime] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [usedBonusLives, setUsedBonusLives] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [isPaused, setIsPaused] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const isPausedRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    const stepFrameRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    const gameLoopRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const timeTrackerRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const lastTimeRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const pathRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])([]);
    const onGameEndRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(onGameEnd);
    const gameEndedRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    const dimensionsRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])({
        width: canvasWidth,
        height: canvasHeight
    });
    const gameStartTimeRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const spawnAccumRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const totalSpawnedRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const spawnFinishedRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(false);
    const gapContextRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const maxTotalBallsRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(100);
    const currentLifeMaxRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(100); // Лимит шаров на текущую жизнь
    const pendingChainReactionRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const bonusLivesRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(bonusLives);
    const usedBonusLivesRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const onUseBonusLifeRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(onUseBonusLife);
    const shooterBallRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(gameState.shooterBall);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        shooterBallRef.current = gameState.shooterBall;
    }, [
        gameState.shooterBall
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        bonusLivesRef.current = bonusLives;
    }, [
        bonusLives
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        onUseBonusLifeRef.current = onUseBonusLife;
    }, [
        onUseBonusLife
    ]);
    const chainReactionTimeoutRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    onGameEndRef.current = onGameEnd;
    pathRef.current = path;
    dimensionsRef.current = {
        width: canvasWidth,
        height: canvasHeight
    };
    const shooterPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getShooterPosition"])(canvasWidth, canvasHeight);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (canvasWidth > 0 && canvasHeight > 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setCurrentLevel"])(level);
            const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["generatePathForLevel"])(canvasWidth, canvasHeight, level);
            setPath(newPath);
            pathRef.current = newPath;
        }
    }, [
        canvasWidth,
        canvasHeight,
        level
    ]);
    const stopAllTimers = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        if (gameLoopRef.current !== null) {
            cancelAnimationFrame(gameLoopRef.current);
            gameLoopRef.current = null;
        }
        if (timeTrackerRef.current !== null) {
            clearInterval(timeTrackerRef.current);
            timeTrackerRef.current = null;
        }
        if (chainReactionTimeoutRef.current !== null) {
            clearTimeout(chainReactionTimeoutRef.current);
            chainReactionTimeoutRef.current = null;
        }
        pendingChainReactionRef.current = null;
    }, []);
    const startGame = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async ()=>{
        if (timeTrackerRef.current !== null) {
            console.warn('Game already running, ignoring startGame call');
            return;
        }
        try {
            const [economyRes, gameplayRes, cryptoAvailRes] = await Promise.all([
                fetch('/api/game-economy'),
                fetch('/api/gameplay-config'),
                fetch('/api/crypto-availability', {
                    credentials: 'include'
                })
            ]);
            // Default to crypto disabled for safety
            let cryptoAvailable = {
                btc: false,
                eth: false,
                usdt: false
            };
            if (economyRes.ok) {
                const economyData = await economyRes.json();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setEconomyConfig"])(economyData);
                // Get crypto availability from economy config (respects cryptoFundEnabled toggle)
                cryptoAvailable = economyData.cryptoAvailable || {
                    btc: false,
                    eth: false,
                    usdt: false
                };
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setUsdtFundEnabled"])(economyData.usdtFundEnabled === true);
            }
            if (cryptoAvailRes.ok) {
                const cryptoAvail = await cryptoAvailRes.json();
                // Only override if crypto-availability returns explicit values
                // This endpoint also respects cryptoFundEnabled, so use AND logic
                cryptoAvailable = {
                    btc: cryptoAvailable.btc && cryptoAvail.btcEnabled === true,
                    eth: cryptoAvailable.eth && cryptoAvail.ethEnabled === true,
                    usdt: cryptoAvailable.usdt && cryptoAvail.usdtEnabled === true
                };
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setAvailableCrypto"])(cryptoAvailable);
            if (gameplayRes.ok) {
                const gameplayData = await gameplayRes.json();
                // Override with level-specific spawn period if available
                if (level?.spawnPeriod) {
                    gameplayData.spawn = {
                        ...gameplayData.spawn,
                        period: level.spawnPeriod
                    };
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setGameplayConfig"])(gameplayData);
                maxTotalBallsRef.current = gameplayData.balls?.maxTotalBalls || 100;
                currentLifeMaxRef.current = maxTotalBallsRef.current; // Изначально = максимум
            }
        } catch (error) {
            console.error('Failed to fetch game config:', error);
            // Default to crypto disabled for safety when API fails
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setAvailableCrypto"])({
                btc: false,
                eth: false,
                usdt: false
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setUsdtFundEnabled"])(false);
        }
        stopAllTimers();
        gameEndedRef.current = false;
        gameStartTimeRef.current = Date.now();
        setElapsedTime(0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["resetCryptoSpawnedCount"])();
        const dims = dimensionsRef.current;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["setCurrentLevel"])(level);
        const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["generatePathForLevel"])(dims.width, dims.height, level);
        setPath(newPath);
        pathRef.current = newPath;
        const initialState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createInitialGameState"])();
        const ballsWithPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(initialState.balls, newPath);
        setGameState({
            ...initialState,
            balls: ballsWithPositions,
            isPlaying: true,
            timeLeft: 0
        });
        setProjectile(null);
        setShooterAngle(-Math.PI / 2);
        lastTimeRef.current = 0;
        spawnAccumRef.current = 0;
        totalSpawnedRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getGameplayConfig"])().balls.initialCount;
        spawnFinishedRef.current = false;
        gapContextRef.current = null;
        // Track frame count for debug logging
        let frameCount = 0;
        const runLoop = (timestamp)=>{
            if (gameEndedRef.current) return;
            if (isPausedRef.current && !stepFrameRef.current) {
                lastTimeRef.current = timestamp; // Keep time up to date to avoid jump
                gameLoopRef.current = requestAnimationFrame(runLoop);
                return;
            }
            if (stepFrameRef.current) {
                stepFrameRef.current = false; // Consume step signal
            }
            frameCount++;
            const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
            lastTimeRef.current = timestamp;
            const currentPath = pathRef.current;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBoostTimers"])();
            if (pendingChainReactionRef.current) {
                gameLoopRef.current = requestAnimationFrame(runLoop);
                return;
            }
            // Log gap context state every 60 frames (roughly once per second)
            if (gapContextRef.current && Math.random() < 0.02) {
                sendDebugLog(`[LOOP] gap exists: L:${gapContextRef.current.leftBallId?.slice(-6)} R:${gapContextRef.current.rightBallId?.slice(-6)}`);
            }
            setGameState((prev)=>{
                if (!prev.isPlaying || gameEndedRef.current) return prev;
                // During rollback, pause forward movement to let chain close gaps properly
                let newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isRollbackActive"])() ? prev.balls : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["moveBallsForward"])(prev.balls, deltaTime);
                newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["processRollback"])(newBalls, deltaTime, spawnFinishedRef.current);
                let updatedState = prev;
                const gap = gapContextRef.current;
                // Debug: log gap status every check
                if (gap) {
                    const leftIdx = gap.leftBallId ? newBalls.findIndex((b)=>b.id === gap.leftBallId) : -1;
                    const rightIdx = gap.rightBallId ? newBalls.findIndex((b)=>b.id === gap.rightBallId) : -1;
                    const isAdj = rightIdx === leftIdx + 1;
                    // Only log when adjacent or first time
                    if (isAdj) {
                        sendDebugLog(`[GAP-FOUND] L:${leftIdx} R:${rightIdx} adj:${isAdj} len:${newBalls.length}`);
                    }
                }
                if (gap && newBalls.length >= 3) {
                    const leftIdx = gap.leftBallId ? newBalls.findIndex((b)=>b.id === gap.leftBallId) : -1;
                    const rightIdx = gap.rightBallId ? newBalls.findIndex((b)=>b.id === gap.rightBallId) : -1;
                    // Log every frame when gap context exists (only log when adjacent to reduce spam)
                    if (rightIdx === leftIdx + 1 || leftIdx < 0 || rightIdx < 0) {
                        sendDebugLog(`[GAP] leftIdx:${leftIdx} rightIdx:${rightIdx} adj:${rightIdx === leftIdx + 1} left:${gap.leftBallId?.slice(-6)} right:${gap.rightBallId?.slice(-6)}`);
                    }
                    let foundMatch = false;
                    let matchesToProcess = null;
                    if (leftIdx >= 0 && rightIdx >= 0 && rightIdx === leftIdx + 1) {
                        const leftBall = newBalls[leftIdx];
                        const rightBall = newBalls[rightIdx];
                        // Check if balls match: crypto balls match by crypto type, regular balls by color
                        const ballsDoMatch = leftBall.crypto && rightBall.crypto ? leftBall.crypto === rightBall.crypto : !leftBall.crypto && !rightBall.crypto && leftBall.color === rightBall.color;
                        sendDebugLog(`[CHECK] L:${leftBall.id.slice(-6)} ${leftBall.color}/${leftBall.crypto || 'reg'} R:${rightBall.id.slice(-6)} ${rightBall.color}/${rightBall.crypto || 'reg'} match:${ballsDoMatch}`);
                        if (ballsDoMatch) {
                            // Boundary balls match - check for 3+ chain that includes both
                            const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, leftBall);
                            sendDebugLog(`[MATCH] found:${matches.length} both:${matches.includes(leftIdx) && matches.includes(rightIdx)}`);
                            if (matches.length >= 3 && matches.includes(leftIdx) && matches.includes(rightIdx)) {
                                foundMatch = true;
                                matchesToProcess = matches;
                            }
                        } else {
                            // Boundary balls DON'T match - check each side independently for 3+ chains
                            // Check LEFT side: leftBall and its left neighbors
                            const leftMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, leftBall);
                            sendDebugLog(`[LEFT] matches:${leftMatches.length} hasLeft:${leftMatches.includes(leftIdx)}`);
                            if (leftMatches.length >= 3 && leftMatches.includes(leftIdx)) {
                                foundMatch = true;
                                matchesToProcess = leftMatches;
                            }
                            // Check RIGHT side: rightBall and its right neighbors (only if left didn't match)
                            if (!foundMatch) {
                                const rightMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, rightIdx, rightBall);
                                sendDebugLog(`[RIGHT] matches:${rightMatches.length} hasRight:${rightMatches.includes(rightIdx)}`);
                                if (rightMatches.length >= 3 && rightMatches.includes(rightIdx)) {
                                    foundMatch = true;
                                    matchesToProcess = rightMatches;
                                }
                            }
                        }
                    } else if (leftIdx >= 0 && rightIdx < 0) {
                        sendDebugLog(`[EDGE] Only left exists, checking`);
                        const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, newBalls[leftIdx]);
                        if (matches.length >= 3 && matches.includes(leftIdx)) {
                            foundMatch = true;
                            matchesToProcess = matches;
                        }
                    } else if (rightIdx >= 0 && leftIdx < 0) {
                        sendDebugLog(`[EDGE] Only right exists, checking`);
                        const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, rightIdx, newBalls[rightIdx]);
                        if (matches.length >= 3 && matches.includes(rightIdx)) {
                            foundMatch = true;
                            matchesToProcess = matches;
                        }
                    } else if (leftIdx < 0 || rightIdx < 0) {
                        sendDebugLog(`[CLEAR] Ball not found! left:${leftIdx} right:${rightIdx}`);
                        gapContextRef.current = null;
                    }
                    if (foundMatch && matchesToProcess) {
                        const matchedBalls = matchesToProcess.map((i)=>newBalls[i]);
                        const matchedBallIds = matchedBalls.map((b)=>b.id);
                        sendDebugLog(`[CHAIN] Triggering chain reaction! Removing ${matchesToProcess.length} balls`);
                        const minIdx = matchesToProcess[0];
                        const maxIdx = matchesToProcess[matchesToProcess.length - 1];
                        const newLeftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
                        const newRightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
                        pendingChainReactionRef.current = {
                            matchedBallIds,
                            newLeftBallId: newLeftBall?.id || null,
                            newRightBallId: newRightBall?.id || null,
                            combo: prev.combo
                        };
                        chainReactionTimeoutRef.current = setTimeout(()=>{
                            setGameState((currentState)=>{
                                if (!currentState.isPlaying || gameEndedRef.current) {
                                    pendingChainReactionRef.current = null;
                                    return currentState;
                                }
                                const pending = pendingChainReactionRef.current;
                                if (!pending) return currentState;
                                const ballIndicesToRemove = pending.matchedBallIds.map((id)=>currentState.balls.findIndex((b)=>b.id === id)).filter((idx)=>idx >= 0).sort((a, b)=>a - b);
                                pendingChainReactionRef.current = null;
                                if (ballIndicesToRemove.length < 3) {
                                    gapContextRef.current = null;
                                    return currentState;
                                }
                                const matchedBalls = ballIndicesToRemove.map((i)=>currentState.balls[i]);
                                const chainCombo = pending.combo;
                                const newCombo = chainCombo + 1;
                                const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculatePoints"])(matchedBalls, chainCombo);
                                const processedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["removeBalls"])(currentState.balls, ballIndicesToRemove);
                                // Only arm portal retreat if very early in game (< 10 balls spawned)
                                const isEarlyGame = totalSpawnedRef.current < 10;
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["activateRollback"])(isEarlyGame);
                                if (pending.newLeftBallId || pending.newRightBallId) {
                                    gapContextRef.current = {
                                        leftBallId: pending.newLeftBallId,
                                        rightBallId: pending.newRightBallId
                                    };
                                } else {
                                    gapContextRef.current = null;
                                }
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                                const hasCrypto = matchedBalls.some((b)=>b.crypto || b.isUsdtFund);
                                if (hasCrypto) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                                } else {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playMatchSound"])(newCombo);
                                }
                                if (newCombo > 1) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playComboSound"])(newCombo);
                                }
                                const ballsWithPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(processedBalls, pathRef.current);
                                return {
                                    ...currentState,
                                    balls: ballsWithPositions,
                                    score: currentState.score + points,
                                    combo: newCombo,
                                    maxCombo: Math.max(currentState.maxCombo, newCombo),
                                    cryptoCollected: {
                                        btc: currentState.cryptoCollected.btc + cryptoCollected.btc,
                                        eth: currentState.cryptoCollected.eth + cryptoCollected.eth,
                                        usdt: currentState.cryptoCollected.usdt + cryptoCollected.usdt
                                    },
                                    usdtFundCollected: currentState.usdtFundCollected + usdtFundCollected
                                };
                            });
                        }, CHAIN_REACTION_DELAY);
                        newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, currentPath);
                        return {
                            ...prev,
                            balls: newBalls
                        };
                    }
                    if (!foundMatch) {
                        gapContextRef.current = null;
                    }
                }
                const gameplayConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getGameplayConfig"])();
                const { period } = gameplayConfig.spawn;
                const buffer = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].spawn.buffer;
                const { targetCount } = gameplayConfig.balls;
                spawnAccumRef.current += deltaTime;
                // Используем currentLifeMaxRef - лимит на текущую жизнь
                const canSpawn = !spawnFinishedRef.current && newBalls.length < targetCount && totalSpawnedRef.current < currentLifeMaxRef.current;
                if (spawnAccumRef.current >= period && canSpawn) {
                    const spacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getBallSpacing"])();
                    // Find tail ball (lowest progress)
                    const tailBall = newBalls.length > 0 ? newBalls.reduce((min, b)=>b.pathProgress < min.pathProgress ? b : min, newBalls[0]) : null;
                    const tailProgress = tailBall?.pathProgress ?? spacing;
                    // Spawn at correct logical position (adjacent to tail) for chain cohesion
                    const spawnPosition = Math.max(0, tailProgress - spacing);
                    sendDebugLog(`[SPAWN] accum=${spawnAccumRef.current.toFixed(0)}ms, balls=${newBalls.length}, tailProg=${tailProgress.toFixed(4)}, spawnPos=${spawnPosition.toFixed(4)}`);
                    spawnAccumRef.current = 0;
                    // Create ball at correct position with spawn animation for visual portal emergence
                    const rawBall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createRandomBall"])(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, spawnPosition, newBalls);
                    const newBall = {
                        ...rawBall,
                        spawnAnimStart: Date.now()
                    };
                    sendDebugLog(`[SPAWN] Created ball at pos=${spawnPosition.toFixed(4)} with portal anim, id=${newBall.id.slice(0, 10)}, color=${newBall.color}`);
                    newBalls = [
                        newBall,
                        ...newBalls
                    ];
                    totalSpawnedRef.current++;
                    if (totalSpawnedRef.current >= currentLifeMaxRef.current) {
                        spawnFinishedRef.current = true;
                    }
                }
                newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, currentPath);
                // Победа: все шары уничтожены И спавн завершён
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["checkWin"])(newBalls) && spawnFinishedRef.current) {
                    gameEndedRef.current = true;
                    stopAllTimers();
                    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
                    const finalState = {
                        ...updatedState,
                        balls: newBalls,
                        isPlaying: false,
                        isGameOver: true,
                        won: true,
                        timeLeft: duration
                    };
                    setTimeout(()=>{
                        onGameEndRef.current?.(finalState);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playWinSound"])();
                    }, 0);
                    return finalState;
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["checkGameOver"])(newBalls)) {
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["consumeShield"])()) {
                        const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                        const beforeCount = newBalls.length;
                        // FIX: Лимит шаров на следующую жизнь = сколько было на экране
                        currentLifeMaxRef.current = beforeCount;
                        sendDebugLog(`[ЩИТ] Сработал. Было ${beforeCount} шаров. Новый лимит: ${currentLifeMaxRef.current}`);
                        let respawnedBalls = [
                            ...newBalls
                        ];
                        respawnedBalls.sort((a, b)=>b.pathProgress - a.pathProgress);
                        // FIX: keepCount = половина от того, что БЫЛО на экране
                        let keepCount = Math.ceil(beforeCount / 2);
                        keepCount = Math.min(keepCount, beforeCount);
                        respawnedBalls = respawnedBalls.slice(0, keepCount);
                        const n = respawnedBalls.length;
                        if (n > 0) {
                            const headPos = 0.5; // Голова на 50%
                            for(let i = 0; i < n; i++){
                                const newProgress = Math.max(0, headPos - i * spacing);
                                respawnedBalls[i] = {
                                    ...respawnedBalls[i],
                                    pathProgress: newProgress,
                                    spawnAnimStart: undefined // Без анимации - сразу на позицию
                                };
                            }
                        }
                        respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
                        respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                        gapContextRef.current = null;
                        spawnFinishedRef.current = false;
                        // currentLifeMaxRef уже установлен
                        totalSpawnedRef.current = respawnedBalls.length;
                        sendDebugLog(`[ЩИТ] После: осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                        return {
                            ...updatedState,
                            balls: respawnedBalls,
                            combo: 0
                        };
                    }
                    const beforeLossCount = newBalls.length;
                    const maxProgressBefore = newBalls.length > 0 ? Math.max(...newBalls.map((b)=>b.pathProgress)) : 0;
                    const newLives = updatedState.lives - 1;
                    sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount} шаров, голова на ${(maxProgressBefore * 100).toFixed(0)}%, осталось жизней: ${newLives}.`);
                    if (newLives <= 0) {
                        // Проверяем есть ли бонусные жизни из BEADS BOX
                        const availableBonusLives = bonusLivesRef.current - usedBonusLivesRef.current;
                        if (availableBonusLives > 0) {
                            // Используем бонусную жизнь
                            usedBonusLivesRef.current += 1;
                            setUsedBonusLives((prev)=>prev + 1);
                            // Вызываем callback для списания бонусной жизни с сервера
                            setTimeout(()=>{
                                onUseBonusLifeRef.current?.();
                            }, 0);
                            // Сбрасываем шарики в начало (как при обычной потере жизни)
                            const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                            let respawnedBalls = [
                                ...newBalls
                            ];
                            respawnedBalls.sort((a, b)=>b.pathProgress - a.pathProgress);
                            let keepCount = Math.ceil(beforeLossCount / 2);
                            keepCount = Math.min(keepCount, beforeLossCount);
                            respawnedBalls = respawnedBalls.slice(0, keepCount);
                            const n = respawnedBalls.length;
                            if (n > 0) {
                                const headPos = 0.5; // Голова на 50%
                                for(let i = 0; i < n; i++){
                                    const newProgress = Math.max(0, headPos - i * spacing);
                                    respawnedBalls[i] = {
                                        ...respawnedBalls[i],
                                        pathProgress: newProgress,
                                        spawnAnimStart: undefined // Без анимации - сразу на позицию
                                    };
                                }
                            }
                            respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
                            respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                            gapContextRef.current = null;
                            spawnFinishedRef.current = false;
                            currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                            totalSpawnedRef.current = respawnedBalls.length;
                            sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeLossCount}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
                            return {
                                ...updatedState,
                                balls: respawnedBalls,
                                lives: 1,
                                combo: 0
                            };
                        }
                        // Нет бонусных жизней - конец игры
                        gameEndedRef.current = true;
                        stopAllTimers();
                        const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
                        const finalState = {
                            ...updatedState,
                            balls: newBalls,
                            lives: 0,
                            isPlaying: false,
                            isGameOver: true,
                            won: false,
                            timeLeft: duration
                        };
                        setTimeout(()=>{
                            onGameEndRef.current?.(finalState);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('error');
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playGameOverSound"])();
                        }, 0);
                        return finalState;
                    }
                    const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                    let respawnedBalls = [
                        ...newBalls
                    ];
                    respawnedBalls.sort((a, b)=>b.pathProgress - a.pathProgress);
                    let keepCount = Math.ceil(beforeLossCount / 2);
                    keepCount = Math.min(keepCount, beforeLossCount);
                    respawnedBalls = respawnedBalls.slice(0, keepCount);
                    const n = respawnedBalls.length;
                    if (n > 0) {
                        const headPos = 0.5; // Голова на 50%
                        for(let i = 0; i < n; i++){
                            const newProgress = Math.max(0, headPos - i * spacing);
                            respawnedBalls[i] = {
                                ...respawnedBalls[i],
                                pathProgress: newProgress,
                                spawnAnimStart: undefined // Без анимации - сразу на позицию
                            };
                        }
                    }
                    respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
                    respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                    gapContextRef.current = null;
                    spawnFinishedRef.current = false;
                    currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                    totalSpawnedRef.current = respawnedBalls.length;
                    sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] Было ${beforeLossCount} шаров, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
                    return {
                        ...updatedState,
                        balls: respawnedBalls,
                        lives: newLives,
                        combo: 0
                    };
                }
                return {
                    ...updatedState,
                    balls: newBalls
                };
            });
            setProjectile((prev)=>{
                if (!prev || gameEndedRef.current) return prev;
                const dims = dimensionsRef.current;
                const newX = prev.x + prev.vx;
                const newY = prev.y + prev.vy;
                if (newX < 0 || newX > dims.width || newY < 0 || newY > dims.height) {
                    return null;
                }
                return {
                    ...prev,
                    prevX: prev.x,
                    prevY: prev.y,
                    x: newX,
                    y: newY
                };
            });
            gameLoopRef.current = requestAnimationFrame(runLoop);
        };
        gameLoopRef.current = requestAnimationFrame(runLoop);
        timeTrackerRef.current = setInterval(()=>{
            if (gameEndedRef.current) return;
            setElapsedTime(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
        }, 1000);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
    }, [
        stopAllTimers
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        return ()=>{
            stopAllTimers();
        };
    }, [
        stopAllTimers
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!projectile || gameEndedRef.current) return;
        setGameState((prev)=>{
            if (!prev.isPlaying || gameEndedRef.current) return prev;
            const collision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["checkPathCollision"])(projectile.x, projectile.y, projectile.prevX, projectile.prevY, prev.balls, pathRef.current);
            if (collision) {
                const insertIndex = collision.insertBefore ? collision.index : collision.index + 1;
                // Check if laser boost is active - pierces through balls without inserting
                const laserResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["consumeLaser"])();
                if (laserResult.active) {
                    const hitIndices = [];
                    for(let i = 0; i < Math.min(laserResult.pierceCount, prev.balls.length); i++){
                        const idx = collision.index + i;
                        if (idx >= 0 && idx < prev.balls.length) {
                            hitIndices.push(idx);
                        }
                    }
                    if (hitIndices.length > 0) {
                        const { newBalls: laserBalls, removedBalls } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["applyLaserEffect"])(prev.balls, hitIndices);
                        const updatedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(laserBalls, pathRef.current);
                        const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculatePoints"])(removedBalls, 0);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('heavy');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playComboSound"])(removedBalls.length);
                        const hasCrypto = removedBalls.some((b)=>b.crypto || b.isUsdtFund);
                        if (hasCrypto) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                        } else {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playMatchSound"])();
                        }
                        gapContextRef.current = null;
                        setProjectile(null);
                        return {
                            ...prev,
                            balls: updatedBalls,
                            score: prev.score + points,
                            combo: removedBalls.length,
                            maxCombo: Math.max(prev.maxCombo, removedBalls.length),
                            cryptoCollected: {
                                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt
                            },
                            usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
                            shooterBall: prev.nextBall,
                            nextBall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createRandomBall"])('next-' + Date.now(), 0, prev.balls, true)
                        };
                    }
                }
                let newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["insertBallInChain"])(prev.balls, projectile.ball, insertIndex);
                newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, pathRef.current);
                // Check if magnet boost is active - attracts same color balls closer
                const magnetResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["consumeMagnet"])();
                if (magnetResult.active) {
                    newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["applyMagnetEffect"])(newBalls, insertIndex, magnetResult.radius);
                    newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, pathRef.current);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                }
                // Check if bomb boost is active
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["consumeBomb"])()) {
                    const { newBalls: bombedBalls, removedBalls } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["applyBombEffect"])(newBalls, insertIndex, 5);
                    newBalls = bombedBalls;
                    if (removedBalls.length > 0) {
                        const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculatePoints"])(removedBalls, 0);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('heavy');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playComboSound"])(2);
                        const hasCrypto = removedBalls.some((b)=>b.crypto || b.isUsdtFund);
                        if (hasCrypto) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                        } else {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playMatchSound"])();
                        }
                        gapContextRef.current = null;
                        setProjectile(null);
                        return {
                            ...prev,
                            balls: newBalls,
                            score: prev.score + points,
                            combo: 2,
                            maxCombo: Math.max(prev.maxCombo, 2),
                            cryptoCollected: {
                                btc: prev.cryptoCollected.btc + cryptoCollected.btc,
                                eth: prev.cryptoCollected.eth + cryptoCollected.eth,
                                usdt: prev.cryptoCollected.usdt + cryptoCollected.usdt
                            },
                            usdtFundCollected: prev.usdtFundCollected + usdtFundCollected,
                            shooterBall: prev.nextBall,
                            nextBall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createRandomBall"])('next-' + Date.now(), 0, newBalls, true)
                        };
                    }
                }
                const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, insertIndex, projectile.ball);
                if (matches.length >= 3) {
                    const matchedBalls = matches.map((i)=>newBalls[i]);
                    const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculatePoints"])(matchedBalls, 0);
                    const minIdx = matches[0];
                    const maxIdx = matches[matches.length - 1];
                    const leftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
                    const rightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
                    newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["removeBalls"])(newBalls, matches);
                    // Only arm portal retreat if very early in game (< 10 balls spawned)
                    const isEarlyGame = totalSpawnedRef.current < 10;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["activateRollback"])(isEarlyGame);
                    let totalPoints = points;
                    let totalCryptoCollected = {
                        ...cryptoCollected
                    };
                    let totalUsdtFundCollected = usdtFundCollected;
                    let currentCombo = 1;
                    let currentLeftBall = leftBall;
                    let currentRightBall = rightBall;
                    // Check for immediate chain reaction (balls are already adjacent after removal)
                    while(currentLeftBall && currentRightBall && newBalls.length >= 3){
                        const leftIdx = newBalls.findIndex((b)=>b.id === currentLeftBall.id);
                        const rightIdx = newBalls.findIndex((b)=>b.id === currentRightBall.id);
                        if (leftIdx < 0 || rightIdx < 0 || rightIdx !== leftIdx + 1) {
                            sendDebugLog(`[CHAIN-BREAK] L:${leftIdx} R:${rightIdx} adj:${rightIdx === leftIdx + 1}`);
                            break;
                        }
                        // Check if boundary balls match
                        const leftB = newBalls[leftIdx];
                        const rightB = newBalls[rightIdx];
                        const ballsDoMatch = leftB.crypto && rightB.crypto ? leftB.crypto === rightB.crypto : !leftB.crypto && !rightB.crypto && leftB.color === rightB.color;
                        if (!ballsDoMatch) {
                            sendDebugLog(`[CHAIN-NOMATCH] L:${leftB.color}/${leftB.crypto || 'reg'} R:${rightB.color}/${rightB.crypto || 'reg'}`);
                            break;
                        }
                        // Find matching balls starting from left
                        const chainMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, leftB);
                        if (chainMatches.length < 3 || !chainMatches.includes(leftIdx) || !chainMatches.includes(rightIdx)) {
                            sendDebugLog(`[CHAIN-SHORT] found:${chainMatches.length} hasLeft:${chainMatches.includes(leftIdx)} hasRight:${chainMatches.includes(rightIdx)}`);
                            break;
                        }
                        // Chain reaction found!
                        currentCombo++;
                        sendDebugLog(`[CHAIN-REACT] combo:${currentCombo} removing:${chainMatches.length} balls`);
                        const chainMatchedBalls = chainMatches.map((i)=>newBalls[i]);
                        const chainResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["calculatePoints"])(chainMatchedBalls, currentCombo - 1);
                        totalPoints += chainResult.points;
                        totalCryptoCollected.btc += chainResult.cryptoCollected.btc;
                        totalCryptoCollected.eth += chainResult.cryptoCollected.eth;
                        totalCryptoCollected.usdt += chainResult.cryptoCollected.usdt;
                        totalUsdtFundCollected += chainResult.usdtFundCollected;
                        // Get new boundary balls before removal
                        const newMinIdx = chainMatches[0];
                        const newMaxIdx = chainMatches[chainMatches.length - 1];
                        currentLeftBall = newMinIdx > 0 ? newBalls[newMinIdx - 1] : null;
                        currentRightBall = newMaxIdx < newBalls.length - 1 ? newBalls[newMaxIdx + 1] : null;
                        newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["removeBalls"])(newBalls, chainMatches);
                        // Keep same early game state for chain reactions
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["activateRollback"])(isEarlyGame);
                        // Play combo sound
                        const hasChainCrypto = chainMatchedBalls.some((b)=>b.crypto || b.isUsdtFund);
                        if (hasChainCrypto) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                        }
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playComboSound"])(currentCombo);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('heavy');
                    }
                    // Clear gap context since we processed chain reactions synchronously
                    gapContextRef.current = null;
                    sendDebugLog(`[CHAIN-END] combo:${currentCombo} points:${totalPoints}`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                    const hasCrypto = matchedBalls.some((b)=>b.crypto || b.isUsdtFund);
                    if (hasCrypto) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                    } else {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playMatchSound"])(currentCombo);
                    }
                    const newScore = prev.score + totalPoints;
                    setProjectile(null);
                    // Победа: все шары уничтожены И спавн завершён
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["checkWin"])(newBalls) && spawnFinishedRef.current) {
                        gameEndedRef.current = true;
                        stopAllTimers();
                        const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
                        const finalState = {
                            ...prev,
                            balls: newBalls,
                            score: newScore,
                            combo: currentCombo,
                            maxCombo: Math.max(prev.maxCombo, currentCombo),
                            cryptoCollected: {
                                btc: prev.cryptoCollected.btc + totalCryptoCollected.btc,
                                eth: prev.cryptoCollected.eth + totalCryptoCollected.eth,
                                usdt: prev.cryptoCollected.usdt + totalCryptoCollected.usdt
                            },
                            usdtFundCollected: prev.usdtFundCollected + totalUsdtFundCollected,
                            shotsHit: prev.shotsHit + 1,
                            isPlaying: false,
                            isGameOver: true,
                            won: true,
                            timeLeft: duration
                        };
                        setTimeout(()=>{
                            onGameEndRef.current?.(finalState);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
                        }, 100);
                        return finalState;
                    }
                    return {
                        ...prev,
                        balls: newBalls,
                        score: newScore,
                        combo: currentCombo,
                        maxCombo: Math.max(prev.maxCombo, currentCombo),
                        cryptoCollected: {
                            btc: prev.cryptoCollected.btc + totalCryptoCollected.btc,
                            eth: prev.cryptoCollected.eth + totalCryptoCollected.eth,
                            usdt: prev.cryptoCollected.usdt + totalCryptoCollected.usdt
                        },
                        usdtFundCollected: prev.usdtFundCollected + totalUsdtFundCollected,
                        shotsHit: prev.shotsHit + 1
                    };
                } else {
                    setProjectile(null);
                    if (gapContextRef.current) {
                        sendDebugLog(`[RESET] Gap context cleared by non-matching shot!`);
                    }
                    gapContextRef.current = null;
                    return {
                        ...prev,
                        balls: newBalls,
                        combo: 0,
                        shotsHit: prev.shotsHit + 1
                    };
                }
            }
            return prev;
        });
    }, [
        projectile,
        stopAllTimers
    ]);
    const shoot = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((targetX, targetY)=>{
        // Use ref to get current shooterBall to avoid stale closure issues
        const currentShooterBall = shooterBallRef.current;
        if (!gameState.isPlaying || projectile || !currentShooterBall) return;
        const dx = targetX - shooterPosition.x;
        const dy = targetY - shooterPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;
        const vx = dx / distance * __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["SHOOTER_BALL_SPEED"];
        const vy = dy / distance * __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["SHOOTER_BALL_SPEED"];
        // Apply rainbow boost to the shooting ball if active
        let ballToShoot = currentShooterBall;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["consumeRainbow"])()) {
            ballToShoot = {
                ...ballToShoot,
                isRainbow: true
            };
        }
        setProjectile({
            x: shooterPosition.x,
            y: shooterPosition.y,
            prevX: shooterPosition.x,
            prevY: shooterPosition.y,
            vx,
            vy,
            ball: ballToShoot
        });
        setGameState((prev)=>({
                ...prev,
                shooterBall: prev.nextBall,
                nextBall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createRandomBall"])('next-' + Date.now(), 0, prev.balls, true),
                shotsTotal: prev.shotsTotal + 1
            }));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('light');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playShootSound"])();
    }, [
        gameState.isPlaying,
        projectile,
        shooterPosition
    ]);
    const updateAim = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((targetX, targetY)=>{
        if (!gameState.isPlaying) return;
        const dx = targetX - shooterPosition.x;
        const dy = targetY - shooterPosition.y;
        const angle = Math.atan2(dy, dx);
        setShooterAngle(angle);
    }, [
        gameState.isPlaying,
        shooterPosition
    ]);
    // resumeGame принимает опцию incrementLives для addExtraLife
    const resumeGame = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((options)=>{
        const shouldIncrementLives = options?.incrementLives ?? false;
        stopAllTimers();
        gameEndedRef.current = false;
        lastTimeRef.current = 0;
        spawnAccumRef.current = 0;
        setGameState((prev)=>{
            let currentPath = pathRef.current;
            if (currentPath.length === 0) {
                console.warn("Path not initialized in resumeGame, regenerating...");
                currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["generatePathForLevel"])(dimensionsRef.current.width, dimensionsRef.current.height, level);
                pathRef.current = currentPath;
                setPath(currentPath);
            }
            const beforeCount = prev.balls.length;
            if (prev.balls.length === 0) {
                spawnFinishedRef.current = true;
                totalSpawnedRef.current = 0;
                currentLifeMaxRef.current = 0;
                const logType = shouldIncrementLives ? 'ПОКУПКА ЖИЗНИ' : 'ПРОДОЛЖИТЬ ИГРУ';
                sendDebugLog(`[${logType}] Цепочка: 0 → 0 шаров, спавн завершён.`);
                return {
                    ...prev,
                    lives: shouldIncrementLives ? prev.lives + 1 : 1,
                    isPlaying: true,
                    isGameOver: false,
                    won: false,
                    extraLivesBought: prev.extraLivesBought + 1
                };
            }
            // FIX: Логика, аналогичная потере жизни
            const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
            let respawnedBalls = [
                ...prev.balls
            ].sort((a, b)=>b.pathProgress - a.pathProgress);
            currentLifeMaxRef.current = beforeCount; // Лимит = сколько было
            let keepCount = Math.ceil(beforeCount / 2);
            keepCount = Math.min(keepCount, beforeCount);
            respawnedBalls = respawnedBalls.slice(0, keepCount);
            const n = respawnedBalls.length;
            if (n > 0) {
                const headPos = 0.5; // Голова на 50%
                for(let i = 0; i < n; i++){
                    const newProgress = Math.max(0, headPos - i * spacing);
                    respawnedBalls[i] = {
                        ...respawnedBalls[i],
                        pathProgress: newProgress,
                        spawnAnimStart: undefined
                    };
                }
            }
            respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
            respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
            gapContextRef.current = null;
            spawnFinishedRef.current = false;
            totalSpawnedRef.current = respawnedBalls.length;
            const logType = shouldIncrementLives ? 'ПОКУПКА ЖИЗНИ' : 'ПРОДОЛЖИТЬ ИГРУ';
            sendDebugLog(`[${logType}] Было ${beforeCount}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
            return {
                ...prev,
                balls: respawnedBalls,
                lives: shouldIncrementLives ? prev.lives + 1 : 1,
                isPlaying: true,
                isGameOver: false,
                won: false,
                extraLivesBought: prev.extraLivesBought + 1
            };
        });
        const currentPath = pathRef.current;
        const runLoop = (timestamp)=>{
            if (gameEndedRef.current) return;
            const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
            lastTimeRef.current = timestamp;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBoostTimers"])();
            setGameState((prev)=>{
                if (!prev.isPlaying || gameEndedRef.current) return prev;
                let newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isRollbackActive"])() ? prev.balls : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["moveBallsForward"])(prev.balls, deltaTime);
                newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["processRollback"])(newBalls, deltaTime, spawnFinishedRef.current);
                const gameplayConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getGameplayConfig"])();
                const { period } = gameplayConfig.spawn;
                const { targetCount } = gameplayConfig.balls;
                spawnAccumRef.current += deltaTime;
                const canSpawn = !spawnFinishedRef.current && newBalls.length < targetCount && totalSpawnedRef.current < currentLifeMaxRef.current;
                if (spawnAccumRef.current >= period && canSpawn) {
                    const spacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getBallSpacing"])();
                    const tailBall = newBalls.length > 0 ? newBalls.reduce((min, b)=>b.pathProgress < min.pathProgress ? b : min, newBalls[0]) : null;
                    const tailProgress = tailBall?.pathProgress ?? spacing;
                    const spawnPosition = Math.max(0, tailProgress - spacing);
                    spawnAccumRef.current = 0;
                    const rawBall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["createRandomBall"])(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, spawnPosition, newBalls);
                    const newBall = {
                        ...rawBall,
                        spawnAnimStart: Date.now()
                    };
                    newBalls = [
                        newBall,
                        ...newBalls
                    ];
                    totalSpawnedRef.current++;
                    if (totalSpawnedRef.current >= currentLifeMaxRef.current) {
                        spawnFinishedRef.current = true;
                    }
                }
                newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, currentPath);
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["checkWin"])(newBalls) && spawnFinishedRef.current) {
                    gameEndedRef.current = true;
                    stopAllTimers();
                    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
                    const finalState = {
                        ...prev,
                        balls: newBalls,
                        isPlaying: false,
                        isGameOver: true,
                        won: true,
                        timeLeft: duration
                    };
                    setTimeout(()=>{
                        onGameEndRef.current?.(finalState);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playWinSound"])();
                    }, 0);
                    return finalState;
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["checkGameOver"])(newBalls)) {
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["consumeShield"])()) {
                        const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                        const beforeCount = newBalls.length;
                        let respawnedBalls = [
                            ...newBalls
                        ];
                        respawnedBalls.sort((a, b)=>b.pathProgress - a.pathProgress);
                        let keepCount = Math.ceil(maxTotalBallsRef.current / 2);
                        keepCount = Math.min(keepCount, beforeCount);
                        respawnedBalls = respawnedBalls.slice(0, keepCount);
                        const n = respawnedBalls.length;
                        if (n > 0) {
                            const headPos = 0.5;
                            for(let i = 0; i < n; i++){
                                const newProgress = Math.max(0, headPos - i * spacing);
                                respawnedBalls[i] = {
                                    ...respawnedBalls[i],
                                    pathProgress: newProgress,
                                    spawnAnimStart: undefined
                                };
                            }
                        }
                        respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
                        respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                        gapContextRef.current = null;
                        spawnFinishedRef.current = false;
                        currentLifeMaxRef.current = maxTotalBallsRef.current;
                        totalSpawnedRef.current = respawnedBalls.length;
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                        return {
                            ...prev,
                            balls: respawnedBalls,
                            combo: 0
                        };
                    }
                    const beforeLossCount2 = newBalls.length;
                    const maxProgressBefore2 = newBalls.length > 0 ? Math.max(...newBalls.map((b)=>b.pathProgress)) : 0;
                    const newLives = prev.lives - 1;
                    sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount2} шаров, голова на ${(maxProgressBefore2 * 100).toFixed(0)}%, осталось жизней: ${newLives}.`);
                    if (newLives <= 0) {
                        const availableBonusLives = bonusLivesRef.current - usedBonusLivesRef.current;
                        if (availableBonusLives > 0) {
                            usedBonusLivesRef.current += 1;
                            setUsedBonusLives((prev)=>prev + 1);
                            setTimeout(()=>{
                                onUseBonusLifeRef.current?.();
                            }, 0);
                            const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                            let respawnedBalls = [
                                ...newBalls
                            ];
                            respawnedBalls.sort((a, b)=>b.pathProgress - a.pathProgress);
                            let keepCount = Math.ceil(beforeLossCount2 / 2);
                            keepCount = Math.min(keepCount, beforeLossCount2);
                            respawnedBalls = respawnedBalls.slice(0, keepCount);
                            const n = respawnedBalls.length;
                            if (n > 0) {
                                const headPos = 0.5;
                                for(let i = 0; i < n; i++){
                                    const newProgress = Math.max(0, headPos - i * spacing);
                                    respawnedBalls[i] = {
                                        ...respawnedBalls[i],
                                        pathProgress: newProgress,
                                        spawnAnimStart: undefined
                                    };
                                }
                            }
                            respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
                            respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                            gapContextRef.current = null;
                            spawnFinishedRef.current = false;
                            currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                            totalSpawnedRef.current = respawnedBalls.length;
                            sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeLossCount2}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
                            return {
                                ...prev,
                                balls: respawnedBalls,
                                lives: 1,
                                combo: 0
                            };
                        }
                        gameEndedRef.current = true;
                        stopAllTimers();
                        const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
                        const finalState = {
                            ...prev,
                            balls: newBalls,
                            lives: 0,
                            isPlaying: false,
                            isGameOver: true,
                            won: false,
                            timeLeft: duration
                        };
                        setTimeout(()=>{
                            onGameEndRef.current?.(finalState);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('error');
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playGameOverSound"])();
                        }, 0);
                        return finalState;
                    }
                    const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                    let respawnedBalls = [
                        ...newBalls
                    ];
                    respawnedBalls.sort((a, b)=>b.pathProgress - a.pathProgress);
                    let keepCount = Math.ceil(beforeLossCount2 / 2);
                    keepCount = Math.min(keepCount, beforeLossCount2);
                    respawnedBalls = respawnedBalls.slice(0, keepCount);
                    const n = respawnedBalls.length;
                    if (n > 0) {
                        const headPos = 0.5;
                        for(let i = 0; i < n; i++){
                            const newProgress = Math.max(0, headPos - i * spacing);
                            respawnedBalls[i] = {
                                ...respawnedBalls[i],
                                pathProgress: newProgress,
                                spawnAnimStart: undefined
                            };
                        }
                    }
                    respawnedBalls.sort((a, b)=>a.pathProgress - b.pathProgress);
                    respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                    gapContextRef.current = null;
                    spawnFinishedRef.current = false;
                    currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                    totalSpawnedRef.current = respawnedBalls.length;
                    sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] Было ${beforeLossCount2} шаров, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
                    return {
                        ...prev,
                        balls: respawnedBalls,
                        lives: newLives,
                        combo: 0
                    };
                }
                return {
                    ...prev,
                    balls: newBalls
                };
            });
            setProjectile((prev)=>{
                if (!prev || gameEndedRef.current) return prev;
                const dims = dimensionsRef.current;
                const newX = prev.x + prev.vx;
                const newY = prev.y + prev.vy;
                if (newX < 0 || newX > dims.width || newY < 0 || newY > dims.height) {
                    return null;
                }
                return {
                    ...prev,
                    prevX: prev.x,
                    prevY: prev.y,
                    x: newX,
                    y: newY
                };
            });
            gameLoopRef.current = requestAnimationFrame(runLoop);
        };
        gameLoopRef.current = requestAnimationFrame(runLoop);
        timeTrackerRef.current = setInterval(()=>{
            if (gameEndedRef.current) return;
            setElapsedTime(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
        }, 1000);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
    }, [
        stopAllTimers,
        level
    ]);
    const ballsOnScreen = gameState.balls.length;
    const totalBalls = maxTotalBallsRef.current;
    const totalSpawned = totalSpawnedRef.current;
    const ballsRemaining = totalBalls - totalSpawned + ballsOnScreen;
    const currentLifeMax = currentLifeMaxRef.current;
    const applyRewind = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        setGameState((prev)=>{
            const rewindedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["applyRewindEffect"])(prev.balls, 0.2);
            const updatedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateBallPositions"])(rewindedBalls, pathRef.current);
            return {
                ...prev,
                balls: updatedBalls
            };
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
    }, []);
    // addExtraLife вызывает resumeGame с флагом incrementLives
    const addExtraLife = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((extraSeconds)=>{
        resumeGame({
            incrementLives: true
        });
    }, [
        resumeGame
    ]);
    const togglePause = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        isPausedRef.current = !isPausedRef.current;
        setIsPaused(isPausedRef.current);
        sendDebugLog(`[DEBUG] Game ${isPausedRef.current ? 'Paused' : 'Resumed'}`);
    }, []);
    const stepFrame = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        if (isPausedRef.current) {
            stepFrameRef.current = true;
            sendDebugLog(`[DEBUG] Stepping one frame`);
        }
    }, []);
    return {
        gameState,
        path,
        projectile,
        shooterAngle,
        shooterPosition,
        elapsedTime,
        ballsOnScreen,
        ballsRemaining,
        totalBalls,
        totalSpawned,
        currentLifeMax,
        isPaused,
        startGame,
        shoot,
        updateAim,
        addExtraLife,
        resumeGame,
        applyRewind,
        togglePause,
        stepFrame
    };
}
}),
"[project]/contexts/UserContext.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "UserProvider",
    ()=>UserProvider,
    "useUser",
    ()=>useUser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/queryClient.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const UserContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])({
    user: null,
    isLoading: true,
    error: null,
    refreshUser: async ()=>{}
});
function UserProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const initUser = async ()=>{
        try {
            setIsLoading(true);
            setError(null);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isTelegramWebApp"])()) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["initTelegramApp"])();
            }
            // Проверяем, есть ли параметр forceAdmin в URL
            const urlParams = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : new URLSearchParams();
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
            const telegramUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getTelegramUser"])();
            const startParam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getStartParam"])();
            if (telegramUser) {
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$queryClient$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["apiRequest"])('POST', '/api/auth/telegram', {
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
            const urlParams = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : new URLSearchParams();
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
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        initUser();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(UserContext.Provider, {
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
function useUser() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(UserContext);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=_cbcc8c6b._.js.map