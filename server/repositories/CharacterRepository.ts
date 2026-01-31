import { db } from '../db'; // Используем основное подключение для обычных запросов
import { characters, type Character, userBoosts, type UserBoost } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export class CharacterRepository {
  /**
   * Создает нового персонажа
   */
  async createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values({
      ...characterData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return newCharacter;
  }

  /**
   * Находит персонажа по ID пользователя
   */
  async findByUserId(userId: string): Promise<Character | null> {
    const [character] = await db.select().from(characters).where(eq(characters.userId, userId));
    return character || null;
  }

  /**
   * Находит персонажа по ID
   */
  async findById(id: string): Promise<Character | null> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || null;
  }

  /**
   * Обновляет персонажа
   */
  async update(id: string, updateData: Partial<Character>): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Удаляет персонажа
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return result.rowCount > 0;
  }

  /**
   * Увеличивает энергию персонажа
   */
  async increaseEnergy(characterId: string, amount: number): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        energy: sql`${characters.energy} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Уменьшает энергию персонажа
   */
  async decreaseEnergy(characterId: string, amount: number): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        energy: sql`${characters.energy} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Восстанавливает здоровье персонажа
   */
  async healCharacter(characterId: string, amount: number): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        health: sql`LEAST(${characters.health} + ${amount}, 100)`, // Ограничиваем максимальное здоровье 100
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Изменяет настроение персонажа
   */
  async changeMood(characterId: string, mood: 'happy' | 'neutral' | 'sad'): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        mood,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Изменяет состояние здоровья персонажа
   */
  async changeHealthState(characterId: string, healthState: 'normal' | 'tired' | 'sick'): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        healthState,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Увеличивает уровень персонажа
   */
  async increaseLevel(characterId: string, amount: number = 1): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        level: sql`${characters.level} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Обновляет статистику персонажа
   */
  async updateStats(characterId: string, stats: {
    gamesPlayed?: number;
    wins?: number;
    losses?: number;
    totalPoints?: number;
    bestScore?: number;
  }): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        ...stats,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Увеличивает счетчик выполненных заданий
   */
  async incrementCompletedTasks(characterId: string, amount: number = 1): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        completedTasks: sql`${characters.completedTasks} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Обновляет параметры голода, жажды и усталости
   */
  async updateNeeds(characterId: string, needs: {
    hunger?: number;
    thirst?: number;
    fatigue?: number;
  }): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        ...needs,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Восстанавливает все параметры персонажа
   */
  async restoreAll(characterId: string): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        energy: 100,
        health: 100,
        mood: 'happy',
        healthState: 'normal',
        hunger: 100,
        thirst: 100,
        fatigue: 0,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Проверяет, существует ли персонаж
   */
  async exists(userId: string): Promise<boolean> {
    const character = await this.findByUserId(userId);
    return character !== null;
  }

  /**
   * Получает уровень энергии персонажа
   */
  async getEnergyLevel(characterId: string): Promise<number> {
    const character = await this.findById(characterId);
    return character?.energy || 0;
  }

  /**
   * Проверяет, может ли персонаж выполнять действия
   */
  async canAct(characterId: string): Promise<boolean> {
    const character = await this.findById(characterId);
    if (!character) return false;
    
    // Персонаж может действовать, если у него достаточно энергии и он здоров
    return character.energy > 10 && character.health > 20 && character.healthState !== 'sick';
  }

  /**
   * Обновляет имя персонажа
   */
  async updateName(characterId: string, name: string): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Обновляет пол персонажа
   */
  async updateGender(characterId: string, gender: 'male' | 'female'): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        gender,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Получает всех персонажей с фильтрацией
   */
  async getCharactersWithFilters(filters: {
    minLevel?: number;
    maxLevel?: number;
    gender?: 'male' | 'female';
    minEnergy?: number;
    sortBy?: 'level' | 'energy' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Character[]> {
    let query = db.select().from(characters);

    if (filters.minLevel !== undefined) {
      query = query.where(sql`${characters.level} >= ${filters.minLevel}`);
    }

    if (filters.maxLevel !== undefined) {
      query = query.where(sql`${characters.level} <= ${filters.maxLevel}`);
    }

    if (filters.gender) {
      query = query.where(eq(characters.gender, filters.gender));
    }

    if (filters.minEnergy !== undefined) {
      query = query.where(sql`${characters.energy} >= ${filters.minEnergy}`);
    }

    if (filters.sortBy) {
      const orderColumn = characters[filters.sortBy];
      query = query.orderBy(
        filters.sortOrder === 'desc' ? sql`${orderColumn} DESC` : orderColumn
      );
    }

    return await query;
  }

  /**
   * Получает статистику персонажей
   */
  async getCharacterStats(): Promise<{
    totalCharacters: number;
    avgLevel: number;
    avgEnergy: number;
    avgHealth: number;
  }> {
    const result = await db
      .select({
        totalCharacters: sql<number>`COUNT(*)`,
        avgLevel: sql<number>`AVG(${characters.level})`,
        avgEnergy: sql<number>`AVG(${characters.energy})`,
        avgHealth: sql<number>`AVG(${characters.health})`,
      })
      .from(characters);
      
    return result[0] || {
      totalCharacters: 0,
      avgLevel: 0,
      avgEnergy: 0,
      avgHealth: 0,
    };
  }

  /**
   * Возвращает количество персонажей по полу
   */
  async getCharacterCountByGender(): Promise<Record<string, number>> {
    const result = await db
      .select({
        gender: characters.gender,
        count: sql<number>`COUNT(*)`,
      })
      .from(characters)
      .groupBy(characters.gender);
      
    return result.reduce((acc, curr) => {
      acc[curr.gender || 'unknown'] = curr.count;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Обновляет бонусные жизни
   */
  async updateBonusLives(characterId: string, bonusLives: number): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        bonusLives,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Увеличивает бонусные жизни
   */
  async incrementBonusLives(characterId: string, amount: number): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        bonusLives: sql`${characters.bonusLives} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }

  /**
   * Сбрасывает параметры нужд персонажа
   */
  async resetNeeds(characterId: string): Promise<Character | null> {
    const [updatedCharacter] = await db.update(characters)
      .set({
        hunger: 100,
        thirst: 100,
        fatigue: 0,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, characterId))
      .returning();
      
    return updatedCharacter || null;
  }
}