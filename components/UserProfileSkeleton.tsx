import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function UserProfileSkeleton() {
  return (
    <div className="w-full max-w-sm mb-4">
      <Card className="p-4">
        <div className="flex gap-3">
          <Skeleton className="w-16 h-16 rounded-full" />
          
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Skeleton className="w-20 h-6 rounded" />
            <Skeleton className="w-16 h-4 mt-1 rounded" />
          </div>
        </div>
        
        {/* Energy section skeleton */}
        <div className="mt-4 pt-3 border-t space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        {/* Stats section skeleton */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center">
            <Skeleton className="h-4 w-8 mx-auto rounded" />
            <Skeleton className="h-6 w-12 mx-auto rounded mt-1" />
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-8 mx-auto rounded" />
            <Skeleton className="h-6 w-12 mx-auto rounded mt-1" />
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-8 mx-auto rounded" />
            <Skeleton className="h-6 w-12 mx-auto rounded mt-1" />
          </div>
        </div>
      </Card>
    </div>
  );
}