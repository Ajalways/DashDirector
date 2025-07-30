import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  Calendar,
  Building2,
  Zap,
  Shield,
  PieChart,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BusinessMetrics {
  revenue: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    growthRate: number;
  };
  expenses: {
    current: number;
    previous: number;
    categories: Array<{
      category: string;
      amount: number;
      percentage: number;
      change: number;
    }>;
  };
  customers: {
    total: number;
    new: number;
    churn: number;
    ltv: number;
    acquisitionCost: number;
  };
  operations: {
    efficiency: number;
    productivity: number;
    teamSize: number;
    avgResponseTime: number;
  };
  market: {
    seasonality: string;
    competition: 'low' | 'medium' | 'high';
    marketGrowth: number;
  };
}

interface Recommendation {
  id: string;
  type: 'revenue' | 'cost' | 'efficiency' | 'risk' | 'growth' | 'retention';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    financial: number;
    timeframe: string;
    confidence: number;
  };
  actionItems: Array<{
    task: string;
    owner: string;
    deadline: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  metrics: string[];
  reasoning: string;
  category: string;
}

interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  dataPoints: string[];
  suggestedActions: string[];
}

export default function BusinessRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  // Fetch business metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<BusinessMetrics>({
    queryKey: ['/api/business/metrics'],
    retry: false,
  });

  // Fetch AI recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery<Recommendation[]>({
    queryKey: ['/api/business/recommendations', selectedType],
    retry: false,
  });

  // Fetch business insights
  const { data: insights = [], isLoading: insightsLoading } = useQuery<BusinessInsight[]>({
    queryKey: ['/api/business/insights'],
    retry: false,
  });

  // Generate new recommendations
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/business/generate-recommendations', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Recommendations Updated',
        description: 'AI has generated new business recommendations based on current data.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/business'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'cost': return <DollarSign className="w-5 h-5 text-red-600" />;
      case 'efficiency': return <Zap className="w-5 h-5 text-blue-600" />;
      case 'risk': return <Shield className="w-5 h-5 text-orange-600" />;
      case 'growth': return <Target className="w-5 h-5 text-purple-600" />;
      case 'retention': return <Users className="w-5 h-5 text-teal-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-green-600" />;
      case 'threat': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'anomaly': return <Activity className="w-5 h-5 text-orange-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            AI Business Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Intelligent insights and actionable recommendations powered by AI analysis
          </p>
        </div>
        
        <Button 
          onClick={() => generateRecommendations.mutate()}
          disabled={generateRecommendations.isPending}
          className="flex items-center space-x-2"
        >
          {generateRecommendations.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Generate New Recommendations</span>
        </Button>
      </div>

      {/* Business Health Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.revenue.growthRate > 0 ? '+' : ''}{metrics.revenue.growthRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.revenue.current)} this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(((metrics.revenue.current - metrics.expenses.current) / metrics.revenue.current) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.revenue.current - metrics.expenses.current)} profit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer LTV:CAC</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.customers.ltv / metrics.customers.acquisitionCost).toFixed(1)}:1
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.customers.total} total customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational Efficiency</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.operations.efficiency}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.operations.teamSize} team members
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All Recommendations
            </Button>
            {['revenue', 'cost', 'efficiency', 'growth', 'retention', 'risk'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {getTypeIcon(type)}
                <span className="ml-2">{type}</span>
              </Button>
            ))}
          </div>

          {/* Recommendations List */}
          {recommendationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">AI is analyzing your business data...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(rec.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'default'}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rec.type}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {rec.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {rec.impact.financial > 0 ? '+' : ''}{formatCurrency(rec.impact.financial)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.impact.timeframe} • {rec.impact.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Action Items */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Action Items
                        </h4>
                        <div className="space-y-2">
                          {rec.actionItems.map((item, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.task}</p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {item.owner}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {item.deadline}
                                  </span>
                                  <Badge className={`text-xs ${getEffortColor(item.effort)}`}>
                                    {item.effort}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics & Reasoning */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                          Key Metrics & Reasoning
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Success Metrics:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.metrics.map((metric, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Reasoning:</p>
                            <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Category:</p>
                            <Badge variant="secondary">{rec.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No recommendations available</h3>
              <p className="text-muted-foreground mb-4">
                Generate AI-powered recommendations based on your business data
              </p>
              <Button onClick={() => generateRecommendations.mutate()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recommendations
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insightsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Generating business insights...</p>
            </div>
          ) : insights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getInsightTypeIcon(insight.type)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge variant={insight.type === 'opportunity' ? 'default' : insight.type === 'threat' ? 'destructive' : 'secondary'} className="mt-2">
                            {insight.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{insight.confidence}%</div>
                        <p className="text-xs text-muted-foreground">confidence</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Data Points:</h4>
                        <ul className="space-y-1">
                          {insight.dataPoints.map((point, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Suggested Actions:</h4>
                        <ul className="space-y-1">
                          {insight.suggestedActions.map((action, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <ArrowRight className="w-3 h-3 mt-0.5 mr-2 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No insights available</h3>
              <p className="text-muted-foreground">
                Business insights will appear as data is analyzed
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {metrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Revenue</span>
                      <span className="text-lg font-bold">{formatCurrency(metrics.revenue.current)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Previous Period</span>
                      <span className="text-lg">{formatCurrency(metrics.revenue.previous)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Growth Rate</span>
                      <span className={`text-lg font-bold ${metrics.revenue.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.revenue.growthRate > 0 ? '+' : ''}{metrics.revenue.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Customers</span>
                      <span className="text-lg font-bold">{metrics.customers.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">New Customers</span>
                      <span className="text-lg text-green-600">+{metrics.customers.new}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer LTV</span>
                      <span className="text-lg font-bold">{formatCurrency(metrics.customers.ltv)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Acquisition Cost</span>
                      <span className="text-lg">{formatCurrency(metrics.customers.acquisitionCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Operational Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Efficiency</span>
                        <span className="text-lg font-bold">{metrics.operations.efficiency}%</span>
                      </div>
                      <Progress value={metrics.operations.efficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Productivity</span>
                        <span className="text-lg font-bold">{metrics.operations.productivity}%</span>
                      </div>
                      <Progress value={metrics.operations.productivity} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Team Size</span>
                      <span className="text-lg font-bold">{metrics.operations.teamSize}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <span className="text-lg">{metrics.operations.avgResponseTime}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Context */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Growth</span>
                      <span className="text-lg font-bold text-green-600">+{metrics.market.marketGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Competition Level</span>
                      <Badge variant={
                        metrics.market.competition === 'low' ? 'default' :
                        metrics.market.competition === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {metrics.market.competition.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Seasonality</span>
                      <span className="text-lg">{metrics.market.seasonality}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No metrics available</h3>
              <p className="text-muted-foreground">
                Business metrics will appear as data is collected
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}