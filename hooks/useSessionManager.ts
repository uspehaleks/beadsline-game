import { useState, useCallback, useRef } from 'react';

interface SessionState {
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number | null;
  pauseTime: number | null;
  elapsedTime: number;
  sessionStarted: boolean;
}

export function useSessionManager() {
  const [sessionState, setSessionState] = useState<SessionState>({
    isPlaying: false,
    isPaused: false,
    startTime: null,
    pauseTime: null,
    elapsedTime: 0,
    sessionStarted: false,
  });

  const accumulatedTimeRef = useRef(0);

  const startSession = useCallback(() => {
    const now = Date.now();
    setSessionState({
      isPlaying: true,
      isPaused: false,
      startTime: now,
      pauseTime: null,
      elapsedTime: 0,
      sessionStarted: true,
    });
    accumulatedTimeRef.current = 0;
  }, []);

  const pauseSession = useCallback(() => {
    if (sessionState.isPlaying && !sessionState.isPaused) {
      setSessionState(prev => ({
        ...prev,
        isPaused: true,
        pauseTime: Date.now(),
      }));
      accumulatedTimeRef.current = sessionState.elapsedTime;
    }
  }, [sessionState]);

  const resumeSession = useCallback(() => {
    if (sessionState.isPaused && sessionState.startTime) {
      const now = Date.now();
      const pausedDuration = now - (sessionState.pauseTime || now);
      const newStartTime = now - (sessionState.elapsedTime || 0) - pausedDuration;
      
      setSessionState(prev => ({
        ...prev,
        isPaused: false,
        startTime: newStartTime,
        pauseTime: null,
      }));
    }
  }, [sessionState]);

  const stopSession = useCallback(() => {
    setSessionState({
      isPlaying: false,
      isPaused: false,
      startTime: null,
      pauseTime: null,
      elapsedTime: 0,
      sessionStarted: false,
    });
    accumulatedTimeRef.current = 0;
  }, []);

  const updateElapsedTime = useCallback(() => {
    if (sessionState.isPlaying && !sessionState.isPaused && sessionState.startTime) {
      const now = Date.now();
      const elapsed = now - sessionState.startTime;
      const totalTime = accumulatedTimeRef.current + elapsed;
      
      setSessionState(prev => ({
        ...prev,
        elapsedTime: totalTime,
      }));
      
      return totalTime;
    }
    return sessionState.elapsedTime;
  }, [sessionState]);

  const getSessionTime = useCallback((): number => {
    if (sessionState.isPlaying && !sessionState.isPaused && sessionState.startTime) {
      const now = Date.now();
      return accumulatedTimeRef.current + (now - sessionState.startTime);
    }
    return sessionState.elapsedTime;
  }, [sessionState]);

  return {
    ...sessionState,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    updateElapsedTime,
    getSessionTime,
  };
}