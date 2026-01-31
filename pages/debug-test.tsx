import { useState, useEffect } from 'react';

// Простая тестовая страница
export default function DebugLogsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Тестовая страница логов</h1>
        <p>Если вы видите это сообщение, маршрут работает.</p>
      </div>
    </div>
  );
}