import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Brain,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FinancialDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  analysis?: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    categories: {
      category: string;
      amount: number;
      type: 'income' | 'expense';
    }[];
    insights: string[];
    trends: string[];
  };
}

interface FinancialSummary {
  currentMonth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  previousMonth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  yearToDate: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topRevenueStreams: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function FinancialAnalysis() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Fetch financial documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<FinancialDocument[]>({
    queryKey: ['/api/financial/documents'],
    retry: false,
  });

  // Fetch financial summary
  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ['/api/financial/summary', selectedPeriod],
    retry: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/financial/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document Uploaded',
        description: 'Your financial document is being processed for analysis.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financial'] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload PDF, CSV, or Excel files only.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'financial-statement');

    uploadMutation.mutate(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Financial Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered financial document analysis and business insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary ? formatCurrency(summary.currentMonth.revenue) : '--'}
                </div>
                {summary && (
                  <p className="text-xs text-muted-foreground">
                    {calculateChange(summary.currentMonth.revenue, summary.previousMonth.revenue) > 0 ? (
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.abs(calculateChange(summary.currentMonth.revenue, summary.previousMonth.revenue)).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -{Math.abs(calculateChange(summary.currentMonth.revenue, summary.previousMonth.revenue)).toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary ? formatCurrency(summary.currentMonth.expenses) : '--'}
                </div>
                {summary && (
                  <p className="text-xs text-muted-foreground">
                    {calculateChange(summary.currentMonth.expenses, summary.previousMonth.expenses) > 0 ? (
                      <span className="text-red-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.abs(calculateChange(summary.currentMonth.expenses, summary.previousMonth.expenses)).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -{Math.abs(calculateChange(summary.currentMonth.expenses, summary.previousMonth.expenses)).toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary ? formatCurrency(summary.currentMonth.profit) : '--'}
                </div>
                {summary && (
                  <p className="text-xs text-muted-foreground">
                    {calculateChange(summary.currentMonth.profit, summary.previousMonth.profit) > 0 ? (
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.abs(calculateChange(summary.currentMonth.profit, summary.previousMonth.profit)).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -{Math.abs(calculateChange(summary.currentMonth.profit, summary.previousMonth.profit)).toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue vs Expenses Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Streams</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.topRevenueStreams.length ? (
                  <div className="space-y-3">
                    {summary.topRevenueStreams.map((stream, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{stream.category}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(stream.amount)}
                            </span>
                          </div>
                          <Progress value={stream.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Upload financial documents to see revenue analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.topExpenseCategories.length ? (
                  <div className="space-y-3">
                    {summary.topExpenseCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.category}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(category.amount)}
                            </span>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Upload financial documents to see expense analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                Financial statements, invoices, and other documents for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          doc.status === 'completed' ? 'default' :
                          doc.status === 'processing' ? 'secondary' : 'destructive'
                        }>
                          {doc.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {doc.status === 'processing' && <Brain className="w-3 h-3 mr-1 animate-pulse" />}
                          {doc.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {doc.status}
                        </Badge>
                        {doc.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Analysis
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload financial statements, invoices, or receipts to get started
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>
                Analysis of your financial performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Trend Analysis Coming Soon</h3>
                <p className="text-muted-foreground">
                  Upload more financial documents to unlock trend analysis and forecasting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Financial Insights</CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations based on your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">AI Insights Coming Soon</h3>
                <p className="text-muted-foreground">
                  Our AI will analyze your financial documents and provide actionable insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}