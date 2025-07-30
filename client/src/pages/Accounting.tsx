import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Brain,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProfitLeak {
  id: string;
  leakType: string;
  title: string;
  description: string;
  estimatedLoss: number;
  currency: string;
  frequency: string;
  status: string;
  detectedAt: string;
}

interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  insightType: string;
  category: string;
  severity: string;
  estimatedImpact: number;
  recommendations: string[];
  status: string;
  createdAt: string;
}

export default function Accounting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const { data: profitLeaks = [], isLoading: leaksLoading } = useQuery<ProfitLeak[]>({
    queryKey: ['/api/accounting/profit-leaks'],
    retry: false,
  });

  const { data: businessInsights = [], isLoading: insightsLoading } = useQuery<BusinessInsight[]>({
    queryKey: ['/api/accounting/business-insights'],
    retry: false,
  });

  const { data: financialSummaryResponse, isLoading: summaryLoading } = useQuery<{summary: string}>({
    queryKey: ['/api/accounting/financial-summary', selectedPeriod],
    retry: false,
  });

  const financialSummary = financialSummaryResponse?.summary || '';

  const detectLeaksMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/accounting/detect-profit-leaks'),
    onSuccess: () => {
      toast({
        title: 'Analysis Complete',
        description: 'Profit leak detection has been completed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/profit-leaks'] });
    },
    onError: () => {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to detect profit leaks. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/accounting/generate-insights'),
    onSuccess: () => {
      toast({
        title: 'Insights Generated',
        description: 'New business insights have been generated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/business-insights'] });
    },
    onError: () => {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate business insights. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getLeakTypeIcon = (leakType: string) => {
    switch (leakType) {
      case 'duplicate_billing': return <TrendingDown className="h-4 w-4" />;
      case 'unused_subscription': return <AlertTriangle className="h-4 w-4" />;
      case 'missed_invoice': return <FileText className="h-4 w-4" />;
      case 'overpayment': return <DollarSign className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const totalLeakAmount = profitLeaks.reduce((sum: number, leak: ProfitLeak) => 
    sum + (leak.estimatedLoss || 0), 0
  );

  const totalImpact = businessInsights.reduce((sum: number, insight: BusinessInsight) => 
    sum + (insight.estimatedImpact || 0), 0
  );

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
            <h1 className="text-3xl font-bold tracking-tight">Accounting Intelligence</h1>
            <p className="text-muted-foreground">
              AI-powered financial analysis and profit optimization
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => detectLeaksMutation.mutate()}
            disabled={detectLeaksMutation.isPending}
            variant="outline"
          >
            <Brain className="mr-2 h-4 w-4" />
            {detectLeaksMutation.isPending ? 'Analyzing...' : 'Detect Profit Leaks'}
          </Button>
          <Button 
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
          >
            <Zap className="mr-2 h-4 w-4" />
            {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalLeakAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitLeaks.length} profit leaks detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalImpact)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated improvement potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessInsights.length}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{selectedPeriod}</div>
            <p className="text-xs text-muted-foreground">
              Current analysis period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
          <TabsTrigger value="leaks">Profit Leaks</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Financial Summary</CardTitle>
              <CardDescription>
                Plain-English analysis of your financial performance
              </CardDescription>
              <div className="flex gap-2">
                {(['month', 'quarter', 'year'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Generating financial summary...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {financialSummary || 'No financial data available for the selected period.'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Leak Detection</CardTitle>
              <CardDescription>
                AI-identified opportunities to reduce costs and increase profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaksLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Loading profit leaks...</span>
                </div>
              ) : profitLeaks.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Profit Leaks Detected</h3>
                  <p className="text-muted-foreground mb-4">
                    Run AI analysis to detect potential cost savings opportunities.
                  </p>
                  <Button onClick={() => detectLeaksMutation.mutate()}>
                    <Brain className="mr-2 h-4 w-4" />
                    Start Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profitLeaks.map((leak: ProfitLeak) => (
                    <div key={leak.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getLeakTypeIcon(leak.leakType)}
                          <h3 className="font-medium">{leak.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{leak.frequency}</Badge>
                          <Badge variant={leak.status === 'open' ? 'destructive' : 'default'}>
                            {leak.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {leak.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(leak.estimatedLoss, leak.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Detected {new Date(leak.detectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
              <CardDescription>
                AI-generated recommendations to improve your business performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Loading business insights...</span>
                </div>
              ) : businessInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered business insights from your financial data.
                  </p>
                  <Button onClick={() => generateInsightsMutation.mutate()}>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Insights
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {businessInsights.map((insight: BusinessInsight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <h3 className="font-medium">{insight.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(insight.severity)}>
                            {insight.severity}
                          </Badge>
                          <Badge variant="outline">{insight.insightType.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {insight.estimatedImpact > 0 && (
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(insight.estimatedImpact)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Generated {new Date(insight.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}