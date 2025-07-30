import React from 'react';
import { KPICards } from '@/components/dashboard/KPICards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { CompanyMetrics } from '@/components/dashboard/CompanyMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart } from 'lucide-react';

function ChartPlaceholder({ title, type }: { title: string; type: 'line' | 'pie' }) {
  const Icon = type === 'line' ? BarChart3 : PieChart;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select defaultValue="30days">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{title} Chart</p>
            <p className="text-sm">Chart integration coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <KPICards />

      {/* Company Performance Metrics */}
      <CompanyMetrics />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="Revenue Trends" type="line" />
        <ChartPlaceholder title="Task Distribution" type="pie" />
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}
