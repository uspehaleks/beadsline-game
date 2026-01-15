import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Coins, Zap, Heart, Ticket, X, Sparkles, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface BeadsBoxProps {
  onClose: () => void;
}

interface BeadsBoxReward {
  type: 'beads' | 'boost' | 'lives' | 'crypto_ticket';
  amount: number;
  boostType?: string;
  boostId?: string;
  value?: number;
}

interface BoxSessionResponse {
  enabled: boolean;
  message?: string;
  session?: {
    id: string;
    boxes: Array<{ hidden?: boolean } | BeadsBoxReward>;
    selectedBoxIndex: number | null;
    rewardClaimed: boolean;
    claimedReward: BeadsBoxReward | null;
  };
  cryptoTickets: number;
  canGetCryptoTicket: boolean;
}

interface ChooseBoxResponse {
  success: boolean;
  selectedIndex: number;
  reward: BeadsBoxReward;
  allBoxes: BeadsBoxReward[];
}

const boxColors = [
  "from-yellow-500 to-amber-600",
  "from-purple-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-blue-500 to-cyan-600",
  "from-orange-500 to-red-600",
];

const rewardIcons: Record<string, JSX.Element> = {
  beads: <Coins className="w-12 h-12 text-yellow-400" />,
  boost: <Zap className="w-12 h-12 text-purple-400" />,
  lives: <Heart className="w-12 h-12 text-red-400" />,
  crypto_ticket: <Ticket className="w-12 h-12 text-green-400" />,
};

const smallRewardIcons: Record<string, JSX.Element> = {
  beads: <Coins className="w-6 h-6 text-yellow-400" />,
  boost: <Zap className="w-6 h-6 text-purple-400" />,
  lives: <Heart className="w-6 h-6 text-red-400" />,
  crypto_ticket: <Ticket className="w-6 h-6 text-green-400" />,
};

const rewardNames: Record<string, string> = {
  beads: "Бусин",
  boost: "Буст",
  lives: "Жизней",
  crypto_ticket: "Крипто-билет",
};

const boostNames: Record<string, string> = {
  double_points: "2x Очки",
  slow_time: "Замедление",
  extra_life: "Жизнь",
  magnet: "Магнит",
};

function Confetti() {
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 720 - 360,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: "linear",
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
          }}
        />
      ))}
    </div>
  );
}

function StarBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ 
            scale: [0, 1.5, 0],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `rotate(${i * 30}deg) translateY(-60px)`,
          }}
        >
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </motion.div>
      ))}
    </div>
  );
}

export function BeadsBox({ onClose }: BeadsBoxProps) {
  const queryClient = useQueryClient();
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<BeadsBoxReward | null>(null);
  const [allRevealedBoxes, setAllRevealedBoxes] = useState<BeadsBoxReward[] | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownAlreadyClaimedReward, setHasShownAlreadyClaimedReward] = useState(false);
  const [isNewlyClaimed, setIsNewlyClaimed] = useState(false);

  const { data: boxData, isLoading, error } = useQuery<BoxSessionResponse>({
    queryKey: ["/api/beads-box/daily"],
  });

  // Show celebration only for newly claimed rewards (not for already-claimed on page load)
  useEffect(() => {
    if (revealedReward && isNewlyClaimed) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
        // Reset the flag so celebration doesn't replay on query refresh
        setIsNewlyClaimed(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [revealedReward, isNewlyClaimed]);

  // Show already claimed reward on first load (no celebration)
  useEffect(() => {
    // Only run once when component mounts and data is loaded
    if (boxData?.session?.claimedReward && !hasShownAlreadyClaimedReward) {
      setHasShownAlreadyClaimedReward(true);
      // Set reward without celebration flag
      setRevealedReward(boxData.session.claimedReward);
      
      // Also set revealed boxes if available
      const boxes = boxData.session.boxes;
      if (boxes && boxes.length > 0 && !('hidden' in boxes[0])) {
        setAllRevealedBoxes(boxes as BeadsBoxReward[]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxData?.session?.claimedReward]);

  const chooseMutation = useMutation({
    mutationFn: async ({ sessionId, boxIndex }: { sessionId: string; boxIndex: number }) => {
      const response = await apiRequest("POST", "/api/beads-box/choose", { sessionId, boxIndex });
      return response.json() as Promise<ChooseBoxResponse>;
    },
    onSuccess: (data) => {
      setIsNewlyClaimed(true);
      setRevealedReward(data.reward);
      setAllRevealedBoxes(data.allBoxes);
      setIsRevealing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/beads-box/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/boosts"] });
    },
    onError: (err) => {
      console.error("Choose box error:", err);
      setIsRevealing(false);
      setSelectedBox(null);
    },
  });

  const handleBoxClick = (index: number) => {
    console.log('BeadsBox handleBoxClick:', { index, session: boxData?.session, selectedBoxIndex: boxData?.session?.selectedBoxIndex, isRevealing });
    if (!boxData?.session || boxData.session.selectedBoxIndex !== null || isRevealing) {
      console.log('BeadsBox click ignored:', { hasSession: !!boxData?.session, selectedBoxIndex: boxData?.session?.selectedBoxIndex, isRevealing });
      return;
    }
    
    setSelectedBox(index);
    setIsRevealing(true);
    
    console.log('BeadsBox choosing box:', { sessionId: boxData.session.id, boxIndex: index });
    // Call mutation immediately - no delay for better mobile responsiveness
    chooseMutation.mutate({ sessionId: boxData.session.id, boxIndex: index });
  };

  const getRewardDisplay = (reward: BeadsBoxReward) => {
    switch (reward.type) {
      case 'beads':
        return `+${reward.amount} ${rewardNames.beads}`;
      case 'boost':
        return `${boostNames[reward.boostType || ''] || reward.boostType} x1`;
      case 'lives':
        return `+${reward.amount} ${rewardNames.lives}`;
      case 'crypto_ticket':
        return rewardNames.crypto_ticket;
      default:
        return 'Награда';
    }
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700 max-w-md">
          <DialogTitle className="sr-only">BEADS BOX</DialogTitle>
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Gift className="w-16 h-16 text-yellow-400" />
            </motion.div>
            <p className="mt-4 text-white font-semibold">Загрузка...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !boxData?.enabled) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700 max-w-sm">
          <DialogTitle className="sr-only">BEADS BOX</DialogTitle>
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">BEADS BOX недоступен</p>
            <p className="text-slate-400 text-sm mb-4">{boxData?.message || "Функция временно отключена"}</p>
            <Button onClick={onClose} variant="outline">
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const session = boxData.session;
  const alreadyClaimed = session?.selectedBoxIndex !== null;
  const showingReward = !!revealedReward;

  return (
    <>
      {showCelebration && <Confetti />}
      
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 max-w-sm max-h-[85vh] p-0 overflow-y-auto">
          <DialogTitle className="sr-only">BEADS BOX - Ежедневная награда</DialogTitle>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/30"
                  >
                    <Gift className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">BEADS BOX</h2>
                    <p className="text-sm text-slate-400">Ежедневная награда</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                  data-testid="button-close-beadsbox"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {boxData.cryptoTickets > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      Крипто-билетов: {boxData.cryptoTickets}
                    </span>
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {showingReward && revealedReward ? (
                  <motion.div
                    key="reward"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="relative mb-6 p-8 bg-gradient-to-br from-yellow-500/30 via-amber-500/20 to-orange-500/30 rounded-3xl border-2 border-yellow-500/50 text-center overflow-hidden"
                  >
                    <StarBurst />
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                    </motion.div>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-yellow-400 font-bold text-xl mb-4"
                    >
                      {alreadyClaimed && hasShownAlreadyClaimedReward ? "Ваша награда сегодня" : "Поздравляем!"}
                    </motion.p>
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        {rewardIcons[revealedReward.type]}
                      </div>
                      <p className="text-white font-bold text-2xl">
                        {getRewardDisplay(revealedReward)}
                      </p>
                      {revealedReward.type === "crypto_ticket" && (
                        <p className="text-sm text-yellow-300/80">
                          Бесплатная игра с крипто-шариками!
                        </p>
                      )}
                    </motion.div>
                    
                    {alreadyClaimed && hasShownAlreadyClaimedReward && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-sm text-slate-400 mt-4"
                      >
                        Приходите завтра за новой наградой!
                      </motion.p>
                    )}
                  </motion.div>
                ) : !alreadyClaimed ? (
                  <motion.p 
                    key="instruction"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-slate-300 mb-6"
                  >
                    Выберите один из 6 боксов!
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {(allRevealedBoxes || session?.boxes || []).map((box, index) => {
                  const isSelected = selectedBox === index || session?.selectedBoxIndex === index;
                  const boxAsAny = box as { hidden?: boolean };
                  const isHidden = !allRevealedBoxes && (!('type' in box) || boxAsAny.hidden === true);
                  const reward = !isHidden && 'type' in box ? box as BeadsBoxReward : null;
                  const canInteract = !alreadyClaimed && !isRevealing && !showingReward;

                  return (
                    <motion.div
                      key={index}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (canInteract) {
                          handleBoxClick(index);
                        }
                      }}
                      role="button"
                      tabIndex={canInteract ? 0 : -1}
                      whileHover={canInteract ? { scale: 1.08, y: -4 } : undefined}
                      whileTap={canInteract ? { scale: 0.95 } : undefined}
                      animate={isSelected && isRevealing ? { 
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1],
                      } : undefined}
                      transition={{ duration: 0.8 }}
                      className={`
                        relative aspect-square rounded-2xl p-2
                        flex flex-col items-center justify-center
                        transition-all duration-300 select-none
                        ${isHidden 
                          ? `bg-gradient-to-br ${boxColors[index]} shadow-lg ${canInteract ? 'cursor-pointer active:scale-95' : 'cursor-default'}` 
                          : 'bg-slate-800/80 border border-slate-600'
                        }
                        ${isSelected && !isRevealing ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
                        ${showingReward && !isSelected ? 'opacity-40' : ''}
                      `}
                      data-testid={`button-box-${index}`}
                    >
                      {isHidden ? (
                        <motion.div
                          animate={canInteract ? { y: [0, -3, 0] } : undefined}
                          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
                          className="flex flex-col items-center pointer-events-none"
                        >
                          {isSelected && isRevealing ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Gift className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
                            </motion.div>
                          ) : (
                            <Gift className="w-10 h-10 text-white/90 drop-shadow-lg" />
                          )}
                          <span className="text-white/80 text-xs font-bold mt-1">#{index + 1}</span>
                        </motion.div>
                      ) : reward && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="flex flex-col items-center pointer-events-none"
                        >
                          {smallRewardIcons[reward.type]}
                          <span className="text-white text-[10px] font-semibold mt-1 text-center leading-tight">
                            {reward.type === "boost" 
                              ? boostNames[reward.boostType || ''] || reward.boostType
                              : reward.type === 'crypto_ticket'
                                ? 'Билет'
                                : `+${reward.amount}`
                            }
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {!boxData.canGetCryptoTicket && !showingReward && !alreadyClaimed && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">
                      Пройдите все 10 уровней для шанса получить крипто-билет
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-6 text-lg"
                data-testid="button-continue-beadsbox"
              >
                {showingReward ? (alreadyClaimed && hasShownAlreadyClaimedReward ? "Закрыть" : "Забрать награду") : "Отмена"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
