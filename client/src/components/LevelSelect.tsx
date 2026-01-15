import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowLeft, Star, Zap, Target, Coins } from 'lucide-react';
import { SiBitcoin } from 'react-icons/si';
import { 
  LEVELS, 
  type LevelConfig, 
  getDifficultyColor, 
  getDifficultyBgColor, 
  getDifficultyLabel,
  isLevelUnlocked 
} from '@/lib/levelConfig';

interface LevelSelectProps {
  completedLevels: number[];
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

function PathPreview({ pathType, size = 60 }: { pathType: string; size?: number }) {
  const center = size / 2;
  const scale = size / 100;
  
  const getPathD = () => {
    switch (pathType) {
      case 'spiral': {
        let d = '';
        const turns = 2.5;
        const outerR = 40 * scale;
        const innerR = 8 * scale;
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const angle = t * Math.PI * 2 * turns;
          const r = outerR - (outerR - innerR) * t;
          const x = center + r * Math.cos(angle - Math.PI / 2);
          const y = center + r * Math.sin(angle - Math.PI / 2);
          d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        return d;
      }
      case 'zigzag': {
        const points = [];
        const freq = 4;
        const amp = 25 * scale;
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const y = 5 * scale + t * 90 * scale;
          const x = center + Math.sin(t * freq * Math.PI) * amp;
          points.push(`${x} ${y}`);
        }
        return `M ${points.join(' L ')}`;
      }
      case 'wave': {
        const points = [];
        const freq = 2;
        const amp = 20 * scale;
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const y = 5 * scale + t * 90 * scale;
          const x = center + Math.sin(t * freq * Math.PI * 2) * amp;
          points.push(`${x} ${y}`);
        }
        return `M ${points.join(' L ')}`;
      }
      case 'sShape': {
        const points = [];
        const amp = 25 * scale;
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const y = 5 * scale + t * 90 * scale;
          const x = center + Math.sin(t * Math.PI * 2) * amp;
          points.push(`${x} ${y}`);
        }
        return `M ${points.join(' L ')}`;
      }
      case 'heart': {
        let d = '';
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const angle = t * Math.PI * 2 - Math.PI / 2;
          const hx = 16 * Math.pow(Math.sin(angle), 3);
          const hy = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
          const x = center + hx * 2 * scale;
          const y = center + hy * 2 * scale;
          d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        return d;
      }
      case 'infinity': {
        let d = '';
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const angle = t * Math.PI * 2;
          const x = center + 35 * scale * Math.sin(angle);
          const y = center + 15 * scale * Math.sin(angle * 2);
          d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        return d;
      }
      default:
        return '';
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`pathGrad-${pathType}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="50%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <motion.path
        d={getPathD()}
        fill="none"
        stroke={`url(#pathGrad-${pathType})`}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}

function LevelCard({ 
  level, 
  isUnlocked, 
  isCompleted,
  onSelect 
}: { 
  level: LevelConfig; 
  isUnlocked: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  const difficultyColor = getDifficultyColor(level.difficulty);
  const difficultyBg = getDifficultyBgColor(level.difficulty);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: level.id * 0.05 }}
      whileHover={isUnlocked ? { scale: 1.03 } : undefined}
      whileTap={isUnlocked ? { scale: 0.97 } : undefined}
    >
      <Card
        className={`relative overflow-hidden p-3 transition-all cursor-pointer ${
          isUnlocked 
            ? 'border-primary/30 hover:border-primary/50' 
            : 'border-muted/20 opacity-60'
        }`}
        style={{
          background: isUnlocked 
            ? 'linear-gradient(135deg, hsl(230 35% 12%) 0%, hsl(230 35% 8%) 100%)'
            : 'linear-gradient(135deg, hsl(230 25% 10%) 0%, hsl(230 25% 7%) 100%)',
          boxShadow: isUnlocked 
            ? '0 0 20px hsl(155 100% 50% / 0.1)' 
            : 'none',
        }}
        onClick={isUnlocked ? onSelect : undefined}
        data-testid={`card-level-${level.id}`}
      >
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div className="flex flex-col items-center gap-1">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Пройди ур. {level.unlockCondition}
              </span>
            </div>
          </div>
        )}
        
        {isCompleted && (
          <div 
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-20"
            style={{ backgroundColor: '#00ff88', boxShadow: '0 0 10px #00ff88' }}
          >
            <Star className="w-4 h-4 text-black" fill="black" />
          </div>
        )}
        
        {/* Crypto indicator for uncompleted levels */}
        {isUnlocked && !isCompleted && (
          <div 
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full z-20"
            style={{ backgroundColor: 'rgba(247, 147, 26, 0.2)', border: '1px solid rgba(247, 147, 26, 0.4)' }}
            title="Криптошарики доступны"
          >
            <SiBitcoin className="w-3 h-3" style={{ color: '#f7931a' }} />
            <span className="text-[10px] font-medium" style={{ color: '#f7931a' }}>КРИПТО</span>
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div 
            className="flex-shrink-0 rounded-lg p-1"
            style={{ backgroundColor: 'hsl(230 30% 15%)' }}
          >
            <PathPreview pathType={level.path.type} size={56} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="font-bold text-sm tabular-nums"
                style={{ color: '#00d4ff' }}
              >
                #{level.id}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs px-1.5 py-0 ${difficultyColor} ${difficultyBg} border-0`}
              >
                {getDifficultyLabel(level.difficulty)}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-sm truncate mb-1" data-testid={`text-level-name-${level.id}`}>
              {level.nameRu}
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-1">
              {level.descriptionRu}
            </p>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" style={{ color: '#f7931a' }} />
                <span>{level.targetBalls}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" style={{ color: '#8b5cf6' }} />
                <span>{level.colors} цветов</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function LevelSelect({ completedLevels, onSelectLevel, onBack }: LevelSelectProps) {
  return (
    <div 
      className="min-h-screen flex flex-col p-4 pb-24"
      style={{ background: 'linear-gradient(180deg, hsl(230 35% 7%) 0%, hsl(230 35% 10%) 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 
            className="font-display text-2xl font-bold"
            style={{ 
              background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            data-testid="text-level-select-title"
          >
            Выбор уровня
          </h1>
          <p className="text-sm text-muted-foreground">
            Пройдено: {completedLevels.length} / {LEVELS.length}
          </p>
        </div>
      </motion.div>
      
      {/* Crypto hint */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
        style={{ backgroundColor: 'rgba(247, 147, 26, 0.1)', border: '1px solid rgba(247, 147, 26, 0.2)' }}
      >
        <SiBitcoin className="w-4 h-4 flex-shrink-0" style={{ color: '#f7931a' }} />
        <p className="text-xs" style={{ color: '#f7931a' }}>
          Криптошарики появляются только на новых уровнях! Проходи дальше для крипто-наград.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4 overflow-x-auto pb-2"
      >
        {(['easy', 'medium', 'hard'] as const).map(diff => {
          const count = LEVELS.filter(l => l.difficulty === diff).length;
          const completed = LEVELS.filter(
            l => l.difficulty === diff && completedLevels.includes(l.id)
          ).length;
          return (
            <Badge
              key={diff}
              variant="secondary"
              className={`${getDifficultyColor(diff)} ${getDifficultyBgColor(diff)} border-0 whitespace-nowrap`}
            >
              {getDifficultyLabel(diff)}: {completed}/{count}
            </Badge>
          );
        })}
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-3">
          {LEVELS.map(level => (
            <LevelCard
              key={level.id}
              level={level}
              isUnlocked={isLevelUnlocked(level.id, completedLevels)}
              isCompleted={completedLevels.includes(level.id)}
              onSelect={() => onSelectLevel(level)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
