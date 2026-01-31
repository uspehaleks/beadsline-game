// services/logService.ts
// Сервис для глобального логирования

interface LogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

class LogService {
  private logs: LogEntry[] = [];
  private listeners: Array<(logs: LogEntry[]) => void> = [];
  private maxLogs = 1000;

  constructor() {
    // Инициализируем глобальный объект для логов
    if (typeof window !== 'undefined') {
      (window as any).__GAME_LOGS__ = this;
    }
  }

  addLog(message: string, level: LogEntry['level'] = 'info') {
    const entry: LogEntry = {
      timestamp: new Date(),
      message,
      level
    };

    this.logs.push(entry);

    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Уведомляем слушателей
    this.notifyListeners();
  }

  getLogs(): LogEntry[] {
    return [...this.logs]; // Возвращаем копию
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback);
    // Отправляем текущие логи новому подписчику
    callback(this.getLogs());
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getLogs());
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  // Методы для удобства
  info(message: string) {
    this.addLog(message, 'info');
  }

  warn(message: string) {
    this.addLog(message, 'warn');
  }

  error(message: string) {
    this.addLog(message, 'error');
  }

  debug(message: string) {
    this.addLog(message, 'debug');
  }
}

// Создаем глобальный экземпляр
export const logService = new LogService();

// Переопределяем console.log для перехвата логов
if (typeof window !== 'undefined') {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    logService.debug(message);
    originalLog.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    logService.warn(message);
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    logService.error(message);
    originalError.apply(console, args);
  };
}