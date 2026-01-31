import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';
import type { GameEconomyConfig } from '@shared/schema';

interface EconomyTabProps {
  economyConfig: GameEconomyConfig;
  refetchEconomyConfig: () => void;
  boosts: any[];
  refetchBoosts: () => void;
}

export default function EconomyTab({ economyConfig, refetchEconomyConfig, boosts, refetchBoosts }: EconomyTabProps) {
  const [config, setConfig] = useState<GameEconomyConfig>(economyConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };

    let current: any = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setConfig(newConfig);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest('PUT', '/api/admin/game-economy', config);
      toast.success('Настройки экономики успешно сохранены');
      refetchEconomyConfig();
    } catch (error) {
      console.error('Error saving economy config:', error);
      toast.error('Ошибка при сохранении настроек экономики');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки экономики</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crypto Spawn Chance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Шанс спавна крипто-шариков</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crypto-spawn-chance">Шанс спавна (0-1)</Label>
                <Slider
                  id="crypto-spawn-chance"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[config.crypto?.spawnChance || 0]}
                  onValueChange={(value) => handleChange('crypto.spawnChance', value[0])}
                />
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={config.crypto?.spawnChance || 0}
                  onChange={(e) => handleChange('crypto.spawnChance', parseFloat(e.target.value))}
                  className="w-32"
                />
                <span>{((config.crypto?.spawnChance || 0) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Base Rewards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Базовые награды</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-btc-reward">BTC награда за уровень</Label>
                <Input
                  id="base-btc-reward"
                  type="number"
                  min={0}
                  value={config.baseBtcReward || 0}
                  onChange={(e) => handleChange('baseBtcReward', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-eth-reward">ETH награда за уровень</Label>
                <Input
                  id="base-eth-reward"
                  type="number"
                  min={0}
                  value={config.baseEthReward || 0}
                  onChange={(e) => handleChange('baseEthReward', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-usdt-reward">USDT награда за уровень</Label>
                <Input
                  id="base-usdt-reward"
                  type="number"
                  min={0}
                  value={config.baseUsdtReward || 0}
                  onChange={(e) => handleChange('baseUsdtReward', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Points Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Очки за шарики</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points-normal">Обычные шарики</Label>
                <Input
                  id="points-normal"
                  type="number"
                  min={0}
                  value={config.points?.normal || 0}
                  onChange={(e) => handleChange('points.normal', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points-btc">BTC шарики</Label>
                <Input
                  id="points-btc"
                  type="number"
                  min={0}
                  value={config.points?.btc || 0}
                  onChange={(e) => handleChange('points.btc', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points-eth">ETH шарики</Label>
                <Input
                  id="points-eth"
                  type="number"
                  min={0}
                  value={config.points?.eth || 0}
                  onChange={(e) => handleChange('points.eth', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points-usdt">USDT шарики</Label>
                <Input
                  id="points-usdt"
                  type="number"
                  min={0}
                  value={config.points?.usdt || 0}
                  onChange={(e) => handleChange('points.usdt', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Combo Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Комбо-множитель</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="combo-multiplier">Множитель комбо</Label>
                <Input
                  id="combo-multiplier"
                  type="number"
                  min={0}
                  step={0.1}
                  value={config.combo?.multiplier || 0}
                  onChange={(e) => handleChange('combo.multiplier', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="combo-max-chain">Максимальная цепочка</Label>
                <Input
                  id="combo-max-chain"
                  type="number"
                  min={0}
                  value={config.combo?.maxChain || 0}
                  onChange={(e) => handleChange('combo.maxChain', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Level Multiplier */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Множитель уровня</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level-multiplier">Множитель</Label>
                <Input
                  id="level-multiplier"
                  type="number"
                  min={0}
                  step={0.1}
                  value={config.levelMultiplier || 0}
                  onChange={(e) => handleChange('levelMultiplier', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Crypto Rewards Per Ball */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Крипто-награды за шарик</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crypto-btc-per-ball">BTC за шарик</Label>
                <Input
                  id="crypto-btc-per-ball"
                  type="number"
                  min={0}
                  step={0.00000001}
                  value={config.cryptoRewards?.btcPerBall || 0}
                  onChange={(e) => handleChange('cryptoRewards.btcPerBall', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crypto-eth-per-ball">ETH за шарик</Label>
                <Input
                  id="crypto-eth-per-ball"
                  type="number"
                  min={0}
                  step={0.000000000001}
                  value={config.cryptoRewards?.ethPerBall || 0}
                  onChange={(e) => handleChange('cryptoRewards.ethPerBall', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crypto-usdt-per-ball">USDT за шарик</Label>
                <Input
                  id="crypto-usdt-per-ball"
                  type="number"
                  min={0}
                  step={0.01}
                  value={config.cryptoRewards?.usdtPerBall || 0}
                  onChange={(e) => handleChange('cryptoRewards.usdtPerBall', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Daily Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ежедневные лимиты</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily-btc-limit">BTC макс. в день (сатоши)</Label>
                <Input
                  id="daily-btc-limit"
                  type="number"
                  min={0}
                  value={config.dailyLimits?.btcMaxSatsPerDay || 0}
                  onChange={(e) => handleChange('dailyLimits.btcMaxSatsPerDay', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-eth-limit">ETH макс. в день (вей)</Label>
                <Input
                  id="daily-eth-limit"
                  type="number"
                  min={0}
                  value={config.dailyLimits?.ethMaxWeiPerDay || 0}
                  onChange={(e) => handleChange('dailyLimits.ethMaxWeiPerDay', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-usdt-limit">USDT макс. в день</Label>
                <Input
                  id="daily-usdt-limit"
                  type="number"
                  min={0}
                  step={0.01}
                  value={config.dailyLimits?.usdtMaxPerDay || 0}
                  onChange={(e) => handleChange('dailyLimits.usdtMaxPerDay', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Per Game Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Лимиты за игру</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="per-game-btc-limit">BTC макс. за игру</Label>
                <Input
                  id="per-game-btc-limit"
                  type="number"
                  min={0}
                  value={config.perGameLimits?.btcMaxBeadsPerGame || 0}
                  onChange={(e) => handleChange('perGameLimits.btcMaxBeadsPerGame', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="per-game-eth-limit">ETH макс. за игру</Label>
                <Input
                  id="per-game-eth-limit"
                  type="number"
                  min={0}
                  value={config.perGameLimits?.ethMaxBeadsPerGame || 0}
                  onChange={(e) => handleChange('perGameLimits.ethMaxBeadsPerGame', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="per-game-usdt-limit">USDT макс. за игру</Label>
                <Input
                  id="per-game-usdt-limit"
                  type="number"
                  min={0}
                  value={config.perGameLimits?.usdtMaxBeadsPerGame || 0}
                  onChange={(e) => handleChange('perGameLimits.usdtMaxBeadsPerGame', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pools Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Балансы пулов</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pool-btc-balance">BTC баланс пула (сатоши)</Label>
                <Input
                  id="pool-btc-balance"
                  type="number"
                  min={0}
                  value={config.pools?.btcBalanceSats || 0}
                  onChange={(e) => handleChange('pools.btcBalanceSats', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pool-eth-balance">ETH баланс пула (вей)</Label>
                <Input
                  id="pool-eth-balance"
                  type="number"
                  min={0}
                  value={config.pools?.ethBalanceWei || 0}
                  onChange={(e) => handleChange('pools.ethBalanceWei', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pool-usdt-balance">USDT баланс пула</Label>
                <Input
                  id="pool-usdt-balance"
                  type="number"
                  min={0}
                  step={0.01}
                  value={config.pools?.usdtBalance || 0}
                  onChange={(e) => handleChange('pools.usdtBalance', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full mt-6">
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </CardContent>
      </Card>

      {/* Level Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Конфигурация уровней</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Настройте параметры для каждого уровня, включая шанс спавна крипто-шариков
          </p>

          <div className="space-y-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((levelId) => (
              <div key={levelId} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Уровень {levelId}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`level-${levelId}-crypto-chance`}>Шанс спавна крипто-шариков</Label>
                    <Slider
                      id={`level-${levelId}-crypto-chance`}
                      min={0}
                      max={1}
                      step={0.01}
                      value={[config.crypto?.spawnChance || 0]} // Используем глобальное значение как временное решение
                      onValueChange={() => {}} // Пока не реализовано обновление конкретного уровня
                    />
                    <span>{((config.crypto?.spawnChance || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`level-${levelId}-balls`}>Количество шариков</Label>
                    <Input
                      id={`level-${levelId}-balls`}
                      type="number"
                      min={1}
                      value={Math.floor(5 + levelId * 0.5)} // Временное значение
                      readOnly // Пока не реализовано обновление
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}