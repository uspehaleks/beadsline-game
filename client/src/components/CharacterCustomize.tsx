import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shirt, Check, X, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import type { Accessory, AccessoryCategory, UserAccessory, CharacterWithAccessories } from '@shared/schema';

interface CharacterCustomizeProps {
  onBack: () => void;
}

export function CharacterCustomize({ onBack }: CharacterCustomizeProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: characterData, isLoading: characterLoading } = useQuery<CharacterWithAccessories>({
    queryKey: ['/api/character'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<AccessoryCategory[]>({
    queryKey: ['/api/accessories/categories'],
  });

  const { data: ownedAccessories = [], isLoading: ownedLoading } = useQuery<UserAccessory[]>({
    queryKey: ['/api/user/accessories'],
  });

  const { data: allAccessories = [] } = useQuery<Accessory[]>({
    queryKey: ['/api/accessories'],
  });

  const equipMutation = useMutation({
    mutationFn: async (accessoryId: string) => {
      const response = await apiRequest('POST', '/api/accessories/equip', { accessoryId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/accessories'] });
      toast({
        title: 'Аксессуар надет!',
        description: 'Ваш персонаж обновлён',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось надеть аксессуар',
        variant: 'destructive',
      });
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async (accessoryId: string) => {
      const response = await apiRequest('POST', '/api/accessories/unequip', { accessoryId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/accessories'] });
      toast({
        title: 'Аксессуар снят!',
        description: 'Ваш персонаж обновлён',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось снять аксессуар',
        variant: 'destructive',
      });
    },
  });

  const equippedIds = new Set(
    characterData?.equippedAccessories?.map(ua => ua.accessoryId) || []
  );

  const accessoryMap = new Map<string, Accessory>();
  allAccessories.forEach(acc => accessoryMap.set(acc.id, acc));

  const ownedWithDetails = ownedAccessories.map(ua => ({
    ...ua,
    accessory: accessoryMap.get(ua.accessoryId),
  })).filter(ua => ua.accessory);

  const filteredOwned = ownedWithDetails.filter(ua => {
    if (!selectedCategory) return true;
    return ua.accessory?.categoryId === selectedCategory;
  });

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const isLoading = characterLoading || categoriesLoading || ownedLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <header className="p-4 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Кастомизация</h1>
          </div>
        </div>
      </header>

      <div className="p-4 flex justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-2">
            <CharacterAvatar 
              characterData={characterData || null} 
              size={160}
              className="rounded-full"
            />
          </div>
          {characterData?.character && (
            <div className="text-center mt-2">
              <p className="font-medium" data-testid="text-character-name">
                {characterData.character.name}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            data-testid="button-category-all"
          >
            Все
          </Button>
          {sortedCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0"
              data-testid={`button-category-${cat.id}`}
            >
              {cat.nameRu}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : filteredOwned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shirt className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {selectedCategory ? 'Нет аксессуаров в этой категории' : 'У вас ещё нет аксессуаров'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Купите аксессуары в магазине
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            <AnimatePresence>
              {filteredOwned.map((ua) => {
                const accessory = ua.accessory!;
                const isEquipped = equippedIds.has(accessory.id);
                const isPending = equipMutation.isPending || unequipMutation.isPending;
                
                return (
                  <motion.div
                    key={ua.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card 
                      className={`overflow-hidden transition-all ${
                        isEquipped ? 'ring-2 ring-primary' : ''
                      }`}
                      data-testid={`card-accessory-${accessory.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="relative aspect-square mb-2 bg-muted/50 rounded-lg overflow-hidden">
                          <img
                            src={accessory.imageUrl}
                            alt={accessory.nameRu}
                            className="w-full h-full object-contain p-2"
                            data-testid={`img-accessory-${accessory.id}`}
                          />
                          {isEquipped && (
                            <div className="absolute top-1 right-1">
                              <Badge className="bg-primary text-primary-foreground text-xs px-1.5">
                                <Check className="w-3 h-3" />
                              </Badge>
                            </div>
                          )}
                          {accessory.maxQuantity !== null && accessory.maxQuantity > 0 && (
                            <div className="absolute top-1 left-1">
                              <Badge variant="secondary" className="text-xs px-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                                <Sparkles className="w-3 h-3" />
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <p className="font-medium text-sm truncate mb-2" data-testid={`text-accessory-name-${accessory.id}`}>
                          {accessory.nameRu}
                        </p>
                        
                        <Button
                          variant={isEquipped ? 'destructive' : 'default'}
                          size="sm"
                          className="w-full"
                          disabled={isPending}
                          onClick={() => {
                            if (isEquipped) {
                              unequipMutation.mutate(accessory.id);
                            } else {
                              equipMutation.mutate(accessory.id);
                            }
                          }}
                          data-testid={`button-${isEquipped ? 'unequip' : 'equip'}-${accessory.id}`}
                        >
                          {isPending ? (
                            <span className="animate-pulse">...</span>
                          ) : isEquipped ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Снять
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Надеть
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
}
