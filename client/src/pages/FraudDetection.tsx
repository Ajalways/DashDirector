import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Search, Filter, Plus, Eye, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import type { FraudCase } from '@shared/schema';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  investigating: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  false_positive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const riskColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function getRiskLevel(score: number): keyof typeof riskColors {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}

function CreateFraudCaseModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    amount: '',
    currency: 'USD',
    riskScore: 50,
    status: 'pending',
    notes: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFraudCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      return await apiRequest('POST', '/api/fraud-cases', {
        ...caseData,
        amount: parseInt(caseData.amount) * 100, // Convert to cents
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fraud-cases'] });
      toast({
        title: 'Fraud Case Created',
        description: 'The fraud case has been created successfully.',
      });
      setOpen(false);
      setFormData({
        transactionId: '',
        amount: '',
        currency: 'USD',
        riskScore: 50,
        status: 'pending',
        notes: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create fraud case. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFraudCaseMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Fraud Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Fraud Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="TXN-123456"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="riskScore">Risk Score (0-100)</Label>
            <Input
              id="riskScore"
              type="number"
              min="0"
              max="100"
              value={formData.riskScore}
              onChange={(e) => setFormData({ ...formData, riskScore: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this case..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFraudCaseMutation.isPending}>
              {createFraudCaseMutation.isPending ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FraudCaseCard({ fraudCase }: { fraudCase: FraudCase }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest('PUT', `/api/fraud-cases/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fraud-cases'] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateCaseMutation.mutate({
      id: fraudCase.id,
      updates: { status: newStatus },
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const riskLevel = getRiskLevel(fraudCase.riskScore || 0);

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {fraudCase.transactionId || 'Unknown Transaction'}
            </h3>
          </div>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="font-medium">
              {formatAmount(fraudCase.amount || 0, fraudCase.currency || 'USD')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Risk Score:</span>
            <Badge className={riskColors[riskLevel]}>
              {fraudCase.riskScore}/100
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge className={statusColors[(fraudCase.status || 'pending') as keyof typeof statusColors]}>
            {(fraudCase.status || 'pending').charAt(0).toUpperCase() + (fraudCase.status || 'pending').slice(1).replace('_', ' ')}
          </Badge>
        </div>

        {fraudCase.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {fraudCase.notes}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Created {formatDistanceToNow(new Date(fraudCase.createdAt || Date.now()), { addSuffix: true })}
          </span>
          <Select value={fraudCase.status || 'pending'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32 h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FraudDetection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: fraudCases, isLoading } = useQuery<FraudCase[]>({
    queryKey: ['/api/fraud-cases'],
  });

  const filteredCases = (fraudCases || []).filter((fraudCase: FraudCase) => {
    const matchesSearch = fraudCase.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fraudCase.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fraudCase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: fraudCases?.length || 0,
    pending: fraudCases?.filter((c: FraudCase) => c.status === 'pending').length || 0,
    investigating: fraudCases?.filter((c: FraudCase) => c.status === 'investigating').length || 0,
    resolved: fraudCases?.filter((c: FraudCase) => c.status === 'resolved').length || 0,
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Fraud Detection
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and investigate suspicious transactions
            </p>
          </div>
        </div>
        <CreateFraudCaseModal />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Investigating</p>
                <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
              </div>
              <Search className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="false_positive">False Positive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCases && filteredCases.length > 0 ? (
          filteredCases.map((fraudCase: FraudCase) => (
            <FraudCaseCard key={fraudCase.id} fraudCase={fraudCase} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No fraud cases found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get started by creating your first fraud case or adjust your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
