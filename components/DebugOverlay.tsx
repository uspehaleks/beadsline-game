import { useEffect } from 'react';

declare global {
  interface Window {
    debugLog: (msg: string) => void;
  }
}

export function DebugOverlay() {
  useEffect(() => {
    // Создаем элемент оверлея, если его нет
    let overlayEl = document.getElementById('debug-overlay');
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.id = 'debug-overlay';
      overlayEl.style.position = 'fixed';
      overlayEl.style.top = '10px';
      overlayEl.style.left = '10px';
      overlayEl.style.background = 'rgba(0,0,0,0.8)';
      overlayEl.style.color = '#0f0';
      overlayEl.style.padding = '10px';
      overlayEl.style.zIndex = '9999';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.style.fontFamily = 'monospace';
      overlayEl.style.fontSize = '12px';
      overlayEl.style.border = '1px solid #0f0';

      overlayEl.innerHTML = `
        <h3 style="margin: 0 0 5px 0; color: #0f0; font-size: 14px;">DEBUG MONITOR</h3>
        <div id="debug-info" style="margin: 0;"></div>
      `;

      document.body.appendChild(overlayEl);
    }

    return () => {
      // Не удаляем глобальную функцию, так как она может использоваться в других местах
    };
  }, []);

  return null; // Компонент не рендерит ничего, только создает оверлей
}