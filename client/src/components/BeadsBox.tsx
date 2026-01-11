import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Coins, Zap, Heart, Ticket, X, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { BeadsBoxReward } from "@shared/schema";

interface BeadsBoxProps {
  onClose: () => void;
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
  beads: <Coins className="w-8 h-8 text-yellow-400" />,
  boost: <Zap className="w-8 h-8 text-purple-400" />,
  lives: <Heart className="w-8 h-8 text-red-400" />,
  crypto_ticket: <Ticket className="w-8 h-8 text-green-400" />,
};

const rewardNames: Record<string, string> = {
  beads: "Beads",
  boost: "Буст",
  lives: "Жизни",
  crypto_ticket: "Крипто-билет",
};

export function BeadsBox({ onClose }: BeadsBoxProps) {
  const queryClient = useQueryClient();
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<BeadsBoxReward | null>(null);
  const [allRevealedBoxes, setAllRevealedBoxes] = useState<BeadsBoxReward[] | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const { data: boxData, isLoading } = useQuery<BoxSessionResponse>({
    queryKey: ["/api/beads-box/daily"],
  });

  const chooseMutation = useMutation({
    mutationFn: async ({ sessionId, boxIndex }: { sessionId: string; boxIndex: number }) => {
      const response = await apiRequest("POST", "/api/beads-box/choose", { sessionId, boxIndex });
      return response.json() as Promise<ChooseBoxResponse>;
    },
    onSuccess: (data) => {
      setRevealedReward(data.reward);
      setAllRevealedBoxes(data.allBoxes);
      setIsRevealing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/beads-box/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/boosts"] });
    },
    onError: () => {
      setIsRevealing(false);
    },
  });

  const handleBoxClick = (index: number) => {
    if (!boxData?.session || boxData.session.selectedBoxIndex !== null || isRevealing) return;
    
    setSelectedBox(index);
    setIsRevealing(true);
    
    setTimeout(() => {
      chooseMutation.mutate({ sessionId: boxData.session!.id, boxIndex: index });
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Gift className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <p className="mt-4 text-white font-semibold">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!boxData?.enabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <Card className="bg-slate-900 border-slate-700 p-6 max-w-sm text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">BEADS BOX недоступен</p>
          <p className="text-slate-400 text-sm mb-4">{boxData?.message || "Функция временно отключена"}</p>
          <Button onClick={onClose} variant="outline">
            Закрыть
          </Button>
        </Card>
      </div>
    );
  }

  const session = boxData.session;
  const alreadyClaimed = session?.selectedBoxIndex !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">BEADS BOX</h2>
              <p className="text-xs text-slate-400">Ежедневная награда</p>
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
          <div className="mb-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">
                Крипто-билетов: {boxData.cryptoTickets}
              </span>
            </div>
            <p className="text-xs text-green-300/70 mt-1">
              Используйте для игры с крипто-шариками
            </p>
          </div>
        )}

        {!alreadyClaimed && !revealedReward && (
          <p className="text-center text-slate-300 mb-6">
            Выберите один из 6 боксов для получения награды!
          </p>
        )}

        <AnimatePresence mode="wait">
          {revealedReward && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-6 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl border border-yellow-500/30 text-center"
            >
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-400 font-bold text-lg mb-2">Поздравляем!</p>
              <div className="flex items-center justify-center gap-3">
                {rewardIcons[revealedReward.type]}
                <div className="text-left">
                  <p className="text-white font-bold text-xl">
                    {revealedReward.type === "boost" 
                      ? `${revealedReward.boostType} x${revealedReward.value}`
                      : `${revealedReward.value} ${rewardNames[revealedReward.type]}`
                    }
                  </p>
                  {revealedReward.type === "crypto_ticket" && (
                    <p className="text-xs text-slate-400">Одна бесплатная игра с крипто-шариками!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(allRevealedBoxes || session?.boxes || []).map((box, index) => {
            const isSelected = selectedBox === index || session?.selectedBoxIndex === index;
            const isHidden = 'hidden' in box && box.hidden;
            const reward = !isHidden ? box as BeadsBoxReward : null;

            return (
              <motion.button
                key={index}
                onClick={() => handleBoxClick(index)}
                disabled={alreadyClaimed || isRevealing}
                whileHover={!alreadyClaimed && !isRevealing ? { scale: 1.05 } : undefined}
                whileTap={!alreadyClaimed && !isRevealing ? { scale: 0.95 } : undefined}
                animate={isSelected && isRevealing ? { 
                  rotateY: [0, 180],
                  transition: { duration: 0.5 }
                } : undefined}
                className={`
                  relative aspect-square rounded-2xl p-3
                  flex flex-col items-center justify-center
                  transition-all duration-300
                  ${isHidden 
                    ? `bg-gradient-to-br ${boxColors[index]} shadow-lg hover:shadow-xl cursor-pointer` 
                    : 'bg-slate-800/80 border border-slate-600'
                  }
                  ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
                  ${alreadyClaimed && !isSelected ? 'opacity-50' : ''}
                  disabled:cursor-default
                `}
                data-testid={`button-box-${index}`}
              >
                {isHidden ? (
                  <>
                    <Gift className="w-10 h-10 text-white/90 mb-1" />
                    <span className="text-white/80 text-xs font-bold">#{index + 1}</span>
                  </>
                ) : reward && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {rewardIcons[reward.type]}
                    <span className="text-white text-xs font-semibold mt-1">
                      {reward.type === "boost" 
                        ? reward.boostType 
                        : `${reward.value}`
                      }
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {!boxData.canGetCryptoTicket && (
          <div className="mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">
                Пройдите все 10 уровней для шанса получить крипто-билет
              </span>
            </div>
          </div>
        )}

        {alreadyClaimed && (
          <p className="text-center text-slate-400 text-sm mb-4">
            Приходите завтра за новой наградой!
          </p>
        )}

        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold"
          data-testid="button-continue-beadsbox"
        >
          {alreadyClaimed ? "Закрыть" : "Отмена"}
        </Button>
      </motion.div>
    </div>
  );
}