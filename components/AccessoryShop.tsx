import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag, Check, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import type { Accessory, AccessoryCategory, UserAccessory, CharacterWithAccessories } from '@shared/schema';

interface AccessoryShopProps {
  onBack: () => void;
}

export function AccessoryShop({ onBack }: AccessoryShopProps) {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<AccessoryCategory[]>({
    queryKey: ['/api/accessories/categories'],
  });

  const { data: accessories = [], isLoading: accessoriesLoading } = useQuery<Accessory[]>({
    queryKey: ['/api/accessories'],
  });

  const { data: ownedAccessories = [], isLoading: ownedLoading } = useQuery<UserAccessory[]>({
    queryKey: ['/api/user/accessories'],
  });

  const { data: characterData } = useQuery<CharacterWithAccessories>({
    queryKey: ['/api/character'],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (accessoryId: string) => {
      const response = await apiRequest('POST', '/api/accessories/purchase', { accessoryId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/accessories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      refreshUser();
      toast({
        title: 'Покупка успешна!',
        description: 'Аксессуар добавлен в вашу коллекцию',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка покупки',
        description: error.message || 'Не удалось купить аксессуар',
        variant: 'destructive',
      });
    },
  });

  const ownedIds = new Set(ownedAccessories.map(ua => ua.accessoryId));
  const userGender = characterData?.gender;

  const filteredAccessories = accessories.filter(acc => {
    if (!acc.isActive) return false;
    if (selectedCategory && acc.categoryId !== selectedCategory) return false;
    if (userGender && acc.gender !== null && acc.gender !== userGender) return false;
    return true;
  });

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const isLoading = categoriesLoading || accessoriesLoading || ownedLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <header className="p-4 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Магазин</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-amber-700 dark:text-amber-400" data-testid="text-beads-balance">
            {user?.totalPoints ?? 0}
          </span>
        </div>
      </header>

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
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAccessories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет доступных аксессуаров</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAccessories.map((acc) => {
                const isOwned = ownedIds.has(acc.id);
                const isSoldOut = false; // maxQuantity and soldCount not available in current schema
                const canAfford = (user?.totalPoints ?? 0) >= acc.price;

                return (
                  <motion.div
                    key={acc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="overflow-hidden" data-testid={`accessory-card-${acc.id}`}>
                      <CardContent className="p-3 space-y-3">
                        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={acc.imageUrl}
                            alt={acc.name}
                            className="w-full h-full object-contain"
                          />
                          {isOwned && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <div className="bg-green-500 rounded-full p-2">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                          {!isOwned && isSoldOut && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="destructive">Распродано</Badge>
                            </div>
                          )}
                          {/* maxQuantity and soldCount not available in current schema */}
                        </div>

                        <div>
                          <h3 className="font-medium text-sm truncate">{acc.name}</h3>
                          {/* description not available in current schema */}
                        </div>

                        {isOwned ? (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full" 
                            disabled
                            data-testid={`button-owned-${acc.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Куплено
                          </Button>
                        ) : isSoldOut ? (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full" 
                            disabled
                            data-testid={`button-soldout-${acc.id}`}
                          >
                            <Lock className="w-4 h-4 mr-1" />
                            Распродано
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={!canAfford || purchaseMutation.isPending}
                            onClick={() => purchaseMutation.mutate(acc.id)}
                            data-testid={`button-buy-${acc.id}`}
                          >
                            <Coins className="w-4 h-4 mr-1" />
                            {acc.price} Beads
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
