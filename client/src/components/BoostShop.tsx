import { useState } from 'react';
import type { Boost } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Zap, Bomb, Timer, RotateCcw, Sparkles, ShoppingCart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

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
};

const BOOST_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  slowdown: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6', glow: '#3b82f650' },
  bomb: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', glow: '#ef444450' },
  rainbow: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7', glow: '#a855f750' },
  rewind: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e', glow: '#22c55e50' },
};

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
  isPurchasing 
}: { 
  boost: Boost; 
  ownedQuantity: number;
  userBalance: number;
  onBuy: (boostId: string) => void;
  isPurchasing: boolean;
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
        className="relative p-4 overflow-hidden"
        style={{ 
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 20px ${colors.glow}`,
        }}
      >
        {ownedQuantity > 0 && (
          <Badge 
            className="absolute top-2 right-2"
            style={{ backgroundColor: colors.text, color: '#fff' }}
          >
            x{ownedQuantity}
          </Badge>
        )}
        
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
            onClick={() => onBuy(boost.id)}
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

  const { data: boosts = [], isLoading: boostsLoading } = useQuery<Boost[]>({
    queryKey: ['/api/boosts'],
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/user/boosts'],
    enabled: !!user,
  });

  const buyMutation = useMutation({
    mutationFn: async (boostId: string) => {
      const response = await apiRequest('POST', '/api/boosts/buy', { boostId });
      return response.json();
    },
    onSuccess: (data) => {
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

  const handleBuy = (boostId: string) => {
    setPurchasingId(boostId);
    buyMutation.mutate(boostId);
  };

  const getOwnedQuantity = (boostId: string): number => {
    const item = inventory.find(i => i.boostId === boostId);
    return item?.quantity || 0;
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-4 pb-24"
      style={{ background: 'linear-gradient(180deg, hsl(230 35% 7%) 0%, hsl(230 35% 10%) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
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

      <div className="flex-1 overflow-y-auto">
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
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

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
    </div>
  );
}
