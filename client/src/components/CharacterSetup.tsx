import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type CharacterGender = 'male' | 'female';

interface CharacterSetupProps {
  onComplete: () => void;
}

export function CharacterSetup({ onComplete }: CharacterSetupProps) {
  const [step, setStep] = useState<'gender' | 'name'>('gender');
  const [gender, setGender] = useState<CharacterGender | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const setupMutation = useMutation({
    mutationFn: async (data: { gender: CharacterGender; name: string }) => {
      return apiRequest('POST', '/api/character/setup', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/status'] });
      onComplete();
    },
    onError: (err: any) => {
      setError(err.message || 'Ошибка при создании персонажа');
    },
  });

  const handleGenderSelect = (selected: CharacterGender) => {
    setGender(selected);
    setStep('name');
  };

  const handleSubmit = () => {
    if (!gender) return;
    
    const trimmedName = name.trim();
    if (trimmedName.length < 1) {
      setError('Введите имя персонажа');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Имя слишком длинное');
      return;
    }

    setError('');
    setupMutation.mutate({ gender, name: trimmedName });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Создай своего персонажа</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'gender' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-muted-foreground mb-6">
                  Выбери пол персонажа
                </p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenderSelect('male')}
                    className="flex flex-col items-center p-6 rounded-xl bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border-2 border-transparent hover:border-blue-400"
                    data-testid="select-gender-male"
                  >
                    <span className="text-6xl mb-2">👦</span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">Он</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGenderSelect('female')}
                    className="flex flex-col items-center p-6 rounded-xl bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors border-2 border-transparent hover:border-pink-400"
                    data-testid="select-gender-female"
                  >
                    <span className="text-6xl mb-2">👧</span>
                    <span className="font-medium text-pink-700 dark:text-pink-300">Она</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'name' && gender && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    gender === 'male' 
                      ? 'bg-gradient-to-b from-blue-400 to-blue-500' 
                      : 'bg-gradient-to-b from-pink-400 to-pink-500'
                  }`}>
                    <span className="text-4xl">{gender === 'male' ? '👦' : '👧'}</span>
                  </div>
                </div>
                
                <p className="text-center text-muted-foreground">
                  Как зовут твоего персонажа?
                </p>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введи имя..."
                  maxLength={50}
                  className="text-center text-lg"
                  data-testid="input-character-name"
                />

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('gender')}
                    className="flex-1"
                    data-testid="button-back-to-gender"
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={setupMutation.isPending || !name.trim()}
                    className="flex-1"
                    data-testid="button-create-character"
                  >
                    {setupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      'Создать'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
