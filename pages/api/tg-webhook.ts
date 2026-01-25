import { createClient } from '@supabase/supabase-js';

// Инициализируем Supabase с сервисным ключом (чтобы обойти RLS и взять токен)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // 1. Достаем токен из базы
  const { data: config } = await supabase
    .from('game_config')
    .select('tg_bot_token')
    .eq('id', 1)
    .single();

  if (!config?.tg_bot_token) return res.status(500).json({ error: 'Token not found' });

  const { message } = req.body;

  if (message?.text === '/start') {
    const chatId = message.chat.id;
    const text = 'Добро пожаловать в BeadsLine! 🎮 Твои 1500 Beads уже на счету.';

    // 2. Отправляем ответ в Telegram, используя токен из базы
    await fetch(`https://api.telegram.org/bot${config.tg_bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
  }

  res.status(200).send('OK');
}