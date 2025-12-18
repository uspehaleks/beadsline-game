import React, { useEffect, useState } from "react";
const LAUNCH_PROMO_END = new Date("2026-02-10T00:00:00Z");

const features = [
  "🎮 Классическая механика шутера по цепочке шариков (BTC, ETH, USDT)",
  "💎 Зарабатывай внутриигровую валюту Beads",
  "🏆 10 рангов от Новичка до Легенды",
  "👥 Реферальная программа: 10% + 3%",
  "🎁 Ежедневные квесты и турниры",
];

const steps = [
  "Регистрируйся и получай стартовый бонус",
  "Зарабатывай до 1800 Beads за игру",
  "Покупай бусты и косметику за Beads",
  "Повышай ранг и получай бонусы",
  "Приглашай друзей и получай процент от их доходов",
];

const tokenomics = [
  "Награды: 200–1800 Beads за победу",
  "Жизни: автореген каждые 30 секунд",
  "Бусты: от 300 Beads",
  "Покупка Beads: от $1 за 300 Beads",
];

const referrals = [
  "10% от заработка рефералов 1-го уровня",
  "3% от заработка рефералов 2-го уровня",
  "Безлимитное количество приглашений",
];

const ranks = [
  {
    id: 1,
    title: "🌱 Новичок (Newbie)",
    requirement: "0 Beads",
    eta: "старт",
    referral: { limit: "10 мест (1 ур)", income: "10% с 1-го уровня", max: "~1,000 Beads/день" },
    reward: "100 Beads",
    bonus: [] as string[],
    unlocks: [] as string[],
  },
  {
    id: 2,
    title: "💎 Майнер (Miner)",
    requirement: "3,000 Beads",
    eta: "3 дня",
    referral: { limit: "25 мест (1 ур)", income: "10% с 1-го уровня", max: "~2,500 Beads/день" },
    reward: '500 Beads + скин "Кирка"',
    bonus: ["+20% к ежедневной награде"],
    unlocks: [],
  },
  {
    id: 3,
    title: "🪙 Трейдер (Trader)",
    requirement: "10,000 Beads",
    eta: "10 дней",
    referral: { limit: "50 мест (1 ур)", income: "10% с 1-го уровня", max: "~5,000 Beads/день" },
    reward: '1,000 Beads + анимация "График"',
    bonus: ["-10% на все бусты"],
    unlocks: ["Разблокировка: уровни 7–8 (крипто!)"],
  },
  {
    id: 4,
    title: "📊 Аналитик (Analyst)",
    requirement: "35,000 Beads",
    eta: "1 месяц",
    referral: { limit: "100 мест (1 ур)", income: "10% с 1-го уровня", max: "~10,000 Beads/день" },
    reward: '3,000 Beads + рамка "Золотой график"',
    bonus: ["+10% к наградам за победы"],
    unlocks: ["Разблокировка: уровень 9, статистика"],
  },
  {
    id: 5,
    title: "🚀 Холдер (Holder)",
    requirement: "120,000 Beads",
    eta: "4 месяца",
    referral: {
      limit: "250 мест (1 ур) + безлимит (2 ур)",
      income: "10% с 1-го + 3% с 2-го",
      max: "~32,500 Beads/день",
    },
    reward: '7,500 Beads + эмоция "Diamond Hands"',
    bonus: ["Еженедельный бонус 1,000 Beads", "5 жизней (вместо 3)"],
    unlocks: ["Уровень 10 разблокирован"],
  },
  {
    id: 6,
    title: "🐋 Кит (Whale)",
    requirement: "400,000 Beads",
    eta: "1 год (или 6 месяцев с рефералами)",
    referral: {
      limit: "500 мест (1 ур) + безлимит (2 ур)",
      income: "10% с 1-го + 3% с 2-го",
      max: "~65,000 Beads/день",
    },
    reward: '20,000 Beads + скин "Космический кит"',
    bonus: ["Регенерация жизни 15 сек (вместо 30)", "VIP-лобби", "Приоритетная поддержка"],
    unlocks: [],
  },
  {
    id: 7,
    title: "🦄 Единорог (Unicorn)",
    requirement: "1,200,000 Beads",
    eta: "3 года (или 1.5 года с бонусами)",
    referral: {
      limit: "1,000 мест (1 ур) + безлимит (2 ур)",
      income: "10% с 1-го + 3% с 2-го",
      max: "~130,000 Beads/день",
    },
    reward: '50,000 Beads + рамка "Единорог"',
    bonus: ["+25% к наградам за победы", "+2 слота под бусты", "NFT-скины", "Закрытые турниры с крипто-призами"],
    unlocks: [],
  },
  {
    id: 8,
    title: "⚡ Молния (Lightning)",
    requirement: "2,500,000 Beads",
    eta: "7 лет (или 4 года с турнирами/рефералами)",
    referral: {
      limit: "2,500 мест (1 ур) + безлимит (2 ур)",
      income: "10% с 1-го + 3% с 2-го",
      max: "~325,000 Beads/день",
    },
    reward: '100,000 Beads + эффект "Молния"',
    bonus: ["Streak bonus x2", "Мгновенный старт игры", "Lightning-турниры", "Ранний доступ к UPDATE 2.0+"],
    unlocks: [],
  },
  {
    id: 9,
    title: "👑 Сатоши (Satoshi)",
    requirement: "5,000,000 Beads",
    eta: "13 лет (или 5 лет с максимальными бонусами)",
    referral: {
      limit: "5,000 мест (1 ур) + безлимит (2 ур)",
      income: "10% с 1-го + 3% с 2-го",
      max: "~650,000 Beads/день",
    },
    reward: '300,000 Beads + корона "Сатоши Накамото"',
    bonus: ["+50% ко всем наградам НАВСЕГДА", "Бесплатный буст раз в день", 'Имя в "Зале славы"', "Персональный значок в профиле", 'Статус "Основатель"'],
    unlocks: [],
  },
  {
    id: 10,
    title: "🌟 Легенда (Legend) — секретный",
    requirement:
      "10,000,000 Beads (20+ лет обычной игры) или 10 лет с максимальными бонусами",
    eta: "секретный путь",
    referral: {
      limit: "10,000 мест (1 ур) + безлимит (2 ур)",
      income: "10% с 1-го + 3% с 2-го",
      max: "~1,300,000 Beads/день + доля от прибыли игры (0.1–1%)",
    },
    reward: '1,000,000 Beads + аватар "Blockchain Legend"',
    bonus: ["x2 ко всем наградам навсегда", "Пожизненный VIP", "Создавай свои турниры", "Предлагай фичи разработчикам", "Ежемесячная доля от прибыли игры"],
    unlocks: ["Секретные достижения:", "• 500 побед подряд", "• Выиграл каждый турнир хотя бы 1 раз", "• 5,000 активных рефералов"],
  },
];

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState(() => LAUNCH_PROMO_END.getTime() - Date.now());
  const showLaunchPromo = timeLeft > 0;

  useEffect(() => {
    if (!showLaunchPromo) return;
    const id = setInterval(() => setTimeLeft(LAUNCH_PROMO_END.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [showLaunchPromo]);

  const safeTimeLeft = Math.max(0, timeLeft);
  const totalSeconds = Math.floor(safeTimeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* фон */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,#475569_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      {/* HERO */}
      <header className="border-b border-slate-800/80 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/98 backdrop-blur">
        <div className="relative mx-auto w-full max-w-6xl px-4 py-4 flex items-center justify-between">
          {/* Лого */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-400 to-cyan-400 flex items-center justify-center text-slate-900 font-black shadow-lg shadow-emerald-500/40">
              B
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-lg tracking-tight">BeadsLine</span>
              <span className="text-[11px] text-slate-400">Аркада с цепочкой крипто-шариков</span>
            </div>
          </div>

          {/* Меню */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm text-slate-300">
            <a href="#about" className="hover:text-emerald-300 transition-colors">О игре</a>
            <a href="#ranks" className="hover:text-emerald-300 transition-colors">Ранги</a>
            <a href="#how-it-works" className="hover:text-emerald-300 transition-colors">Как работает</a>
            <a href="#tokenomics" className="hover:text-emerald-300 transition-colors">Токеномика</a>
            <a href="#referrals" className="hover:text-emerald-300 transition-colors">Рефералка</a>
          </nav>

          {/* Вход / Регистрация */}
          <div className="flex items-center gap-3">
            <a href="/login" className="text-xs sm:text-sm text-slate-300 hover:text-emerald-300 transition-colors">Войти</a>
            <a
              href="/register"
              className="inline-flex items-center rounded-full bg-emerald-400 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
            >
              Начать играть
            </a>
          </div>
        </div>

        {/* HERO Контент */}
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-6 lg:pb-16 lg:pt-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-slate-950/70 px-2.5 py-1 mb-4 text-[11px] sm:text-xs text-emerald-200">
              <span className="text-[14px]">🟢</span> Запуск беты • ранний доступ
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-center lg:text-left">
              Играй и Фарми{" "}
              <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Beads
              </span>
              !
            </h1>

            {/* ⭐ АКЦИЯ */}
            {showLaunchPromo && (
              <div className="relative mb-6 flex justify-center">
                {/* контурное сияние (центр) */}
                <div className="pointer-events-none absolute inset-[2px] rounded-[24px] overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent animate-sweep" />
                </div>

                {/* микрочастицы */}
                <span className="pointer-events-none absolute -top-1 left-10 h-1.5 w-1.5 rounded-full bg-emerald-300/80 blur-[1px] animate-particle" />
                <span className="pointer-events-none absolute top-2 right-8 h-1 w-1 rounded-full bg-cyan-300/80 blur-[1px] animate-particle [animation-delay:350ms]" />
                <span className="pointer-events-none absolute bottom-0 left-4 h-1 w-1 rounded-full bg-emerald-200/70 blur-[1px] animate-particle [animation-delay:700ms]" />

                {/* основной блок акции */}
                <div
                  className="relative z-10 w-full max-w-md rounded-3xl border border-emerald-300/80
                    bg-slate-950/95 px-6 py-6 text-sm sm:text-base text-emerald-100
                    shadow-[0_0_26px_rgba(16,185,129,0.28)] animate-glow
                    hover:scale-[1.02] hover:rotate-[0.3deg] hover:border-emerald-200
                    hover:shadow-[0_0_36px_rgba(45,212,191,0.35)]
                    transition-transform transition-shadow duration-300 ease-out"
                >
                  <div className="absolute -top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    LIVE
                  </div>

                  <div className="font-bold text-emerald-300 text-base sm:text-lg mb-2 flex items-center justify-center gap-2">
                    🎁 Стартовый бонус!
                  </div>

                  <p className="mb-2 text-center">
                    Получи{" "}
                    <span className="font-semibold text-emerald-300 text-base sm:text-lg">
                      +150 Beads
                    </span>{" "}
                    для первой игры.
                  </p>

                  <p className="text-[12px] text-emerald-300/80 text-center">
                    Акция действует до <strong>10.02.2026</strong>
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-1 text-[11px] sm:text-xs text-emerald-200/90 font-mono">
                    <span className="uppercase tracking-wide text-emerald-300/80">Осталось:</span>
                    <span>
                      {days}д {hours.toString().padStart(2, "0")}:
                      {minutes.toString().padStart(2, "0")}:
                      {seconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Кнопки — центр */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center items-center text-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
              >
                Начать с бонусом
              </a>
              <a
                href="/play"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Играть без регистрации
              </a>
            </div>

             {/* Мини-статистика под акцией */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-[11px] sm:text-xs text-slate-300">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 flex flex-col items-center text-center">
                <div className="text-[10px] uppercase text-slate-500 mb-1 tracking-wide">Пользователи</div>
                <div className="text-lg font-semibold text-emerald-300 leading-none mb-0.5">1 000+</div>
                <div className="text-[10px] text-slate-500">уже в BeadsLine</div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 flex flex-col items-center text-center">
                <div className="text-[10px] uppercase text-slate-500 mb-1 tracking-wide">Заработано Beads</div>
                <div className="text-lg font-semibold text-amber-300 leading-none mb-0.5">1 800+</div>
                <div className="text-[10px] text-slate-500">за последние сессии</div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 flex flex-col items-center text-center">
                <div className="text-[10px] uppercase text-slate-500 mb-1 tracking-wide">Сейчас в игре</div>
                <div className="text-lg font-semibold text-cyan-300 leading-none mb-0.5">10</div>
                <div className="text-[10px] text-slate-500">активных игроков</div>
              </div>
            </div>
          </div>

          {/* Превью игры */}
          <div className="relative">
            <div className="absolute -top-6 -right-4 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-2xl shadow-emerald-500/10">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-x-8 top-4 flex justify-between text-xs text-slate-400">
                  <span>BTC • ETH • USDT</span>
                  <span>Combo x7</span>
                </div>
                <span className="text-slate-300 text-xs sm:text-sm text-center px-4">
                  Здесь будет живой скриншот или анимация BeadsLine.
                </span>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        {/* О ИГРЕ */}
        <section id="about" className="border-b border-slate-800/80 bg-slate-950/95">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">О игре BeadsLine</h2>

            <p className="text-sm text-slate-300 mb-5 max-w-2xl whitespace-pre-line">
              BeadsLine — это динамичная аркада, в которой
              крипто-шарики движутся по траектории, а ты создаёшь
              комбинации, уничтожаешь цепочку и получаешь Beads
              для прокачки, бустов и участия в событиях.
              {"\n\n"}
              Проходи каждый новый уровень игры и собирай Крипто-Шарики BTC,
              ETH и USDT прямо в игре.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* РАНГИ */}
        <section id="ranks" className="border-b border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Ранги</h2>
            <p className="text-sm text-slate-300 mb-6 max-w-2xl">
              Прокачивайся, открывай бонусы и расширяй реферальные возможности. Нажми на ранг, чтобы увидеть детали.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {ranks.map((r) => (
                <details key={r.id} className="group rounded-3xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-400">Ранг {r.id}</div>
                      <div className="text-base sm:text-lg font-semibold text-slate-100">{r.title}</div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                          <div className="text-[10px] uppercase text-slate-500 mb-0.5">Требование</div>
                          <div className="font-semibold text-emerald-200">{r.requirement}</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                          <div className="text-[10px] uppercase text-slate-500 mb-0.5">Время</div>
                          <div className="font-semibold text-cyan-200">{r.eta}</div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                        Награда: <span className="font-semibold text-slate-100">{r.reward}</span>
                      </div>
                      <div className="text-slate-400 text-xs transition-transform duration-200 group-open:rotate-180">
                        ▾
                      </div>
                    </div>
                  </summary>

                  <div className="px-5 pb-5 pt-4 border-t border-slate-800/80 bg-slate-950/40">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="text-xs font-semibold text-slate-100 mb-2">Реферальная система</div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          <li>• Лимит: <span className="text-slate-100">{r.referral.limit}</span></li>
                          <li>• Доход: <span className="text-slate-100">{r.referral.income}</span></li>
                          <li>• Макс: <span className="text-slate-100">{r.referral.max}</span></li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="text-xs font-semibold text-slate-100 mb-2">Бонусы / Разблокировки</div>

                        {r.bonus.length > 0 ? (
                          <div className="mb-3">
                            <div className="text-[10px] uppercase text-slate-500 mb-1">Бонусы</div>
                            <ul className="text-xs text-slate-300 space-y-1">
                              {r.bonus.map((b) => (
                                <li key={b}>• <span className="text-slate-100">{b}</span></li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 mb-3">Бонусов нет — стартовый ранг.</div>
                        )}

                        {r.unlocks.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 mb-1">Разблокировка</div>
                            <ul className="text-xs text-slate-300 space-y-1">
                              {r.unlocks.map((u) => (
                                <li key={u}>• <span className="text-slate-100">{u}</span></li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* КАК ЭТО РАБОТАЕТ */}
        <section id="how-it-works" className="border-b border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Как это работает</h2>
            <p className="text-sm text-slate-300 mb-5 max-w-2xl">
              Вся экономика завязана на Beads: играй, побеждай, прокачивайся и получай бонусы.
            </p>

            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-slate-200">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="relative rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 pl-10"
                >
                  <span className="absolute left-3 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-bold text-slate-900">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ТОКЕНОМИКА */}
        <section id="tokenomics" className="border-b border-slate-800/80 bg-slate-950/95">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Токеномика Beads</h2>
            <p className="text-sm text-slate-300 mb-5 max-w-2xl">
              Зарабатывай Beads в игре и трать на бусты, улучшения и косметику.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tokenomics.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* РЕФЕРАЛКА */}
        <section id="referrals" className="border-b border-slate-800/80 bg-slate-950">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Реферальная программа</h2>
            <p className="text-sm text-slate-300 mb-5 max-w-2xl">
              Приглашай друзей и получай часть их дохода в Beads — без ограничений.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {referrals.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative bg-slate-950/98 border-t border-slate-800/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <div className="flex flex-wrap gap-4">
            <a href="#about" className="hover:text-emerald-300 transition-colors">О нас</a>
            <a href="#tokenomics" className="hover:text-emerald-300 transition-colors">Токеномика</a>
            <a href="#faq" className="hover:text-emerald-300 transition-colors">FAQ (скоро)</a>
            <a href="#contacts" className="hover:text-emerald-300 transition-colors">Контакты (скоро)</a>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="https://t.me/Beads_Lines" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition-colors">
              Telegram
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition-colors">
              Twitter / X
            </a>
            <a href="https://discord.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition-colors">
              Discord
            </a>
          </div>

          <div className="text-[11px] text-slate-500">© 2025 BeadsLine. Все права защищены.</div>
        </div>
      </footer>
    </div>
  );
}