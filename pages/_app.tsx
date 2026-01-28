import { useState, useEffect } from 'react';
import App from './App';
import '../client/src/index.css';

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

  // Отображаем оригинальное приложение на клиенте
  return <App {...props} />;
}