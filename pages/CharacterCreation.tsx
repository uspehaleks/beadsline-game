import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { GenderType } from '@shared/schema';

interface CharacterCreationProps {
  onComplete: () => void;
}

export default function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState<'gender' | 'name'>('gender');
  const [selectedGender, setSelectedGender] = useState<GenderType | null>(null);
  const [name, setName] = useState('');
  const { toast } = useToast();

  const createCharacterMutation = useMutation({
    mutationFn: async ({ name, gender }: { name: string; gender: GenderType }) => {
      const response = await apiRequest('POST', '/api/character', { name, gender });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      toast({
        title: 'Персонаж создан!',
        description: `Добро пожаловать, ${name}!`,
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать персонажа',
        variant: 'destructive',
      });
    },
  });

  const handleGenderSelect = (gender: GenderType) => {
    setSelectedGender(gender);
    setStep('name');
  };

  const handleSubmit = () => {
    if (!selectedGender || !name.trim()) return;
    createCharacterMutation.mutate({ name: name.trim(), gender: selectedGender });
  };

  const handleBack = () => {
    setStep('gender');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Создание персонажа</h1>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          {step === 'gender' ? 'Выберите своего персонажа' : 'Как вас зовут?'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'gender' && (
          <motion.div
            key="gender"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <Card 
              className={`flex-1 cursor-pointer transition-all hover-elevate ${
                selectedGender === 'male' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleGenderSelect('male')}
              data-testid="button-gender-male"
            >
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-500" />
                </div>
                <span className="text-lg font-medium">Он</span>
              </CardContent>
            </Card>

            <Card 
              className={`flex-1 cursor-pointer transition-all hover-elevate ${
                selectedGender === 'female' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleGenderSelect('female')}
              data-testid="button-gender-female"
            >
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                <div className="w-24 h-24 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <UserCircle2 className="w-12 h-12 text-pink-500" />
                </div>
                <span className="text-lg font-medium">Она</span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    selectedGender === 'male' 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-pink-100 dark:bg-pink-900/30'
                  }`}>
                    {selectedGender === 'male' ? (
                      <User className="w-10 h-10 text-blue-500" />
                    ) : (
                      <UserCircle2 className="w-10 h-10 text-pink-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="character-name" className="text-sm font-medium">
                    Имя персонажа
                  </label>
                  <Input
                    id="character-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите имя..."
                    maxLength={20}
                    className="text-center text-lg"
                    data-testid="input-character-name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) {
                        handleSubmit();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {name.length}/20 символов
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1"
                    data-testid="button-back"
                  >
                    Назад
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!name.trim() || createCharacterMutation.isPending}
                    className="flex-1"
                    data-testid="button-create-character"
                  >
                    {createCharacterMutation.isPending ? (
                      'Создание...'
                    ) : (
                      <>
                        Создать
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
