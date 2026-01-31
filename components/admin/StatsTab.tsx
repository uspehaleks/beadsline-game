import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import type { RevenueSummary } from '@shared/schema';

export default function StatsTab({ 
  revenueSummary 
}: { 
  revenueSummary: RevenueSummary; 
}) {
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Mock data for charts - in real implementation, this would come from API
  const dailyData = [
    { name: 'Mon', revenue: 4000, users: 240 },
    { name: 'Tue', revenue: 3000, users: 139 },
    { name: 'Wed', revenue: 2000, users: 180 },
    { name: 'Thu', revenue: 2780, users: 190 },
    { name: 'Fri', revenue: 1890, users: 120 },
    { name: 'Sat', revenue: 2390, users: 210 },
    { name: 'Sun', revenue: 3490, users: 250 },
  ];
  
  const weeklyData = [
    { week: 'Week 1', revenue: 24000, users: 1400 },
    { week: 'Week 2', revenue: 13980, users: 1398 },
    { week: 'Week 3', revenue: 9800, users: 980 },
    { week: 'Week 4', revenue: 3908, users: 390 },
  ];
  
  const monthlyData = [
    { month: 'Jan', revenue: 40000, users: 2400 },
    { month: 'Feb', revenue: 30000, users: 1398 },
    { month: 'Mar', revenue: 20000, users: 1800 },
    { month: 'Apr', revenue: 27800, users: 1900 },
    { month: 'May', revenue: 18900, users: 1200 },
    { month: 'Jun', revenue: 23900, users: 2100 },
  ];
  
  const getDataForChart = () => {
    switch(chartType) {
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      default:
        return dailyData;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Revenue Summary</CardTitle>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded-md text-sm ${
                  chartType === 'daily' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
                onClick={() => setChartType('daily')}
              >
                Daily
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${
                  chartType === 'weekly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
                onClick={() => setChartType('weekly')}
              >
                Weekly
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${
                  chartType === 'monthly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
                onClick={() => setChartType('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getDataForChart()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={chartType === 'daily' ? 'name' : chartType === 'weekly' ? 'week' : 'month'} 
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="users" fill="#82ca9d" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueSummary.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueSummary.totalTeamShare?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Total team revenue share</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueSummary.teamRevenue?.length || '0'}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((level) => (
                <TableRow key={level}>
                  <TableCell>Level {level}</TableCell>
                  <TableCell>{Math.floor(Math.random() * 1000)}</TableCell>
                  <TableCell>{Math.floor(Math.random() * 100)}%</TableCell>
                  <TableCell>${Math.floor(Math.random() * 1000)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}