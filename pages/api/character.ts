// pages/api/character.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Получение информации о персонаже
    try {
      // В реальном приложении здесь будет логика получения данных персонажа из базы данных
      const character = null; // по умолчанию персонаж не существует
      
      res.status(200).json(character);
    } catch (error) {
      console.error('Error in /api/character GET:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Создание или обновление персонажа
    try {
      // В реальном приложении здесь будет логика создания/обновления персонажа в базе данных
      const updatedCharacter = {
        // данные обновленного персонажа
      };
      
      res.status(200).json(updatedCharacter);
    } catch (error) {
      console.error('Error in /api/character POST:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}