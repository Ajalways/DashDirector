import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Brain,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetric {
  category: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

interface PerformanceInsight {
  id: string;
  title: string;
  category: 'financial' | 'operational' | 'team' | 'risk' | 'growth';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  recommendation: string;
  actionItems: string[];
  estimatedImpact: string;
  timeframe: string;
  metrics: PerformanceMetric[];
  status: 'active' | 'implemented' | 'dismissed';
  createdAt: string;
}

const categoryColors = {
  financial: 'bg-green-500',
  operational: 'bg-blue-500',
  team: 'bg-purple-500',
  risk: 'bg-red-500',
  growth: 'bg-orange-500'
};

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary'
} as const;

export default function PerformanceInsights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: insights = [], isLoading: insightsLoading } = useQuery<PerformanceInsight[]>({
    queryKey: ['/api/performance/insights', selectedCategory === 'all' ? '' : selectedCategory],
    retry: false,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<PerformanceMetric[]>({
    queryKey: ['/api/performance/metrics'],
    retry: false,
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/performance/generate-insights');
    },
    onSuccess: () => {
      toast({
        title: 'Performance Insights Generated',
        description: 'AI has analyzed your business data and generated new insights.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/performance/insights'] });
    },
    onError: () => {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate performance insights. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/performance/generate-report');
      return response;
    },
    onSuccess: (data: any) => {
      // Create and download the report
      const blob = new Blob([data.report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Report Generated',
        description: 'Performance report has been downloaded.',
      });
    },
    onError: () => {
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate performance report. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const getTrendIcon = (trend: string, changePercent: number) => {
    if (trend === 'up') {
      return <TrendingUp className={`h-4 w-4 ${changePercent > 0 ? 'text-green-500' : 'text-red-500'}`} />;
    } else if (trend === 'down') {
      return <TrendingDown className={`h-4 w-4 ${changePercent < 0 ? 'text-red-500' : 'text-green-500'}`} />;
    }
    return <BarChart3 className="h-4 w-4 text-gray-500" />;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Insights</h1>
            <p className="text-muted-foreground">
              AI-powered business performance analysis and recommendations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {generateReportMutation.isPending ? 'Generating...' : 'Download Report'}
          </Button>
          <Button 
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
          >
            <Brain className="mr-2 h-4 w-4" />
            {generateInsightsMutation.isPending ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* Performance Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.slice(0, 4).map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                {getTrendIcon(metric.trend, metric.changePercent)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.unit === '%' ? `${metric.currentValue}%` : 
                   metric.unit === '$' ? `$${metric.currentValue.toLocaleString()}` :
                   `${metric.currentValue}${metric.unit}`}
                </div>
                <p className={`text-xs ${metric.changePercent > 0 ? 'text-green-600' : 
                                        metric.changePercent < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}% from last period
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Insights Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {insightsLoading ? (
            <div className="flex items-center space-x-2 py-8">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Loading insights...</span>
            </div>
          ) : filteredInsights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered insights to get actionable recommendations for your business.
                </p>
                <Button onClick={() => generateInsightsMutation.mutate()}>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {getPriorityIcon(insight.priority)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${categoryColors[insight.category]}`} />
                            <Badge variant={priorityColors[insight.priority]} className="text-xs">
                              {insight.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.category.toUpperCase()}
                            </Badge>
                            {insight.timeframe && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {insight.timeframe}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={insight.status === 'active' ? 'default' : 'secondary'}>
                        {insight.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Analysis</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Business Impact</h4>
                      <p className="text-sm text-muted-foreground">{insight.impact}</p>
                      {insight.estimatedImpact && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Estimated Impact: {insight.estimatedImpact}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                    </div>

                    {insight.actionItems && insight.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Action Items</h4>
                        <ul className="space-y-1">
                          {insight.actionItems.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className="text-primary mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.metrics && insight.metrics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Supporting Metrics</h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {insight.metrics.map((metric, index) => (
                            <div key={index} className="bg-muted p-3 rounded-md">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{metric.metric}</span>
                                {getTrendIcon(metric.trend, metric.changePercent)}
                              </div>
                              <div className="text-lg font-bold">
                                {metric.unit === '%' ? `${metric.currentValue}%` : 
                                 metric.unit === '$' ? `$${metric.currentValue.toLocaleString()}` :
                                 `${metric.currentValue}${metric.unit}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}% change
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}