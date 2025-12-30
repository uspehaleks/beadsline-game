import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, ExternalLink, Check, Loader2 } from 'lucide-react';
import { SiTelegram } from 'react-icons/si';

interface MembershipStatus {
  inChannel: boolean;
  inChat: boolean;
  channelLink: string;
  chatLink: string;
}

interface CommunityInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunityInviteDialog({ open, onOpenChange }: CommunityInviteDialogProps) {
  const [hasOpenedLinks, setHasOpenedLinks] = useState({ channel: false, chat: false });
  
  const { data: membership, isLoading, refetch } = useQuery<MembershipStatus>({
    queryKey: ['/api/telegram/check-membership'],
    enabled: open,
    refetchInterval: open ? 3000 : false,
  });

  useEffect(() => {
    if (membership?.inChannel && membership?.inChat) {
      setTimeout(() => onOpenChange(false), 1500);
    }
  }, [membership, onOpenChange]);

  const handleOpenChannel = () => {
    if (membership?.channelLink) {
      window.open(membership.channelLink, '_blank');
      setHasOpenedLinks(prev => ({ ...prev, channel: true }));
    }
  };

  const handleOpenChat = () => {
    if (membership?.chatLink) {
      window.open(membership.chatLink, '_blank');
      setHasOpenedLinks(prev => ({ ...prev, chat: true }));
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const allJoined = membership?.inChannel && membership?.inChat;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-testid="dialog-community-invite">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SiTelegram className="w-6 h-6 text-[#0088cc]" />
            Присоединяйтесь к сообществу!
          </DialogTitle>
          <DialogDescription>
            Подпишитесь на наш канал и чат, чтобы быть в курсе новостей, получать бонусы и общаться с другими игроками.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Канал Beads Lines</div>
                <div className="text-xs text-muted-foreground">Новости и обновления</div>
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : membership?.inChannel ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Button size="sm" variant="outline" onClick={handleOpenChannel} data-testid="button-join-channel">
                <ExternalLink className="w-4 h-4 mr-1" />
                Открыть
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Чат игроков</div>
                <div className="text-xs text-muted-foreground">Общение и помощь</div>
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : membership?.inChat ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Button size="sm" variant="outline" onClick={handleOpenChat} data-testid="button-join-chat">
                <ExternalLink className="w-4 h-4 mr-1" />
                Открыть
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {allJoined ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Вы в сообществе!</span>
            </div>
          ) : (
            <>
              {(hasOpenedLinks.channel || hasOpenedLinks.chat) && (
                <Button variant="outline" onClick={handleRefresh} className="w-full" data-testid="button-refresh-membership">
                  <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Проверить подписку
                </Button>
              )}
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full" data-testid="button-skip-community">
                Позже
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
