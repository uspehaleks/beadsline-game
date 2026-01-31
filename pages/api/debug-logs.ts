// pages/api/debug-logs.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Глобальный объект для хранения логов
if (!global.debugLogs) {
  global.debugLogs = [];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Возвращаем последние 100 логов
    const logs = global.debugLogs.slice(-100);
    res.status(200).json({ logs });
  } else if (req.method === 'POST') {
    // Добавляем новые логи
    const { logs } = req.body;
    if (Array.isArray(logs)) {
      global.debugLogs.push(...logs);
      // Ограничиваем размер массива
      if (global.debugLogs.length > 1000) {
        global.debugLogs = global.debugLogs.slice(-1000);
      }
    }
    res.status(200).json({ success: true });
  } else if (req.method === 'DELETE') {
    // Очищаем логи
    global.debugLogs = [];
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

declare global {
  var debugLogs: string[];
}