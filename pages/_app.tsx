import { useState, useEffect } from 'react';
import App from './App';
import '../styles/globals.css'; // Импорт глобальных стилей
import { fredoka, inter } from '../lib/fonts'; // Import local fonts

// Обертка для SSR
export default function WrappedApp(props: any) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Возвращаем пустой div на сервере
    return <div />;
  }

  // Отображаем оригинальное приложение на клиенте с подключенными шрифтами
  return (
    <div className={`${fredoka.variable} ${inter.variable}`}>
      <App {...props} />
    </div>
  );
}