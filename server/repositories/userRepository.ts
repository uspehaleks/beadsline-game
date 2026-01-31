import { db } from '../db'; // Используем основное подключение для обычных запросов
import { users, type User } from '@shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';

export class UserRepository {
  /**
   * Создает нового пользователя
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return newUser;
  }

  /**
   * Находит пользователя по Telegram ID
   */
  async findByTelegramId(telegramId: string): Promise<User | null> {
    const user = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return user[0] || null;
  }

  /**
   * Находит пользователя по Telegram ID (совместимость с интерфейсом)
   */
  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    console.log("Searching user for:", telegramId);
    const user = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return user[0] || undefined;
  }

  /**
   * Находит пользователя по ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user[0] || null;
  }

  /**
   * Обновляет пользователя
   */
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Удаляет пользователя
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  /**
   * Получает всех пользователей
   */
  async getAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  /**
   * Увеличивает баланс пользователя
   */
  async incrementBalance(userId: string, currency: 'btc' | 'eth' | 'usdt', amount: number): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        [`_${currency}Balance`]: sql`${users[`_${currency}Balance`]} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Устанавливает баланс пользователя
   */
  async setBalance(userId: string, currency: 'btc' | 'eth' | 'usdt', amount: number): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        [`_${currency}Balance`]: amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Проверяет, является ли пользователь администратором
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user?.isAdmin || false;
  }

  /**
   * Получает топ пользователей по очкам
   */
  async getTopUsers(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(sql`${users.totalPoints} DESC`)
      .limit(limit);
  }

  /**
   * Получает количество пользователей
   */
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    return result[0]?.count || 0;
  }

  /**
   * Обновляет статистику пользователя
   */
  async updateStats(userId: string, stats: {
    gamesPlayed?: number;
    bestScore?: number;
    totalPoints?: number;
  }): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        ...stats,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Проверяет существование пользователя
   */
  async exists(telegramId: string): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    return user !== null;
  }

  /**
   * Обновляет время последней активности
   */
  async updateLastActivity(userId: string): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({ lastActivityAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Получает пользователей, активных за последние N дней
   */
  async getActiveUsers(days: number = 7): Promise<User[]> {
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db
      .select()
      .from(users)
      .where(sql`${users.lastActivityAt} > ${dateThreshold}`)
      .orderBy(sql`${users.lastActivityAt} DESC`);
  }

  /**
   * Получает пользователей по реферальному коду
   */
  async getUsersByReferralCode(referralCode: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
  }

  /**
   * Обновляет реферальную информацию
   */
  async updateReferralInfo(userId: string, referralInfo: {
    referralCode?: string;
    referredBy?: string;
    directReferralsCount?: number;
  }): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        ...referralInfo,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Получает пользователей с фильтрацией
   */
  async getUsersWithFilters(filters: {
    isAdmin?: boolean;
    hasCompletedLevels?: boolean;
    minPoints?: number;
    maxPoints?: number;
  }): Promise<User[]> {
    let query = db.select().from(users);

    if (filters.isAdmin !== undefined) {
      query = query.where(eq(users.isAdmin, filters.isAdmin));
    }

    if (filters.hasCompletedLevels !== undefined) {
      if (filters.hasCompletedLevels) {
        query = query.where(sql`${users.completedLevels} != '{}'`);
      } else {
        query = query.where(sql`${users.completedLevels} = '{}'`);
      }
    }

    if (filters.minPoints !== undefined) {
      query = query.where(sql`${users.totalPoints} >= ${filters.minPoints}`);
    }

    if (filters.maxPoints !== undefined) {
      query = query.where(sql`${users.totalPoints} <= ${filters.maxPoints}`);
    }

    return await query;
  }

  /**
   * Обновляет уровень пользователя
   */
  async updateUserLevel(userId: string, level: number): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        level,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Обновляет информацию о персонаже
   */
  async updateCharacterInfo(userId: string, characterInfo: {
    characterGender?: 'male' | 'female';
    characterName?: string;
    characterEnergy?: number;
    characterHealthState?: 'normal' | 'tired' | 'sick';
    characterMood?: 'happy' | 'neutral' | 'sad';
  }): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        ...characterInfo,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Увеличивает количество бонусных жизней
   */
  async incrementBonusLives(userId: string, amount: number): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({
        bonusLives: sql`${users.bonusLives} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser || null;
  }

  /**
   * Сбрасывает ежедневные лимиты
   */
  async resetDailyLimits(): Promise<void> {
    await db.update(users).set({
      btcTodaySats: 0,
      ethTodayWei: 0,
      usdtToday: '0',
      btcTodayDate: new Date(),
      ethTodayDate: new Date(),
      usdtTodayDate: new Date(),
    });
  }

  /**
   * Проверяет дневные лимиты
   */
  async checkDailyLimits(userId: string, cryptoType: 'btc' | 'eth' | 'usdt'): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (cryptoType) {
      case 'btc':
        return user.btcTodayDate?.getTime() !== today.getTime();
      case 'eth':
        return user.ethTodayDate?.getTime() !== today.getTime();
      case 'usdt':
        return user.usdtTodayDate?.getTime() !== today.getTime();
      default:
        return false;
    }
  }

  /**
   * Мягкое удаление пользователя (установка deletedAt)
   */
  async softDeleteUser(userId: string): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || null;
  }

  /**
   * Жесткое удаление пользователя (полное удаление из базы)
   */
  async hardDeleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount > 0;
  }

  /**
   * Восстановление мягко удаленного пользователя
   */
  async restoreUser(userId: string): Promise<User | null> {
    const [updatedUser] = await db.update(users)
      .set({ deletedAt: null })
      .where(and(eq(users.id, userId), sql`${users.deletedAt} IS NOT NULL`))
      .returning();

    return updatedUser || null;
  }

  /**
   * Обновляет пользователя (совместимость с интерфейсом IStorage)
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || undefined;
  }

  /**
   * Получает всех пользователей с возможностью пагинации и фильтрации по удаленным
   */
  async getAllUsers(limit: number = 50, offset: number = 0, includeDeleted: boolean = true): Promise<User[]> {
    let query = db.select().from(users);

    if (!includeDeleted) {
      query = query.where(sql`${users.deletedAt} IS NULL`);
    }

    query = query.limit(limit).offset(offset);

    return await query;
  }

  /**
   * Получает активных пользователей с пагинацией
   */
  async getActiveUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`)
      .orderBy(sql`${users.lastActivityAt} DESC`)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Получает количество пользователей с возможностью фильтрации по удаленным
   */
  async getUserCount(includeDeleted: boolean = false): Promise<number> {
    let query = db.select({ count: sql<number>`COUNT(*)` }).from(users);

    if (!includeDeleted) {
      query = query.where(sql`${users.deletedAt} IS NULL`);
    }

    const result = await query;
    return result[0]?.count || 0;
  }

  /**
   * Получает всех администраторов
   */
  async getAdmins(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true));
  }
}