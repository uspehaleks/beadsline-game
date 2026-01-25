import { NextApiRequest, NextApiResponse } from 'next'; // Добавляем импорт типов
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest, // Указываем тип для запроса
  res: NextApiResponse // Указываем тип для ответа
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ... остальная часть кода ...
  
  const { data: config } = await supabase
    .from('game_config')
    .select('tg_bot_token')
    .eq('id', 1)
    .single();

  if (!config?.tg_bot_token) {
    return res.status(500).json({ error: 'Token not found in database' });
  }

  // В телеграме данные приходят в req.body
  const { message } = req.body;

  if (message?.text === '/start') {
    const chatId = message.chat.id;
    const text = 'Добро пожаловать в BeadsLine! 🎮 Твои 1500 Beads уже на счету.';

    try {
      await fetch(`https://api.telegram.org/bot${config.tg_bot_token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text }),
      });
    } catch (err) {
      console.error('Ошибка отправки в TG:', err);
    }
  }

  return res.status(200).send('OK');
}