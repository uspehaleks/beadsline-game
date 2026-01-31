// pages/debug-logs.tsx
import { useState, useEffect, useCallback } from 'react';

// Компонент для отображения отладочных логов
export default function DebugLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(true);

  // Функция для получения логов с API
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/debug-logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  // Обновляем логи каждые 2 секунды
  useEffect(() => {
    if (isListening) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isListening, fetchLogs]);

  const clearLogs = async () => {
    try {
      await fetch('/api/debug-logs', { method: 'DELETE' });
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Отладочные логи</h1>
        
        <div className="mb-4 flex space-x-2">
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Очистить логи
          </button>
          
          <button
            onClick={toggleListening}
            className={`px-4 py-2 rounded-md transition-colors ${
              isListening 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isListening ? 'Пауза логов' : 'Продолжить логи'}
          </button>
          
          <span className="px-4 py-2 bg-blue-600 rounded-md">
            Всего логов: {logs.length}
          </span>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 h-[70vh] overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-400 italic">Логов пока нет...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`py-1 px-2 rounded ${
                    log.includes('ERROR') || log.includes('WARNING') 
                      ? 'bg-red-900/30 text-red-300' 
                      : log.includes('Ball') || log.includes('progress')
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Как использовать:</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>Откройте эту страницу в отдельной вкладке во время игры</li>
            <li>Все отладочные логи из игры будут отображаться здесь в реальном времени</li>
            <li>Используйте кнопки для управления отображением логов</li>
            <li>Обратите внимание на сообщения, содержащие "Ball", "progress", "pathPoint", "WARNING"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}