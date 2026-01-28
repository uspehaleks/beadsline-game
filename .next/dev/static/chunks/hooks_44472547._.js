(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/hooks/use-toast.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
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
    _s();
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useToast.useEffect": ()=>{
            listeners.push(setState);
            return ({
                "useToast.useEffect": ()=>{
                    const index = listeners.indexOf(setState);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            })["useToast.useEffect"];
        }
    }["useToast.useEffect"], [
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
_s(useToast, "SPWE98mLGnlsnNfIwu/IAKTSZtk=");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useGameState.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGameState",
    ()=>useGameState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gameEngine.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gameConfig.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/sounds.ts [client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
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
    _s();
    const [gameState, setGameState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createInitialGameState"]);
    const [path, setPath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [projectile, setProjectile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [shooterAngle, setShooterAngle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(-Math.PI / 2);
    const [elapsedTime, setElapsedTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [usedBonusLives, setUsedBonusLives] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isPaused, setIsPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isPausedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const stepFrameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const gameLoopRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timeTrackerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const pathRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const onGameEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(onGameEnd);
    const gameEndedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const dimensionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])({
        width: canvasWidth,
        height: canvasHeight
    });
    const gameStartTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const spawnAccumRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const totalSpawnedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const spawnFinishedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const gapContextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const maxTotalBallsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(100);
    const currentLifeMaxRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(100); // Лимит шаров на текущую жизнь
    const pendingChainReactionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bonusLivesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(bonusLives);
    const usedBonusLivesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const onUseBonusLifeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(onUseBonusLife);
    const shooterBallRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(gameState.shooterBall);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGameState.useEffect": ()=>{
            shooterBallRef.current = gameState.shooterBall;
        }
    }["useGameState.useEffect"], [
        gameState.shooterBall
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGameState.useEffect": ()=>{
            bonusLivesRef.current = bonusLives;
        }
    }["useGameState.useEffect"], [
        bonusLives
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGameState.useEffect": ()=>{
            onUseBonusLifeRef.current = onUseBonusLife;
        }
    }["useGameState.useEffect"], [
        onUseBonusLife
    ]);
    const chainReactionTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    onGameEndRef.current = onGameEnd;
    pathRef.current = path;
    dimensionsRef.current = {
        width: canvasWidth,
        height: canvasHeight
    };
    const shooterPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getShooterPosition"])(canvasWidth, canvasHeight);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGameState.useEffect": ()=>{
            if (canvasWidth > 0 && canvasHeight > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setCurrentLevel"])(level);
                const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["generatePathForLevel"])(canvasWidth, canvasHeight, level);
                setPath(newPath);
                pathRef.current = newPath;
            }
        }
    }["useGameState.useEffect"], [
        canvasWidth,
        canvasHeight,
        level
    ]);
    const stopAllTimers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[stopAllTimers]": ()=>{
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
        }
    }["useGameState.useCallback[stopAllTimers]"], []);
    const startGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[startGame]": async ()=>{
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
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setEconomyConfig"])(economyData);
                    // Get crypto availability from economy config (respects cryptoFundEnabled toggle)
                    cryptoAvailable = economyData.cryptoAvailable || {
                        btc: false,
                        eth: false,
                        usdt: false
                    };
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setUsdtFundEnabled"])(economyData.usdtFundEnabled === true);
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
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setAvailableCrypto"])(cryptoAvailable);
                if (gameplayRes.ok) {
                    const gameplayData = await gameplayRes.json();
                    // Override with level-specific spawn period if available
                    if (level?.spawnPeriod) {
                        gameplayData.spawn = {
                            ...gameplayData.spawn,
                            period: level.spawnPeriod
                        };
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setGameplayConfig"])(gameplayData);
                    maxTotalBallsRef.current = gameplayData.balls?.maxTotalBalls || 100;
                    currentLifeMaxRef.current = maxTotalBallsRef.current; // Изначально = максимум
                }
            } catch (error) {
                console.error('Failed to fetch game config:', error);
                // Default to crypto disabled for safety when API fails
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setAvailableCrypto"])({
                    btc: false,
                    eth: false,
                    usdt: false
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setUsdtFundEnabled"])(false);
            }
            stopAllTimers();
            gameEndedRef.current = false;
            gameStartTimeRef.current = Date.now();
            setElapsedTime(0);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["resetCryptoSpawnedCount"])();
            const dims = dimensionsRef.current;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["setCurrentLevel"])(level);
            const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["generatePathForLevel"])(dims.width, dims.height, level);
            setPath(newPath);
            pathRef.current = newPath;
            const initialState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createInitialGameState"])();
            const ballsWithPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(initialState.balls, newPath);
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
            totalSpawnedRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getGameplayConfig"])().balls.initialCount;
            spawnFinishedRef.current = false;
            gapContextRef.current = null;
            // Track frame count for debug logging
            let frameCount = 0;
            const runLoop = {
                "useGameState.useCallback[startGame].runLoop": (timestamp)=>{
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
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBoostTimers"])();
                    if (pendingChainReactionRef.current) {
                        gameLoopRef.current = requestAnimationFrame(runLoop);
                        return;
                    }
                    // Log gap context state every 60 frames (roughly once per second)
                    if (gapContextRef.current && Math.random() < 0.02) {
                        sendDebugLog(`[LOOP] gap exists: L:${gapContextRef.current.leftBallId?.slice(-6)} R:${gapContextRef.current.rightBallId?.slice(-6)}`);
                    }
                    setGameState({
                        "useGameState.useCallback[startGame].runLoop": (prev)=>{
                            if (!prev.isPlaying || gameEndedRef.current) return prev;
                            // During rollback, pause forward movement to let chain close gaps properly
                            let newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["isRollbackActive"])() ? prev.balls : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["moveBallsForward"])(prev.balls, deltaTime);
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["processRollback"])(newBalls, deltaTime, spawnFinishedRef.current);
                            let updatedState = prev;
                            const gap = gapContextRef.current;
                            // Debug: log gap status every check
                            if (gap) {
                                const leftIdx = gap.leftBallId ? newBalls.findIndex({
                                    "useGameState.useCallback[startGame].runLoop": (b)=>b.id === gap.leftBallId
                                }["useGameState.useCallback[startGame].runLoop"]) : -1;
                                const rightIdx = gap.rightBallId ? newBalls.findIndex({
                                    "useGameState.useCallback[startGame].runLoop": (b)=>b.id === gap.rightBallId
                                }["useGameState.useCallback[startGame].runLoop"]) : -1;
                                const isAdj = rightIdx === leftIdx + 1;
                                // Only log when adjacent or first time
                                if (isAdj) {
                                    sendDebugLog(`[GAP-FOUND] L:${leftIdx} R:${rightIdx} adj:${isAdj} len:${newBalls.length}`);
                                }
                            }
                            if (gap && newBalls.length >= 3) {
                                const leftIdx = gap.leftBallId ? newBalls.findIndex({
                                    "useGameState.useCallback[startGame].runLoop": (b)=>b.id === gap.leftBallId
                                }["useGameState.useCallback[startGame].runLoop"]) : -1;
                                const rightIdx = gap.rightBallId ? newBalls.findIndex({
                                    "useGameState.useCallback[startGame].runLoop": (b)=>b.id === gap.rightBallId
                                }["useGameState.useCallback[startGame].runLoop"]) : -1;
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
                                        const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, leftBall);
                                        sendDebugLog(`[MATCH] found:${matches.length} both:${matches.includes(leftIdx) && matches.includes(rightIdx)}`);
                                        if (matches.length >= 3 && matches.includes(leftIdx) && matches.includes(rightIdx)) {
                                            foundMatch = true;
                                            matchesToProcess = matches;
                                        }
                                    } else {
                                        // Boundary balls DON'T match - check each side independently for 3+ chains
                                        // Check LEFT side: leftBall and its left neighbors
                                        const leftMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, leftBall);
                                        sendDebugLog(`[LEFT] matches:${leftMatches.length} hasLeft:${leftMatches.includes(leftIdx)}`);
                                        if (leftMatches.length >= 3 && leftMatches.includes(leftIdx)) {
                                            foundMatch = true;
                                            matchesToProcess = leftMatches;
                                        }
                                        // Check RIGHT side: rightBall and its right neighbors (only if left didn't match)
                                        if (!foundMatch) {
                                            const rightMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, rightIdx, rightBall);
                                            sendDebugLog(`[RIGHT] matches:${rightMatches.length} hasRight:${rightMatches.includes(rightIdx)}`);
                                            if (rightMatches.length >= 3 && rightMatches.includes(rightIdx)) {
                                                foundMatch = true;
                                                matchesToProcess = rightMatches;
                                            }
                                        }
                                    }
                                } else if (leftIdx >= 0 && rightIdx < 0) {
                                    sendDebugLog(`[EDGE] Only left exists, checking`);
                                    const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, newBalls[leftIdx]);
                                    if (matches.length >= 3 && matches.includes(leftIdx)) {
                                        foundMatch = true;
                                        matchesToProcess = matches;
                                    }
                                } else if (rightIdx >= 0 && leftIdx < 0) {
                                    sendDebugLog(`[EDGE] Only right exists, checking`);
                                    const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, rightIdx, newBalls[rightIdx]);
                                    if (matches.length >= 3 && matches.includes(rightIdx)) {
                                        foundMatch = true;
                                        matchesToProcess = matches;
                                    }
                                } else if (leftIdx < 0 || rightIdx < 0) {
                                    sendDebugLog(`[CLEAR] Ball not found! left:${leftIdx} right:${rightIdx}`);
                                    gapContextRef.current = null;
                                }
                                if (foundMatch && matchesToProcess) {
                                    const matchedBalls = matchesToProcess.map({
                                        "useGameState.useCallback[startGame].runLoop.matchedBalls": (i)=>newBalls[i]
                                    }["useGameState.useCallback[startGame].runLoop.matchedBalls"]);
                                    const matchedBallIds = matchedBalls.map({
                                        "useGameState.useCallback[startGame].runLoop.matchedBallIds": (b)=>b.id
                                    }["useGameState.useCallback[startGame].runLoop.matchedBallIds"]);
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
                                    chainReactionTimeoutRef.current = setTimeout({
                                        "useGameState.useCallback[startGame].runLoop": ()=>{
                                            setGameState({
                                                "useGameState.useCallback[startGame].runLoop": (currentState)=>{
                                                    if (!currentState.isPlaying || gameEndedRef.current) {
                                                        pendingChainReactionRef.current = null;
                                                        return currentState;
                                                    }
                                                    const pending = pendingChainReactionRef.current;
                                                    if (!pending) return currentState;
                                                    const ballIndicesToRemove = pending.matchedBallIds.map({
                                                        "useGameState.useCallback[startGame].runLoop.ballIndicesToRemove": (id)=>currentState.balls.findIndex({
                                                                "useGameState.useCallback[startGame].runLoop.ballIndicesToRemove": (b)=>b.id === id
                                                            }["useGameState.useCallback[startGame].runLoop.ballIndicesToRemove"])
                                                    }["useGameState.useCallback[startGame].runLoop.ballIndicesToRemove"]).filter({
                                                        "useGameState.useCallback[startGame].runLoop.ballIndicesToRemove": (idx)=>idx >= 0
                                                    }["useGameState.useCallback[startGame].runLoop.ballIndicesToRemove"]).sort({
                                                        "useGameState.useCallback[startGame].runLoop.ballIndicesToRemove": (a, b)=>a - b
                                                    }["useGameState.useCallback[startGame].runLoop.ballIndicesToRemove"]);
                                                    pendingChainReactionRef.current = null;
                                                    if (ballIndicesToRemove.length < 3) {
                                                        gapContextRef.current = null;
                                                        return currentState;
                                                    }
                                                    const matchedBalls = ballIndicesToRemove.map({
                                                        "useGameState.useCallback[startGame].runLoop.matchedBalls": (i)=>currentState.balls[i]
                                                    }["useGameState.useCallback[startGame].runLoop.matchedBalls"]);
                                                    const chainCombo = pending.combo;
                                                    const newCombo = chainCombo + 1;
                                                    const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculatePoints"])(matchedBalls, chainCombo);
                                                    const processedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["removeBalls"])(currentState.balls, ballIndicesToRemove);
                                                    // Only arm portal retreat if very early in game (< 10 balls spawned)
                                                    const isEarlyGame = totalSpawnedRef.current < 10;
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["activateRollback"])(isEarlyGame);
                                                    if (pending.newLeftBallId || pending.newRightBallId) {
                                                        gapContextRef.current = {
                                                            leftBallId: pending.newLeftBallId,
                                                            rightBallId: pending.newRightBallId
                                                        };
                                                    } else {
                                                        gapContextRef.current = null;
                                                    }
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                                                    const hasCrypto = matchedBalls.some({
                                                        "useGameState.useCallback[startGame].runLoop.hasCrypto": (b)=>b.crypto || b.isUsdtFund
                                                    }["useGameState.useCallback[startGame].runLoop.hasCrypto"]);
                                                    if (hasCrypto) {
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                                                    } else {
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playMatchSound"])(newCombo);
                                                    }
                                                    if (newCombo > 1) {
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playComboSound"])(newCombo);
                                                    }
                                                    const ballsWithPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(processedBalls, pathRef.current);
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
                                                }
                                            }["useGameState.useCallback[startGame].runLoop"]);
                                        }
                                    }["useGameState.useCallback[startGame].runLoop"], CHAIN_REACTION_DELAY);
                                    newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, currentPath);
                                    return {
                                        ...prev,
                                        balls: newBalls
                                    };
                                }
                                if (!foundMatch) {
                                    gapContextRef.current = null;
                                }
                            }
                            const gameplayConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getGameplayConfig"])();
                            const { period } = gameplayConfig.spawn;
                            const buffer = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].spawn.buffer;
                            const { targetCount } = gameplayConfig.balls;
                            spawnAccumRef.current += deltaTime;
                            // Используем currentLifeMaxRef - лимит на текущую жизнь
                            const canSpawn = !spawnFinishedRef.current && newBalls.length < targetCount && totalSpawnedRef.current < currentLifeMaxRef.current;
                            if (spawnAccumRef.current >= period && canSpawn) {
                                const spacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getBallSpacing"])();
                                // Find tail ball (lowest progress)
                                const tailBall = newBalls.length > 0 ? newBalls.reduce({
                                    "useGameState.useCallback[startGame].runLoop": (min, b)=>b.pathProgress < min.pathProgress ? b : min
                                }["useGameState.useCallback[startGame].runLoop"], newBalls[0]) : null;
                                const tailProgress = tailBall?.pathProgress ?? spacing;
                                // Spawn at correct logical position (adjacent to tail) for chain cohesion
                                const spawnPosition = Math.max(0, tailProgress - spacing);
                                sendDebugLog(`[SPAWN] accum=${spawnAccumRef.current.toFixed(0)}ms, balls=${newBalls.length}, tailProg=${tailProgress.toFixed(4)}, spawnPos=${spawnPosition.toFixed(4)}`);
                                spawnAccumRef.current = 0;
                                // Create ball at correct position with spawn animation for visual portal emergence
                                const rawBall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createRandomBall"])(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, spawnPosition, newBalls);
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
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, currentPath);
                            // Победа: все шары уничтожены И спавн завершён
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["checkWin"])(newBalls) && spawnFinishedRef.current) {
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
                                setTimeout({
                                    "useGameState.useCallback[startGame].runLoop": ()=>{
                                        onGameEndRef.current?.(finalState);
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playWinSound"])();
                                    }
                                }["useGameState.useCallback[startGame].runLoop"], 0);
                                return finalState;
                            }
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["checkGameOver"])(newBalls)) {
                                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["consumeShield"])()) {
                                    const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                                    const beforeCount = newBalls.length;
                                    // FIX: Лимит шаров на следующую жизнь = сколько было на экране
                                    currentLifeMaxRef.current = beforeCount;
                                    sendDebugLog(`[ЩИТ] Сработал. Было ${beforeCount} шаров. Новый лимит: ${currentLifeMaxRef.current}`);
                                    let respawnedBalls = [
                                        ...newBalls
                                    ];
                                    respawnedBalls.sort({
                                        "useGameState.useCallback[startGame].runLoop": (a, b)=>b.pathProgress - a.pathProgress
                                    }["useGameState.useCallback[startGame].runLoop"]);
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
                                    respawnedBalls.sort({
                                        "useGameState.useCallback[startGame].runLoop": (a, b)=>a.pathProgress - b.pathProgress
                                    }["useGameState.useCallback[startGame].runLoop"]);
                                    respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                                    gapContextRef.current = null;
                                    spawnFinishedRef.current = false;
                                    // currentLifeMaxRef уже установлен
                                    totalSpawnedRef.current = respawnedBalls.length;
                                    sendDebugLog(`[ЩИТ] После: осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                                    return {
                                        ...updatedState,
                                        balls: respawnedBalls,
                                        combo: 0
                                    };
                                }
                                const beforeLossCount = newBalls.length;
                                const maxProgressBefore = newBalls.length > 0 ? Math.max(...newBalls.map({
                                    "useGameState.useCallback[startGame].runLoop": (b)=>b.pathProgress
                                }["useGameState.useCallback[startGame].runLoop"])) : 0;
                                const newLives = updatedState.lives - 1;
                                sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount} шаров, голова на ${(maxProgressBefore * 100).toFixed(0)}%, осталось жизней: ${newLives}.`);
                                if (newLives <= 0) {
                                    // Проверяем есть ли бонусные жизни из BEADS BOX
                                    const availableBonusLives = bonusLivesRef.current - usedBonusLivesRef.current;
                                    if (availableBonusLives > 0) {
                                        // Используем бонусную жизнь
                                        usedBonusLivesRef.current += 1;
                                        setUsedBonusLives({
                                            "useGameState.useCallback[startGame].runLoop": (prev)=>prev + 1
                                        }["useGameState.useCallback[startGame].runLoop"]);
                                        // Вызываем callback для списания бонусной жизни с сервера
                                        setTimeout({
                                            "useGameState.useCallback[startGame].runLoop": ()=>{
                                                onUseBonusLifeRef.current?.();
                                            }
                                        }["useGameState.useCallback[startGame].runLoop"], 0);
                                        // Сбрасываем шарики в начало (как при обычной потере жизни)
                                        const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                                        let respawnedBalls = [
                                            ...newBalls
                                        ];
                                        respawnedBalls.sort({
                                            "useGameState.useCallback[startGame].runLoop": (a, b)=>b.pathProgress - a.pathProgress
                                        }["useGameState.useCallback[startGame].runLoop"]);
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
                                        respawnedBalls.sort({
                                            "useGameState.useCallback[startGame].runLoop": (a, b)=>a.pathProgress - b.pathProgress
                                        }["useGameState.useCallback[startGame].runLoop"]);
                                        respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                                        gapContextRef.current = null;
                                        spawnFinishedRef.current = false;
                                        currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                                        totalSpawnedRef.current = respawnedBalls.length;
                                        sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeLossCount}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
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
                                    setTimeout({
                                        "useGameState.useCallback[startGame].runLoop": ()=>{
                                            onGameEndRef.current?.(finalState);
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('error');
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playGameOverSound"])();
                                        }
                                    }["useGameState.useCallback[startGame].runLoop"], 0);
                                    return finalState;
                                }
                                const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                                let respawnedBalls = [
                                    ...newBalls
                                ];
                                respawnedBalls.sort({
                                    "useGameState.useCallback[startGame].runLoop": (a, b)=>b.pathProgress - a.pathProgress
                                }["useGameState.useCallback[startGame].runLoop"]);
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
                                respawnedBalls.sort({
                                    "useGameState.useCallback[startGame].runLoop": (a, b)=>a.pathProgress - b.pathProgress
                                }["useGameState.useCallback[startGame].runLoop"]);
                                respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                                gapContextRef.current = null;
                                spawnFinishedRef.current = false;
                                currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                                totalSpawnedRef.current = respawnedBalls.length;
                                sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] Было ${beforeLossCount} шаров, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
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
                        }
                    }["useGameState.useCallback[startGame].runLoop"]);
                    setProjectile({
                        "useGameState.useCallback[startGame].runLoop": (prev)=>{
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
                        }
                    }["useGameState.useCallback[startGame].runLoop"]);
                    gameLoopRef.current = requestAnimationFrame(runLoop);
                }
            }["useGameState.useCallback[startGame].runLoop"];
            gameLoopRef.current = requestAnimationFrame(runLoop);
            timeTrackerRef.current = setInterval({
                "useGameState.useCallback[startGame]": ()=>{
                    if (gameEndedRef.current) return;
                    setElapsedTime(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
                }
            }["useGameState.useCallback[startGame]"], 1000);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
        }
    }["useGameState.useCallback[startGame]"], [
        stopAllTimers
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGameState.useEffect": ()=>{
            return ({
                "useGameState.useEffect": ()=>{
                    stopAllTimers();
                }
            })["useGameState.useEffect"];
        }
    }["useGameState.useEffect"], [
        stopAllTimers
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGameState.useEffect": ()=>{
            if (!projectile || gameEndedRef.current) return;
            setGameState({
                "useGameState.useEffect": (prev)=>{
                    if (!prev.isPlaying || gameEndedRef.current) return prev;
                    const collision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["checkPathCollision"])(projectile.x, projectile.y, projectile.prevX, projectile.prevY, prev.balls, pathRef.current);
                    if (collision) {
                        const insertIndex = collision.insertBefore ? collision.index : collision.index + 1;
                        // Check if laser boost is active - pierces through balls without inserting
                        const laserResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["consumeLaser"])();
                        if (laserResult.active) {
                            const hitIndices = [];
                            for(let i = 0; i < Math.min(laserResult.pierceCount, prev.balls.length); i++){
                                const idx = collision.index + i;
                                if (idx >= 0 && idx < prev.balls.length) {
                                    hitIndices.push(idx);
                                }
                            }
                            if (hitIndices.length > 0) {
                                const { newBalls: laserBalls, removedBalls } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["applyLaserEffect"])(prev.balls, hitIndices);
                                const updatedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(laserBalls, pathRef.current);
                                const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculatePoints"])(removedBalls, 0);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('heavy');
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playComboSound"])(removedBalls.length);
                                const hasCrypto = removedBalls.some({
                                    "useGameState.useEffect.hasCrypto": (b)=>b.crypto || b.isUsdtFund
                                }["useGameState.useEffect.hasCrypto"]);
                                if (hasCrypto) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                                } else {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playMatchSound"])();
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
                                    nextBall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createRandomBall"])('next-' + Date.now(), 0, prev.balls, true)
                                };
                            }
                        }
                        let newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["insertBallInChain"])(prev.balls, projectile.ball, insertIndex);
                        newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, pathRef.current);
                        // Check if magnet boost is active - attracts same color balls closer
                        const magnetResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["consumeMagnet"])();
                        if (magnetResult.active) {
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["applyMagnetEffect"])(newBalls, insertIndex, magnetResult.radius);
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, pathRef.current);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                        }
                        // Check if bomb boost is active
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["consumeBomb"])()) {
                            const { newBalls: bombedBalls, removedBalls } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["applyBombEffect"])(newBalls, insertIndex, 5);
                            newBalls = bombedBalls;
                            if (removedBalls.length > 0) {
                                const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculatePoints"])(removedBalls, 0);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('heavy');
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playComboSound"])(2);
                                const hasCrypto = removedBalls.some({
                                    "useGameState.useEffect.hasCrypto": (b)=>b.crypto || b.isUsdtFund
                                }["useGameState.useEffect.hasCrypto"]);
                                if (hasCrypto) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                                } else {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playMatchSound"])();
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
                                    nextBall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createRandomBall"])('next-' + Date.now(), 0, newBalls, true)
                                };
                            }
                        }
                        const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, insertIndex, projectile.ball);
                        if (matches.length >= 3) {
                            const matchedBalls = matches.map({
                                "useGameState.useEffect.matchedBalls": (i)=>newBalls[i]
                            }["useGameState.useEffect.matchedBalls"]);
                            const { points, cryptoCollected, usdtFundCollected } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculatePoints"])(matchedBalls, 0);
                            const minIdx = matches[0];
                            const maxIdx = matches[matches.length - 1];
                            const leftBall = minIdx > 0 ? newBalls[minIdx - 1] : null;
                            const rightBall = maxIdx < newBalls.length - 1 ? newBalls[maxIdx + 1] : null;
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["removeBalls"])(newBalls, matches);
                            // Only arm portal retreat if very early in game (< 10 balls spawned)
                            const isEarlyGame = totalSpawnedRef.current < 10;
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["activateRollback"])(isEarlyGame);
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
                                const leftIdx = newBalls.findIndex({
                                    "useGameState.useEffect.leftIdx": (b)=>b.id === currentLeftBall.id
                                }["useGameState.useEffect.leftIdx"]);
                                const rightIdx = newBalls.findIndex({
                                    "useGameState.useEffect.rightIdx": (b)=>b.id === currentRightBall.id
                                }["useGameState.useEffect.rightIdx"]);
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
                                const chainMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["findMatchingBalls"])(newBalls, leftIdx, leftB);
                                if (chainMatches.length < 3 || !chainMatches.includes(leftIdx) || !chainMatches.includes(rightIdx)) {
                                    sendDebugLog(`[CHAIN-SHORT] found:${chainMatches.length} hasLeft:${chainMatches.includes(leftIdx)} hasRight:${chainMatches.includes(rightIdx)}`);
                                    break;
                                }
                                // Chain reaction found!
                                currentCombo++;
                                sendDebugLog(`[CHAIN-REACT] combo:${currentCombo} removing:${chainMatches.length} balls`);
                                const chainMatchedBalls = chainMatches.map({
                                    "useGameState.useEffect.chainMatchedBalls": (i)=>newBalls[i]
                                }["useGameState.useEffect.chainMatchedBalls"]);
                                const chainResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["calculatePoints"])(chainMatchedBalls, currentCombo - 1);
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
                                newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["removeBalls"])(newBalls, chainMatches);
                                // Keep same early game state for chain reactions
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["activateRollback"])(isEarlyGame);
                                // Play combo sound
                                const hasChainCrypto = chainMatchedBalls.some({
                                    "useGameState.useEffect.hasChainCrypto": (b)=>b.crypto || b.isUsdtFund
                                }["useGameState.useEffect.hasChainCrypto"]);
                                if (hasChainCrypto) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                                }
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playComboSound"])(currentCombo);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('heavy');
                            }
                            // Clear gap context since we processed chain reactions synchronously
                            gapContextRef.current = null;
                            sendDebugLog(`[CHAIN-END] combo:${currentCombo} points:${totalPoints}`);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                            const hasCrypto = matchedBalls.some({
                                "useGameState.useEffect.hasCrypto": (b)=>b.crypto || b.isUsdtFund
                            }["useGameState.useEffect.hasCrypto"]);
                            if (hasCrypto) {
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playCryptoMatchSound"])();
                            } else {
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playMatchSound"])(currentCombo);
                            }
                            const newScore = prev.score + totalPoints;
                            setProjectile(null);
                            // Победа: все шары уничтожены И спавн завершён
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["checkWin"])(newBalls) && spawnFinishedRef.current) {
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
                                setTimeout({
                                    "useGameState.useEffect": ()=>{
                                        onGameEndRef.current?.(finalState);
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
                                    }
                                }["useGameState.useEffect"], 100);
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
                }
            }["useGameState.useEffect"]);
        }
    }["useGameState.useEffect"], [
        projectile,
        stopAllTimers
    ]);
    const shoot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[shoot]": (targetX, targetY)=>{
            // Use ref to get current shooterBall to avoid stale closure issues
            const currentShooterBall = shooterBallRef.current;
            if (!gameState.isPlaying || projectile || !currentShooterBall) return;
            const dx = targetX - shooterPosition.x;
            const dy = targetY - shooterPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance === 0) return;
            const vx = dx / distance * __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["SHOOTER_BALL_SPEED"];
            const vy = dy / distance * __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["SHOOTER_BALL_SPEED"];
            // Apply rainbow boost to the shooting ball if active
            let ballToShoot = currentShooterBall;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["consumeRainbow"])()) {
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
            setGameState({
                "useGameState.useCallback[shoot]": (prev)=>({
                        ...prev,
                        shooterBall: prev.nextBall,
                        nextBall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createRandomBall"])('next-' + Date.now(), 0, prev.balls, true),
                        shotsTotal: prev.shotsTotal + 1
                    })
            }["useGameState.useCallback[shoot]"]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('light');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playShootSound"])();
        }
    }["useGameState.useCallback[shoot]"], [
        gameState.isPlaying,
        projectile,
        shooterPosition
    ]);
    const updateAim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[updateAim]": (targetX, targetY)=>{
            if (!gameState.isPlaying) return;
            const dx = targetX - shooterPosition.x;
            const dy = targetY - shooterPosition.y;
            const angle = Math.atan2(dy, dx);
            setShooterAngle(angle);
        }
    }["useGameState.useCallback[updateAim]"], [
        gameState.isPlaying,
        shooterPosition
    ]);
    // resumeGame принимает опцию incrementLives для addExtraLife
    const resumeGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[resumeGame]": (options)=>{
            const shouldIncrementLives = options?.incrementLives ?? false;
            stopAllTimers();
            gameEndedRef.current = false;
            lastTimeRef.current = 0;
            spawnAccumRef.current = 0;
            setGameState({
                "useGameState.useCallback[resumeGame]": (prev)=>{
                    let currentPath = pathRef.current;
                    if (currentPath.length === 0) {
                        console.warn("Path not initialized in resumeGame, regenerating...");
                        currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["generatePathForLevel"])(dimensionsRef.current.width, dimensionsRef.current.height, level);
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
                    const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                    let respawnedBalls = [
                        ...prev.balls
                    ].sort({
                        "useGameState.useCallback[resumeGame].respawnedBalls": (a, b)=>b.pathProgress - a.pathProgress
                    }["useGameState.useCallback[resumeGame].respawnedBalls"]);
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
                    respawnedBalls.sort({
                        "useGameState.useCallback[resumeGame]": (a, b)=>a.pathProgress - b.pathProgress
                    }["useGameState.useCallback[resumeGame]"]);
                    respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
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
                }
            }["useGameState.useCallback[resumeGame]"]);
            const currentPath = pathRef.current;
            const runLoop = {
                "useGameState.useCallback[resumeGame].runLoop": (timestamp)=>{
                    if (gameEndedRef.current) return;
                    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
                    lastTimeRef.current = timestamp;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBoostTimers"])();
                    setGameState({
                        "useGameState.useCallback[resumeGame].runLoop": (prev)=>{
                            if (!prev.isPlaying || gameEndedRef.current) return prev;
                            let newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["isRollbackActive"])() ? prev.balls : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["moveBallsForward"])(prev.balls, deltaTime);
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["processRollback"])(newBalls, deltaTime, spawnFinishedRef.current);
                            const gameplayConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getGameplayConfig"])();
                            const { period } = gameplayConfig.spawn;
                            const { targetCount } = gameplayConfig.balls;
                            spawnAccumRef.current += deltaTime;
                            const canSpawn = !spawnFinishedRef.current && newBalls.length < targetCount && totalSpawnedRef.current < currentLifeMaxRef.current;
                            if (spawnAccumRef.current >= period && canSpawn) {
                                const spacing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getBallSpacing"])();
                                const tailBall = newBalls.length > 0 ? newBalls.reduce({
                                    "useGameState.useCallback[resumeGame].runLoop": (min, b)=>b.pathProgress < min.pathProgress ? b : min
                                }["useGameState.useCallback[resumeGame].runLoop"], newBalls[0]) : null;
                                const tailProgress = tailBall?.pathProgress ?? spacing;
                                const spawnPosition = Math.max(0, tailProgress - spacing);
                                spawnAccumRef.current = 0;
                                const rawBall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["createRandomBall"])(`spawn-${Date.now()}-${Math.random().toString(36).slice(2)}`, spawnPosition, newBalls);
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
                            newBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(newBalls, currentPath);
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["checkWin"])(newBalls) && spawnFinishedRef.current) {
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
                                setTimeout({
                                    "useGameState.useCallback[resumeGame].runLoop": ()=>{
                                        onGameEndRef.current?.(finalState);
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playWinSound"])();
                                    }
                                }["useGameState.useCallback[resumeGame].runLoop"], 0);
                                return finalState;
                            }
                            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["checkGameOver"])(newBalls)) {
                                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["consumeShield"])()) {
                                    const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                                    const beforeCount = newBalls.length;
                                    let respawnedBalls = [
                                        ...newBalls
                                    ];
                                    respawnedBalls.sort({
                                        "useGameState.useCallback[resumeGame].runLoop": (a, b)=>b.pathProgress - a.pathProgress
                                    }["useGameState.useCallback[resumeGame].runLoop"]);
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
                                    respawnedBalls.sort({
                                        "useGameState.useCallback[resumeGame].runLoop": (a, b)=>a.pathProgress - b.pathProgress
                                    }["useGameState.useCallback[resumeGame].runLoop"]);
                                    respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                                    gapContextRef.current = null;
                                    spawnFinishedRef.current = false;
                                    currentLifeMaxRef.current = maxTotalBallsRef.current;
                                    totalSpawnedRef.current = respawnedBalls.length;
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
                                    return {
                                        ...prev,
                                        balls: respawnedBalls,
                                        combo: 0
                                    };
                                }
                                const beforeLossCount2 = newBalls.length;
                                const maxProgressBefore2 = newBalls.length > 0 ? Math.max(...newBalls.map({
                                    "useGameState.useCallback[resumeGame].runLoop": (b)=>b.pathProgress
                                }["useGameState.useCallback[resumeGame].runLoop"])) : 0;
                                const newLives = prev.lives - 1;
                                sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] До: ${beforeLossCount2} шаров, голова на ${(maxProgressBefore2 * 100).toFixed(0)}%, осталось жизней: ${newLives}.`);
                                if (newLives <= 0) {
                                    const availableBonusLives = bonusLivesRef.current - usedBonusLivesRef.current;
                                    if (availableBonusLives > 0) {
                                        usedBonusLivesRef.current += 1;
                                        setUsedBonusLives({
                                            "useGameState.useCallback[resumeGame].runLoop": (prev)=>prev + 1
                                        }["useGameState.useCallback[resumeGame].runLoop"]);
                                        setTimeout({
                                            "useGameState.useCallback[resumeGame].runLoop": ()=>{
                                                onUseBonusLifeRef.current?.();
                                            }
                                        }["useGameState.useCallback[resumeGame].runLoop"], 0);
                                        const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                                        let respawnedBalls = [
                                            ...newBalls
                                        ];
                                        respawnedBalls.sort({
                                            "useGameState.useCallback[resumeGame].runLoop": (a, b)=>b.pathProgress - a.pathProgress
                                        }["useGameState.useCallback[resumeGame].runLoop"]);
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
                                        respawnedBalls.sort({
                                            "useGameState.useCallback[resumeGame].runLoop": (a, b)=>a.pathProgress - b.pathProgress
                                        }["useGameState.useCallback[resumeGame].runLoop"]);
                                        respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                                        gapContextRef.current = null;
                                        spawnFinishedRef.current = false;
                                        currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                                        totalSpawnedRef.current = respawnedBalls.length;
                                        sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] После (бонус): было ${beforeLossCount2}, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
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
                                    setTimeout({
                                        "useGameState.useCallback[resumeGame].runLoop": ()=>{
                                            onGameEndRef.current?.(finalState);
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('error');
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playGameOverSound"])();
                                        }
                                    }["useGameState.useCallback[resumeGame].runLoop"], 0);
                                    return finalState;
                                }
                                const spacing = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameConfig$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["GAME_CONFIG"].balls.spacing;
                                let respawnedBalls = [
                                    ...newBalls
                                ];
                                respawnedBalls.sort({
                                    "useGameState.useCallback[resumeGame].runLoop": (a, b)=>b.pathProgress - a.pathProgress
                                }["useGameState.useCallback[resumeGame].runLoop"]);
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
                                respawnedBalls.sort({
                                    "useGameState.useCallback[resumeGame].runLoop": (a, b)=>a.pathProgress - b.pathProgress
                                }["useGameState.useCallback[resumeGame].runLoop"]);
                                respawnedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(respawnedBalls, currentPath);
                                gapContextRef.current = null;
                                spawnFinishedRef.current = false;
                                currentLifeMaxRef.current = maxTotalBallsRef.current; // FIX: Лимит всегда сбрасывается на максимум
                                totalSpawnedRef.current = respawnedBalls.length;
                                sendDebugLog(`[ПОТЕРЯ ЖИЗНИ] Было ${beforeLossCount2} шаров, осталось ${respawnedBalls.length}, ещё выедут ${currentLifeMaxRef.current - respawnedBalls.length}`);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('warning');
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sounds$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playLifeLostSound"])();
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
                        }
                    }["useGameState.useCallback[resumeGame].runLoop"]);
                    setProjectile({
                        "useGameState.useCallback[resumeGame].runLoop": (prev)=>{
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
                        }
                    }["useGameState.useCallback[resumeGame].runLoop"]);
                    gameLoopRef.current = requestAnimationFrame(runLoop);
                }
            }["useGameState.useCallback[resumeGame].runLoop"];
            gameLoopRef.current = requestAnimationFrame(runLoop);
            timeTrackerRef.current = setInterval({
                "useGameState.useCallback[resumeGame]": ()=>{
                    if (gameEndedRef.current) return;
                    setElapsedTime(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
                }
            }["useGameState.useCallback[resumeGame]"], 1000);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('success');
        }
    }["useGameState.useCallback[resumeGame]"], [
        stopAllTimers,
        level
    ]);
    const ballsOnScreen = gameState.balls.length;
    const totalBalls = maxTotalBallsRef.current;
    const totalSpawned = totalSpawnedRef.current;
    const ballsRemaining = totalBalls - totalSpawned + ballsOnScreen;
    const currentLifeMax = currentLifeMaxRef.current;
    const applyRewind = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[applyRewind]": ()=>{
            setGameState({
                "useGameState.useCallback[applyRewind]": (prev)=>{
                    const rewindedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["applyRewindEffect"])(prev.balls, 0.2);
                    const updatedBalls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gameEngine$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["updateBallPositions"])(rewindedBalls, pathRef.current);
                    return {
                        ...prev,
                        balls: updatedBalls
                    };
                }
            }["useGameState.useCallback[applyRewind]"]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["hapticFeedback"])('medium');
        }
    }["useGameState.useCallback[applyRewind]"], []);
    // addExtraLife вызывает resumeGame с флагом incrementLives
    const addExtraLife = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[addExtraLife]": (extraSeconds)=>{
            resumeGame({
                incrementLives: true
            });
        }
    }["useGameState.useCallback[addExtraLife]"], [
        resumeGame
    ]);
    const togglePause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[togglePause]": ()=>{
            isPausedRef.current = !isPausedRef.current;
            setIsPaused(isPausedRef.current);
            sendDebugLog(`[DEBUG] Game ${isPausedRef.current ? 'Paused' : 'Resumed'}`);
        }
    }["useGameState.useCallback[togglePause]"], []);
    const stepFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useGameState.useCallback[stepFrame]": ()=>{
            if (isPausedRef.current) {
                stepFrameRef.current = true;
                sendDebugLog(`[DEBUG] Stepping one frame`);
            }
        }
    }["useGameState.useCallback[stepFrame]"], []);
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
_s(useGameState, "J+E+vUmeBLDehroEhUZf2mP4Law=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=hooks_44472547._.js.map