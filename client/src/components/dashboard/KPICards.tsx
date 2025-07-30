import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, CheckSquare, Shield, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBg: string;
}

function KPICard({ title, value, change, changeType, icon, iconBg }: KPICardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-3 h-3 mr-1" />;
      case 'negative':
        return <TrendingDown className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {change && (
              <div className={`flex items-center mt-2 text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()}
                {change}
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards() {
  const { data: stats, isLoading } = useQuery<{
    totalRevenue: number;
    activeTasks: number;
    fraudAlerts: number;
    teamMembers: number;
  }>({
    queryKey: ['/api/analytics/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value / 100); // Assuming value is in cents
  };

  const kpiData = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />,
      iconBg: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks || 0,
      change: `+${stats?.activeTasks || 0}`,
      changeType: 'positive' as const,
      icon: <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Fraud Alerts',
      value: stats?.fraudAlerts || 0,
      change: stats?.fraudAlerts ? `+${stats.fraudAlerts}` : '0',
      changeType: stats?.fraudAlerts ? 'negative' as const : 'neutral' as const,
      icon: <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />,
      iconBg: 'bg-red-100 dark:bg-red-900',
    },
    {
      title: 'Team Members',
      value: stats?.teamMembers || 0,
      change: '2 online',
      changeType: 'neutral' as const,
      icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
