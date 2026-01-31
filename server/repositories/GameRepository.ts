import { db } from '../db'; // Используем основное подключение для обычных запросов
import { eq, desc, sql, isNull, and, or, gte, sum, ilike, count, inArray } from 'drizzle-orm';
import {
  gameScores,
  type GameScore,
  users,
  type User,
  gameConfig,
  type GameConfig,
  prizePool,
  type PrizePool,
  usdtFundSettings,
  type UsdtFundSettings,
  realRewards,
  type RealReward,
  referralRewards,
  type ReferralReward,
  beadsTransactions,
  type BeadsTransaction,
  type InsertGameScore,
  type InsertBeadsTransaction,
  type TransactionType,
  type GameplayConfig,
  type GameEconomyConfig,
  type LivesConfig,
  type ReferralConfig,
  type ReferralInfo,
  type ReferralUserStats,
  type UsdtFundStats,
  type RewardResult,
  type HouseAccountConfig,
  type InsertGameConfig,
  type InsertPrizePool,
  type InsertUsdtFundSettings,
  type InsertRealReward,
  type InsertReferralReward,
  type InsertBeadsTransaction,
  type LeaderboardEntry,
  type AdminCryptoBalances,
  type UserUpdate,
  type BeadsBoxSession,
  type InsertBeadsBoxSession,
  type CryptoGameTicket,
  type InsertCryptoGameTicket,
  type BeadsBoxReward,
  type BeadsBoxConfig,
  type Season,
  type InsertSeason,
  type SeasonResult,
  type InsertSeasonResult,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type WithdrawalConfig,
  type LevelConfig,
  type InsertLevelConfig,
  cryptoGameTickets,
  beadsBoxSessions,
  seasons,
  seasonResults,
  withdrawalRequests,
  levelConfigs,
} from '@shared/schema';

export class GameRepository {
  /**
   * Создает новую запись о результатах игры
   */
  async createGameScore(scoreData: Omit<GameScore, 'id' | 'createdAt'>): Promise<GameScore> {
    const [newScore] = await db.insert(gameScores).values({
      ...scoreData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }).returning();

    return newScore;
  }

  /**
   * Получает результаты игры пользователя
   */
  async getUserScores(userId: string, limit: number = 10): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.odUserId, userId))
      .orderBy(desc(gameScores.createdAt))
      .limit(limit);
  }

  /**
   * Получает все результаты игр
   */
  async getAllScores(limit: number = 50, offset: number = 0): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .orderBy(desc(gameScores.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Получает количество всех результатов игр
   */
  async getScoreCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(gameScores);
    return Number(result[0]?.count || 0);
  }

  /**
   * Получает таблицу лидеров
   */
  async getLeaderboard(limit: number = 50, period: 'all' | 'week' | 'today' = 'all'): Promise<LeaderboardEntry[]> {
    // Ограничиваем максимальное количество результатов до 100
    const maxLimit = Math.min(limit, 100);

    if (period === 'all') {
      // Рейтинг по рейтинговым очкам для общего списка
      const result = await db.execute(sql`
        SELECT
          u.id,
          u.username,
          u.photo_url,
          u.rating_score,
          u.total_points,
          u.games_played,
          u.best_score,
          c.name as character_name,
          (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
        FROM users u
        LEFT JOIN characters c ON c.user_id = u.id
        WHERE u.deleted_at IS NULL AND u.rating_score > 0
        ORDER BY u.rating_score DESC
        LIMIT ${maxLimit}
      `);

      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        photoUrl: row.photo_url,
        totalPoints: Number(row.total_points),
        ratingScore: Number(row.rating_score),
        gamesPlayed: row.games_played,
        bestScore: row.best_score,
        characterName: row.character_name || null,
        characterImageUrl: row.character_image_url || null,
      }));
    } else {
      // Недельный/дневной рейтинг
      const dateCondition = period === 'today'
        ? sql`bt.created_at >= CURRENT_DATE`
        : sql`bt.created_at >= CURRENT_DATE - INTERVAL '7 days'`;

      const result = await db.execute(sql`
        SELECT
          u.id,
          u.username,
          u.photo_url,
          u.total_points,
          u.rating_score,
          COALESCE(SUM(bt.amount), 0)::integer as period_beads,
          u.games_played,
          u.best_score,
          c.name as character_name,
          (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
        FROM users u
        LEFT JOIN beads_transactions bt ON bt.user_id = u.id
          AND bt.type = 'game_win_reward'
          AND ${dateCondition}
          AND bt.deleted_at IS NULL
        LEFT JOIN characters c ON c.user_id = u.id
        WHERE u.deleted_at IS NULL
        GROUP BY u.id, u.username, u.photo_url, u.total_points, u.rating_score, u.games_played, u.best_score, c.name, c.gender
        HAVING COALESCE(SUM(bt.amount), 0) > 0
        ORDER BY period_beads DESC
        LIMIT ${maxLimit}
      `);

      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        photoUrl: row.photo_url,
        totalPoints: Number(row.total_points),
        ratingScore: Number(row.rating_score),
        gamesPlayed: row.games_played,
        bestScore: row.best_score,
        characterName: row.character_name || null,
        characterImageUrl: row.character_image_url || null,
      }));
    }
  }

  /**
   * Получает таблицу лидеров друзей
   */
  async getFriendsLeaderboardGlobal(userId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    // Получаем лигу пользователя для определения, каких друзей включать
    const userResult = await db
      .select({
        id: users.id,
        leagueSlug: users.ratingScore, // Используем рейтинговый балл для определения лиги косвенно
      })
      .from(users)
      .where(eq(users.id, userId))
      .leftJoin(seasonResults, eq(users.id, seasonResults.userId)); // Присоединяем результаты сезона для получения информации о лиге

    if (!userResult[0]) {
      return [];
    }

    // Для таблицы лидеров друзей мы получим пользователей, с которыми текущий пользователь взаимодействовал
    // Это упрощенная реализация - в реальном приложении у вас может быть таблица друзей
    const result = await db.execute(sql`
      SELECT
        u.id,
        u.username,
        u.photo_url,
        u.rating_score,
        u.total_points,
        u.games_played,
        u.best_score,
        c.name as character_name,
        (SELECT bb.image_url FROM base_bodies bb WHERE bb.gender = c.gender LIMIT 1) as character_image_url
      FROM users u
      LEFT JOIN characters c ON c.user_id = u.id
      WHERE u.deleted_at IS NULL
        AND u.id != ${userId}
        AND u.rating_score > 0
      ORDER BY u.rating_score DESC
      LIMIT ${limit}
    `);

    return result.rows.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.id,
      username: row.username,
      photoUrl: row.photo_url,
      totalPoints: Number(row.total_points),
      ratingScore: Number(row.rating_score),
      gamesPlayed: row.games_played,
      bestScore: row.best_score,
      characterName: row.character_name || null,
      characterImageUrl: row.character_image_url || null,
    }));
  }

  /**
   * Получает конфигурацию игры по ключу
   */
  async getGameConfig(key: string): Promise<GameConfig | undefined> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, key));
    return config || undefined;
  }

  /**
   * Получает все конфигурации игры
   */
  async getAllGameConfigs(): Promise<GameConfig[]> {
    return await db.select().from(gameConfig);
  }

  /**
   * Устанавливает конфигурацию игры
   */
  async setGameConfig(config: InsertGameConfig): Promise<GameConfig> {
    const [existing] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, config.key));

    if (existing) {
      const [updated] = await db
        .update(gameConfig)
        .set(config)
        .where(eq(gameConfig.key, config.key))
        .returning();
      return updated;
    } else {
      const [newConfig] = await db
        .insert(gameConfig)
        .values(config)
        .returning();
      return newConfig;
    }
  }

  /**
   * Удаляет конфигурацию игры
   */
  async deleteGameConfig(key: string): Promise<void> {
    await db.delete(gameConfig).where(eq(gameConfig.key, key));
  }

  /**
   * Получает балансы криптовалюты администратора
   */
  async getAdminCryptoBalances(): Promise<AdminCryptoBalances> {
    const settings = await this.getUsdtFundSettings();
    const [userResult] = await db
      .select({
        totalBtc: sql<number>`sum(${users.btcBalanceSats})::integer`,
        totalEth: sql<number>`sum(${users.ethBalanceWei})::integer`,
        totalUsdt: sql<number>`sum(${users.usdtBalance})`,
      })
      .from(users);

    return {
      totalBtcSats: userResult?.totalBtc || 0,
      totalEthWei: userResult?.totalEth || 0,
      totalUsdt: userResult?.totalUsdt || 0,
      availableBtcSats: settings.btcBalanceSats,
      availableEthWei: settings.ethBalanceWei,
      availableUsdt: settings.usdtBalance,
    };
  }

  /**
   * Устанавливает балансы криптовалюты администратора
   */
  async setAdminCryptoBalances(balances: AdminCryptoBalances): Promise<AdminCryptoBalances> {
    const settings = await this.getUsdtFundSettings();

    // Обновляем настройки фонда USDT
    await db
      .update(usdtFundSettings)
      .set({
        btcBalanceSats: balances.availableBtcSats,
        ethBalanceWei: balances.availableEthWei,
        usdtBalance: balances.availableUsdt,
      })
      .where(eq(usdtFundSettings.id, settings.id));

    return balances;
  }

  /**
   * Получает призовой фонд по ID
   */
  async getPrizePool(id: string): Promise<PrizePool | undefined> {
    const [pool] = await db
      .select()
      .from(prizePool)
      .where(eq(prizePool.id, id));
    return pool || undefined;
  }

  /**
   * Получает активный призовой фонд
   */
  async getActivePrizePool(): Promise<PrizePool | undefined> {
    const [pool] = await db
      .select()
      .from(prizePool)
      .where(eq(prizePool.isActive, true));
    return pool || undefined;
  }

  /**
   * Получает все призовые фонды
   */
  async getAllPrizePools(): Promise<PrizePool[]> {
    return await db
      .select()
      .from(prizePool)
      .orderBy(desc(prizePool.createdAt));
  }

  /**
   * Создает новый призовой фонд
   */
  async createPrizePool(pool: InsertPrizePool): Promise<PrizePool> {
    const [newPool] = await db
      .insert(prizePool)
      .values(pool)
      .returning();
    return newPool;
  }

  /**
   * Обновляет призовой фонд
   */
  async updatePrizePool(id: string, pool: Partial<InsertPrizePool>): Promise<PrizePool | undefined> {
    const [updatedPool] = await db
      .update(prizePool)
      .set(pool)
      .where(eq(prizePool.id, id))
      .returning();
    return updatedPool || undefined;
  }

  /**
   * Удаляет призовой фонд
   */
  async deletePrizePool(id: string): Promise<void> {
    await db.delete(prizePool).where(eq(prizePool.id, id));
  }

  /**
   * Получает настройки фонда USDT
   */
  async getUsdtFundSettings(): Promise<UsdtFundSettings> {
    const [settings] = await db
      .select()
      .from(usdtFundSettings)
      .orderBy(desc(usdtFundSettings.updatedAt))
      .limit(1);

    if (!settings) {
      // Если настройки не существуют, создаем настройки по умолчанию
      const [defaultSettings] = await db
        .insert(usdtFundSettings)
        .values({
          usdtTotalFund: 50,
          usdtAvailable: 50,
          usdtDailyLimit: 1.0,
          usdtPerDrop: 0.02,
          usdtMaxPerUserPerDay: 0.1,
          usdtDistributedToday: 0,
        })
        .returning();
      return defaultSettings;
    }

    return settings;
  }

  /**
   * Обновляет настройки фонда USDT
   */
  async updateUsdtFundSettings(updates: Partial<InsertUsdtFundSettings>): Promise<UsdtFundSettings> {
    const currentSettings = await this.getUsdtFundSettings();

    const [updatedSettings] = await db
      .update(usdtFundSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(usdtFundSettings.id, currentSettings.id))
      .returning();

    return updatedSettings;
  }

  /**
   * Получает статистику фонда USDT
   */
  async getUsdtFundStats(): Promise<UsdtFundStats> {
    const settings = await this.getUsdtFundSettings();
    const today = new Date().toISOString().split('T')[0];

    // Рассчитываем общее количество распределенного сегодня
    const [dailyTotalResult] = await db
      .select({ total: sql<number>`sum(${realRewards.amount})` })
      .from(realRewards)
      .where(sql`${realRewards.createdAt}::date = ${today}::date`);

    return {
      totalFund: settings.usdtTotalFund,
      available: settings.usdtAvailable,
      dailyLimit: settings.usdtDailyLimit,
      perDrop: settings.usdtPerDrop,
      maxPerUserPerDay: settings.usdtMaxPerUserPerDay,
      distributedToday: settings.usdtDistributedToday,
      dailyTotalDistributed: Number(dailyTotalResult?.total || 0),
    };
  }

  /**
   * Создает реальную награду
   */
  async createRealReward(reward: InsertRealReward): Promise<RealReward> {
    const [newReward] = await db
      .insert(realRewards)
      .values(reward)
      .returning();
    return newReward;
  }

  /**
   * Получает награды пользователя за сегодня
   */
  async getUserRewardsToday(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const [result] = await db
      .select({ total: sql<number>`sum(${realRewards.amount})` })
      .from(realRewards)
      .where(
        and(
          eq(realRewards.userId, userId),
          sql`${realRewards.createdAt}::date = ${today}::date`
        )
      );

    return Number(result?.total || 0);
  }

  /**
   * Получает общее количество распределенных наград
   */
  async getTotalDistributed(): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`sum(${realRewards.amount})` })
      .from(realRewards);

    return Number(result?.total || 0);
  }

  /**
   * Получает количество распределенных наград за сегодня
   */
  async getDistributedToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const [result] = await db
      .select({ total: sql<number>`sum(${realRewards.amount})` })
      .from(realRewards)
      .where(sql`${realRewards.createdAt}::date = ${today}::date`);

    return Number(result?.total || 0);
  }

  /**
   * Обрабатывает награду USDT
   */
  async processUsdtReward(userId: string, usdtBallsCollected: number, gameScoreId: string): Promise<RewardResult> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      throw new Error('User not found');
    }

    const settings = await this.getUsdtFundSettings();
    const userDailyRewards = await this.getUserRewardsToday(userId);

    // Рассчитываем потенциальную награду
    const potentialReward = usdtBallsCollected * settings.usdtPerDrop;
    const maxPossibleReward = settings.usdtMaxPerUserPerDay - userDailyRewards;
    const actualReward = Math.min(potentialReward, maxPossibleReward, settings.usdtAvailable);

    if (actualReward <= 0) {
      return {
        success: false,
        error: 'No USDT reward available (daily limit reached or insufficient funds)',
        amount: 0,
        newBalance: user[0].usdtBalance,
      };
    }

    // Обновляем баланс пользователя
    const [updatedUser] = await db
      .update(users)
      .set({
        usdtBalance: user[0].usdtBalance + actualReward,
        usdtToday: user[0].usdtToday + actualReward,
        usdtTodayDate: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Обновляем настройки фонда
    await this.updateUsdtFundSettings({
      usdtAvailable: settings.usdtAvailable - actualReward,
      usdtDistributedToday: settings.usdtDistributedToday + actualReward,
    });

    // Создаем запись о награде
    await this.createRealReward({
      userId,
      cryptoType: 'USDT',
      amount: actualReward,
      balanceBefore: user[0].usdtBalance,
      balanceAfter: updatedUser.usdtBalance,
      description: `USDT reward from ${usdtBallsCollected} balls collected`,
      gameScoreId,
    });

    return {
      success: true,
      amount: actualReward,
      newBalance: updatedUser.usdtBalance,
    };
  }

  /**
   * Проверяет, доступен ли фонд USDT
   */
  async isUsdtFundAvailable(): Promise<boolean> {
    const settings = await this.getUsdtFundSettings();
    return settings.usdtAvailable > 0;
  }

  /**
   * Получает конфигурацию экономики игры
   */
  async getGameEconomyConfig(): Promise<GameEconomyConfig> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, 'game_economy'));

    if (!config) {
      // Возвращаем значения по умолчанию, если конфигурация не существует
      return {
        cryptoRewards: {
          enabled: true,
          minBtcReward: 0.00000001,
          maxBtcReward: 0.00001,
          minEthReward: 0.000000000000000001,
          maxEthReward: 0.00000000000001,
          minUsdtReward: 0.00000001,
          maxUsdtReward: 0.1,
        },
        dailyLimits: {
          maxBtcPerUser: 0.0001,
          maxEthPerUser: 0.0000000000001,
          maxUsdtPerUser: 1,
        },
        perGameLimits: {
          maxBtcPerGame: 0.00001,
          maxEthPerGame: 0.00000000000001,
          maxUsdtPerGame: 0.1,
        },
        pools: {
          btcBalanceSats: 1000000, // 0.01 BTC
          ethBalanceWei: 10000000000000000000n, // 10 ETH
          usdtBalance: 1000, // 1000 USDT
        },
        fundToggles: {
          cryptoFundEnabled: true,
          usdtFundEnabled: true,
        },
        livesConfig: {
          baseLives: 3,
          maxLives: 5,
          liveCost: 100, // стоимость жизни в бусинах
          livesRefillTime: 30 * 60 * 1000, // 30 минут в миллисекундах
        },
        gameplayConfig: {
          baseScoreMultiplier: 1,
          comboMultiplier: 1.1,
          maxComboMultiplier: 5,
          levelThreshold: 1000,
        },
        referralConfig: {
          enabled: true,
          directReferralReward: 100, // бусин
          indirectReferralReward: 50, // бусин
          maxLevels: 3, // максимальное количество уровней рефералов
        },
      };
    }

    return config.value as GameEconomyConfig;
  }

  /**
   * Обновляет конфигурацию экономики игры
   */
  async updateGameEconomyConfig(config: Partial<GameEconomyConfig>): Promise<GameEconomyConfig> {
    const existing = await this.getGameEconomyConfig();
    const updatedConfig = { ...existing, ...config };

    await db
      .insert(gameConfig)
      .values({
        key: 'game_economy',
        value: updatedConfig,
        description: 'Game economy configuration',
      })
      .onConflictDoUpdate({
        target: [gameConfig.key],
        set: {
          value: updatedConfig,
          updatedAt: new Date(),
        },
      });

    return updatedConfig;
  }

  /**
   * Обрабатывает награды криптовалюты
   */
  async processCryptoRewards(userId: string, cryptoBtc: number, cryptoEth: number, cryptoUsdt: number, gameScoreId?: string): Promise<{ btcAwarded: number; ethAwarded: number; usdtAwarded: number; btcSatsAwarded: number; ethWeiAwarded: number }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      throw new Error('User not found');
    }

    const config = await this.getGameEconomyConfig();

    // Рассчитываем награды с учетом ограничений
    let btcReward = Math.min(cryptoBtc, config.cryptoRewards.maxBtcReward);
    let ethReward = Math.min(cryptoEth, config.cryptoRewards.maxEthReward);
    let usdtReward = Math.min(cryptoUsdt, config.cryptoRewards.maxUsdtReward);

    // Проверяем доступность пула
    if (config.fundToggles.cryptoFundEnabled) {
      if (btcReward > 0 && config.pools.btcBalanceSats < btcReward) {
        btcReward = Math.min(btcReward, config.pools.btcBalanceSats);
      }
      if (ethReward > 0 && config.pools.ethBalanceWei < ethReward) {
        ethReward = Math.min(ethReward, config.pools.ethBalanceWei);
      }
    }

    if (config.fundToggles.usdtFundEnabled) {
      if (usdtReward > 0 && config.pools.usdtBalance < usdtReward) {
        usdtReward = Math.min(usdtReward, config.pools.usdtBalance);
      }
    }

    // Обновляем балансы пользователя
    const [updatedUser] = await db
      .update(users)
      .set({
        btcBalanceSats: user[0].btcBalanceSats + Math.floor(btcReward),
        ethBalanceWei: user[0].ethBalanceWei + Math.floor(ethReward),
        usdtBalance: user[0].usdtBalance + usdtReward,
        // Обновляем сегодняшние значения, если это новый день
        ...(user[0].btcTodayDate?.toDateString() !== new Date().toDateString() && {
          btcTodaySats: Math.floor(btcReward),
          btcTodayDate: new Date(),
        }),
        ...(user[0].ethTodayDate?.toDateString() !== new Date().toDateString() && {
          ethTodayWei: Math.floor(ethReward),
          ethTodayDate: new Date(),
        }),
        ...(user[0].usdtTodayDate?.toDateString() !== new Date().toDateString() && {
          usdtToday: usdtReward,
          usdtTodayDate: new Date(),
        }),
      })
      .where(eq(users.id, userId))
      .returning();

    // Обновляем пулы, если фонды включены
    if (config.fundToggles.cryptoFundEnabled || config.fundToggles.usdtFundEnabled) {
      const updatedPools = {
        ...config.pools,
      };

      if (config.fundToggles.cryptoFundEnabled) {
        updatedPools.btcBalanceSats = Math.max(0, config.pools.btcBalanceSats - Math.floor(btcReward));
        updatedPools.ethBalanceWei = Math.max(0, config.pools.ethBalanceWei - Math.floor(ethReward));
      }

      if (config.fundToggles.usdtFundEnabled) {
        updatedPools.usdtBalance = Math.max(0, config.pools.usdtBalance - usdtReward);
      }

      await this.updateGameEconomyConfig({
        pools: updatedPools,
      });
    }

    // Создаем записи о наградах, если были выданы награды
    if (btcReward > 0) {
      await this.createRealReward({
        userId,
        cryptoType: 'BTC',
        amount: btcReward,
        balanceBefore: user[0].btcBalance,
        balanceAfter: updatedUser.btcBalance,
        description: 'BTC reward from game',
        gameScoreId: gameScoreId || null,
      });
    }

    if (ethReward > 0) {
      await this.createRealReward({
        userId,
        cryptoType: 'ETH',
        amount: ethReward,
        balanceBefore: user[0].ethBalance,
        balanceAfter: updatedUser.ethBalance,
        description: 'ETH reward from game',
        gameScoreId: gameScoreId || null,
      });
    }

    if (usdtReward > 0) {
      await this.createRealReward({
        userId,
        cryptoType: 'USDT',
        amount: usdtReward,
        balanceBefore: user[0].usdtBalance,
        balanceAfter: updatedUser.ethBalance,
        description: 'USDT reward from game',
        gameScoreId: gameScoreId || null,
      });
    }

    return {
      btcAwarded: btcReward,
      ethAwarded: ethReward,
      usdtAwarded: usdtReward,
      btcSatsAwarded: Math.floor(btcReward),
      ethWeiAwarded: Math.floor(ethReward),
    };
  }

  /**
   * Получает пользователя по реферальному коду
   */
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user || undefined;
  }

  /**
   * Генерирует реферальный код
   */
  generateReferralCode(): string {
    // Генерируем случайный реферальный код
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Обеспечивает наличие у пользователя реферального кода
   */
  async ensureUserHasReferralCode(userId: string): Promise<string> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      throw new Error('User not found');
    }

    if (user[0].referralCode) {
      return user[0].referralCode;
    }

    // Генерируем уникальный реферальный код
    let referralCode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      referralCode = this.generateReferralCode();
      const existingUser = await this.getUserByReferralCode(referralCode);
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Could not generate unique referral code');
    }

    // Обновляем пользователя с реферальным кодом
    await db
      .update(users)
      .set({ referralCode })
      .where(eq(users.id, userId));

    return referralCode;
  }

  /**
   * Обрабатывает реферала
   */
  async processReferral(newUserId: string, referrerCode: string): Promise<boolean> {
    const referrer = await this.getUserByReferralCode(referrerCode);
    if (!referrer) {
      return false;
    }

    // Обновляем количество прямых рефералов у реферера
    await db
      .update(users)
      .set({
        directReferralsCount: referrer.directReferralsCount + 1,
      })
      .where(eq(users.id, referrer.id));

    // Связываем нового пользователя с реферером
    await db
      .update(users)
      .set({
        referredBy: referrer.id,
      })
      .where(eq(users.id, newUserId));

    return true;
  }

  /**
   * Получает конфигурацию реферальной системы
   */
  async getReferralConfig(): Promise<ReferralConfig> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, 'referral_config'));

    if (!config) {
      return {
        enabled: true,
        directReferralReward: 100,
        indirectReferralReward: 50,
        maxLevels: 3,
      };
    }

    return config.value as ReferralConfig;
  }

  /**
   * Обновляет конфигурацию реферальной системы
   */
  async updateReferralConfig(config: Partial<ReferralConfig>): Promise<ReferralConfig> {
    const existing = await this.getReferralConfig();
    const updatedConfig = { ...existing, ...config };

    await db
      .insert(gameConfig)
      .values({
        key: 'referral_config',
        value: updatedConfig,
        description: 'Referral system configuration',
      })
      .onConflictDoUpdate({
        target: [gameConfig.key],
        set: {
          value: updatedConfig,
          updatedAt: new Date(),
        },
      });

    return updatedConfig;
  }

  /**
   * Получает информацию о рефералах пользователя
   */
  async getReferralInfo(userId: string, botUsername: string): Promise<ReferralInfo> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      throw new Error('User not found');
    }

    const referralCode = await this.ensureUserHasReferralCode(userId);

    // Получаем статистику рефералов
    const [statsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.referredBy, userId));

    const directReferralsCount = Number(statsResult?.count || 0);

    // Получаем общее количество бусин, заработанных через рефералов
    const [totalBeadsResult] = await db
      .select({ total: sql<number>`sum(${referralRewards.beadsAmount})` })
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId));

    const totalReferralBeads = Number(totalBeadsResult?.total || 0);

    return {
      referralLink: `https://t.me/${botUsername}?start=${referralCode}`,
      referralCode,
      directReferralsCount,
      totalReferralBeads,
    };
  }

  /**
   * Создает реферальную награду
   */
  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const [newReward] = await db
      .insert(referralRewards)
      .values(reward)
      .returning();
    return newReward;
  }

  /**
   * Обрабатывает реферальные награды
   */
  async processReferralRewards(gameScoreId: string, playerId: string, beadsEarned: number): Promise<void> {
    // Получаем результат игры для доступа к информации о игроке
    const [gameScore] = await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.id, gameScoreId));

    if (!gameScore) {
      throw new Error('Game score not found');
    }

    const config = await this.getReferralConfig();
    if (!config.enabled) {
      return;
    }

    // Находим цепочку рефералов (ограничено maxLevels)
    let currentUserId = playerId;
    let level = 1;

    while (currentUserId && level <= config.maxLevels) {
      const user = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1);
      if (!user[0] || !user[0].referredBy) {
        break;
      }

      // Рассчитываем награду для этого уровня
      const rewardAmount = level === 1
        ? config.directReferralReward
        : Math.floor(config.indirectReferralReward / level);

      if (rewardAmount > 0) {
        // Начисляем бусины рефереру
        await this.awardBeadsWithHouse(
          user[0].referredBy,
          rewardAmount,
          'referral_reward',
          `Referral reward (level ${level}) for user ${playerId}'s game`
        );

        // Записываем реферальную награду
        await this.createReferralReward({
          userId: user[0].referredBy,
          refUserId: currentUserId,
          level,
          beadsAmount: rewardAmount,
          gameScoreId,
        });
      }

      // Переходим по цепочке рефералов
      currentUserId = user[0].referredBy;
      level++;
    }
  }

  /**
   * Получает реферальные награды пользователя
   */
  async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    return await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId))
      .orderBy(desc(referralRewards.createdAt));
  }

  /**
   * Получает общее количество бусин, заработанных через рефералов
   */
  async getTotalReferralBeads(userId: string): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`sum(${referralRewards.beadsAmount})` })
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId));

    return Number(result?.total || 0);
  }

  /**
   * Получает переключатели фондов
   */
  async getFundToggles(): Promise<{ cryptoFundEnabled: boolean; usdtFundEnabled: boolean }> {
    const config = await this.getGameEconomyConfig();
    return {
      cryptoFundEnabled: config.fundToggles.cryptoFundEnabled,
      usdtFundEnabled: config.fundToggles.usdtFundEnabled,
    };
  }

  /**
   * Получает конфигурацию домашнего аккаунта
   */
  async getHouseAccount(): Promise<HouseAccountConfig> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, 'house_account'));

    if (!config) {
      return {
        beadsBalance: 1000000,
        totalEarned: 0,
        totalPaidOut: 0,
      };
    }

    return config.value as HouseAccountConfig;
  }

  /**
   * Обновляет конфигурацию домашнего аккаунта
   */
  async updateHouseAccount(updates: Partial<HouseAccountConfig>): Promise<HouseAccountConfig> {
    const existing = await this.getHouseAccount();
    const updatedConfig = { ...existing, ...updates };

    await db
      .insert(gameConfig)
      .values({
        key: 'house_account',
        value: updatedConfig,
        description: 'House account configuration',
      })
      .onConflictDoUpdate({
        target: [gameConfig.key],
        set: {
          value: updatedConfig,
          updatedAt: new Date(),
        },
      });

    return updatedConfig;
  }

  /**
   * Получает конфигурацию жизней
   */
  async getLivesConfig(): Promise<LivesConfig> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, 'lives_config'));

    if (!config) {
      return {
        baseLives: 3,
        maxLives: 5,
        liveCost: 100,
        livesRefillTime: 30 * 60 * 1000, // 30 минут
      };
    }

    return config.value as LivesConfig;
  }

  /**
   * Обновляет конфигурацию жизней
   */
  async updateLivesConfig(config: Partial<LivesConfig>): Promise<LivesConfig> {
    const existing = await this.getLivesConfig();
    const updatedConfig = { ...existing, ...config };

    await db
      .insert(gameConfig)
      .values({
        key: 'lives_config',
        value: updatedConfig,
        description: 'Lives configuration',
      })
      .onConflictDoUpdate({
        target: [gameConfig.key],
        set: {
          value: updatedConfig,
          updatedAt: new Date(),
        },
      });

    return updatedConfig;
  }

  /**
   * Создает транзакцию бусин
   */
  async createBeadsTransaction(tx: InsertBeadsTransaction): Promise<BeadsTransaction> {
    const [transaction] = await db
      .insert(beadsTransactions)
      .values(tx)
      .returning();
    return transaction;
  }

  /**
   * Получает транзакции бусин
   */
  async getBeadsTransactions(limit?: number, offset?: number): Promise<BeadsTransaction[]> {
    let query = db
      .select()
      .from(beadsTransactions)
      .where(isNull(beadsTransactions.deletedAt))
      .orderBy(desc(beadsTransactions.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.offset(offset);
    }

    return query;
  }

  /**
   * Получает количество транзакций бусин
   */
  async getBeadsTransactionsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(beadsTransactions)
      .where(isNull(beadsTransactions.deletedAt));

    return Number(result?.count || 0);
  }

  /**
   * Награждает пользователя бусинами из дома
   */
  async awardBeadsWithHouse(userId: string, amount: number, type: TransactionType, description: string, gameScoreId?: string): Promise<{ success: boolean; newBalance: number }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return { success: false, newBalance: 0 };
    }

    // Обновляем баланс пользователя
    const [updatedUser] = await db
      .update(users)
      .set({
        totalPoints: user[0].totalPoints + amount,
      })
      .where(eq(users.id, userId))
      .returning();

    // Создаем запись транзакции
    await this.createBeadsTransaction({
      userId,
      type,
      amount,
      balanceBefore: user[0].totalPoints,
      balanceAfter: updatedUser.totalPoints,
      description,
      gameScoreId: gameScoreId || null,
    });

    return { success: true, newBalance: updatedUser.totalPoints };
  }

  /**
   * Списание бусин в пользу дома
   */
  async chargeBeadsToHouse(userId: string, amount: number, type: TransactionType, description: string): Promise<{ success: boolean; newBalance: number }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0] || user[0].totalPoints < amount) {
      return { success: false, newBalance: user[0]?.totalPoints || 0 };
    }

    // Обновляем баланс пользователя
    const [updatedUser] = await db
      .update(users)
      .set({
        totalPoints: user[0].totalPoints - amount,
      })
      .where(eq(users.id, userId))
      .returning();

    // Создаем запись транзакции
    await this.createBeadsTransaction({
      userId,
      type,
      amount: -amount, // Отрицательная сумма для списаний
      balanceBefore: user[0].totalPoints,
      balanceAfter: updatedUser.totalPoints,
      description,
    });

    return { success: true, newBalance: updatedUser.totalPoints };
  }

  /**
   * Награждает пользователя бонусом за регистрацию
   */
  async awardSignupBonus(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return { success: false, newBalance: 0 };
    }

    // Проверяем, был ли уже получен бонус за регистрацию
    if (user[0].signupBonusReceived) {
      return { success: false, newBalance: user[0].totalPoints };
    }

    // Обновляем баланс пользователя и отмечаем получение бонуса
    const [updatedUser] = await db
      .update(users)
      .set({
        totalPoints: user[0].totalPoints + amount,
        signupBonusReceived: true,
      })
      .where(eq(users.id, userId))
      .returning();

    // Создаем запись транзакции
    await this.createBeadsTransaction({
      userId,
      type: 'signup_bonus',
      amount,
      balanceBefore: user[0].totalPoints,
      balanceAfter: updatedUser.totalPoints,
      description: 'Sign-up bonus',
    });

    return { success: true, newBalance: updatedUser.totalPoints };
  }

  /**
   * Записывает игру и завершает уровень
   */
  async recordGameAndCompleteLevel(
    userId: string,
    score: number,
    levelId: number,
    isVictory: boolean,
    maxCombo?: number,
    previousLeagueSlug?: string,
    previousLeagueSortOrder?: number
  ): Promise<{
    leaguePromotion?: {
      previousLeague: string;
      newLeague: string;
      newLeagueNameRu: string;
      playerName: string;
      telegramId: string;
    },
    isFirstPassage: boolean
  }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      throw new Error('User not found');
    }

    // Проверяем, является ли это первым прохождением уровня
    const isFirstPassage = !user[0].completedLevels.includes(levelId);

    // Создаем запись результата игры
    const gameScore = await this.createGameScore({
      odUserId: userId,
      levelId,
      score,
      cryptoBtc: 0, // Будет рассчитано позже на основе результата
      cryptoEth: 0,
      cryptoUsdt: 0,
      maxCombo: maxCombo || 0,
      accuracy: 100, // Заглушка
      duration: 120, // Заглушка
      won: isVictory,
    });

    // Обновляем статистику пользователя
    const [updatedUser] = await db
      .update(users)
      .set({
        totalPoints: user[0].totalPoints + score,
        gamesPlayed: user[0].gamesPlayed + 1,
        bestScore: Math.max(user[0].bestScore, score),
        totalWins: isVictory ? user[0].totalWins + 1 : user[0].totalWins,
        currentWinStreak: isVictory ? user[0].currentWinStreak + 1 : 0,
        bestWinStreak: Math.max(user[0].bestWinStreak, isVictory ? user[0].currentWinStreak + 1 : user[0].currentWinStreak),
        totalCombo5Plus: (maxCombo && maxCombo >= 5) ? user[0].totalCombo5Plus + 1 : user[0].totalCombo5Plus,
        lastActivityAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Добавляем уровень к завершенным уровням, если он еще не был завершен
    if (isFirstPassage) {
      await db
        .update(users)
        .set({
          completedLevels: [...user[0].completedLevels, levelId],
        })
        .where(eq(users.id, userId));
    }

    // Обрабатываем награды криптовалюты на основе результата
    // Награды начисляются только при первом прохождении уровня
    if (isVictory && isFirstPassage) {
      // Рассчитываем награды криптовалюты на основе результата (упрощенный расчет)
      const cryptoBtc = Math.floor(score * 0.000001);
      const cryptoEth = Math.floor(score * 0.000000000001);
      const cryptoUsdt = score * 0.0001;

      await this.processCryptoRewards(userId, cryptoBtc, cryptoEth, cryptoUsdt, gameScore.id);
    }

    // Проверяем повышение в лиге
    let leaguePromotion = undefined;

    if (previousLeagueSlug && previousLeagueSortOrder !== undefined) {
      const newLeague = await db
        .select()
        .from(leagues)
        .where(and(
          eq(leagues.isActive, true),
          gt(leagues.sortOrder, previousLeagueSortOrder)
        ))
        .orderBy(leagues.sortOrder)
        .limit(1);

      if (newLeague.length > 0 && updatedUser.ratingScore >= newLeague[0].minBeads) {
        leaguePromotion = {
          previousLeague: previousLeagueSlug,
          newLeague: newLeague[0].slug,
          newLeagueNameRu: newLeague[0].nameRu,
          playerName: updatedUser.username,
          telegramId: updatedUser.telegramId || '',
        };
      }
    }

    // Обрабатываем реферальные награды
    await this.processReferralRewards(gameScore.id, userId, score);

    return { leaguePromotion, isFirstPassage };
  }

  /**
   * Получает конфигурации игры для уровня
   */
  async getGameConfigsForLevel(levelId: number): Promise<{ gameplayConfig: GameplayConfig; gameEconomyConfig: GameEconomyConfig; livesConfig: LivesConfig; levelConfig?: any }> {
    const gameplayConfig: GameplayConfig = {
      baseScoreMultiplier: 1,
      comboMultiplier: 1.1,
      maxComboMultiplier: 5,
      levelThreshold: 1000,
    };

    const gameEconomyConfig = await this.getGameEconomyConfig();
    const livesConfig = await this.getLivesConfig();

    // Получаем конфигурацию уровня из базы данных, если она существует
    const levelConfig = await this.getLevelConfig(levelId);

    return {
      gameplayConfig,
      gameEconomyConfig,
      livesConfig,
      levelConfig, // Возвращаем конфигурацию уровня, если она существует
    };
  }

  /**
   * Получает сессию коробки бусин пользователя за день
   */
  async getUserDailyBoxSession(userId: string, date: string): Promise<BeadsBoxSession | undefined> {
    const [session] = await db
      .select()
      .from(beadsBoxSessions)
      .where(and(
        eq(beadsBoxSessions.userId, userId),
        eq(beadsBoxSessions.date, date)
      ));
    return session || undefined;
  }

  /**
   * Создает сессию коробки бусин пользователя за день
   */
  async createDailyBoxSession(userId: string, date: string, boxes: BeadsBoxReward[]): Promise<BeadsBoxSession> {
    const [session] = await db
      .insert(beadsBoxSessions)
      .values({
        userId,
        date,
        boxes,
        openedBoxes: [],
      })
      .returning();
    return session;
  }

  /**
   * Выбирает коробку в сессии
   */
  async selectBox(sessionId: string, boxIndex: number): Promise<{ success: boolean; reward?: BeadsBoxReward; error?: string }> {
    const [session] = await db
      .select()
      .from(beadsBoxSessions)
      .where(eq(beadsBoxSessions.id, sessionId));

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.openedBoxes.includes(boxIndex)) {
      return { success: false, error: 'Box already opened' };
    }

    if (boxIndex < 0 || boxIndex >= session.boxes.length) {
      return { success: false, error: 'Invalid box index' };
    }

    // Отмечаем коробку как открытую
    const updatedOpenedBoxes = [...session.openedBoxes, boxIndex];
    await db
      .update(beadsBoxSessions)
      .set({ openedBoxes: updatedOpenedBoxes })
      .where(eq(beadsBoxSessions.id, sessionId));

    const reward = session.boxes[boxIndex];

    // Обрабатываем награду
    switch (reward.type) {
      case 'beads':
        await this.awardBeadsWithHouse(
          session.userId,
          reward.amount,
          'beads_box_reward',
          `Beads Box reward: ${reward.amount} beads`
        );
        break;
      case 'boost':
        // Здесь нужно добавить логику для работы с бустами
        break;
      case 'skin':
        // Здесь нужно добавить логику для работы со скинами
        break;
      case 'life':
        await db
          .update(users)
          .set({
            bonusLives: sql`${users.bonusLives} + ${reward.quantity}`,
          })
          .where(eq(users.id, session.userId));
        break;
    }

    return { success: true, reward };
  }

  /**
   * Получает билеты криптоИгры пользователя
   */
  async getUserCryptoTickets(userId: string): Promise<CryptoGameTicket[]> {
    return await db
      .select()
      .from(cryptoGameTickets)
      .where(and(
        eq(cryptoGameTickets.userId, userId),
        eq(cryptoGameTickets.used, false)
      ))
      .orderBy(desc(cryptoGameTickets.createdAt));
  }

  /**
   * Использует билет криптоИгры
   */
  async useCryptoTicket(ticketId: string, gameScoreId: string | null = null): Promise<{ success: boolean; error?: string }> {
    const [ticket] = await db
      .select()
      .from(cryptoGameTickets)
      .where(eq(cryptoGameTickets.id, ticketId));

    if (!ticket || ticket.used) {
      return { success: false, error: 'Ticket not found or already used' };
    }

    // Отмечаем билет как использованный
    await db
      .update(cryptoGameTickets)
      .set({
        used: true,
        usedAt: new Date(),
        gameScoreId: gameScoreId,
      })
      .where(eq(cryptoGameTickets.id, ticketId));

    return { success: true };
  }

  /**
   * Создает билет криптоИгры
   */
  async createCryptoTicket(userId: string, sessionId: string): Promise<CryptoGameTicket> {
    const [ticket] = await db
      .insert(cryptoGameTickets)
      .values({
        userId,
        sessionId,
        used: false,
      })
      .returning();
    return ticket;
  }

  /**
   * Получает конфигурацию коробки бусин
   */
  async getBeadsBoxConfig(): Promise<BeadsBoxConfig> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, 'beads_box_config'));

    if (!config) {
      return {
        enabled: true,
        costPerBox: 100,
        boxesPerDay: 3,
        rewards: [
          { type: 'beads', min: 50, max: 200, probability: 0.5 },
          { type: 'boost', boostType: 'score_multiplier', quantity: 1, probability: 0.3 },
          { type: 'skin', skinId: '', probability: 0.1 },
          { type: 'life', quantity: 1, probability: 0.1 },
        ],
      };
    }

    return config.value as BeadsBoxConfig;
  }

  /**
   * Обновляет конфигурацию коробки бусин
   */
  async updateBeadsBoxConfig(config: Partial<BeadsBoxConfig>): Promise<BeadsBoxConfig> {
    const existing = await this.getBeadsBoxConfig();
    const updatedConfig = { ...existing, ...config };

    await db
      .insert(gameConfig)
      .values({
        key: 'beads_box_config',
        value: updatedConfig,
        description: 'Beads Box configuration',
      })
      .onConflictDoUpdate({
        target: [gameConfig.key],
        set: {
          value: updatedConfig,
          updatedAt: new Date(),
        },
      });

    return updatedConfig;
  }

  /**
   * Получает активный сезон
   */
  async getActiveSeason(): Promise<Season | undefined> {
    const [season] = await db
      .select()
      .from(seasons)
      .where(eq(seasons.isActive, true));
    return season || undefined;
  }

  /**
   * Завершает текущий сезон
   */
  async endCurrentSeason(): Promise<{ success: boolean; season?: Season; resultsCount?: number; error?: string }> {
    const currentSeason = await this.getActiveSeason();
    if (!currentSeason) {
      return { success: false, error: 'No active season found' };
    }

    // Завершаем текущий сезон
    const [updatedSeason] = await db
      .update(seasons)
      .set({
        isActive: false,
        endDate: new Date(),
      })
      .where(eq(seasons.id, currentSeason.id))
      .returning();

    // Генерируем результаты сезона
    const topUsers = await db
      .select({
        id: users.id,
        ratingScore: users.ratingScore,
        totalWins: users.totalWins,
        gamesPlayed: users.gamesPlayed,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.ratingScore))
      .limit(100); // Топ 100 игроков

    // Сохраняем результаты сезона
    const results = await Promise.all(topUsers.map(async (user, index) => {
      const [result] = await db
        .insert(seasonResults)
        .values({
          seasonId: currentSeason.id,
          userId: user.id,
          leagueSlug: 'top_players', // Упрощено - на самом деле нужно рассчитывать правильные лиги
          finalRatingScore: user.ratingScore,
          finalRank: index + 1,
          totalWins: user.totalWins,
          totalGames: user.gamesPlayed,
          bestWinStreak: 0, // Нужно рассчитать
        })
        .returning();
      return result;
    }));

    return {
      success: true,
      season: updatedSeason,
      resultsCount: results.length,
    };
  }

  /**
   * Начинает новый сезон
   */
  async startNewSeason(): Promise<{ success: boolean; season?: Season; error?: string }> {
    const currentSeason = await this.getActiveSeason();
    if (currentSeason) {
      // Сначала завершаем текущий сезон
      await this.endCurrentSeason();
    }

    // Получаем следующий номер сезона
    const [latestSeason] = await db
      .select({ maxNumber: sql<number>`MAX(${seasons.seasonNumber})` })
      .from(seasons);

    const nextSeasonNumber = (latestSeason?.maxNumber || 0) + 1;

    // Создаем новый сезон
    const [newSeason] = await db
      .insert(seasons)
      .values({
        seasonNumber: nextSeasonNumber,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        startDate: new Date(),
        isActive: true,
      })
      .returning();

    return {
      success: true,
      season: newSeason,
    };
  }

  /**
   * Получает запросы на вывод
   */
  async getWithdrawalRequests(status?: string): Promise<Array<WithdrawalRequest & { username?: string }>> {
    let query = db
      .select({
        request: sql<WithdrawalRequest>`withdrawal_requests.*`,
        username: users.username,
      })
      .from(withdrawalRequests)
      .leftJoin(users, eq(withdrawalRequests.userId, users.id))
      .orderBy(desc(withdrawalRequests.createdAt));

    if (status) {
      query = query.where(eq(withdrawalRequests.status, status));
    }

    const result = await query;
    return result.map(item => ({
      ...item.request,
      username: item.username || undefined,
    }));
  }

  /**
   * Обновляет запрос на вывод
   */
  async updateWithdrawalRequest(id: string, updates: { status?: string; adminNote?: string; txHash?: string; processedBy?: string; processedAt?: Date }): Promise<WithdrawalRequest | undefined> {
    const [updatedRequest] = await db
      .update(withdrawalRequests)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  /**
   * Получает конфигурацию вывода
   */
  async getWithdrawalConfig(): Promise<WithdrawalConfig> {
    const [config] = await db
      .select()
      .from(gameConfig)
      .where(eq(gameConfig.key, 'withdrawal_config'));

    if (!config) {
      return {
        minWithdrawalAmount: 1,
        maxWithdrawalAmount: 100,
        feePercent: 2,
        enabled: true,
      };
    }

    return config.value as WithdrawalConfig;
  }

  /**
   * Обновляет конфигурацию вывода
   */
  async updateWithdrawalConfig(config: Partial<WithdrawalConfig>): Promise<WithdrawalConfig> {
    const existing = await this.getWithdrawalConfig();
    const updatedConfig = { ...existing, ...config };

    await db
      .insert(gameConfig)
      .values({
        key: 'withdrawal_config',
        value: updatedConfig,
        description: 'Withdrawal configuration',
      })
      .onConflictDoUpdate({
        target: [gameConfig.key],
        set: {
          value: updatedConfig,
          updatedAt: new Date(),
        },
      });

    return updatedConfig;
  }

  /**
   * Получает конфигурацию уровня
   */
  async getLevelConfig(levelId: number): Promise<LevelConfig | undefined> {
    const [config] = await db
      .select()
      .from(levelConfigs)
      .where(eq(levelConfigs.levelId, levelId));

    return config || undefined;
  }

  /**
   * Получает все конфигурации уровней
   */
  async getAllLevelConfigs(): Promise<LevelConfig[]> {
    return await db
      .select()
      .from(levelConfigs)
      .orderBy(levelConfigs.levelId);
  }

  /**
   * Создает конфигурацию уровня
   */
  async createLevelConfig(config: InsertLevelConfig): Promise<LevelConfig> {
    const [levelConfig] = await db
      .insert(levelConfigs)
      .values(config)
      .returning();

    return levelConfig;
  }

  /**
   * Обновляет конфигурацию уровня
   */
  async updateLevelConfig(levelId: number, updates: Partial<InsertLevelConfig>): Promise<LevelConfig | undefined> {
    const [updatedConfig] = await db
      .update(levelConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(levelConfigs.levelId, levelId))
      .returning();

    return updatedConfig || undefined;
  }

  /**
   * Удаляет конфигурацию уровня
   */
  async deleteLevelConfig(levelId: number): Promise<boolean> {
    const result = await db
      .delete(levelConfigs)
      .where(eq(levelConfigs.levelId, levelId));

    return result.rowCount !== 0;
  }

  /**
   * Создает игровую сессию (временная реализация)
   */
  async createGameSession(sessionData: { userId: string; levelId: number; config: any }): Promise<any> {
    // Временная реализация - возвращаем объект сессии без сохранения в базе
    // В реальной реализации сессии могут храниться в базе или в кэше (Redis)
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: sessionData.userId,
      levelId: sessionData.levelId,
      config: sessionData.config,
      startTime: new Date(),
      isActive: true,
    };
  }
}