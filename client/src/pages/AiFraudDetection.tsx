import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Brain, TrendingUp, Eye, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FraudStats {
  totalTransactions: number;
  flaggedTransactions: number;
  flaggedPercentage: number;
  avgRiskScore: number;
  topPatterns: Array<{
    patternName: string;
    matchCount: number;
  }>;
}

interface TransactionAnalysis {
  riskScore: number;
  confidenceLevel: number;
  detectionMethod: string;
  flags: string[];
  aiAnalysis: {
    summary: string;
    reasoning: string;
    recommendations: string[];
    patterns: string[];
  };
  patternMatches: Array<{
    patternName: string;
    confidence: number;
    details: any;
  }>;
}

export default function AiFraudDetection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysisForm, setAnalysisForm] = useState({
    transactionId: '',
    amount: '',
    currency: 'USD',
    userId: '',
    transactionType: 'payment',
    merchantInfo: '{}',
    deviceInfo: '{}',
    locationInfo: '{}'
  });

  // Fetch fraud statistics
  const { data: stats, isLoading: statsLoading } = useQuery<FraudStats>({
    queryKey: ['/api/fraud/stats'],
    refetchInterval: 30000,
  });

  // Fetch recent transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ['/api/fraud/transactions'],
  });

  // Fetch flagged transactions
  const { data: flaggedTransactions = [] } = useQuery<any[]>({
    queryKey: ['/api/fraud/transactions', 'flagged'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/fraud/transactions?flagged=true');
      if (response instanceof Response) {
        return await response.json();
      }
      return response;
    },
  });

  // Fetch fraud patterns
  const { data: patterns = [] } = useQuery<any[]>({
    queryKey: ['/api/fraud/patterns'],
  });

  // Transaction analysis mutation
  const analyzeTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest('POST', '/api/fraud/analyze-transaction', {
        ...transactionData,
        amount: Math.round(parseFloat(transactionData.amount) * 100),
        merchantInfo: JSON.parse(transactionData.merchantInfo || '{}'),
        deviceInfo: JSON.parse(transactionData.deviceInfo || '{}'),
        locationInfo: JSON.parse(transactionData.locationInfo || '{}')
      });
      if (response instanceof Response) {
        const data = await response.json();
        return data as TransactionAnalysis;
      }
      return response as TransactionAnalysis;
    },
    onSuccess: (analysis: TransactionAnalysis) => {
      toast({
        title: 'Analysis Complete',
        description: `Risk Score: ${analysis.riskScore}/100 - ${analysis.aiAnalysis.summary}`,
        variant: analysis.riskScore > 70 ? 'destructive' : 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fraud/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fraud/transactions'] });
    },
    onError: () => {
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze transaction. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAnalyzeTransaction = () => {
    if (!analysisForm.transactionId || !analysisForm.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please provide transaction ID and amount.',
        variant: 'destructive',
      });
      return;
    }
    analyzeTransactionMutation.mutate(analysisForm);
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Fraud Detection</h1>
          <p className="text-muted-foreground">
            Advanced pattern recognition and real-time transaction monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-sm text-muted-foreground">Powered by Claude AI</span>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalTransactions.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {statsLoading ? '...' : stats?.flaggedTransactions.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.flaggedPercentage || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.avgRiskScore || '0'}/100
            </div>
            <p className="text-xs text-muted-foreground">AI-calculated risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Status</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="patterns">Detection Patterns</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Items</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Transaction Analysis
              </CardTitle>
              <CardDescription>
                Analyze individual transactions using advanced AI pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    value={analysisForm.transactionId}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, transactionId: e.target.value })}
                    placeholder="TXN-123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={analysisForm.amount}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, amount: e.target.value })}
                    placeholder="99.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={analysisForm.userId}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, userId: e.target.value })}
                    placeholder="user_123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Type</Label>
                  <Input
                    id="transactionType"
                    value={analysisForm.transactionType}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, transactionType: e.target.value })}
                    placeholder="payment"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchantInfo">Merchant Info (JSON)</Label>
                  <Textarea
                    id="merchantInfo"
                    value={analysisForm.merchantInfo}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, merchantInfo: e.target.value })}
                    placeholder='{"name": "Merchant Name", "category": "retail"}'
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceInfo">Device Info (JSON)</Label>
                  <Textarea
                    id="deviceInfo"
                    value={analysisForm.deviceInfo}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, deviceInfo: e.target.value })}
                    placeholder='{"type": "mobile", "os": "iOS"}'
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationInfo">Location Info (JSON)</Label>
                  <Textarea
                    id="locationInfo"
                    value={analysisForm.locationInfo}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, locationInfo: e.target.value })}
                    placeholder='{"country": "US", "city": "New York"}'
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAnalyzeTransaction}
                disabled={analyzeTransactionMutation.isPending}
                className="w-full"
              >
                {analyzeTransactionMutation.isPending ? 'Analyzing...' : 'Analyze Transaction'}
              </Button>

              {analyzeTransactionMutation.data && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Analysis Results
                      <Badge variant={getRiskBadgeVariant(analyzeTransactionMutation.data.riskScore)}>
                        Risk: {analyzeTransactionMutation.data.riskScore}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">AI Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {analyzeTransactionMutation.data.aiAnalysis.summary}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Analysis Reasoning</h4>
                      <p className="text-sm text-muted-foreground">
                        {analyzeTransactionMutation.data.aiAnalysis.reasoning}
                      </p>
                    </div>

                    {analyzeTransactionMutation.data.flags.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Risk Flags</h4>
                        <div className="flex flex-wrap gap-2">
                          {analyzeTransactionMutation.data.flags.map((flag, index) => (
                            <Badge key={index} variant="destructive">{flag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analyzeTransactionMutation.data.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {analyzeTransactionMutation.data.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Monitor all transactions in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div>Loading transactions...</div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(transactions) && transactions.length > 0 ? (
                    transactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.transactionId}</p>
                          <p className="text-sm text-muted-foreground">
                            ${(transaction.amount / 100).toFixed(2)} {transaction.currency}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                            {transaction.riskScore}/100
                          </Badge>
                          {transaction.isFlagged && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No transactions found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Detection Patterns</CardTitle>
              <CardDescription>Active fraud detection patterns and rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.isArray(patterns) && patterns.length > 0 ? (
                  patterns.map((pattern: any) => (
                    <div key={pattern.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{pattern.patternName}</p>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={pattern.isActive ? 'default' : 'secondary'}>
                          {pattern.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pattern.matchCount} matches
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No patterns configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Flagged Transactions
              </CardTitle>
              <CardDescription>High-risk transactions requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.isArray(flaggedTransactions) && flaggedTransactions.length > 0 ? (
                  flaggedTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div>
                        <p className="font-medium">{transaction.transactionId}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(transaction.amount / 100).toFixed(2)} {transaction.currency}
                        </p>
                        {Array.isArray(transaction.flaggedReasons) && transaction.flaggedReasons.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {transaction.flaggedReasons.map((reason: string, index: number) => (
                              <Badge key={index} variant="destructive" className="text-xs">{reason}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">Risk: {transaction.riskScore}/100</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No flagged transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}