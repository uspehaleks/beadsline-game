import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import type { User } from '@shared/schema';

export default function UsersTab({ users, refetchUsers }: { users: User[]; refetchUsers: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegramId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const makeAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest('PUT', `/api/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(variables.isAdmin ? 'User promoted to admin' : 'User demoted from admin');
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    },
  });

  const handleMakeAdmin = async (user: User, isAdmin: boolean) => {
    await makeAdminMutation.mutateAsync({ userId: user.id, isAdmin });
  };

  const handleUserDetail = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users</CardTitle>
            <div className="flex space-x-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Games Played</TableHead>
                <TableHead>Wins</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.telegramId}</TableCell>
                  <TableCell>{user.totalPoints}</TableCell>
                  <TableCell>{user.gamesPlayed}</TableCell>
                  <TableCell>{user.totalWins}</TableCell>
                  <TableCell>
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserDetail(user)}
                      >
                        View
                      </Button>
                      <Button
                        variant={user.isAdmin ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleMakeAdmin(user, !user.isAdmin)}
                        disabled={makeAdminMutation.isPending}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details: {selectedUser.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ID</Label>
                <p>{selectedUser.id}</p>
              </div>
              <div>
                <Label>Username</Label>
                <p>{selectedUser.username}</p>
              </div>
              <div>
                <Label>Telegram ID</Label>
                <p>{selectedUser.telegramId}</p>
              </div>
              <div>
                <Label>Total Points</Label>
                <p>{selectedUser.totalPoints}</p>
              </div>
              <div>
                <Label>Games Played</Label>
                <p>{selectedUser.gamesPlayed}</p>
              </div>
              <div>
                <Label>Total Wins</Label>
                <p>{selectedUser.totalWins}</p>
              </div>
              <div>
                <Label>Current Win Streak</Label>
                <p>{selectedUser.currentWinStreak}</p>
              </div>
              <div>
                <Label>Best Win Streak</Label>
                <p>{selectedUser.bestWinStreak}</p>
              </div>
              <div>
                <Label>Best Score</Label>
                <p>{selectedUser.bestScore}</p>
              </div>
              <div>
                <Label>Created At</Label>
                <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label>Last Activity</Label>
                <p>{new Date(selectedUser.lastActivityAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}