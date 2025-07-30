import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Shield, Check, UserPlus } from 'lucide-react';
import type { Activity } from '@shared/schema';

function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-4">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const getActivityIcon = (action: string, entityType: string) => {
    if (action === 'created' && entityType === 'task') {
      return <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    if (action === 'created' && entityType === 'fraud_case') {
      return <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
    if (action === 'updated' && entityType === 'task') {
      return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    if (action === 'invited') {
      return <UserPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
    return <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
  };

  const getActivityIconBg = (action: string, entityType: string) => {
    if (action === 'created' && entityType === 'task') {
      return 'bg-blue-100 dark:bg-blue-900';
    }
    if (action === 'created' && entityType === 'fraud_case') {
      return 'bg-red-100 dark:bg-red-900';
    }
    if (action === 'updated' && entityType === 'task') {
      return 'bg-green-100 dark:bg-green-900';
    }
    if (action === 'invited') {
      return 'bg-purple-100 dark:bg-purple-900';
    }
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const formatActivityText = (activity: any, user: any) => {
    const userName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown User';
    
    if (activity.action === 'created' && activity.entityType === 'task') {
      return (
        <>
          <span className="font-medium">{userName}</span> created a new task{' '}
          <span className="font-medium text-primary">
            "{activity.details?.taskTitle || 'Untitled Task'}"
          </span>
        </>
      );
    }
    
    if (activity.action === 'created' && activity.entityType === 'fraud_case') {
      return (
        <>
          Fraud alert triggered for transaction{' '}
          <span className="font-medium text-red-600 dark:text-red-400">
            #{activity.details?.transactionId || activity.entityId}
          </span>
        </>
      );
    }
    
    if (activity.action === 'updated' && activity.entityType === 'task') {
      return (
        <>
          <span className="font-medium">{userName}</span> updated task{' '}
          <span className="font-medium text-green-600 dark:text-green-400">
            "{activity.details?.taskTitle || 'Task'}"
          </span>
        </>
      );
    }
    
    if (activity.action === 'invited') {
      return (
        <>
          <span className="font-medium">{userName}</span> invited{' '}
          <span className="font-medium">{activity.details?.email}</span> as {activity.details?.role}
        </>
      );
    }
    
    return (
      <>
        <span className="font-medium">{userName}</span> {activity.action} {activity.entityType}
      </>
    );
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))
          ) : activities && Array.isArray(activities) && activities.length > 0 ? (
            activities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconBg(activity.action, activity.entityType)}`}>
                  {getActivityIcon(activity.action, activity.entityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatActivityText(activity, 'User')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt || Date.now()), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as your team works</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
