import { useState, useEffect } from 'react';
import type { Boost, BoostPackage } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Zap, Bomb, Timer, RotateCcw, Sparkles, ShoppingCart, Loader2, Shield, Magnet, Crosshair, Info, Star, Gift, Heart, Crown, Flame, Package, Copy, Check, Wallet, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { isTelegramWebApp, openTelegramInvoice, showTelegramAlert } from '@/lib/telegram';

interface BoostShopProps {
  onBack: () => void;
}

interface InventoryItem {
  id: string;
  boostId: string;
  quantity: number;
  boost: Boost;
}

const BOOST_ICONS: Record<string, typeof Zap> = {
  slowdown: Timer,
  bomb: Bomb,
  rainbow: Sparkles,
  rewind: RotateCcw,
  shield: Shield,
  magnet: Magnet,
  laser: Crosshair,
};

const BOOST_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  slowdown: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6', glow: '#3b82f650' },
  bomb: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', glow: '#ef444450' },
  rainbow: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7', glow: '#a855f750' },
  rewind: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e', glow: '#22c55e50' },
  shield: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#06b6d4', glow: '#06b6d450' },
  magnet: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', text: '#f97316', glow: '#f9731650' },
  laser: { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.3)', text: '#eab308', glow: '#eab30850' },
};

const BOOST_FULL_DESCRIPTIONS: Record<string, string> = {
  slowdown: 'Замедляет движение всех шаров на 5 секунд. Даёт вам больше времени для прицеливания и создания комбинаций. Особенно полезен на сложных уровнях с быстрым движением шаров.',
  bomb: 'Следующий ваш выстрел взрывает область вокруг места попадания, уничтожая до 5 ближайших шаров независимо от их цвета. Отличный способ быстро очистить опасную зону.',
  rainbow: 'Следующий выпущенный шар становится "радужным" - он автоматически принимает цвет соседнего шара при попадании, гарантируя создание комбинации минимум из 3 шаров.',
  rewind: 'Мгновенно откатывает все шары на 20% назад по пути. Используйте когда шары подошли слишком близко к концу и нужно выиграть время.',
  shield: 'Создаёт защитный барьер, который блокирует одну потерю жизни. Когда шары достигают конца пути, щит поглощает удар вместо снятия жизни. Одноразовая защита.',
  magnet: 'При следующем выстреле притягивает все шары того же цвета ближе к месту попадания. Помогает собрать разбросанные шары одного цвета для создания комбинации.',
  laser: 'Следующий выстрел становится лазерным лучом, который пробивает насквозь до 3 шаров подряд, уничтожая их. Не вставляет шар в цепочку, а просто удаляет шары на пути.',
};

const PACKAGE_STYLES: Record<string, { gradient: string; border: string; glow: string }> = {
  default: { 
    gradient: 'linear-gradient(135deg, hsl(230 30% 15%) 0%, hsl(230 30% 20%) 100%)',
    border: 'hsl(230 30% 30%)',
    glow: 'none'
  },
  hot: { 
    gradient: 'linear-gradient(135deg, hsl(15 80% 15%) 0%, hsl(30 70% 20%) 100%)',
    border: 'hsl(25 100% 50%)',
    glow: '0 0 30px hsl(25 100% 50% / 0.3)'
  },
  best_value: { 
    gradient: 'linear-gradient(135deg, hsl(45 80% 10%) 0%, hsl(35 70% 15%) 100%)',
    border: 'hsl(45 100% 50%)',
    glow: '0 0 40px hsl(45 100% 50% / 0.4)'
  },
};

function PackageCard({
  pkg,
  boostCount,
  onBuy,
  isPurchasing,
  isHighlighted,
}: {
  pkg: BoostPackage;
  boostCount: number;
  onBuy: (pkgId: string) => void;
  isPurchasing: boolean;
  isHighlighted?: boolean;
}) {
  const style = PACKAGE_STYLES[pkg.badge || 'default'] || PACKAGE_STYLES.default;
  const totalBoosts = pkg.boostsPerType * boostCount;
  const hasDiscount = pkg.originalPriceStars && pkg.originalPriceStars > pkg.priceStars;
  const discountPercent = hasDiscount 
    ? Math.round((1 - pkg.priceStars / (pkg.originalPriceStars || pkg.priceStars)) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative h-full ${isHighlighted ? 'z-10' : ''}`}
    >
      <Card
        className={`relative overflow-hidden p-4 h-full flex flex-col ${isHighlighted ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
        style={{
          background: style.gradient,
          borderColor: style.border,
          borderWidth: pkg.badge ? '2px' : '1px',
          boxShadow: style.glow,
        }}
      >
        {pkg.badge && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold z-10"
            style={{
              backgroundColor: pkg.badge === 'hot' ? 'hsl(25 100% 50%)' : 'hsl(45 100% 50%)',
              color: '#000',
              boxShadow: `0 0 15px ${pkg.badge === 'hot' ? 'hsl(25 100% 50% / 0.5)' : 'hsl(45 100% 50% / 0.5)'}`,
            }}
          >
            {pkg.badge === 'hot' ? (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {pkg.badgeText || 'ХИТ ПРОДАЖ'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {pkg.badgeText || 'VIP'}
              </span>
            )}
          </div>
        )}

        <div className={`text-center flex-1 ${pkg.badge ? 'pt-8' : 'pt-2'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Package className="w-5 h-5" style={{ color: pkg.badge === 'best_value' ? '#ffd700' : pkg.badge === 'hot' ? '#ff6b35' : '#00ff88' }} />
            <h3 className="font-bold text-lg">{pkg.nameRu}</h3>
          </div>
          
          <div className="text-3xl font-black my-3" style={{ 
            color: pkg.badge === 'best_value' ? '#ffd700' : pkg.badge === 'hot' ? '#ff6b35' : '#00ff88',
            textShadow: `0 0 20px ${pkg.badge === 'best_value' ? '#ffd70050' : pkg.badge === 'hot' ? '#ff6b3550' : '#00ff8850'}`,
          }}>
            {totalBoosts} бустов
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {pkg.boostsPerType} шт. каждого типа
          </p>

          {pkg.bonusLives > 0 && (
            <div className="flex items-center justify-center gap-1.5 mb-3 text-rose-400">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">+{pkg.bonusLives} жизней</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 mt-auto pt-4">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-sm">
                {pkg.originalPriceStars} ⭐
              </span>
            )}
            <span className="text-2xl font-bold flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              {pkg.priceStars}
            </span>
            {pkg.priceUsd && (
              <span className="text-lg font-semibold text-green-400">
                / ${parseFloat(pkg.priceUsd).toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => onBuy(pkg.id)}
            disabled={isPurchasing}
            style={{
              background: pkg.badge === 'best_value' 
                ? 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)'
                : pkg.badge === 'hot'
                  ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                  : 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              color: '#000',
              fontWeight: 'bold',
            }}
            data-testid={`button-buy-package-${pkg.name}`}
          >
            {isPurchasing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Купить за {pkg.priceStars} ⭐
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function MiniBeadsLogo({ size = 18 }: { size?: number }) {
  return (
    <div 
      className="relative flex items-center justify-center rounded-full"
      style={{ 
        width: size, 
        height: size,
        background: 'radial-gradient(circle at 30% 30%, hsl(155 100% 50% / 0.25), hsl(270 60% 30% / 0.3) 70%)',
        border: '1px solid hsl(155 100% 50% / 0.4)',
      }}
    >
      <span 
        className="font-bold"
        style={{ 
          fontSize: size * 0.5,
          color: '#00ff88',
          textShadow: '0 0 4px #00ff88',
          lineHeight: 1,
        }}
      >
        B
      </span>
    </div>
  );
}

function BoostCard({ 
  boost, 
  ownedQuantity, 
  userBalance,
  onBuy,
  isPurchasing,
  onShowDetails,
}: { 
  boost: Boost; 
  ownedQuantity: number;
  userBalance: number;
  onBuy: (boostId: string) => void;
  isPurchasing: boolean;
  onShowDetails: (boost: Boost) => void;
}) {
  const Icon = BOOST_ICONS[boost.type] || Zap;
  const colors = BOOST_COLORS[boost.type] || BOOST_COLORS.slowdown;
  const canAfford = userBalance >= boost.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="relative p-4 overflow-hidden cursor-pointer"
        onClick={() => onShowDetails(boost)}
        style={{ 
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 20px ${colors.glow}`,
        }}
      >
        {ownedQuantity > 0 && (
          <Badge 
            className="absolute top-2 right-10"
            style={{ backgroundColor: colors.text, color: '#fff' }}
          >
            x{ownedQuantity}
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onShowDetails(boost); }}
          data-testid={`button-info-${boost.type}`}
        >
          <Info className="w-4 h-4" style={{ color: colors.text }} />
        </Button>
        
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ 
              backgroundColor: colors.text,
              boxShadow: `0 0 15px ${colors.text}, 0 0 30px ${colors.glow}`,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base" style={{ color: colors.text }}>
              {boost.nameRu}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {boost.descriptionRu}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <MiniBeadsLogo size={18} />
            <span className="font-bold text-sm" style={{ color: '#00ff88' }}>
              {boost.price}
            </span>
          </div>
          
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onBuy(boost.id); }}
            disabled={!canAfford || isPurchasing}
            data-testid={`button-buy-boost-${boost.type}`}
            style={canAfford ? {
              backgroundColor: colors.text,
              boxShadow: `0 0 10px ${colors.glow}`,
            } : undefined}
          >
            {isPurchasing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Купить
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function BoostShop({ onBack }: BoostShopProps) {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [selectedBoost, setSelectedBoost] = useState<Boost | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'single'>('packages');
  
  // Payment method selection
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<BoostPackage | null>(null);
  
  // Crypto payment states
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [cryptoPaymentSent, setCryptoPaymentSent] = useState(false);

  // Fetch crypto wallet addresses
  const { data: cryptoWallets } = useQuery<{
    usdt_trc20: string;
    usdt_bep20: string;
    usdt_erc20: string;
    usdt_ton: string;
  }>({
    queryKey: ['/api/crypto-wallets'],
  });

  const { data: boosts = [], isLoading: boostsLoading } = useQuery<Boost[]>({
    queryKey: ['/api/boosts'],
  });

  const { data: packages = [], isLoading: packagesLoading } = useQuery<BoostPackage[]>({
    queryKey: ['/api/boost-packages'],
  });

  // Check for pending crypto payments to enable auto-refresh
  const { data: pendingPayments = [] } = useQuery<Array<{ id: string; status: string }>>({
    queryKey: ['/api/user/crypto-payments'],
    enabled: !!user,
    refetchInterval: 10000, // Check every 10 seconds
  });

  const hasPendingPayments = pendingPayments.some(p => p.status === 'pending');

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/user/boosts'],
    enabled: !!user,
    refetchInterval: hasPendingPayments ? 5000 : false, // Auto-refresh every 5s if pending payments
  });

  const buyMutation = useMutation({
    mutationFn: async (boostId: string) => {
      const response = await apiRequest('POST', '/api/boosts/buy', { boostId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/boosts'] });
      refreshUser();
      toast({
        title: "Буст куплен!",
        description: "Используйте его во время игры",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось купить буст",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPurchasingId(null);
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest('POST', `/api/boost-packages/${packageId}/create-invoice`);
      return response.json();
    },
    onSuccess: (data, packageId) => {
      if (data.invoiceUrl) {
        // Open Telegram Stars payment dialog
        if (isTelegramWebApp()) {
          openTelegramInvoice(data.invoiceUrl, (status) => {
            setPurchasingPackageId(null);
            if (status === 'paid') {
              // Payment successful - refresh data
              queryClient.invalidateQueries({ queryKey: ['/api/user/boosts'] });
              refreshUser();
              toast({
                title: "Оплата успешна!",
                description: "Бусты добавлены в ваш инвентарь",
              });
            } else if (status === 'cancelled') {
              toast({
                title: "Оплата отменена",
                description: "Вы можете попробовать снова",
              });
            } else if (status === 'failed') {
              toast({
                title: "Ошибка оплаты",
                description: "Попробуйте ещё раз",
                variant: "destructive",
              });
            }
          });
        } else {
          // Not in Telegram - show error
          toast({
            title: "Недоступно",
            description: "Оплата Stars доступна только в Telegram",
            variant: "destructive",
          });
          setPurchasingPackageId(null);
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать счёт",
        variant: "destructive",
      });
      setPurchasingPackageId(null);
    },
  });

  const handleBuy = (boostId: string) => {
    setPurchasingId(boostId);
    buyMutation.mutate(boostId);
  };

  // Open payment method selection dialog
  const handleBuyPackage = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackageForPayment(pkg);
      setPaymentMethodDialogOpen(true);
    }
  };

  // Pay with Telegram Stars
  const handlePayWithStars = () => {
    if (!selectedPackageForPayment) return;
    
    if (!isTelegramWebApp()) {
      toast({
        title: "Недоступно",
        description: "Оплата Stars доступна только в Telegram",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentMethodDialogOpen(false);
    setPurchasingPackageId(selectedPackageForPayment.id);
    createInvoiceMutation.mutate(selectedPackageForPayment.id);
  };

  // Open crypto payment dialog
  const handlePayWithCrypto = () => {
    setPaymentMethodDialogOpen(false);
    setSelectedNetwork(null);
    setCopiedAddress(false);
    setCryptoPaymentSent(false);
    setCryptoDialogOpen(true);
  };

  // Copy wallet address to clipboard
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast({
      title: "Скопировано",
      description: "Адрес кошелька скопирован в буфер обмена",
    });
  };

  // Crypto payment mutation
  const cryptoPaymentMutation = useMutation({
    mutationFn: async ({ packageId, network }: { packageId: string; network: string }) => {
      const response = await apiRequest('POST', `/api/boost-packages/${packageId}/crypto-payment`, { network });
      return response.json();
    },
    onSuccess: (data) => {
      setCryptoPaymentSent(true);
      toast({
        title: "Заявка отправлена",
        description: data.message || "Ожидайте подтверждения администратора",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить заявку",
        variant: "destructive",
      });
    },
  });

  // Send "I paid" request
  const handleConfirmCryptoPayment = () => {
    if (!selectedPackageForPayment || !selectedNetwork) return;
    cryptoPaymentMutation.mutate({
      packageId: selectedPackageForPayment.id,
      network: selectedNetwork,
    });
  };

  // Network info
  const NETWORK_INFO: Record<string, { name: string; symbol: string; color: string }> = {
    usdt_trc20: { name: 'USDT TRC-20', symbol: 'Tron', color: '#ff0013' },
    usdt_bep20: { name: 'USDT BEP-20', symbol: 'BSC', color: '#f3ba2f' },
    usdt_erc20: { name: 'USDT ERC-20', symbol: 'Ethereum', color: '#627eea' },
    usdt_ton: { name: 'USDT TON', symbol: 'TON', color: '#0088cc' },
  };

  const getOwnedQuantity = (boostId: string): number => {
    const item = inventory.find(i => i.boostId === boostId);
    return item?.quantity || 0;
  };

  const activePackages = packages.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const hotPackageIndex = activePackages.findIndex(p => p.badge === 'hot');

  return (
    <div 
      className="min-h-screen flex flex-col p-4 pb-24"
      style={{ background: 'linear-gradient(180deg, hsl(230 35% 7%) 0%, hsl(230 35% 10%) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: '#00ff88' }}>
            Магазин бустов
          </h1>
          <p className="text-xs text-muted-foreground">
            Усильте свою игру специальными способностями
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <MiniBeadsLogo size={16} />
            <span className="font-bold text-sm" style={{ color: '#00ff88' }}>
              {user.totalPoints.toLocaleString()}
            </span>
          </div>
        )}
      </motion.div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'packages' | 'single')} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="packages" className="gap-2" data-testid="tab-packages">
            <Gift className="w-4 h-4" />
            Наборы
          </TabsTrigger>
          <TabsTrigger value="single" className="gap-2" data-testid="tab-single">
            <Zap className="w-4 h-4" />
            Поштучно
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="flex-1 overflow-y-auto mt-0">
          {packagesLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : activePackages.length === 0 ? (
            <Card className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Пакеты пока недоступны</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Покупайте наборы за <Star className="w-4 h-4 inline text-yellow-400 fill-yellow-400" /> Telegram Stars
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <AnimatePresence>
                  {activePackages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      boostCount={boosts.length || 7}
                      onBuy={handleBuyPackage}
                      isPurchasing={purchasingPackageId === pkg.id}
                      isHighlighted={index === hotPackageIndex}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="single" className="flex-1 overflow-y-auto mt-0">
          {boostsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : boosts.length === 0 ? (
            <Card className="p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Бусты пока недоступны</p>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Покупайте отдельные бусты за <MiniBeadsLogo size={16} /> Beads
                </p>
              </div>
              <AnimatePresence>
                {boosts.map((boost, index) => (
                  <motion.div
                    key={boost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BoostCard
                      boost={boost}
                      ownedQuantity={getOwnedQuantity(boost.id)}
                      userBalance={user?.totalPoints || 0}
                      onBuy={handleBuy}
                      isPurchasing={purchasingId === boost.id}
                      onShowDetails={setSelectedBoost}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {inventory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-border/30"
        >
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Ваш инвентарь
          </h3>
          <div className="flex flex-wrap gap-2">
            {inventory.map((item) => {
              const Icon = BOOST_ICONS[item.boost.type] || Zap;
              const colors = BOOST_COLORS[item.boost.type] || BOOST_COLORS.slowdown;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: colors.text }} />
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    {item.boost.nameRu}
                  </span>
                  <Badge 
                    variant="secondary"
                    className="text-xs"
                  >
                    x{item.quantity}
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <Dialog open={!!selectedBoost} onOpenChange={(open) => !open && setSelectedBoost(null)}>
        <DialogContent className="max-w-sm" style={{ 
          backgroundColor: selectedBoost ? BOOST_COLORS[selectedBoost.type]?.bg || 'hsl(var(--card))' : 'hsl(var(--card))',
          borderColor: selectedBoost ? BOOST_COLORS[selectedBoost.type]?.border : undefined,
        }}>
          {selectedBoost && (() => {
            const Icon = BOOST_ICONS[selectedBoost.type] || Zap;
            const colors = BOOST_COLORS[selectedBoost.type] || BOOST_COLORS.slowdown;
            const fullDesc = BOOST_FULL_DESCRIPTIONS[selectedBoost.type] || selectedBoost.descriptionRu;
            const canAfford = (user?.totalPoints || 0) >= selectedBoost.price;
            
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: colors.text,
                        boxShadow: `0 0 20px ${colors.text}`,
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle style={{ color: colors.text }}>
                        {selectedBoost.nameRu}
                      </DialogTitle>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MiniBeadsLogo size={16} />
                        <span className="font-bold text-sm" style={{ color: '#00ff88' }}>
                          {selectedBoost.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                <DialogDescription className="text-sm text-foreground/80 leading-relaxed">
                  {fullDesc}
                </DialogDescription>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedBoost(null)}
                  >
                    Закрыть
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleBuy(selectedBoost.id);
                      setSelectedBoost(null);
                    }}
                    disabled={!canAfford || purchasingId === selectedBoost.id}
                    style={canAfford ? {
                      backgroundColor: colors.text,
                      boxShadow: `0 0 10px ${colors.glow}`,
                    } : undefined}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Купить
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Payment Method Selection Dialog */}
      <Dialog open={paymentMethodDialogOpen} onOpenChange={setPaymentMethodDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" style={{ color: '#00ff88' }} />
              Способ оплаты
            </DialogTitle>
            <DialogDescription>
              {selectedPackageForPayment && (
                <span>
                  {selectedPackageForPayment.nameRu} — {selectedPackageForPayment.boostsPerType * (boosts.length || 7)} бустов
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* Telegram Stars option */}
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-3"
              onClick={handlePayWithStars}
              disabled={purchasingPackageId !== null}
              data-testid="button-pay-stars"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Telegram Stars</div>
                <div className="text-xs text-muted-foreground">
                  {selectedPackageForPayment?.priceStars} ⭐ {isTelegramWebApp() ? '' : '(только в Telegram)'}
                </div>
              </div>
            </Button>

            {/* Crypto option */}
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-3"
              onClick={handlePayWithCrypto}
              disabled={purchasingPackageId !== null}
              data-testid="button-pay-crypto"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Криптовалюта (USDT)</div>
                <div className="text-xs text-muted-foreground">
                  ~${selectedPackageForPayment?.priceUsd || Math.round((selectedPackageForPayment?.priceStars || 0) / 50)} USD
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crypto Payment Dialog */}
      <Dialog open={cryptoDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCryptoDialogOpen(false);
          setSelectedNetwork(null);
          setCryptoPaymentSent(false);
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-400" />
              Оплата криптовалютой
            </DialogTitle>
            <DialogDescription>
              {selectedPackageForPayment && (
                <span>
                  {selectedPackageForPayment.nameRu} — ${selectedPackageForPayment.priceUsd || Math.round(selectedPackageForPayment.priceStars / 50)} USD
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {cryptoPaymentSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Заявка отправлена</h3>
              <p className="text-sm text-muted-foreground">
                Администратор проверит платёж и подтвердит покупку. Обычно это занимает до 24 часов.
              </p>
              <Button 
                className="mt-4 w-full" 
                onClick={() => {
                  setCryptoDialogOpen(false);
                  setCryptoPaymentSent(false);
                }}
              >
                Закрыть
              </Button>
            </div>
          ) : !selectedNetwork ? (
            <div className="space-y-2 mt-2">
              <p className="text-sm text-muted-foreground mb-3">Выберите сеть для оплаты:</p>
              {Object.entries(NETWORK_INFO).map(([key, info]) => {
                const address = cryptoWallets?.[key as keyof typeof cryptoWallets];
                const isAvailable = address && address.length > 10;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    className="w-full h-auto py-3 justify-start gap-3"
                    onClick={() => setSelectedNetwork(key)}
                    disabled={!isAvailable}
                    data-testid={`button-network-${key}`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: info.color }}
                    >
                      {info.symbol.substring(0, 1)}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{info.name}</div>
                      <div className="text-xs text-muted-foreground">{info.symbol}</div>
                    </div>
                    {!isAvailable && (
                      <Badge variant="secondary" className="text-xs">Недоступно</Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedNetwork(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium">{NETWORK_INFO[selectedNetwork]?.name}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Переведите <span className="font-bold text-foreground">${selectedPackageForPayment?.priceUsd || Math.round((selectedPackageForPayment?.priceStars || 0) / 50)} USDT</span> на адрес:
                </p>
                
                <div className="relative">
                  <div className="p-3 rounded-lg bg-muted/50 border break-all font-mono text-xs">
                    {cryptoWallets?.[selectedNetwork as keyof typeof cryptoWallets] || 'Адрес не настроен'}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => handleCopyAddress(cryptoWallets?.[selectedNetwork as keyof typeof cryptoWallets] || '')}
                    data-testid="button-copy-address"
                  >
                    {copiedAddress ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-200">
                  Внимание: отправляйте только USDT в сети {NETWORK_INFO[selectedNetwork]?.symbol}. Отправка других монет или в другой сети приведёт к потере средств.
                </p>
              </div>

              <Button 
                className="w-full" 
                onClick={handleConfirmCryptoPayment}
                disabled={cryptoPaymentMutation.isPending}
                data-testid="button-confirm-crypto-payment"
              >
                {cryptoPaymentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Я оплатил
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
