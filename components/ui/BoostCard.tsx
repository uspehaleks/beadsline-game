import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Bomb, Timer, RotateCcw, Sparkles, Shield, Magnet, Crosshair, Info, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Boost } from '@shared/schema';
import MiniBeadsLogo from '@/components/ui/MiniBeadsLogo';

interface BoostCardProps {
  boost: Boost;
  ownedQuantity: number;
  userBalance: number;
  onBuy: (id: string) => void;
  isPurchasing: boolean;
  onShowDetails: (boost: Boost) => void;
}

const BOOST_ICONS = {
  slowdown: Timer,
  bomb: Bomb,
  shield: Shield,
  magnet: Magnet,
  multiplier: Sparkles,
  extraLife: Crosshair,
  reverse: RotateCcw,
};

const BOOST_COLORS = {
  slowdown: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  bomb: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  shield: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  magnet: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  multiplier: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  extraLife: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  reverse: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
};

const BoostCard = React.memo(({
  boost,
  ownedQuantity,
  userBalance,
  onBuy,
  isPurchasing,
  onShowDetails
}: BoostCardProps) => {
  const Icon = BOOST_ICONS[boost.type as keyof typeof BOOST_ICONS] || Zap;
  const colors = BOOST_COLORS[boost.type as keyof typeof BOOST_COLORS] || BOOST_COLORS.slowdown;
  const canAfford = userBalance >= boost.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card 
        className="p-4 cursor-pointer"
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
        onClick={() => onShowDetails(boost)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: colors.text,
              boxShadow: `0 0 20px ${colors.glow}`,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold truncate">{boost.nameRu}</h3>
              <Badge variant="secondary" className="text-xs">
                ×{ownedQuantity}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground truncate">
              {boost.descriptionRu}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <MiniBeadsLogo size={16} />
                <span className="font-bold text-sm" style={{ color: '#00ff88' }}>
                  {boost.price}
                </span>
              </div>
              
              <span className="text-xs text-muted-foreground">
                {/* duration not available in current schema */}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBuy(boost.id);
              }}
              disabled={!canAfford || isPurchasing}
              style={canAfford ? {
                backgroundColor: colors.text,
                boxShadow: `0 0 10px ${colors.glow}`,
              } : undefined}
            >
              {isPurchasing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(boost);
              }}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export default BoostCard;