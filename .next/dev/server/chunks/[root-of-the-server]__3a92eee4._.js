module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/character.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// pages/api/character.ts
__turbopack_context__.s([
    "default",
    ()=>handler
]);
async function handler(req, res) {
    if (req.method === 'GET') {
        // Получение информации о персонаже
        try {
            // В реальном приложении здесь будет логика получения данных персонажа из базы данных
            const character = null; // по умолчанию персонаж не существует
            res.status(200).json(character);
        } catch (error) {
            console.error('Error in /api/character GET:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    } else if (req.method === 'POST') {
        // Создание или обновление персонажа
        try {
            // В реальном приложении здесь будет логика создания/обновления персонажа в базе данных
            const updatedCharacter = {
            };
            res.status(200).json(updatedCharacter);
        } catch (error) {
            console.error('Error in /api/character POST:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    } else {
        res.status(405).json({
            error: 'Method not allowed'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3a92eee4._.js.map