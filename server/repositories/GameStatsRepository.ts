import { db } from '../db'; // Используем основное подключение для обычных запросов
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
  cryptoGameTickets,
  beadsBoxSessions,
  seasons,
  seasonResults,
  withdrawalRequests,
  leagues,
  type League,
  type InsertLeague,
  eq,
  desc,
  sql,
  isNull,
  and,
  or,
  gte,
  sum,
  ilike,
  count,
  inArray
} from '@shared/schema';

export class GameStatsRepository {
  /**
   * Получает таблицу лидеров
   */
  async getLeaderboard(limit: number = 50, period: 'all' | 'week' | 'today' = 'all'): Promise<LeaderboardEntry[]> {
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
   * Получает транзакции бусин с пользователями
   */
  async getBeadsTransactionsWithUsers(options: {
    limit?: number;
    offset?: number;
    type?: string;
    search?: string;
  }): Promise<{ transactions: Array<BeadsTransaction & { username?: string }>; total: number }> {
    let query = db
      .select({
        transaction: sql<BeadsTransaction>`beads_transactions.*`,
        username: users.username,
      })
      .from(beadsTransactions)
      .leftJoin(users, eq(beadsTransactions.userId, users.id))
      .where(isNull(beadsTransactions.deletedAt))
      .orderBy(desc(beadsTransactions.createdAt));

    // Применяем фильтры
    if (options.type) {
      query = query.where(eq(beadsTransactions.type, options.type));
    }

    if (options.search) {
      query = query.where(ilike(users.username, `%${options.search}%`));
    }

    // Получаем общее количество
    const countQuery = db
      .select({ count: count() })
      .from(beadsTransactions)
      .leftJoin(users, eq(beadsTransactions.userId, users.id))
      .where(isNull(beadsTransactions.deletedAt));

    if (options.type) {
      countQuery.where(eq(beadsTransactions.type, options.type));
    }

    if (options.search) {
      countQuery.where(ilike(users.username, `%${options.search}%`));
    }

    const [totalCountResult] = await countQuery;
    const total = Number(totalCountResult?.count || 0);

    // Применяем пагинацию
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    if (options.offset !== undefined) {
      query = query.offset(options.offset);
    }

    const result = await query;
    const transactions = result.map(item => ({
      ...item.transaction,
      username: item.username || undefined,
    }));

    return { transactions, total };
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
   * Получает лиги
   */
  async getLeagues(): Promise<League[]> {
    return await db
      .select()
      .from(leagues)
      .where(eq(leagues.isActive, true))
      .orderBy(leagues.sortOrder);
  }

  /**
   * Получает лигу по слагу
   */
  async getLeague(slug: string): Promise<League | undefined> {
    const [league] = await db
      .select()
      .from(leagues)
      .where(eq(leagues.slug, slug));
    return league || undefined;
  }

  /**
   * Получает лигу пользователя
   */
  async getUserLeague(userId: string): Promise<{ league: League; rank: number } | undefined> {
    return await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .leftJoin(seasonResults, eq(users.id, seasonResults.userId))
      .then(result => {
        if (!result[0]) {
          return undefined;
        }

        // Реализация получения лиги пользователя
        // Это упрощенная версия - в реальном приложении логика будет сложнее
        return undefined;
      });
  }

  /**
   * Получает ранг пользователя
   */
  async getUserRank(userId: string): Promise<number> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return 0;
    }

    const allUsers = await db
      .select({ id: users.id, ratingScore: users.ratingScore })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.ratingScore));

    return allUsers.findIndex(u => u.id === userId) + 1;
  }

  /**
   * Получает таблицу лидеров лиги
   */
  async getLeagueLeaderboard(leagueSlug: string, limit: number = 50, period: 'all' | 'week' | 'today' = 'all'): Promise<Array<{
    rank: number;
    odoserId: string;
    name: string;
    ratingScore: number;
    beadsBalance: number;
    photoUrl: string | null;
    characterType: string | null;
    characterImageUrl: string | null;
  }>> {
    // Реализация получения таблицы лидеров лиги
    // Это упрощенная версия - в реальном приложении логика будет сложнее
    return [];
  }

  /**
   * Получает количество игроков в лиге
   */
  async getLeaguePlayerCount(leagueSlug: string): Promise<number> {
    // Реализация получения количества игроков в лиге
    // Это упрощенная версия - в реальном приложении логика будет сложнее
    return 0;
  }

  /**
   * Получает таблицу лидеров друзей
   */
  async getFriendsLeaderboard(userId: string, leagueSlug: string, limit: number = 50): Promise<Array<{
    rank: number;
    odoserId: string;
    name: string;
    ratingScore: number;
    beadsBalance: number;
    photoUrl: string | null;
    characterType: string | null;
    characterImageUrl: string | null;
  }>> {
    // Реализация получения таблицы лидеров друзей
    // Это упрощенная версия - в реальном приложении логика будет сложнее
    return [];
  }

  /**
   * Получает пользователей без персонажей
   */
  async getUsersWithoutCharacters(): Promise<Array<{ id: string; telegramId: string; firstName: string | null; username: string }>> {
    return await db.execute(sql`
      SELECT
        u.id,
        u.telegram_id as telegramId,
        u.first_name as firstName,
        u.username
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id
      WHERE c.id IS NULL
        AND u.deleted_at IS NULL
    `).then(result => result.rows as any[]);
  }

  /**
   * Удаляет транзакцию
   */
  async deleteTransaction(transactionId: string): Promise<boolean> {
    const [transaction] = await db
      .update(beadsTransactions)
      .set({
        deletedAt: new Date(),
        deletedBy: 'system', // В реальной реализации передавать ID администратора
        deleteReason: 'Manually deleted',
      })
      .where(eq(beadsTransactions.id, transactionId))
      .returning();

    return !!transaction;
  }

  /**
   * Сбрасывает уровни пользователя
   */
  async resetUserLevels(userId: string): Promise<{ success: boolean; error?: string }> {
    const [user] = await db
      .update(users)
      .set({
        completedLevels: [],
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true };
  }

  /**
   * Получает результаты сезона
   */
  async getSeasonResults(seasonId: string): Promise<SeasonResult[]> {
    return await db
      .select()
      .from(seasonResults)
      .where(eq(seasonResults.seasonId, seasonId))
      .orderBy(seasonResults.finalRank);
  }

  /**
   * Получает результаты сезона пользователя
   */
  async getUserSeasonResults(userId: string): Promise<Array<SeasonResult & { season: Season }>> {
    return await db
      .select()
      .from(seasonResults)
      .innerJoin(seasons, eq(seasonResults.seasonId, seasons.id))
      .where(eq(seasonResults.userId, userId))
      .orderBy(desc(seasons.seasonNumber));
  }
}