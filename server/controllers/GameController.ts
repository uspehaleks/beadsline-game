import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";
import { z } from "zod";
import { insertGameScoreSchema } from "../../shared/schema.js";

// Контроллер для основной игровой логики
export class GameController {
  // Метод для создания результата игры
  async createGameScore(req: Request, res: Response) {
    try {
      const validatedData = insertGameScoreSchema.parse(req.body);

      // Проверка на реалистичность очков (защита от читерства)
      const { score, duration } = validatedData;

      // Максимальное количество очков в секунду (на основе реалистичной игры)
      // Предполагаем, что максимальный возможный скор - около 1000 очков в секунду
      const MAX_SCORE_PER_SECOND = 1000;

      if (duration && duration > 0) {
        const calculatedMaxScore = duration * MAX_SCORE_PER_SECOND;

        if (score > calculatedMaxScore) {
          console.warn(`Potential cheating detected: user scored ${score} points in ${duration} seconds (max expected: ${calculatedMaxScore})`);
          return res.status(400).json({
            error: 'Score too high for the given duration. Possible cheating detected.'
          });
        }
      } else if (duration === 0 && score > 5000) {
        // Если продолжительность игры 0, но очки высокие - это подозрительно
        console.warn(`Potential cheating detected: user scored ${score} points in 0 seconds`);
        return res.status(400).json({
          error: 'Score too high for zero duration. Possible cheating detected.'
        });
      }

      const gameScore = await storage.createGameScore(validatedData);

      res.status(201).json(gameScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Метод для получения результатов игр пользователя
  async getUserScores(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const scores = await storage.getUserScores(userId, limit);
      
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения всех результатов игр
  async getAllScores(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const scores = await storage.getAllScores(limit, offset);
      const count = await storage.getScoreCount();
      
      res.json({
        scores,
        count,
        limit,
        offset,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения таблицы лидеров
  async getLeaderboard(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const period = req.query.period === 'week' || req.query.period === 'today' ? req.query.period : 'all';
      
      const leaderboard = await storage.getLeaderboard(limit, period as 'all' | 'week' | 'today');
      
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для получения таблицы лидеров друзей
  async getFriendsLeaderboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const leaderboard = await storage.getFriendsLeaderboardGlobal(userId, limit);
      
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Метод для завершения игры и обновления уровня
  async completeLevel(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { score, levelId, isVictory, maxCombo, duration } = req.body;

      if (!userId || score === undefined || levelId === undefined || isVictory === undefined) {
        return res.status(400).json({ error: 'Missing required fields: userId, score, levelId, isVictory' });
      }

      // Проверка на минимальное время прохождения (защита от взлома)
      const MIN_DURATION_SECONDS = 0.5;
      if (duration && duration < MIN_DURATION_SECONDS) {
        console.warn(`Potential cheating detected in completeLevel: user completed level in ${duration} seconds (minimum expected: ${MIN_DURATION_SECONDS})`);
        return res.status(400).json({
          error: 'Level completed too quickly. Possible cheating detected.'
        });
      }

      // Проверка на реалистичность очков (защита от читерства)
      // Максимальное количество очков в секунду (на основе реалистичной игры)
      const MAX_SCORE_PER_SECOND = 1000;

      if (duration && duration > 0) {
        const calculatedMaxScore = duration * MAX_SCORE_PER_SECOND;

        if (score > calculatedMaxScore) {
          console.warn(`Potential cheating detected in completeLevel: user scored ${score} points in ${duration} seconds (max expected: ${calculatedMaxScore})`);
          return res.status(400).json({
            error: 'Score too high for the given duration. Possible cheating detected.'
          });
        }
      } else if (duration === 0 && score > 5000) {
        // Если продолжительность игры 0, но очки высокие - это подозрительно
        console.warn(`Potential cheating detected in completeLevel: user scored ${score} points in 0 seconds`);
        return res.status(400).json({
          error: 'Score too high for zero duration. Possible cheating detected.'
        });
      }

      // Получаем текущую лигу пользователя для определения необходимости повышения
      const userLeague = await storage.getUserLeague(userId);

      const result = await storage.recordGameAndCompleteLevel(
        userId,
        score,
        levelId,
        isVictory,
        maxCombo,
        userLeague?.league.slug,
        userLeague?.league.sortOrder
      );

      // Проверяем, были ли крипто-награды начислены при первом прохождении
      if (isVictory && result.isFirstPassage) {
        console.log(`Crypto rewards granted for first passage of level ${levelId} by user ${userId}`);
      } else if (isVictory && !result.isFirstPassage) {
        console.log(`Level ${levelId} victory by user ${userId}, but crypto rewards were not granted (not first passage)`);
      }

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const gameController = new GameController();