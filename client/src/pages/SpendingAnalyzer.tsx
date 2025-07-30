import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Eye,
  Building2,
  CreditCard,
  Receipt,
  Filter,
  Search,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  category: string;
  extractedData?: {
    vendor?: string;
    amount: number;
    date: string;
    description: string;
    category: string;
    paymentMethod?: string;
    lineItems?: Array<{
      description: string;
      amount: number;
    }>;
  };
}

interface SpendingAnalytics {
  totalSpend: number;
  monthlySpend: number;
  previousMonthSpend: number;
  topVendors: Array<{
    vendor: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    change: number;
  }>;
  flaggedAnomalies: Array<{
    type: 'spike' | 'duplicate' | 'unusual' | 'recurring_increase';
    description: string;
    amount: number;
    vendor?: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
}

export default function SpendingAnalyzer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch parsed documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<ParsedDocument[]>({
    queryKey: ['/api/spending/documents'],
    retry: false,
  });

  // Fetch spending analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<SpendingAnalytics>({
    queryKey: ['/api/spending/analytics', selectedPeriod, selectedCategory],
    retry: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/spending/upload', {
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
        description: 'Your document is being processed for spending analysis.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/spending'] });
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
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name}: Please upload PDF, CSV, Excel, or image files only.`,
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: `${file.name}: File size must be less than 10MB.`,
          variant: 'destructive',
        });
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'spending-document');

      uploadMutation.mutate(formData);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Simulate file input change
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        for (let i = 0; i < files.length; i++) {
          dt.items.add(files[i]);
        }
        input.files = dt.files;
        handleFileUpload({ target: input } as any);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (fileType.includes('csv') || fileType.includes('excel')) return <BarChart3 className="w-6 h-6 text-green-500" />;
    if (fileType.includes('image')) return <Receipt className="w-6 h-6 text-blue-500" />;
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Spending Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload documents to analyze spending patterns and detect financial insights
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
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="dashboard">Spending Dashboard</TabsTrigger>
          <TabsTrigger value="documents">Document Vault</TabsTrigger>
          <TabsTrigger value="alerts">Financial Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Financial Documents</CardTitle>
              <CardDescription>
                Upload invoices, receipts, bank statements, and credit card summaries for automatic analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Supports PDF, CSV, Excel, JPG, PNG files up to 10MB each
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Receipt className="w-4 h-4 mr-1" />
                    Receipts
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Invoices
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-1" />
                    Bank Statements
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(doc.fileType)}
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.category}
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
                        {doc.extractedData && (
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(doc.extractedData.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Spending Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Spend</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics ? formatCurrency(analytics.monthlySpend) : '--'}
                </div>
                {analytics && (
                  <p className="text-xs text-muted-foreground">
                    {analytics.monthlySpend > analytics.previousMonthSpend ? (
                      <span className="text-red-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{(((analytics.monthlySpend - analytics.previousMonthSpend) / analytics.previousMonthSpend) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -{(((analytics.previousMonthSpend - analytics.monthlySpend) / analytics.previousMonthSpend) * 100).toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Vendor</CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {analytics?.topVendors[0]?.vendor || '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.topVendors[0] ? formatCurrency(analytics.topVendors[0].amount) : 'No data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {documents.length} total uploaded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.flaggedAnomalies.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Financial anomalies detected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Vendors and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.topVendors.length ? (
                  <div className="space-y-3">
                    {analytics.topVendors.slice(0, 5).map((vendor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{vendor.vendor}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(vendor.amount)}
                            </span>
                          </div>
                          <Progress value={vendor.percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {vendor.transactionCount} transactions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Upload documents to see vendor analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.categoryBreakdown.length ? (
                  <div className="space-y-3">
                    {analytics.categoryBreakdown.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(category.amount)}
                              </span>
                              {category.change !== 0 && (
                                <span className={`text-xs ${category.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Upload documents to see category breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Vault</CardTitle>
              <CardDescription>
                All uploaded financial documents and their extracted data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="receipt">Receipts</SelectItem>
                    <SelectItem value="statement">Statements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Documents List */}
              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getDocumentIcon(doc.fileType)}
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{doc.category}</span>
                            {doc.extractedData && (
                              <>
                                <span>•</span>
                                <span>{doc.extractedData.vendor}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {doc.extractedData && (
                          <span className="font-medium text-lg">
                            {formatCurrency(doc.extractedData.amount)}
                          </span>
                        )}
                        <Badge variant={
                          doc.status === 'completed' ? 'default' :
                          doc.status === 'processing' ? 'secondary' : 'destructive'
                        }>
                          {doc.status}
                        </Badge>
                        {doc.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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
                    Upload your first financial document to get started
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Alerts & Anomalies</CardTitle>
              <CardDescription>
                Automated detection of unusual spending patterns and potential financial leaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.flaggedAnomalies.length ? (
                <div className="space-y-4">
                  {analytics.flaggedAnomalies.map((anomaly, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <Badge variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'secondary' : 'default'}>
                              {anomaly.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium capitalize">{anomaly.type.replace('_', ' ')}</span>
                          </div>
                          <p className="font-medium mb-1">{anomaly.description}</p>
                          {anomaly.vendor && (
                            <p className="text-sm text-muted-foreground">Vendor: {anomaly.vendor}</p>
                          )}
                        </div>
                        <div className="text-lg font-bold">
                          {formatCurrency(anomaly.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No alerts detected</h3>
                  <p className="text-muted-foreground">
                    Your spending patterns look normal. Upload more documents for better analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}