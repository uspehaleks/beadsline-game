import { useState, useEffect } from 'react';
import App from '../client/src/App';

// Обертка для SSR
export default function WrappedApp(props) {
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