import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Brain, 
  Activity, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { BusinessChange, TimelineEvent } from '@shared/schema';

interface TimelineItem {
  id: string;
  type: 'business_change' | 'timeline_event';
  date: string;
  title: string;
  description: string;
  [key: string]: any;
}

const impactColors = {
  major: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  minor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const categoryColors = {
  financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  operational: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  team: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  customer: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'financial':
      return <DollarSign className="w-4 h-4" />;
    case 'operational':
      return <BarChart3 className="w-4 h-4" />;
    case 'team':
      return <Users className="w-4 h-4" />;
    case 'customer':
      return <Activity className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

function BusinessChangeCard({ change }: { change: BusinessChange }) {
  const isPositive = change.changePercentage ? change.changePercentage > 0 : false;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <CardTitle className="text-lg">{change.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={impactColors[change.impactMagnitude as keyof typeof impactColors]}>
              {change.impactMagnitude}
            </Badge>
            <Badge className={categoryColors[change.impactCategory as keyof typeof categoryColors]}>
              {getCategoryIcon(change.impactCategory)}
              <span className="ml-1">{change.impactCategory}</span>
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(change.detectedAt), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {change.description}
          </p>
          
          {change.changePercentage && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-medium">Change:</span>
                <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                  {isPositive ? '+' : ''}{change.changePercentage}%
                </span>
              </div>
              {change.previousValue && change.newValue && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">From:</span>
                  <span>{change.previousValue.toLocaleString()}</span>
                  <span>→</span>
                  <span>{change.newValue.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {change.aiAnalysis && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start space-x-2">
                <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    AI Analysis
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {change.aiAnalysis}
                  </p>
                </div>
              </div>
            </div>
          )}

            {Array.isArray(change.relatedEvents) && change.relatedEvents.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Related Events:</p>
              <div className="space-y-1">
              {change.relatedEvents.map((event: any, index: number) => (
                <div key={index} className="text-xs bg-muted dark:bg-gray-800 p-2 rounded flex items-center space-x-2">
                <Zap className="w-3 h-3 text-gray-500" />
                <span>
                  {event.title ?? event.type ?? ''}
                </span>
                {event.date && (
                  <span className="text-gray-500">
                  ({format(new Date(event.date), 'MMM d')})
                  </span>
                )}
                </div>
              ))}
              </div>
            </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={categoryColors[event.category as keyof typeof categoryColors]}>
              {getCategoryIcon(event.category)}
              <span className="ml-1">{event.category}</span>
            </Badge>
            {event.impactScore && event.impactScore > 70 && (
              <Badge variant="destructive">High Impact</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(event.eventDate), { addSuffix: true })}
        </p>
      </CardHeader>
      {event.description && (
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {event.description}
          </p>
            
        </CardContent>
      )}
    </Card>
  );
}

export default function WhatChanged() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<TimelineItem[]>({
    queryKey: ['/api/timeline/comprehensive', selectedPeriod],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/timeline/comprehensive?limit=${selectedPeriod}`);
      return response.json();
    },
  });
  const timeline: TimelineItem[] = Array.isArray(data) ? data : [];

  const detectChangesMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/timeline/detect-changes'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline/comprehensive'] });
      toast({
        title: 'Analysis Complete',
        description: 'Business changes have been detected and analyzed.',
      });
    },
    onError: () => {
      toast({
        title: 'Detection Failed',
        description: 'Failed to detect business changes. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredTimeline = timeline.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'changes') return item.type === 'business_change';
    if (selectedFilter === 'events') return item.type === 'timeline_event';
    return true;
  });

  const stats = {
    totalChanges: timeline.filter(item => item.type === 'business_change').length,
    majorChanges: timeline.filter(item => 
      item.type === 'business_change' && item.impactMagnitude === 'major'
    ).length,
    recentEvents: timeline.filter(item => 
      item.type === 'timeline_event' && 
      new Date(item.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">What Changed?</h1>
            <p className="text-muted-foreground">
              Business activity time machine - track and understand major metric shifts
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              apiRequest('POST', '/api/timeline/seed-demo-data').then(() => {
                queryClient.invalidateQueries({ queryKey: ['/api/timeline/comprehensive'] });
                toast({
                  title: 'Demo Data Added',
                  description: 'Sample business changes and events have been generated.',
                });
              }).catch(() => {
                toast({
                  title: 'Seed Failed',
                  description: 'Failed to generate demo data.',
                  variant: 'destructive',
                });
              });
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Add Demo Data
          </Button>
          <Button 
            onClick={() => detectChangesMutation.mutate()}
            disabled={detectChangesMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${detectChangesMutation.isPending ? 'animate-spin' : ''}`} />
            {detectChangesMutation.isPending ? 'Analyzing...' : 'Detect Changes'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Changes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChanges}</div>
            <p className="text-xs text-muted-foreground">
              Metric shifts detected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Major Impact</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.majorChanges}</div>
            <p className="text-xs text-muted-foreground">
              High-impact changes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="changes">Changes Only</SelectItem>
              <SelectItem value="events">Events Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Last 10</SelectItem>
              <SelectItem value="30">Last 30</SelectItem>
              <SelectItem value="50">Last 50</SelectItem>
              <SelectItem value="100">Last 100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredTimeline.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Changes Detected
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                No significant business changes have been detected yet. Try running the change detection 
                analysis or check back as your business data grows.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTimeline.map((item) => (
            <div key={item.id}>
              {item.type === 'business_change' ? (
                <BusinessChangeCard change={item as unknown as BusinessChange} />
              ) : (
                <TimelineEventCard event={item as unknown as TimelineEvent} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}