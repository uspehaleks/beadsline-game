import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import type { HouseAccountConfig } from '@shared/schema';

export default function WalletsTab({ 
  walletAddresses, 
  refetchWalletAddresses 
}: { 
  walletAddresses: {
    btc_address: string;
    eth_address: string;
    usdt_trc20_address: string;
    usdt_ton_address: string;
  }; 
  refetchWalletAddresses: () => void; 
}) {
  const [formData, setFormData] = useState({
    btc_address: walletAddresses?.btc_address || '',
    eth_address: walletAddresses?.eth_address || '',
    usdt_trc20_address: walletAddresses?.usdt_trc20_address || '',
    usdt_ton_address: walletAddresses?.usdt_ton_address || '',
  });
  
  const queryClient = useQueryClient();
  
  const updateWalletsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('PUT', '/api/admin/wallets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      toast.success('Wallet addresses updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update wallet addresses');
      console.error('Error updating wallet addresses:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWalletsMutation.mutateAsync(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="btc_address">Bitcoin Address</Label>
                <Input
                  id="btc_address"
                  name="btc_address"
                  value={formData.btc_address}
                  onChange={handleChange}
                  placeholder="Enter Bitcoin address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eth_address">Ethereum Address</Label>
                <Input
                  id="eth_address"
                  name="eth_address"
                  value={formData.eth_address}
                  onChange={handleChange}
                  placeholder="Enter Ethereum address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usdt_trc20_address">USDT TRC20 Address</Label>
                <Input
                  id="usdt_trc20_address"
                  name="usdt_trc20_address"
                  value={formData.usdt_trc20_address}
                  onChange={handleChange}
                  placeholder="Enter USDT TRC20 address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usdt_ton_address">USDT TON Address</Label>
                <Input
                  id="usdt_ton_address"
                  name="usdt_ton_address"
                  value={formData.usdt_ton_address}
                  onChange={handleChange}
                  placeholder="Enter USDT TON address"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateWalletsMutation.isPending}
              >
                {updateWalletsMutation.isPending ? 'Updating...' : 'Update Wallets'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}