import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function HealthPage() {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  
  const { data: healthData, isLoading, error, refetch } = useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString());
  }, [healthData]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Health Check</h1>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Last checked: {timestamp}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
            
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                <span>Checking connection...</span>
              </div>
            ) : error ? (
              <div className="text-red-500">
                <div className="font-medium">❌ Connection failed</div>
                <div className="text-sm mt-2">{error.message}</div>
                <button 
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            ) : healthData ? (
              <div className="text-green-500">
                <div className="font-medium">✅ Connected successfully</div>
                <div className="text-sm mt-2">Status: {healthData.dbStatus}</div>
                {healthData.timestamp && (
                  <div className="text-xs mt-2">Server time: {healthData.timestamp}</div>
                )}
              </div>
            ) : null}
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Application Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>API Endpoint:</span>
                <span className="font-medium">/api/health</span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-medium">{process.env.NODE_ENV || 'development'}</span>
              </div>
              <div className="flex justify-between">
                <span>Database URL:</span>
                <span className="font-medium">
                  {process.env.DATABASE_URL ? 'Configured' : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>If database connection fails, check your <code className="bg-muted px-1 rounded">DATABASE_URL</code> in <code className="bg-muted px-1 rounded">.env.local</code></li>
            <li>Make sure your Supabase project is active and accessible</li>
            <li>Check for any firewall or network restrictions</li>
            <li>Verify that your database credentials are correct</li>
          </ul>
        </div>
      </div>
    </div>
  );
}