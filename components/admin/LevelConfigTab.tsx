import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';
import type { LevelConfigDB as LevelConfig, InsertLevelConfig } from '@shared/schema';

export default function LevelConfigTab() {
  const [levelConfigs, setLevelConfigs] = useState<Record<number, LevelConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLevelConfigs();
  }, []);

  const fetchLevelConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/admin/level-configs');
      const configs: LevelConfig[] = await response.json();
      const configMap: Record<number, LevelConfig> = {};

      // Заполняем конфигурации для всех 10 уровней, даже если они не существуют в БД
      for (let i = 1; i <= 10; i++) {
        const existingConfig = configs.find((c) => c.levelId === i);
        if (existingConfig) {
          configMap[i] = existingConfig;
        } else {
          // Создаем конфигурацию по умолчанию
          const defaultConfig: LevelConfig = {
            id: `default-${i}`, // UUID должен быть строкой
            levelId: i,
            config: {
              levelId: i,
              cryptoSpawnChance: 0.08, // Значение по умолчанию
              ballCount: 5 + Math.floor(i * 0.5), // Пример: увеличиваем кол-во шариков с уровнем
              speed: 1 + i * 0.1, // Пример: увеличиваем скорость с уровнем
              rewardMultiplier: 1 + i * 0.1, // Пример: увеличиваем множитель награды
              difficulty: i <= 3 ? 'easy' : i <= 6 ? 'medium' : 'hard', // Пример: сложность по уровнем
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          configMap[i] = defaultConfig;
        }
      }
      
      setLevelConfigs(configMap);
    } catch (error) {
      console.error('Error fetching level configs:', error);
      toast.error('Ошибка при загрузке конфигурации уровней');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelConfigChange = (levelId: number, field: string, value: any) => {
    setLevelConfigs(prev => {
      const updated = { ...prev };
      if (updated[levelId]) {
        updated[levelId] = {
          ...updated[levelId],
          config: {
            ...(updated[levelId].config || {}),
            [field]: value
          }
        };
      }
      return updated;
    });
  };

  const handleSaveLevelConfig = async (levelId: number) => {
    try {
      setIsSaving(true);
      const config = levelConfigs[levelId];
      
      if (!config) {
        toast.error(`Конфигурация для уровня ${levelId} не найдена`);
        return;
      }

      // Подготовим данные для отправки
      const updateData: Partial<InsertLevelConfig> = {
        levelId: config.levelId,
        config: config.config as any
      };

      // Если конфигурации еще нет в БД, создаем новую, иначе обновляем
      const existingInDb = await apiRequest('GET', `/api/admin/level-configs/${levelId}`).catch(() => null);
      
      if (existingInDb) {
        await apiRequest('PUT', `/api/admin/level-configs/${levelId}`, updateData);
      } else {
        await apiRequest('POST', '/api/admin/level-configs', updateData);
      }
      
      toast.success(`Конфигурация уровня ${levelId} сохранена`);
    } catch (error) {
      console.error(`Error saving level ${levelId} config:`, error);
      toast.error(`Ошибка при сохранении конфигурации уровня ${levelId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      // Сохраняем все конфигурации
      for (const levelId in levelConfigs) {
        const config = levelConfigs[parseInt(levelId)];
        
        if (!config) continue;

        // Подготовим данные для отправки
        const updateData: Partial<InsertLevelConfig> = {
          levelId: config.levelId,
          config: config.config as any
        };

        // Если конфигурации еще нет в БД, создаем новую, иначе обновляем
        const existingInDb = await apiRequest('GET', `/api/admin/level-configs/${config.levelId}`).catch(() => null);
        
        if (existingInDb) {
          await apiRequest('PUT', `/api/admin/level-configs/${config.levelId}`, updateData);
        } else {
          await apiRequest('POST', '/api/admin/level-configs', updateData);
        }
      }
      
      toast.success('Все конфигурации уровней сохранены');
    } catch (error) {
      console.error('Error saving all level configs:', error);
      toast.error('Ошибка при сохранении конфигураций уровней');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Загрузка конфигурации уровней...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Конфигурация уровней</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Настройте параметры для каждого уровня, включая шанс спавна крипто-шариков
          </p>
          
          <div className="space-y-6">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((levelId) => {
              const config = levelConfigs[levelId];
              if (!config) return null;
              
              return (
                <div key={levelId} className="border rounded-lg p-4 bg-card">
                  <h3 className="text-lg font-semibold mb-4">Уровень {levelId}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`crypto-chance-${levelId}`}>Шанс спавна крипто-шариков</Label>
                      <Slider
                        id={`crypto-chance-${levelId}`}
                        min={0}
                        max={1}
                        step={0.01}
                        value={[(config.config as any).cryptoSpawnChance]}
                        onValueChange={(value) => handleLevelConfigChange(levelId, 'cryptoSpawnChance', value[0])}
                      />
                      <div className="flex items-center justify-between">
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.01}
                          value={(config.config as any).cryptoSpawnChance}
                          onChange={(e) => handleLevelConfigChange(levelId, 'cryptoSpawnChance', parseFloat(e.target.value))}
                          className="w-24"
                        />
                        <span>{((config.config as any).cryptoSpawnChance * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`ball-count-${levelId}`}>Количество шариков</Label>
                      <Input
                        id={`ball-count-${levelId}`}
                        type="number"
                        min={1}
                        value={(config.config as any).ballCount}
                        onChange={(e) => handleLevelConfigChange(levelId, 'ballCount', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`speed-${levelId}`}>Скорость</Label>
                      <Input
                        id={`speed-${levelId}`}
                        type="number"
                        min={0}
                        step={0.1}
                        value={(config.config as any).speed}
                        onChange={(e) => handleLevelConfigChange(levelId, 'speed', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`reward-multiplier-${levelId}`}>Множитель награды</Label>
                      <Input
                        id={`reward-multiplier-${levelId}`}
                        type="number"
                        min={0}
                        step={0.1}
                        value={(config.config as any).rewardMultiplier}
                        onChange={(e) => handleLevelConfigChange(levelId, 'rewardMultiplier', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={() => handleSaveLevelConfig(levelId)} 
                      disabled={isSaving}
                      variant="outline"
                    >
                      Сохранить уровень {levelId}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button onClick={handleSaveAll} disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить все уровни'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}