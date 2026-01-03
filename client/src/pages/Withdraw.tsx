import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bitcoin, Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { SiEthereum, SiTether } from 'react-icons/si';
import { Link } from 'wouter';
import type { WithdrawalConfig, WithdrawalRequest } from '@shared/schema';

type CryptoType = 'btc' | 'eth' | 'usdt';
type UsdtNetwork = 'bep20' | 'trc20' | 'erc20' | 'ton';

const NETWORK_LABELS: Record<UsdtNetwork, { name: string; fullName: string }> = {
  bep20: { name: 'BEP-20', fullName: 'Binance Smart Chain' },
  trc20: { name: 'TRC-20', fullName: 'TRON Network' },
  erc20: { name: 'ERC-20', fullName: 'Ethereum Network' },
  ton: { name: 'TON', fullName: 'TON Network' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  approved: { label: 'Одобрено', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle2 },
  completed: { label: 'Выполнено', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  rejected: { label: 'Отклонено', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function Withdraw() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<UsdtNetwork | null>(null);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [networkConfirmed, setNetworkConfirmed] = useState(false);

  const { data: config } = useQuery<WithdrawalConfig>({
    queryKey: ['/api/withdrawal/config'],
  });

  const { data: myWithdrawals = [] } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/withdrawal/my'],
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/withdrawal/request', {
        cryptoType: selectedCrypto,
        network: selectedCrypto === 'usdt' ? selectedNetwork : selectedCrypto,
        amount,
        walletAddress,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Заявка создана', description: 'Ваша заявка на вывод отправлена на рассмотрение' });
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal/my'] });
      refreshUser();
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось создать заявку',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setSelectedCrypto(null);
    setSelectedNetwork(null);
    setAmount('');
    setWalletAddress('');
    setNetworkConfirmed(false);
  };

  const getBalance = () => {
    if (!user) return 0;
    if (selectedCrypto === 'btc') return user.btcBalance;
    if (selectedCrypto === 'eth') return user.ethBalance;
    if (selectedCrypto === 'usdt') return user.usdtBalance;
    return 0;
  };

  const getMinAmount = () => {
    if (!config || !selectedCrypto) return 0;
    if (selectedCrypto === 'btc') return config.btc.minAmount;
    if (selectedCrypto === 'eth') return config.eth.minAmount;
    if (selectedCrypto === 'usdt' && selectedNetwork) {
      return config.usdt[selectedNetwork]?.minAmount || 0;
    }
    return 0;
  };

  const getNetworkFee = () => {
    if (!config || !selectedCrypto) return 0;
    if (selectedCrypto === 'btc') return config.btc.networkFee;
    if (selectedCrypto === 'eth') return config.eth.networkFee;
    if (selectedCrypto === 'usdt' && selectedNetwork) {
      return config.usdt[selectedNetwork]?.networkFee || 0;
    }
    return 0;
  };

  const isNetworkEnabled = (network: UsdtNetwork) => {
    return config?.usdt[network]?.enabled ?? false;
  };

  const canSubmit = () => {
    if (!selectedCrypto || !amount || !walletAddress) return false;
    if (selectedCrypto === 'usdt' && !selectedNetwork) return false;
    if (!networkConfirmed) return false;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    if (numAmount < getMinAmount()) return false;
    if (numAmount > getBalance()) return false;
    return true;
  };

  const formatCrypto = (value: number, crypto: CryptoType) => {
    if (crypto === 'btc') return value.toFixed(8);
    if (crypto === 'eth') return value.toFixed(8);
    return value.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Вывод криптовалюты</h1>
        </div>

        {!selectedCrypto ? (
          <div className="space-y-4">
            <p className="text-gray-400 mb-4">Выберите криптовалюту для вывода:</p>
            
            <Card 
              className="cursor-pointer hover-elevate bg-gray-800/50 border-gray-700"
              onClick={() => setSelectedCrypto('btc')}
              data-testid="card-select-btc"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Bitcoin (BTC)</div>
                  <div className="text-sm text-gray-400">
                    Баланс: {user?.btcBalance.toFixed(8)} BTC
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover-elevate bg-gray-800/50 border-gray-700"
              onClick={() => setSelectedCrypto('eth')}
              data-testid="card-select-eth"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <SiEthereum className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Ethereum (ETH)</div>
                  <div className="text-sm text-gray-400">
                    Баланс: {user?.ethBalance.toFixed(8)} ETH
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover-elevate bg-gray-800/50 border-gray-700"
              onClick={() => setSelectedCrypto('usdt')}
              data-testid="card-select-usdt"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <SiTether className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Tether (USDT)</div>
                  <div className="text-sm text-gray-400">
                    Баланс: {user?.usdtBalance.toFixed(2)} USDT
                  </div>
                </div>
              </CardContent>
            </Card>

            {myWithdrawals.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">История заявок</h2>
                <div className="space-y-3">
                  {myWithdrawals.map((w) => {
                    const statusInfo = STATUS_LABELS[w.status] || STATUS_LABELS.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <Card key={w.id} className="bg-gray-800/30 border-gray-700" data-testid={`card-withdrawal-${w.id}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {parseFloat(w.amount).toFixed(w.cryptoType === 'usdt' ? 2 : 8)} {w.cryptoType.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {w.network && NETWORK_LABELS[w.network as UsdtNetwork]?.name}
                              </div>
                            </div>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          {w.txHash && (
                            <div className="text-xs text-gray-500 mt-2 truncate">
                              TX: {w.txHash}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : selectedCrypto === 'usdt' && !selectedNetwork ? (
          <div className="space-y-4">
            <Button variant="ghost" onClick={resetForm} className="mb-4" data-testid="button-back-crypto">
              <ArrowLeft className="w-4 h-4 mr-2" /> Назад
            </Button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <SiTether className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-lg">USDT</div>
                <div className="text-sm text-gray-400">Выберите сеть</div>
              </div>
            </div>

            <div className="space-y-3">
              {(['bep20', 'trc20', 'ton', 'erc20'] as UsdtNetwork[]).map((network) => {
                const networkInfo = NETWORK_LABELS[network];
                const enabled = isNetworkEnabled(network);
                const fee = config?.usdt[network]?.networkFee || 0;
                const min = config?.usdt[network]?.minAmount || 0;
                
                return (
                  <Card 
                    key={network}
                    className={`${enabled ? 'cursor-pointer hover-elevate' : 'opacity-50'} bg-gray-800/50 border-gray-700`}
                    onClick={() => enabled && setSelectedNetwork(network)}
                    data-testid={`card-network-${network}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-green-400">{networkInfo.name}</div>
                          <div className="text-sm text-gray-400">{networkInfo.fullName}</div>
                        </div>
                        {!enabled && <Badge variant="secondary">Недоступно</Badge>}
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>Минимум:</span>
                          <span>{min} USDT</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Комиссия сети:</span>
                          <span>~{fee} USDT</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => selectedCrypto === 'usdt' ? setSelectedNetwork(null) : resetForm()} className="mb-4" data-testid="button-back-form">
              <ArrowLeft className="w-4 h-4 mr-2" /> Назад
            </Button>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  {selectedCrypto === 'btc' && <Bitcoin className="w-6 h-6 text-orange-500" />}
                  {selectedCrypto === 'eth' && <SiEthereum className="w-6 h-6 text-purple-400" />}
                  {selectedCrypto === 'usdt' && <SiTether className="w-6 h-6 text-green-500" />}
                  {selectedCrypto.toUpperCase()}
                  {selectedNetwork && (
                    <Badge className="bg-green-500/20 text-green-400 ml-2">
                      {NETWORK_LABELS[selectedNetwork].name}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Баланс: {formatCrypto(getBalance(), selectedCrypto)} {selectedCrypto.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="text-blue-400 font-medium">Информация о выводе</div>
                      <div className="text-gray-300 mt-1">
                        Минимальный вывод: <span className="font-medium">{getMinAmount()} {selectedCrypto.toUpperCase()}</span>
                      </div>
                      <div className="text-gray-300">
                        Комиссия сети: <span className="font-medium">~{getNetworkFee()} {selectedCrypto.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Сумма вывода</Label>
                  <div className="relative mt-1">
                    <Input
                      id="amount"
                      type="number"
                      step="any"
                      placeholder={`Мин. ${getMinAmount()}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-20"
                      data-testid="input-amount"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                      onClick={() => setAmount(String(getBalance()))}
                      data-testid="button-max"
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="wallet">Адрес кошелька</Label>
                  <Input
                    id="wallet"
                    placeholder="Введите адрес кошелька"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="mt-1"
                    data-testid="input-wallet"
                  />
                </div>

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm"
                      checked={networkConfirmed}
                      onCheckedChange={(checked) => setNetworkConfirmed(checked === true)}
                      data-testid="checkbox-confirm"
                    />
                    <Label htmlFor="confirm" className="text-sm cursor-pointer">
                      Я понимаю, что выбрал сеть{' '}
                      <span className="font-bold text-yellow-400">
                        {selectedCrypto === 'usdt' && selectedNetwork 
                          ? NETWORK_LABELS[selectedNetwork].name 
                          : selectedCrypto === 'btc' ? 'Bitcoin' : 'Ethereum'
                        }
                      </span>{' '}
                      и ввёл правильный адрес. Отправка на неверный адрес или в неверную сеть приведёт к потере средств.
                    </Label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!canSubmit() || withdrawMutation.isPending}
                  onClick={() => withdrawMutation.mutate()}
                  data-testid="button-submit"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить заявку на вывод'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
