import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@shared/schema';
import { getTelegramUser, initTelegramApp, isTelegramWebApp, getStartParam } from '@/lib/telegram';
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

      // First check if there's an existing session (e.g., admin login)
      try {
        const meResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (meResponse.ok) {
          const existingUser = await meResponse.json();
          setUser(existingUser);
          return;
        }
      } catch {
        // No existing session, continue with normal auth
      }

      const telegramUser = getTelegramUser();
      const startParam = getStartParam();
      
      if (telegramUser) {
        const response = await apiRequest('POST', '/api/auth/telegram', {
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || `user_${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          photoUrl: telegramUser.photo_url,
          startParam: startParam || undefined,
        });
        
        const data = await response.json();
        setUser(data);
      } else {
        setError('telegram_required');
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
      // Use /api/auth/me endpoint which checks session and returns current user data including admin status
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Fallback to /api/users/:id if /api/auth/me fails
        const userResponse = await fetch(`/api/users/${user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
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
