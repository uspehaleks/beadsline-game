import { sql } from 'drizzle-orm';
import { db } from '../server/db.js';
import { users, gameConfig, prizePool, boosts, boostPackages, leagues, seasons, gameSkins, accessoryCategories, baseBodies, teamMembers } from '../shared/schema.js';

// Функция для заполнения базы начальными данными
export async function seedDatabase() {
  console.log('Начинаем заполнение базы данных начальными данными...');

  try {
    // 1. Создание начальных пользователей (включая администратора)
    console.log('Создание начальных пользователей...');
    const adminUser = await db.insert(users).values({
      telegramId: '5261121242',
      username: 'admin_user',
      firstName: 'Admin',
      totalPoints: 10000,
      gamesPlayed: 50,
      bestScore: 5000,
      isAdmin: true,
      referralCode: 'ADMIN001',
      ratingScore: 5000,
      totalScore: 10000,
      totalWins: 25,
      currentWinStreak: 5,
      bestWinStreak: 10,
    }).returning();
    console.log('Создан администратор:', adminUser[0].username);

    const testUser = await db.insert(users).values({
      telegramId: '123456789',
      username: 'test_player',
      firstName: 'Test',
      totalPoints: 5000,
      gamesPlayed: 20,
      bestScore: 2500,
      referralCode: 'TEST001',
      ratingScore: 2500,
      totalScore: 5000,
      totalWins: 10,
      currentWinStreak: 2,
      bestWinStreak: 5,
    }).returning();
    console.log('Создан тестовый пользователь:', testUser[0].username);

    // 2. Создание игровых конфигураций
    console.log('Создание игровых конфигураций...');
    const configs = [
      {
        key: 'crypto_fund_enabled',
        value: true,
        description: 'Включить/выключить крипто-награды (BTC, ETH, USDT)'
      },
      {
        key: 'usdt_fund_enabled',
        value: true,
        description: 'Включить/выключить реальные USDT-награды'
      },
      {
        key: 'maintenance_mode',
        value: { enabled: false, endTime: null, message: null },
        description: 'Режим технического обслуживания'
      },
      {
        key: 'crypto_wallets',
        value: {
          usdt_trc20: '',
          usdt_bep20: '',
          usdt_erc20: '',
          usdt_ton: ''
        },
        description: 'Адреса кошельков для криптоплатежей'
      },
      {
        key: 'signup_bonus',
        value: {
          enabled: true,
          amount: 1000,
          endDate: null
        },
        description: 'Бонус новым пользователям'
      },
      {
        key: 'beads_box_config',
        value: {
          enabled: true,
          boxCount: 6,
          rewards: {
            beads: { min: 10, max: 100, weight: 40 },
            boost: { quantity: 1, weight: 20 },
            lives: { min: 1, max: 3, weight: 30 },
            cryptoTicket: { weight: 10 }
          },
          cryptoTicketMinLevel: 10
        },
        description: 'Конфигурация BEADS BOX'
      }
    ];

    for (const config of configs) {
      await db.insert(gameConfig).values(config);
    }
    console.log('Созданы игровые конфигурации');

    // 3. Создание призовых пулов
    console.log('Создание призовых пулов...');
    await db.insert(prizePool).values({
      name: 'Основной призовой фонд',
      totalAmount: 100000,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Через 30 дней
    });
    console.log('Создан призовой пул');

    // 4. Создание бустов
    console.log('Создание бустов...');
    const boostTypes = [
      {
        type: 'slowdown',
        nameRu: 'Замедление',
        nameEn: 'Slowdown',
        descriptionRu: 'Замедляет движение всех шаров на 5 секунд',
        descriptionEn: 'Slows down all balls for 5 seconds',
        icon: '⏱️',
        price: 500,
        durationSeconds: 5,
        effectValue: 0.5, // 50% slowdown
        isActive: true,
        sortOrder: 1
      },
      {
        type: 'bomb',
        nameRu: 'Бомба',
        nameEn: 'Bomb',
        descriptionRu: 'Взрывает область вокруг следующего выстрела',
        descriptionEn: 'Explodes area around next shot',
        icon: '💣',
        price: 750,
        durationSeconds: 0,
        effectValue: 0,
        isActive: true,
        sortOrder: 2
      },
      {
        type: 'rainbow',
        nameRu: 'Радуга',
        nameEn: 'Rainbow',
        descriptionRu: 'Следующий шарик становится радугой (подходит к любому цвету)',
        descriptionEn: 'Next ball becomes rainbow (matches any color)',
        icon: '🌈',
        price: 1000,
        durationSeconds: 0,
        effectValue: 0,
        isActive: true,
        sortOrder: 3
      },
      {
        type: 'rewind',
        nameRu: 'Отмотка',
        nameEn: 'Rewind',
        descriptionRu: 'Откатывает игру на 3 секунды назад',
        descriptionEn: 'Rewinds game 3 seconds back',
        icon: '⏪',
        price: 1250,
        durationSeconds: 0,
        effectValue: 0,
        isActive: true,
        sortOrder: 4
      },
      {
        type: 'shield',
        nameRu: 'Щит',
        nameEn: 'Shield',
        descriptionRu: 'Защищает от поражения в течение 10 секунд',
        descriptionEn: 'Protects from defeat for 10 seconds',
        icon: '🛡️',
        price: 1500,
        durationSeconds: 10,
        effectValue: 0,
        isActive: true,
        sortOrder: 5
      },
      {
        type: 'magnet',
        nameRu: 'Магнит',
        nameEn: 'Magnet',
        descriptionRu: 'Притягивает шарики одного цвета ближе друг к другу',
        descriptionEn: 'Pulls same-colored balls closer together',
        icon: '🧲',
        price: 2000,
        durationSeconds: 8,
        effectValue: 0,
        isActive: true,
        sortOrder: 6
      },
      {
        type: 'laser',
        nameRu: 'Лазер',
        nameEn: 'Laser',
        descriptionRu: 'Пробивает шарики насквозь',
        descriptionEn: 'Pierces through balls',
        icon: '🔫',
        price: 2500,
        durationSeconds: 5,
        effectValue: 0,
        isActive: true,
        sortOrder: 7
      }
    ];

    for (const boost of boostTypes) {
      await db.insert(boosts).values(boost);
    }
    console.log('Созданы бусты');

    // 5. Создание пакетов бустов
    console.log('Создание пакетов бустов...');
    const boostPackagesData = [
      {
        name: 'starter',
        nameRu: 'СТАРТЕР',
        boostsPerType: 3,
        priceStars: 50,
        originalPriceStars: null,
        badge: null,
        badgeText: null,
        bonusLives: 0,
        bonusSkinId: null,
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'basic',
        nameRu: 'БАЗОВЫЙ',
        boostsPerType: 7,
        priceStars: 100,
        originalPriceStars: 117,
        badge: null,
        badgeText: null,
        bonusLives: 0,
        bonusSkinId: null,
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'mega',
        nameRu: 'МЕГА-НАБОР',
        boostsPerType: 15,
        priceStars: 200,
        originalPriceStars: 250,
        badge: 'hot',
        badgeText: 'ХИТ ПРОДАЖ!',
        bonusLives: 3,
        bonusSkinId: null,
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'vip',
        nameRu: 'VIP-НАБОР',
        boostsPerType: 40,
        priceStars: 350,
        originalPriceStars: 500,
        badge: 'best_value',
        badgeText: 'VIP',
        bonusLives: 10,
        bonusSkinId: null, // Будет назначен позже, когда создадим скины
        sortOrder: 4,
        isActive: true
      }
    ];

    for (const pkg of boostPackagesData) {
      await db.insert(boostPackages).values(pkg);
    }
    console.log('Созданы пакеты бустов');

    // 6. Создание лиг
    console.log('Создание лиг...');
    const leaguesData = [
      {
        slug: 'bronze',
        nameRu: 'Бронзовая лига',
        nameEn: 'Bronze League',
        icon: '🥉',
        minBeads: 0,
        maxRank: null,
        themeColor: '#CD7F32',
        sortOrder: 1,
        isActive: true
      },
      {
        slug: 'silver',
        nameRu: 'Серебряная лига',
        nameEn: 'Silver League',
        icon: '🥈',
        minBeads: 10000,
        maxRank: null,
        themeColor: '#C0C0C0',
        sortOrder: 2,
        isActive: true
      },
      {
        slug: 'gold',
        nameRu: 'Золотая лига',
        nameEn: 'Gold League',
        icon: '🥇',
        minBeads: 50000,
        maxRank: null,
        themeColor: '#FFD700',
        sortOrder: 3,
        isActive: true
      },
      {
        slug: 'platinum',
        nameRu: 'Платиновая лига',
        nameEn: 'Platinum League',
        icon: '💎',
        minBeads: 100000,
        maxRank: null,
        themeColor: '#E5E4E2',
        sortOrder: 4,
        isActive: true
      },
      {
        slug: 'diamond',
        nameRu: 'Алмазная лига',
        nameEn: 'Diamond League',
        icon: '💎',
        minBeads: 500000,
        maxRank: null,
        themeColor: '#B9F2FF',
        sortOrder: 5,
        isActive: true
      }
    ];

    for (const league of leaguesData) {
      await db.insert(leagues).values(league);
    }
    console.log('Созданы лиги');

    // 7. Создание сезонов
    console.log('Создание сезонов...');
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    await db.insert(seasons).values({
      seasonNumber: 1,
      month: nextMonth.getMonth() + 1, // Месяцы в JS начинаются с 0, но в БД с 1
      year: nextMonth.getFullYear(),
      startDate: nextMonth,
      endDate: nextMonthEnd,
      isActive: false
    });
    console.log('Создан сезон');

    // 8. Создание игровых скинов
    console.log('Создание игровых скинов...');
    const gameSkinsData = [
      {
        name: 'classic',
        nameRu: 'Классический',
        descriptionRu: 'Классический стиль игры',
        previewImageUrl: null,
        skinType: 'game',
        colorPrimary: '#3B82F6',
        colorSecondary: '#1D4ED8',
        isActive: true
      },
      {
        name: 'golden_boost',
        nameRu: 'Золотой Буст',
        descriptionRu: 'Эксклюзивный золотой скин для VIP-игроков',
        previewImageUrl: null,
        skinType: 'game',
        colorPrimary: '#FFD700',
        colorSecondary: '#FFA500',
        isActive: true
      },
      {
        name: 'neon_night',
        nameRu: 'Неоновая ночь',
        descriptionRu: 'Стиль неоновой ночи',
        previewImageUrl: null,
        skinType: 'game',
        colorPrimary: '#FF00FF',
        colorSecondary: '#00FFFF',
        isActive: true
      }
    ];

    for (const skin of gameSkinsData) {
      await db.insert(gameSkins).values(skin);
    }
    console.log('Созданы игровые скины');

    // 9. Создание категорий аксессуаров
    console.log('Создание категорий аксессуаров...');
    const accessoryCategoriesData = [
      {
        name: 'hat',
        nameRu: 'Головные уборы',
        slot: 'head',
        sortOrder: 1
      },
      {
        name: 'face',
        nameRu: 'Лицо',
        slot: 'face',
        sortOrder: 2
      },
      {
        name: 'body',
        nameRu: 'Тело',
        slot: 'body',
        sortOrder: 3
      },
      {
        name: 'accessory',
        nameRu: 'Аксессуары',
        slot: 'accessory',
        sortOrder: 4
      }
    ];

    for (const category of accessoryCategoriesData) {
      await db.insert(accessoryCategories).values(category);
    }
    console.log('Созданы категории аксессуаров');

    // 10. Создание базовых тел
    console.log('Создание базовых тел...');
    const baseBodiesData = [
      {
        gender: 'male',
        imageUrl: '/images/avatars/male_default.webp',
        isDefault: true
      },
      {
        gender: 'female',
        imageUrl: '/images/avatars/female_default.webp',
        isDefault: true
      }
    ];

    for (const body of baseBodiesData) {
      await db.insert(baseBodies).values(body);
    }
    console.log('Созданы базовые тела');

    // 11. Создание членов команды
    console.log('Создание членов команды...');
    const teamMembersData = [
      {
        name: 'Александр',
        role: 'Владелец проекта',
        sharePercent: 40,
        isActive: true
      },
      {
        name: 'Квен',
        role: 'Разработчик',
        sharePercent: 30,
        isActive: true
      },
      {
        name: 'Админ',
        role: 'Модератор',
        sharePercent: 15,
        isActive: true
      },
      {
        name: 'Техподдержка',
        role: 'Поддержка',
        sharePercent: 15,
        isActive: true
      }
    ];

    for (const member of teamMembersData) {
      await db.insert(teamMembers).values(member);
    }
    console.log('Созданы члены команды');

    // 12. Создание реферальной конфигурации
    console.log('Создание реферальной конфигурации...');
    await db.insert(gameConfig).values({
      key: 'referral_config',
      value: {
        maxDirectReferralsPerUser: 100,
        level1RewardPercent: 10,
        level2RewardPercent: 2,
        maxReferralBeadsPerRefPerDay: 1000,
        maxReferralBeadsPerUserPerDay: 10000,
        title: 'Приведи друзей',
        description: 'Получай Beads за каждого приведенного друга'
      },
      description: 'Конфигурация реферальной системы'
    });
    console.log('Создана реферальная конфигурация');

    console.log('База данных успешно заполнена начальными данными!');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    throw error;
  }
}