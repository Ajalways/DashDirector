import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Building2
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  period?: string;
}

function MetricCard({ title, value, change, icon, trend, period = 'vs last month' }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Target;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${trendColor} mt-1`}>
          <TrendIcon className="w-3 h-3 mr-1" />
          {Math.abs(change)}% {period}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressMetricProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}

function ProgressMetric({ title, current, target, unit, color = 'default' }: ProgressMetricProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOverTarget = current > target;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          {isOverTarget && <Badge variant="secondary" className="text-xs">Over Target</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{current.toLocaleString()} / {target.toLocaleString()} {unit}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% complete</span>
          <span>{isOverTarget ? `+${(current - target).toLocaleString()}` : `${(target - current).toLocaleString()} remaining`}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyMetrics() {
  const metrics = [
    {
      title: 'Monthly Revenue',
      value: '$125,430',
      change: 12.5,
      icon: <DollarSign className="w-4 h-4 text-primary" />,
      trend: 'up' as const,
    },
    {
      title: 'Active Customers',
      value: '2,847',
      change: 8.2,
      icon: <Users className="w-4 h-4 text-primary" />,
      trend: 'up' as const,
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: -2.1,
      icon: <Target className="w-4 h-4 text-primary" />,
      trend: 'down' as const,
    },
    {
      title: 'Avg. Order Value',
      value: '$87.50',
      change: 5.7,
      icon: <ShoppingCart className="w-4 h-4 text-primary" />,
      trend: 'up' as const,
    },
  ];

  const progressMetrics = [
    {
      title: 'Quarterly Revenue Goal',
      current: 375000,
      target: 500000,
      unit: 'USD',
    },
    {
      title: 'New Customer Acquisition',
      current: 847,
      target: 1000,
      unit: 'customers',
    },
    {
      title: 'Support Tickets Resolved',
      current: 234,
      target: 200,
      unit: 'tickets',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-primary" />
          Company Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Progress Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Goal Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {progressMetrics.map((metric, index) => (
            <ProgressMetric key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Alerts & Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Service Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Gateway</span>
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Degraded</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">High CPU Usage</p>
                    <p className="text-xs text-muted-foreground">Server load at 85%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Backup Completed</p>
                    <p className="text-xs text-muted-foreground">Daily backup successful</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}