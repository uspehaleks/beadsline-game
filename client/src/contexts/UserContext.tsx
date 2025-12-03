import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@shared/schema';
import { getTelegramUser, initTelegramApp, isTelegramWebApp } from '@/lib/telegram';
import { apiRequest } from '@/lib/queryClient';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isTelegramWebApp()) {
        initTelegramApp();
      }

      const telegramUser = getTelegramUser();
      
      if (telegramUser) {
        const response = await apiRequest('POST', '/api/auth/telegram', {
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || `user_${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          photoUrl: telegramUser.photo_url,
        });
        
        const data = await response.json();
        setUser(data);
      } else {
        const guestId = localStorage.getItem('guestUserId') || `guest_${Date.now()}`;
        localStorage.setItem('guestUserId', guestId);
        
        const response = await apiRequest('POST', '/api/auth/guest', {
          guestId,
        });
        
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to initialize user:', err);
      setError('Failed to initialize user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  useEffect(() => {
    initUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
