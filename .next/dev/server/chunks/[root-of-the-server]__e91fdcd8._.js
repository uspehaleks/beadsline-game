module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/health-check.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Next.js API route for health check
__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    // Простой тест: проверяем, видит ли сервер переменные окружения
    const databaseUrlStatus = process.env.DATABASE_URL ? "Found" : "Not Found";
    console.log("Environment variables check:");
    console.log("- DATABASE_URL Status:", databaseUrlStatus);
    console.log("- PORT:", process.env.PORT || 'Not Set');
    console.log("- NODE_ENV:", ("TURBOPACK compile-time value", "development") || 'Not Set');
    res.status(200).json({
        test: "hello",
        databaseUrlStatus: databaseUrlStatus,
        timestamp: new Date().toISOString(),
        message: 'Health check endpoint is working',
        env: {
            databaseUrlExists: !!process.env.DATABASE_URL,
            port: process.env.PORT || 'Not Set',
            nodeEnv: ("TURBOPACK compile-time value", "development") || 'Not Set'
        }
    });
}
const config = {
    api: {
        bodyParser: false
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e91fdcd8._.js.map