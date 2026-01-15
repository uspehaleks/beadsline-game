import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Zap, Heart, Frown, Smile, Meh, ThermometerSun, User, UserRound } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import type { CharacterWithAccessories } from "@shared/schema";

export type CharacterGender = 'male' | 'female';
export type HealthState = 'normal' | 'tired' | 'sick' | 'hungry';
export type CharacterMood = 'happy' | 'neutral' | 'sad';

interface CharacterStatus {
  isSetup: boolean;
  gender: CharacterGender | null;
  name: string | null;
  energy: number;
  maxEnergy: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  fatigue: number;
  maxFatigue: number;
  healthState: HealthState;
  mood: CharacterMood;
  lastActivityAt: string;
  lastCareAt: string | null;
  hoursSinceActivity: number;
  careCooldowns: Record<string, string>;
}

const maleReplies = {
  normal: ["Рад тебя видеть!", "Готов продолжать!", "Поехали дальше!"],
  win: ["Отличная игра!", "Круто сыграно!", "Мы молодцы!"],
  lose: ["В следующий раз получится!", "Надо ещё попытку!"],
  low_energy: ["Я устал...", "Нужно немного отдыха..."],
  sick: ["Мне плохо...", "Кажется, я заболел..."],
  item_used: ["Стало лучше!", "Спасибо!"],
  feed: ["Ммм, вкусно!", "Спасибо за еду!", "Теперь я сытый!"],
  drink: ["Освежает!", "Спасибо за воду!", "Больше не хочу пить!"],
  rest: ["Отдохнул отлично!", "Силы восстановились!", "Спасибо за отдых!"],
  heal: ["Мне уже лучше!", "Спасибо за заботу!", "Чувствую себя здоровым!"],
  hungry: ["Я голодный...", "Хочу кушать...", "Покорми меня, пожалуйста!"],
  thirsty: ["Хочу пить...", "Дай водички...", "Очень хочется пить!"],
};

const femaleReplies = {
  normal: ["Рада тебя видеть!", "Готова продолжать!", "Поехали дальше!"],
  win: ["Отличная игра!", "Круто сыграно!", "Мы молодцы!"],
  lose: ["В следующий раз получится!", "Надо ещё попытку!"],
  low_energy: ["Я устала...", "Нужно немного отдыха..."],
  sick: ["Мне плохо...", "Кажется, я заболела..."],
  item_used: ["Стало лучше!", "Спасибо!"],
  feed: ["Ммм, вкусно!", "Спасибо за еду!", "Теперь я сытая!"],
  drink: ["Освежает!", "Спасибо за воду!", "Больше не хочу пить!"],
  rest: ["Отдохнула отлично!", "Силы восстановились!", "Спасибо за отдых!"],
  heal: ["Мне уже лучше!", "Спасибо за заботу!", "Чувствую себя здоровой!"],
  hungry: ["Я голодная...", "Хочу кушать...", "Покорми меня, пожалуйста!"],
  thirsty: ["Хочу пить...", "Дай водички...", "Очень хочется пить!"],
};

export type ReplyTrigger = keyof typeof maleReplies;

const REPLY_COOLDOWN_KEY = 'character_reply_cooldown';
const REPLY_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

export function getRandomReply(gender: CharacterGender, trigger: ReplyTrigger): string {
  const replies = gender === 'male' ? maleReplies : femaleReplies;
  const options = replies[trigger];
  return options[Math.floor(Math.random() * options.length)];
}

function canShowReply(): boolean {
  const lastShown = localStorage.getItem(REPLY_COOLDOWN_KEY);
  if (!lastShown) return true;
  return Date.now() - parseInt(lastShown, 10) >= REPLY_COOLDOWN_MS;
}

function markReplyShown(): void {
  localStorage.setItem(REPLY_COOLDOWN_KEY, Date.now().toString());
}

interface GameCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  trigger?: ReplyTrigger | null;
  onSetupRequired?: () => void;
}

export function GameCharacter({
  size = 'md',
  showStats = true,
  trigger,
  onSetupRequired,
}: GameCharacterProps) {
  const [reply, setReply] = useState<string | null>(null);
  const [showReply, setShowReply] = useState(false);

  const { data: status, isLoading } = useQuery<CharacterStatus>({
    queryKey: ['/api/character/status'],
  });

  const { data: characterData } = useQuery<CharacterWithAccessories>({
    queryKey: ['/api/character'],
    enabled: !!status?.isSetup,
  });

  const showReplyBubble = useCallback((newReply: string) => {
    if (canShowReply()) {
      setReply(newReply);
      setShowReply(true);
      markReplyShown();
      setTimeout(() => {
        setShowReply(false);
        setReply(null);
      }, 4000);
    }
  }, []);

  useEffect(() => {
    if (status?.isSetup && status.gender && trigger) {
      let actualTrigger = trigger;
      
      if (status.healthState === 'sick') {
        actualTrigger = 'sick';
      } else if (status.energy < 30) {
        actualTrigger = 'low_energy';
      }
      
      const replyText = getRandomReply(status.gender, actualTrigger);
      showReplyBubble(replyText);
    }
  }, [trigger, status?.isSetup, status?.gender, status?.healthState, status?.energy, showReplyBubble]);

  useEffect(() => {
    if (status && !status.isSetup && onSetupRequired) {
      onSetupRequired();
    }
  }, [status, onSetupRequired]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center animate-pulse" data-testid="character-loading">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!status?.isSetup) {
    return null;
  }

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const avatarSize = sizeClasses[size];
  
  const getBodyColor = () => {
    if (status.healthState === 'sick') return 'from-green-300 to-green-400';
    if (status.healthState === 'tired') return 'from-yellow-300 to-yellow-400';
    return status.gender === 'male' ? 'from-blue-400 to-blue-500' : 'from-pink-400 to-pink-500';
  };

  const getMoodIcon = () => {
    switch (status.mood) {
      case 'happy': return <Smile className="w-full h-full text-yellow-400" />;
      case 'sad': return <Frown className="w-full h-full text-blue-400" />;
      default: return <Meh className="w-full h-full text-gray-400" />;
    }
  };

  const getHealthIcon = () => {
    if (status.healthState === 'sick') return <ThermometerSun className="w-4 h-4 text-red-500" />;
    if (status.healthState === 'tired') return <Zap className="w-4 h-4 text-yellow-500" />;
    return <Heart className="w-4 h-4 text-green-500" />;
  };

  const getAnimationVariants = () => {
    if (status.healthState === 'sick') {
      return {
        animate: { 
          rotate: [-2, 2, -2],
          transition: { duration: 2, repeat: Infinity }
        }
      };
    }
    if (status.healthState === 'tired') {
      return {
        animate: { 
          y: [0, 3, 0],
          transition: { duration: 3, repeat: Infinity }
        }
      };
    }
    return {
      animate: { 
        scale: [1, 1.02, 1],
        transition: { duration: 2, repeat: Infinity }
      }
    };
  };

  const energyPercent = Math.round((status.energy / status.maxEnergy) * 100);
  const energyColor = energyPercent > 60 ? 'bg-green-500' : energyPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="relative flex flex-col items-center" data-testid="game-character">
      <AnimatePresence>
        {showReply && reply && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-10"
            data-testid="character-reply-bubble"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700 max-w-[180px]">
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">{reply}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`${avatarSize} relative`}
        variants={getAnimationVariants()}
        animate="animate"
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-b ${getBodyColor()} shadow-lg flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700`}>
          {characterData?.baseBody ? (
            <CharacterAvatar 
              characterData={characterData} 
              size={size === 'lg' ? 120 : size === 'md' ? 88 : 56}
              showPlaceholder={false}
            />
          ) : (
            <div className="w-12 h-12 text-white">
              {status.gender === 'male' ? <User className="w-full h-full" /> : <UserRound className="w-full h-full" />}
            </div>
          )}
        </div>
        
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-gray-200 dark:border-gray-600">
          <div className="w-5 h-5">
            {getMoodIcon()}
          </div>
        </div>

        {status.healthState !== 'normal' && (
          <div className="absolute -top-1 -left-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-gray-200 dark:border-gray-600">
            {getHealthIcon()}
          </div>
        )}
      </motion.div>

      <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200" data-testid="character-name">
        {status.name}
      </p>

      {showStats && (
        <div className="mt-2 w-full max-w-[120px]" data-testid="character-energy-bar">
          <div className="flex items-center justify-between gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Энергия
            </span>
            <span>{energyPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${energyColor} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function useCharacterActivity() {
  const mutation = useMutation({
    mutationFn: async ({ energyGain, mood }: { energyGain?: number; mood?: CharacterMood }) => {
      return apiRequest('POST', '/api/character/activity', { energyGain, mood });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/status'] });
    },
  });

  return mutation;
}
