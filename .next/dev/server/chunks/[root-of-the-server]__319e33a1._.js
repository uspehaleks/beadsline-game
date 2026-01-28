module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/shared/schema.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "accessories",
    ()=>accessories,
    "accessoriesRelations",
    ()=>accessoriesRelations,
    "accessoryCategories",
    ()=>accessoryCategories,
    "adminUserIsAdminUpdateSchema",
    ()=>adminUserIsAdminUpdateSchema,
    "adminUserUpdateSchema",
    ()=>adminUserUpdateSchema,
    "baseBodies",
    ()=>baseBodies,
    "beadsBoxSessions",
    ()=>beadsBoxSessions,
    "beadsTransactions",
    ()=>beadsTransactions,
    "beadsTransactionsRelations",
    ()=>beadsTransactionsRelations,
    "boostPackagePurchases",
    ()=>boostPackagePurchases,
    "boostPackagePurchasesRelations",
    ()=>boostPackagePurchasesRelations,
    "boostPackages",
    ()=>boostPackages,
    "boostPackagesRelations",
    ()=>boostPackagesRelations,
    "boosts",
    ()=>boosts,
    "boostsRelations",
    ()=>boostsRelations,
    "characters",
    ()=>characters,
    "charactersRelations",
    ()=>charactersRelations,
    "cryptoGameTickets",
    ()=>cryptoGameTickets,
    "cryptoPayments",
    ()=>cryptoPayments,
    "cryptoPaymentsRelations",
    ()=>cryptoPaymentsRelations,
    "gameConfig",
    ()=>gameConfig,
    "gameScores",
    ()=>gameScores,
    "gameScoresRelations",
    ()=>gameScoresRelations,
    "gameSkins",
    ()=>gameSkins,
    "gameSkinsRelations",
    ()=>gameSkinsRelations,
    "insertAccessoryCategorySchema",
    ()=>insertAccessoryCategorySchema,
    "insertAccessorySchema",
    ()=>insertAccessorySchema,
    "insertBaseBodySchema",
    ()=>insertBaseBodySchema,
    "insertBeadsBoxSessionSchema",
    ()=>insertBeadsBoxSessionSchema,
    "insertBeadsTransactionSchema",
    ()=>insertBeadsTransactionSchema,
    "insertBoostPackagePurchaseSchema",
    ()=>insertBoostPackagePurchaseSchema,
    "insertBoostPackageSchema",
    ()=>insertBoostPackageSchema,
    "insertBoostSchema",
    ()=>insertBoostSchema,
    "insertCharacterSchema",
    ()=>insertCharacterSchema,
    "insertCryptoGameTicketSchema",
    ()=>insertCryptoGameTicketSchema,
    "insertCryptoPaymentSchema",
    ()=>insertCryptoPaymentSchema,
    "insertGameConfigSchema",
    ()=>insertGameConfigSchema,
    "insertGameScoreSchema",
    ()=>insertGameScoreSchema,
    "insertGameSkinSchema",
    ()=>insertGameSkinSchema,
    "insertLeagueSchema",
    ()=>insertLeagueSchema,
    "insertPrizePoolSchema",
    ()=>insertPrizePoolSchema,
    "insertRealRewardSchema",
    ()=>insertRealRewardSchema,
    "insertReferralRewardSchema",
    ()=>insertReferralRewardSchema,
    "insertRevenueShareSchema",
    ()=>insertRevenueShareSchema,
    "insertSeasonResultSchema",
    ()=>insertSeasonResultSchema,
    "insertSeasonSchema",
    ()=>insertSeasonSchema,
    "insertTeamMemberSchema",
    ()=>insertTeamMemberSchema,
    "insertUsdtFundSettingsSchema",
    ()=>insertUsdtFundSettingsSchema,
    "insertUserAccessorySchema",
    ()=>insertUserAccessorySchema,
    "insertUserBoostInventorySchema",
    ()=>insertUserBoostInventorySchema,
    "insertUserSchema",
    ()=>insertUserSchema,
    "insertUserSkinSchema",
    ()=>insertUserSkinSchema,
    "insertWithdrawalRequestSchema",
    ()=>insertWithdrawalRequestSchema,
    "leagues",
    ()=>leagues,
    "prizePool",
    ()=>prizePool,
    "realRewards",
    ()=>realRewards,
    "realRewardsRelations",
    ()=>realRewardsRelations,
    "referralRewards",
    ()=>referralRewards,
    "referralRewardsRelations",
    ()=>referralRewardsRelations,
    "revenueShares",
    ()=>revenueShares,
    "seasonResults",
    ()=>seasonResults,
    "seasonResultsRelations",
    ()=>seasonResultsRelations,
    "seasons",
    ()=>seasons,
    "systemLogs",
    ()=>systemLogs,
    "teamMembers",
    ()=>teamMembers,
    "updateBeadsBoxConfigSchema",
    ()=>updateBeadsBoxConfigSchema,
    "updateFundTogglesSchema",
    ()=>updateFundTogglesSchema,
    "updateLeagueSchema",
    ()=>updateLeagueSchema,
    "usdtFundSettings",
    ()=>usdtFundSettings,
    "userAccessories",
    ()=>userAccessories,
    "userAccessoriesRelations",
    ()=>userAccessoriesRelations,
    "userBoostInventory",
    ()=>userBoostInventory,
    "userBoostInventoryRelations",
    ()=>userBoostInventoryRelations,
    "userSkins",
    ()=>userSkins,
    "userSkinsRelations",
    ()=>userSkinsRelations,
    "users",
    ()=>users,
    "usersRelations",
    ()=>usersRelations,
    "withdrawalRequests",
    ()=>withdrawalRequests,
    "withdrawalRequestsRelations",
    ()=>withdrawalRequestsRelations
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__ = __turbopack_context__.i("[externals]/drizzle-orm [external] (drizzle-orm, esm_import, [project]/node_modules/drizzle-orm)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__ = __turbopack_context__.i("[externals]/drizzle-orm/pg-core [external] (drizzle-orm/pg-core, esm_import, [project]/node_modules/drizzle-orm)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__ = __turbopack_context__.i("[externals]/drizzle-zod [external] (drizzle-zod, esm_import, [project]/node_modules/drizzle-zod)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const systemLogs = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("system_logs", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    message: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("message").notNull(),
    timestamp: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("timestamp").defaultNow().notNull(),
    data: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["jsonb"])("data")
});
const users = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("users", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    telegramId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("telegram_id", {
        length: 255
    }).unique(),
    username: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("username").notNull(),
    firstName: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("first_name"),
    lastName: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("last_name"),
    photoUrl: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("photo_url"),
    totalPoints: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_points").default(0).notNull(),
    gamesPlayed: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("games_played").default(0).notNull(),
    bestScore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("best_score").default(0).notNull(),
    isAdmin: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_admin").default(false).notNull(),
    btcBalance: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("btc_balance").default(0).notNull(),
    ethBalance: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("eth_balance").default(0).notNull(),
    usdtBalance: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_balance").default(0).notNull(),
    btcBalanceSats: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["bigint"])("btc_balance_sats", {
        mode: "number"
    }).default(0).notNull(),
    btcTodaySats: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["bigint"])("btc_today_sats", {
        mode: "number"
    }).default(0).notNull(),
    btcTodayDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["date"])("btc_today_date"),
    ethBalanceWei: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["bigint"])("eth_balance_wei", {
        mode: "number"
    }).default(0).notNull(),
    ethTodayWei: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["bigint"])("eth_today_wei", {
        mode: "number"
    }).default(0).notNull(),
    ethTodayDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["date"])("eth_today_date"),
    usdtToday: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("usdt_today", {
        precision: 18,
        scale: 8
    }).default("0").notNull(),
    usdtTodayDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["date"])("usdt_today_date"),
    referralCode: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("referral_code", {
        length: 20
    }).unique(),
    referredBy: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("referred_by", {
        length: 255
    }),
    directReferralsCount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("direct_referrals_count").default(0).notNull(),
    completedLevels: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("completed_levels").array().default([]).notNull(),
    signupBonusReceived: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("signup_bonus_received").default(false).notNull(),
    ratingScore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("rating_score").default(0).notNull(),
    totalScore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_score").default(0).notNull(),
    totalWins: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_wins").default(0).notNull(),
    currentWinStreak: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("current_win_streak").default(0).notNull(),
    bestWinStreak: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("best_win_streak").default(0).notNull(),
    totalCombo5Plus: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_combo_5_plus").default(0).notNull(),
    // Character system
    characterGender: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("character_gender", {
        length: 10
    }),
    characterName: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("character_name", {
        length: 50
    }),
    characterEnergy: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("character_energy").default(100).notNull(),
    characterHealthState: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("character_health_state", {
        length: 20
    }).default("normal").notNull(),
    characterMood: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("character_mood", {
        length: 20
    }).default("neutral").notNull(),
    bonusLives: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("bonus_lives").default(0).notNull(),
    lastActivityAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("last_activity_at").defaultNow().notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    deletedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("deleted_at")
});
const usersRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(users, ({ many })=>({
        gameScores: many(gameScores)
    }));
const gameScores = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("game_scores", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    odUserId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    levelId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("level_id").default(1).notNull(),
    score: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("score").notNull(),
    cryptoBtc: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("crypto_btc").default(0).notNull(),
    cryptoEth: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("crypto_eth").default(0).notNull(),
    cryptoUsdt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("crypto_usdt").default(0).notNull(),
    maxCombo: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("max_combo").default(0).notNull(),
    accuracy: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("accuracy").default(0).notNull(),
    duration: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("duration").notNull(),
    won: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("won").default(false).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const gameScoresRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(gameScores, ({ one })=>({
        user: one(users, {
            fields: [
                gameScores.odUserId
            ],
            references: [
                users.id
            ]
        })
    }));
const gameConfig = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("game_config", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    key: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("key", {
        length: 255
    }).unique().notNull(),
    value: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["jsonb"])("value").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("description"),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const prizePool = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("prize_pool", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name").notNull(),
    totalAmount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_amount").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(false).notNull(),
    startDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("start_date"),
    endDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("end_date"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const usdtFundSettings = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("usdt_fund_settings", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    usdtTotalFund: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_total_fund").default(50).notNull(),
    usdtAvailable: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_available").default(50).notNull(),
    usdtDailyLimit: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_daily_limit").default(1.0).notNull(),
    usdtPerDrop: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_per_drop").default(0.02).notNull(),
    usdtMaxPerUserPerDay: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_max_per_user_per_day").default(0.1).notNull(),
    usdtDistributedToday: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("usdt_distributed_today").default(0).notNull(),
    lastResetDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("last_reset_date").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const realRewards = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("real_rewards", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    cryptoType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("crypto_type", {
        length: 10
    }).notNull(),
    amount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("amount").notNull(),
    balanceBefore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("balance_before").default(0),
    balanceAfter: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("balance_after").default(0),
    description: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("description", {
        length: 100
    }),
    gameScoreId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("game_score_id", {
        length: 255
    }).references(()=>gameScores.id),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const realRewardsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(realRewards, ({ one })=>({
        user: one(users, {
            fields: [
                realRewards.userId
            ],
            references: [
                users.id
            ]
        }),
        gameScore: one(gameScores, {
            fields: [
                realRewards.gameScoreId
            ],
            references: [
                gameScores.id
            ]
        })
    }));
const seasons = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("seasons", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    seasonNumber: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("season_number").notNull().unique(),
    month: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("month").notNull(),
    year: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("year").notNull(),
    startDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("start_date").notNull(),
    endDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("end_date"),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(false).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const seasonResults = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("season_results", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    seasonId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("season_id", {
        length: 255
    }).notNull().references(()=>seasons.id),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    leagueSlug: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("league_slug", {
        length: 50
    }).notNull(),
    finalRatingScore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("final_rating_score").notNull(),
    finalRank: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("final_rank").notNull(),
    totalWins: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_wins").default(0).notNull(),
    totalGames: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_games").default(0).notNull(),
    bestWinStreak: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("best_win_streak").default(0).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const seasonResultsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(seasonResults, ({ one })=>({
        season: one(seasons, {
            fields: [
                seasonResults.seasonId
            ],
            references: [
                seasons.id
            ]
        }),
        user: one(users, {
            fields: [
                seasonResults.userId
            ],
            references: [
                users.id
            ]
        })
    }));
const referralRewards = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("referral_rewards", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    refUserId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("ref_user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    level: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("level").notNull(),
    beadsAmount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("beads_amount").notNull(),
    gameScoreId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("game_score_id", {
        length: 255
    }).references(()=>gameScores.id),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const referralRewardsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(referralRewards, ({ one })=>({
        user: one(users, {
            fields: [
                referralRewards.userId
            ],
            references: [
                users.id
            ]
        }),
        refUser: one(users, {
            fields: [
                referralRewards.refUserId
            ],
            references: [
                users.id
            ]
        }),
        gameScore: one(gameScores, {
            fields: [
                referralRewards.gameScoreId
            ],
            references: [
                gameScores.id
            ]
        })
    }));
const boosts = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("boosts", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    type: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("type", {
        length: 50
    }).notNull().unique(),
    nameRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_ru").notNull(),
    nameEn: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_en").notNull(),
    descriptionRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("description_ru").notNull(),
    descriptionEn: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("description_en").notNull(),
    icon: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("icon").notNull(),
    price: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("price").notNull(),
    durationSeconds: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("duration_seconds").default(0).notNull(),
    effectValue: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("effect_value").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(true).notNull(),
    sortOrder: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("sort_order").default(0).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const userBoostInventory = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("user_boost_inventory", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    boostId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("boost_id", {
        length: 255
    }).notNull().references(()=>boosts.id),
    quantity: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("quantity").default(0).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const boostsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(boosts, ({ many })=>({
        inventory: many(userBoostInventory)
    }));
const userBoostInventoryRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(userBoostInventory, ({ one })=>({
        user: one(users, {
            fields: [
                userBoostInventory.userId
            ],
            references: [
                users.id
            ]
        }),
        boost: one(boosts, {
            fields: [
                userBoostInventory.boostId
            ],
            references: [
                boosts.id
            ]
        })
    }));
const gameSkins = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("game_skins", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("name", {
        length: 100
    }).notNull().unique(),
    nameRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_ru").notNull(),
    descriptionRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("description_ru"),
    previewImageUrl: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("preview_image_url"),
    skinType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("skin_type", {
        length: 20
    }).notNull().default("game"),
    colorPrimary: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("color_primary", {
        length: 20
    }),
    colorSecondary: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("color_secondary", {
        length: 20
    }),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const userSkins = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("user_skins", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    skinId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("skin_id", {
        length: 255
    }).notNull().references(()=>gameSkins.id),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(false).notNull(),
    acquiredAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("acquired_at").defaultNow().notNull()
});
const gameSkinsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(gameSkins, ({ many })=>({
        userSkins: many(userSkins)
    }));
const userSkinsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(userSkins, ({ one })=>({
        user: one(users, {
            fields: [
                userSkins.userId
            ],
            references: [
                users.id
            ]
        }),
        skin: one(gameSkins, {
            fields: [
                userSkins.skinId
            ],
            references: [
                gameSkins.id
            ]
        })
    }));
const boostPackages = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("boost_packages", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("name", {
        length: 100
    }).notNull(),
    nameRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_ru").notNull(),
    boostsPerType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("boosts_per_type").notNull(),
    priceStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("price_stars").notNull(),
    priceUsd: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("price_usd", {
        precision: 10,
        scale: 2
    }),
    originalPriceStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("original_price_stars"),
    badge: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("badge", {
        length: 50
    }),
    badgeText: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("badge_text"),
    bonusLives: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("bonus_lives").default(0).notNull(),
    bonusSkinId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("bonus_skin_id", {
        length: 255
    }).references(()=>gameSkins.id),
    sortOrder: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("sort_order").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const boostPackagePurchases = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("boost_package_purchases", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    packageId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("package_id", {
        length: 255
    }).notNull().references(()=>boostPackages.id),
    telegramPaymentId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("telegram_payment_id", {
        length: 255
    }),
    priceStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("price_stars").notNull(),
    boostsPerType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("boosts_per_type").notNull(),
    bonusLives: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("bonus_lives").default(0).notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("status", {
        length: 20
    }).default("pending").notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const cryptoPayments = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("crypto_payments", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    packageId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("package_id", {
        length: 255
    }).notNull().references(()=>boostPackages.id),
    network: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("network", {
        length: 30
    }).notNull(),
    priceUsd: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("price_usd", {
        precision: 10,
        scale: 2
    }).notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("status", {
        length: 30
    }).default("pending").notNull(),
    adminNote: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("admin_note"),
    confirmedBy: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("confirmed_by", {
        length: 255
    }),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("updated_at").defaultNow().notNull()
});
const cryptoPaymentsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(cryptoPayments, ({ one })=>({
        user: one(users, {
            fields: [
                cryptoPayments.userId
            ],
            references: [
                users.id
            ]
        }),
        package: one(boostPackages, {
            fields: [
                cryptoPayments.packageId
            ],
            references: [
                boostPackages.id
            ]
        })
    }));
const boostPackagesRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(boostPackages, ({ many })=>({
        purchases: many(boostPackagePurchases)
    }));
const boostPackagePurchasesRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(boostPackagePurchases, ({ one })=>({
        user: one(users, {
            fields: [
                boostPackagePurchases.userId
            ],
            references: [
                users.id
            ]
        }),
        package: one(boostPackages, {
            fields: [
                boostPackagePurchases.packageId
            ],
            references: [
                boostPackages.id
            ]
        })
    }));
const beadsTransactions = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("beads_transactions", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).references(()=>users.id),
    type: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("type", {
        length: 50
    }).notNull(),
    amount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("amount").notNull(),
    balanceBefore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("balance_before").notNull(),
    balanceAfter: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("balance_after").notNull(),
    houseBalanceBefore: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("house_balance_before"),
    houseBalanceAfter: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("house_balance_after"),
    description: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("description"),
    gameScoreId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("game_score_id", {
        length: 255
    }).references(()=>gameScores.id),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    deletedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("deleted_at"),
    deletedBy: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("deleted_by", {
        length: 255
    }),
    deleteReason: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("delete_reason")
});
const beadsTransactionsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(beadsTransactions, ({ one })=>({
        user: one(users, {
            fields: [
                beadsTransactions.userId
            ],
            references: [
                users.id
            ]
        }),
        gameScore: one(gameScores, {
            fields: [
                beadsTransactions.gameScoreId
            ],
            references: [
                gameScores.id
            ]
        })
    }));
const characters = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("characters", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id).unique(),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name").notNull(),
    gender: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("gender", {
        length: 10
    }).notNull(),
    hunger: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("hunger").default(100).notNull(),
    thirst: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("thirst").default(100).notNull(),
    fatigue: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("fatigue").default(0).notNull(),
    lastCareAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("last_care_at").defaultNow(),
    careCooldowns: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("care_cooldowns").default('{}'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const accessoryCategories = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("accessory_categories", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("name", {
        length: 50
    }).notNull().unique(),
    nameRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_ru").notNull(),
    slot: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("slot", {
        length: 20
    }).notNull(),
    sortOrder: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("sort_order").default(0).notNull()
});
const baseBodies = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("base_bodies", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    gender: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("gender", {
        length: 10
    }).notNull(),
    imageUrl: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("image_url").notNull(),
    isDefault: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_default").default(false).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const accessories = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("accessories", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    categoryId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("category_id", {
        length: 255
    }).notNull().references(()=>accessoryCategories.id),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("name", {
        length: 100
    }).notNull(),
    nameRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_ru").notNull(),
    descriptionRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("description_ru"),
    imageUrl: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("image_url").notNull(),
    gender: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("gender", {
        length: 10
    }).notNull(),
    positionX: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("position_x").default(0).notNull(),
    positionY: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("position_y").default(0).notNull(),
    zIndex: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("z_index").default(1).notNull(),
    scale: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("scale", {
        precision: 5,
        scale: 2
    }).default("1.0").notNull(),
    price: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("price").default(100).notNull(),
    maxQuantity: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("max_quantity"),
    soldCount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("sold_count").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const userAccessories = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("user_accessories", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    accessoryId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("accessory_id", {
        length: 255
    }).notNull().references(()=>accessories.id),
    isEquipped: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_equipped").default(false).notNull(),
    purchasedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("purchased_at").defaultNow().notNull()
});
const charactersRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(characters, ({ one })=>({
        user: one(users, {
            fields: [
                characters.userId
            ],
            references: [
                users.id
            ]
        })
    }));
const accessoriesRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(accessories, ({ one, many })=>({
        category: one(accessoryCategories, {
            fields: [
                accessories.categoryId
            ],
            references: [
                accessoryCategories.id
            ]
        }),
        userAccessories: many(userAccessories)
    }));
const userAccessoriesRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(userAccessories, ({ one })=>({
        user: one(users, {
            fields: [
                userAccessories.userId
            ],
            references: [
                users.id
            ]
        }),
        accessory: one(accessories, {
            fields: [
                userAccessories.accessoryId
            ],
            references: [
                accessories.id
            ]
        })
    }));
const leagues = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("leagues", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    slug: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("slug", {
        length: 50
    }).notNull().unique(),
    nameRu: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_ru").notNull(),
    nameEn: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name_en").notNull(),
    icon: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("icon").notNull(),
    minBeads: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("min_beads").default(0).notNull(),
    maxRank: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("max_rank"),
    themeColor: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("theme_color", {
        length: 20
    }).notNull(),
    sortOrder: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("sort_order").default(0).notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const insertLeagueSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(leagues).omit({
    id: true,
    createdAt: true
});
const updateLeagueSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    nameRu: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    nameEn: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    icon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    minBeads: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    maxRank: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional().nullable(),
    themeColor: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    isActive: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
const insertBeadsTransactionSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(beadsTransactions).omit({
    id: true,
    createdAt: true
});
const insertUserSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(users).omit({
    id: true,
    totalPoints: true,
    gamesPlayed: true,
    bestScore: true,
    isAdmin: true,
    completedLevels: true,
    createdAt: true
});
const insertGameScoreSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(gameScores, {
    score: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0, "Score cannot be negative").max(100000, "Score is unrealistically high"),
    cryptoBtc: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(100, "Too many BTC collected"),
    cryptoEth: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(100, "Too many ETH collected"),
    cryptoUsdt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(100, "Too many USDT collected"),
    maxCombo: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(500, "Max combo is unrealistically high"),
    accuracy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(100, "Accuracy must be between 0 and 100"),
    duration: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).max(300, "Game duration is out of bounds")
}).omit({
    id: true,
    createdAt: true
});
const insertGameConfigSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(gameConfig).omit({
    id: true,
    updatedAt: true
});
const insertPrizePoolSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(prizePool).omit({
    id: true,
    createdAt: true
});
const insertUsdtFundSettingsSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(usdtFundSettings).omit({
    id: true,
    updatedAt: true
});
const insertRealRewardSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(realRewards).omit({
    id: true,
    createdAt: true
});
const insertSeasonSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(seasons).omit({
    id: true,
    createdAt: true
});
const insertSeasonResultSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(seasonResults).omit({
    id: true,
    createdAt: true
});
const insertReferralRewardSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(referralRewards).omit({
    id: true,
    createdAt: true
});
const insertBoostSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(boosts).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
const insertUserBoostInventorySchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(userBoostInventory).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
const insertCharacterSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(characters).omit({
    id: true,
    createdAt: true
});
const insertAccessoryCategorySchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(accessoryCategories).omit({
    id: true
});
const insertBaseBodySchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(baseBodies).omit({
    id: true,
    createdAt: true
});
const insertAccessorySchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(accessories).omit({
    id: true,
    soldCount: true,
    createdAt: true
});
const insertUserAccessorySchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(userAccessories).omit({
    id: true,
    purchasedAt: true
});
const insertGameSkinSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(gameSkins).omit({
    id: true,
    createdAt: true
});
const insertUserSkinSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(userSkins).omit({
    id: true,
    acquiredAt: true
});
const insertBoostPackageSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(boostPackages).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
const insertBoostPackagePurchaseSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(boostPackagePurchases).omit({
    id: true,
    createdAt: true
});
const insertCryptoPaymentSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(cryptoPayments).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
const teamMembers = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("team_members", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    name: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("name").notNull(),
    role: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("role"),
    sharePercent: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["real"])("share_percent").default(15).notNull(),
    totalEarnedStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_earned_stars").default(0).notNull(),
    totalEarnedUsd: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("total_earned_usd", {
        precision: 12,
        scale: 2
    }).default("0").notNull(),
    isActive: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("is_active").default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const insertTeamMemberSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(teamMembers).omit({
    id: true,
    createdAt: true
});
const revenueShares = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("revenue_shares", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    purchaseId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("purchase_id", {
        length: 255
    }),
    cryptoPaymentId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("crypto_payment_id", {
        length: 255
    }),
    paymentType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("payment_type", {
        length: 20
    }).notNull(),
    totalStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("total_stars").default(0).notNull(),
    totalUsd: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("total_usd", {
        precision: 12,
        scale: 2
    }).default("0").notNull(),
    developmentStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("development_stars").default(0).notNull(),
    developmentUsd: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("development_usd", {
        precision: 12,
        scale: 2
    }).default("0").notNull(),
    advertisingStars: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("advertising_stars").default(0).notNull(),
    advertisingUsd: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("advertising_usd", {
        precision: 12,
        scale: 2
    }).default("0").notNull(),
    teamSharesJson: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["jsonb"])("team_shares_json").default({}).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const insertRevenueShareSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(revenueShares).omit({
    id: true,
    createdAt: true
});
const withdrawalRequests = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("withdrawal_requests", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    cryptoType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("crypto_type", {
        length: 10
    }).notNull(),
    network: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("network", {
        length: 20
    }),
    amount: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("amount", {
        precision: 18,
        scale: 8
    }).notNull(),
    walletAddress: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("wallet_address").notNull(),
    networkFee: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["numeric"])("network_fee", {
        precision: 18,
        scale: 8
    }).default("0").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("status", {
        length: 20
    }).default("pending").notNull(),
    adminNote: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("admin_note"),
    txHash: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["text"])("tx_hash"),
    processedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("processed_at"),
    processedBy: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("processed_by", {
        length: 255
    }).references(()=>users.id),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull()
});
const withdrawalRequestsRelations = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["relations"])(withdrawalRequests, ({ one })=>({
        user: one(users, {
            fields: [
                withdrawalRequests.userId
            ],
            references: [
                users.id
            ]
        }),
        processedByUser: one(users, {
            fields: [
                withdrawalRequests.processedBy
            ],
            references: [
                users.id
            ]
        })
    }));
const insertWithdrawalRequestSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(withdrawalRequests).omit({
    id: true,
    status: true,
    adminNote: true,
    txHash: true,
    processedAt: true,
    processedBy: true,
    createdAt: true
});
const beadsBoxSessions = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("beads_box_sessions", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    sessionDate: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["date"])("session_date").notNull(),
    boxes: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["jsonb"])("boxes").notNull(),
    selectedBoxIndex: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["integer"])("selected_box_index"),
    rewardClaimed: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["boolean"])("reward_claimed").default(false).notNull(),
    rewardType: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("reward_type", {
        length: 50
    }),
    rewardValue: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["jsonb"])("reward_value"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    claimedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("claimed_at")
});
const insertBeadsBoxSessionSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(beadsBoxSessions).omit({
    id: true,
    createdAt: true
});
const cryptoGameTickets = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["pgTable"])("crypto_game_tickets", {
    id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("id", {
        length: 255
    }).primaryKey().default(__TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["sql"]`gen_random_uuid()`),
    userId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("user_id", {
        length: 255
    }).notNull().references(()=>users.id),
    sourceSessionId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("source_session_id", {
        length: 255
    }).references(()=>beadsBoxSessions.id),
    status: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("status", {
        length: 20
    }).default("available").notNull(),
    usedAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("used_at"),
    gameScoreId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["varchar"])("game_score_id", {
        length: 255
    }).references(()=>gameScores.id),
    createdAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("created_at").defaultNow().notNull(),
    expiresAt: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$pg$2d$core__$5b$external$5d$__$28$drizzle$2d$orm$2f$pg$2d$core$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["timestamp"])("expires_at")
});
const insertCryptoGameTicketSchema = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$zod__$5b$external$5d$__$28$drizzle$2d$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$zod$29$__["createInsertSchema"])(cryptoGameTickets).omit({
    id: true,
    createdAt: true
});
const updateBeadsBoxConfigSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    boxCount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).max(10).optional(),
    rewards: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        beads: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            min: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0),
            max: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional(),
            weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0)
        }).default({
            min: 10,
            max: 100,
            weight: 40
        }),
        boost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            quantity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0),
            weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0)
        }).default({
            quantity: 1,
            weight: 20
        }),
        lives: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            min: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0),
            max: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional(),
            weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0)
        }).default({
            min: 1,
            max: 3,
            weight: 30
        }),
        cryptoTicket: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
            weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0)
        }).default({
            weight: 10
        })
    }).default({
        beads: {
            min: 10,
            max: 100,
            weight: 40
        },
        boost: {
            quantity: 1,
            weight: 20
        },
        lives: {
            min: 1,
            max: 3,
            weight: 30
        },
        cryptoTicket: {
            weight: 10
        }
    }),
    cryptoTicketMinLevel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0).optional()
});
const adminUserUpdateSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    username: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    totalPoints: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    gamesPlayed: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    bestScore: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    isAdmin: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    btcBalanceSats: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    ethBalanceWei: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional(),
    usdtBalance: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    referredBy: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional()
});
const adminUserIsAdminUpdateSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    isAdmin: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean()
});
const updateFundTogglesSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    cryptoFundEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    usdtFundEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional()
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/db.ts [api] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createDirectDbConnection",
    ()=>createDirectDbConnection,
    "db",
    ()=>db,
    "getDbClient",
    ()=>getDbClient,
    "pool",
    ()=>pool,
    "withDbTransaction",
    ()=>withDbTransaction,
    "withTempDbConnection",
    ()=>withTempDbConnection
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$node$2d$postgres__$5b$external$5d$__$28$drizzle$2d$orm$2f$node$2d$postgres$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__ = __turbopack_context__.i("[externals]/drizzle-orm/node-postgres [external] (drizzle-orm/node-postgres, esm_import, [project]/node_modules/drizzle-orm)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/schema.ts [api] (ecmascript)");
// Экспортируем также функции для использования в API маршрутах
var __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__ = __turbopack_context__.i("[externals]/drizzle-orm [external] (drizzle-orm, esm_import, [project]/node_modules/drizzle-orm)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$node$2d$postgres__$5b$external$5d$__$28$drizzle$2d$orm$2f$node$2d$postgres$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$node$2d$postgres__$5b$external$5d$__$28$drizzle$2d$orm$2f$node$2d$postgres$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// Определяем URL для подключения в зависимости от назначения
const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_URL = process.env.DIRECT_URL || DATABASE_URL; // Используем DIRECT_URL для миграций, если доступен
if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set!");
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
// Функция для извлечения хоста и порта из URL
function parseConnectionString(connectionString) {
    try {
        const url = new URL(connectionString);
        return {
            host: url.hostname,
            port: url.port || '5432',
            fullUrl: connectionString
        };
    } catch (error) {
        console.error("Error parsing connection string:", error);
        return {
            host: 'unknown',
            port: 'unknown',
            fullUrl: connectionString
        };
    }
}
// Добавляем sslmode=require к строке подключения, если его нет
function ensureSslMode(connectionString) {
    if (!connectionString.includes('sslmode=')) {
        return connectionString + (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
    }
    return connectionString;
}
// Определяем, какой URL использовать для основного подключения
const connectionTarget = ensureSslMode(DATABASE_URL);
const { host, port } = parseConnectionString(connectionTarget);
console.log("Attempting to connect to database...");
console.log("Connecting to host:", host, "on port:", port);
console.log("DATABASE_URL exists:", !!DATABASE_URL);
console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
console.log("DATABASE_URL being used:", DATABASE_URL ? DATABASE_URL.substring(0, 50) + "..." : "UNDEFINED");
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: connectionTarget,
    ssl: {
        rejectUnauthorized: false
    },
    // Минимальные настройки для serverless
    connectionTimeoutMillis: 1000,
    idleTimeoutMillis: 5000,
    max: 1 // Только одно соединение
});
async function getDbClient() {
    const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Client"]({
        connectionString: connectionTarget,
        ssl: {
            rejectUnauthorized: false
        }
    });
    await client.connect();
    return client;
}
async function withDbTransaction(callback) {
    const client = await getDbClient();
    try {
        // Создаем Drizzle DB с логированием для отладки
        const db = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$node$2d$postgres__$5b$external$5d$__$28$drizzle$2d$orm$2f$node$2d$postgres$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["drizzle"])(client, {
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
            logger: true // Включаем логирование для просмотра запросов
        });
        const result = await callback(db);
        return result;
    } finally{
        await client.end(); // Обязательно закрываем соединение
    }
}
const db = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$node$2d$postgres__$5b$external$5d$__$28$drizzle$2d$orm$2f$node$2d$postgres$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["drizzle"])(pool, {
    schema: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    logger: true // Включаем логирование для просмотра запросов
});
;
async function createDirectDbConnection() {
    let directUrl = process.env.DIRECT_URL || DATABASE_URL;
    if (!directUrl) {
        throw new Error("Either DIRECT_URL or DATABASE_URL must be set");
    }
    directUrl = ensureSslMode(directUrl); // Добавляем sslmode=require
    const { host: directHost, port: directPort } = parseConnectionString(directUrl);
    console.log("Creating direct connection to host:", directHost, "on port:", directPort);
    const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Client"]({
        connectionString: directUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });
    try {
        await client.connect();
        // Создаем Drizzle DB с логированием для совместимости
        const directDb = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm$2f$node$2d$postgres__$5b$external$5d$__$28$drizzle$2d$orm$2f$node$2d$postgres$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["drizzle"])(client, {
            schema: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
            logger: true // Включаем логирование
        });
        return {
            db: directDb,
            client
        };
    } catch (error) {
        await client.end(); // Обязательно закрываем клиент при ошибке
        throw error;
    }
}
async function withTempDbConnection(callback) {
    const { db, client } = await createDirectDbConnection(); // Используем прямое соединение
    try {
        const result = await callback(db);
        return result;
    } finally{
        // Всегда закрываем клиент соединения после использования
        await client.end();
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/api/auth/me.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// pages/api/auth/me.ts
__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/server/db.ts [api] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/schema.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__ = __turbopack_context__.i("[externals]/drizzle-orm [external] (drizzle-orm, esm_import, [project]/node_modules/drizzle-orm)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    try {
        // Получаем ID пользователя из сессии или заголовков (в зависимости от вашей системы аутентификации)
        // В данном случае предполагаем, что ID пользователя передается в заголовке или сессии
        const userId = req.headers['x-user-id'] || req.cookies?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'User not authenticated'
            });
        }
        // Проверяем, существует ли пользователь в базе данных
        let user = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["users"]).where((0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["users"].id, userId)).limit(1);
        if (user.length === 0) {
            // Если пользователя нет, создаем его
            const newUser = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["users"]).values({
                id: userId,
                username: `user_${Date.now()}`,
                totalPoints: 0,
                gamesPlayed: 0,
                bestScore: 0,
                isAdmin: false,
                btcBalance: 0,
                ethBalance: 0,
                usdtBalance: 0,
                btcBalanceSats: 0n,
                btcTodaySats: 0n,
                ethBalanceWei: 0n,
                ethTodayWei: 0n,
                usdtToday: "0",
                referralCode: `REF_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                directReferralsCount: 0,
                completedLevels: [],
                signupBonusReceived: false,
                ratingScore: 0,
                totalScore: 0,
                totalWins: 0,
                currentWinStreak: 0,
                bestWinStreak: 0,
                totalCombo5Plus: 0,
                characterEnergy: 100,
                bonusLives: 0,
                lastActivityAt: new Date(),
                createdAt: new Date()
            }).returning();
            user = newUser;
        } else {
            // Обновляем время последней активности
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$api$5d$__$28$ecmascript$29$__$3c$locals$3e$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["users"]).set({
                lastActivityAt: new Date()
            }).where((0, __TURBOPACK__imported__module__$5b$externals$5d2f$drizzle$2d$orm__$5b$external$5d$__$28$drizzle$2d$orm$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$schema$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["users"].id, userId));
        }
        // Возвращаем данные пользователя
        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Error in /api/auth/me:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__319e33a1._.js.map