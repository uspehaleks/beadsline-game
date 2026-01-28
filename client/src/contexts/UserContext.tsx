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

      // Проверяем, есть ли параметр forceAdmin в URL
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminForced = urlParams.get('forceAdmin') === 'true' || urlParams.get('forceAdmin') === '1';

      // Если forceAdmin=true, сначала устанавливаем сессию на сервере
      if (process.env.NODE_ENV === 'development' && isAdminForced) {
        await fetch('/api/auth/me?forceAdmin=true', {
          method: 'GET',
          credentials: 'include'
        });
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
        // Попробуем получить данные пользователя без Telegram, если сессия существует
        try {
          const meResponse = await fetch('/api/auth/me', { credentials: 'include' });
          if (meResponse.ok) {
            const userData = await meResponse.json();
            setUser(userData);
          } else {
            // Для локальной разработки создаем фейкового пользователя, если нет сессии
            if (process.env.NODE_ENV === 'development') {
              const fakeUser = {
                id: 'dev-user-12345',
                telegramId: '123456789',
                username: 'dev_tester',
                firstName: 'Dev',
                lastName: 'Tester',
                photoUrl: null,
                totalPoints: 5000,
                gamesPlayed: 10,
                bestScore: 1500,
                btcBalance: 0.001,
                ethBalance: 0.01,
                usdtBalance: 10.5,
                btcBalanceSats: 100000,
                btcTodaySats: 0,
                ethBalanceWei: 10000000000000000,
                ethTodayWei: 0,
                usdtToday: "0.00",
                referralCode: 'DEVTEST',
                referredBy: null,
                directReferralsCount: 0,
                completedLevels: [1, 2, 3, 4, 5],
                signupBonusReceived: true,
                ratingScore: 1200,
                totalScore: 5000,
                totalWins: 5,
                currentWinStreak: 2,
                bestWinStreak: 5,
                totalCombo5Plus: 10,
                characterGender: 'male',
                characterName: 'Dev Player',
                characterEnergy: 100,
                characterHealthState: 'normal',
                characterMood: 'happy',
                bonusLives: 0,
                btcTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
                ethTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
                usdtTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
                lastActivityAt: new Date(),
                createdAt: new Date(),
                deletedAt: null,
                isAdmin: isAdminForced // Устанавливаем isAdmin в true, если forceAdmin=true
              };
              setUser(fakeUser);
            } else {
              // Если не в разработке, оставляем пользователя как null, но не устанавливаем ошибку
              setUser(null);
            }
          }
        } catch (err) {
          console.error('Error fetching user without Telegram:', err);
          // Для локальной разработки создаем фейкового пользователя при ошибке
          if (process.env.NODE_ENV === 'development') {
            const fakeUser = {
              id: 'dev-user-12345',
              telegramId: '123456789',
              username: 'dev_tester',
              firstName: 'Dev',
              lastName: 'Tester',
              photoUrl: null,
              totalPoints: 5000,
              gamesPlayed: 10,
              bestScore: 1500,
              btcBalance: 0.001,
              ethBalance: 0.01,
              usdtBalance: 10.5,
              btcBalanceSats: 100000,
              btcTodaySats: 0,
              ethBalanceWei: 10000000000000000,
              ethTodayWei: 0,
              usdtToday: "0.00",
              referralCode: 'DEVTEST',
              referredBy: null,
              directReferralsCount: 0,
              completedLevels: [1, 2, 3, 4, 5],
              signupBonusReceived: true,
              btcTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
              ethTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
              usdtTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
              lastActivityAt: new Date(),
              createdAt: new Date(),
              ratingScore: 1200,
              totalScore: 5000,
              totalWins: 5,
              currentWinStreak: 2,
              bestWinStreak: 5,
              totalCombo5Plus: 10,
              characterGender: 'male',
              characterName: 'Dev Player',
              characterEnergy: 100,
              characterHealthState: 'normal',
              characterMood: 'happy',
              bonusLives: 0,
              deletedAt: null,
              isAdmin: isAdminForced // Устанавливаем isAdmin в true, если forceAdmin=true
            };
            setUser(fakeUser);
          } else {
            setUser(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to initialize user:', err);
      setError('Failed to initialize user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      // Проверяем, есть ли параметр forceAdmin в URL
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminForced = urlParams.get('forceAdmin') === 'true' || urlParams.get('forceAdmin') === '1';

      // Если forceAdmin=true и мы в режиме разработки, сначала устанавливаем сессию на сервере
      if (process.env.NODE_ENV === 'development' && isAdminForced) {
        await fetch('/api/auth/me?forceAdmin=true', {
          method: 'GET',
          credentials: 'include'
        });
      }

      // Use /api/auth/me endpoint which checks session and returns current user data including admin status
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Если /api/auth.me возвращает 401, это может означать, что сессия была сброшена
        // В этом случае не пытаемся получить данные по старому user.id
        // Вместо этого, если в режиме разработки и есть forceAdmin, создаем фейкового администратора
        if (process.env.NODE_ENV === 'development' && isAdminForced) {
          const fakeUser = {
            id: 'dev-user-12345',
            telegramId: '123456789',
            username: 'dev_tester',
            firstName: 'Dev',
            lastName: 'Tester',
            photoUrl: null,
            totalPoints: 5000,
            gamesPlayed: 10,
            bestScore: 1500,
            btcBalance: 0.001,
            ethBalance: 0.01,
            usdtBalance: 10.5,
            btcBalanceSats: 100000,
            btcTodaySats: 0,
            ethBalanceWei: 10000000000000000,
            ethTodayWei: 0,
            usdtToday: "0.00",
            referralCode: 'DEVTEST',
            referredBy: null,
            directReferralsCount: 0,
            completedLevels: [1, 2, 3, 4, 5],
            signupBonusReceived: true,
            ratingScore: 1200,
            totalScore: 5000,
            totalWins: 5,
            currentWinStreak: 2,
            bestWinStreak: 5,
            totalCombo5Plus: 10,
            characterGender: 'male',
            characterName: 'Dev Player',
            characterEnergy: 100,
            characterHealthState: 'normal',
            characterMood: 'happy',
            bonusLives: 0,
            btcTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
            ethTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
            usdtTodayDate: new Date().toISOString().split('T')[0], // Добавляем отсутствующее поле
            lastActivityAt: new Date(),
            createdAt: new Date(),
            deletedAt: null,
            isAdmin: true // Устанавливаем isAdmin в true, если forceAdmin=true
          };
          setUser(fakeUser);
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
