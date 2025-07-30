import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Crown, 
  Shield, 
  Users, 
  Building, 
  Settings, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Key,
  Database,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'wouter';

interface ImpersonationSession {
  targetUserId: string;
  targetRole: string;
  targetTenantId: string;
  startedAt: string;
}

interface UserWithPermissions {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isTestAccount: boolean;
  canImpersonate: boolean;
  permissions: any;
  isImpersonating: boolean;
  impersonationInfo: ImpersonationSession | null;
}

export default function OwnerPanel() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { toast } = useToast();

  // Get current user with permissions
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user-with-permissions'],
    retry: false,
  }) as { data: UserWithPermissions | undefined; isLoading: boolean };

  const createOwnerAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/create-owner-account', {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Owner Account Created',
        description: `Test account created: ${data.user.email}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user-with-permissions'] });
    },
    onError: (error) => {
      console.error('Failed to create owner account:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create owner test account.',
        variant: 'destructive',
      });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (data: { targetRole: string; targetTenantId?: string }) => {
      const response = await apiRequest('POST', '/api/admin/impersonate', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Impersonation Started',
        description: `Now viewing as ${selectedRole} role`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user-with-permissions'] });
    },
    onError: (error) => {
      console.error('Failed to start impersonation:', error);
      toast({
        title: 'Impersonation Failed',
        description: 'Failed to start role impersonation.',
        variant: 'destructive',
      });
    },
  });

  const stopImpersonationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/stop-impersonation', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Impersonation Stopped',
        description: 'Returned to owner view',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user-with-permissions'] });
    },
    onError: (error) => {
      console.error('Failed to stop impersonation:', error);
      toast({
        title: 'Stop Failed',
        description: 'Failed to stop impersonation.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateOwnerAccount = () => {
    setIsCreatingAccount(true);
    createOwnerAccountMutation.mutate();
    setTimeout(() => setIsCreatingAccount(false), 3000);
  };

  const handleImpersonate = () => {
    impersonateMutation.mutate({
      targetRole: selectedRole,
      targetTenantId: currentUser?.tenantId
    });
  };

  const handleStopImpersonation = () => {
    stopImpersonationMutation.mutate();
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Owner role required to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              Owner Control Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Full system administration and testing controls
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Crown className="w-3 h-3 mr-1" />
          OWNER ACCESS
        </Badge>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Current Session Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Active User</Label>
              <p className="text-lg">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Role</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={currentUser.isImpersonating ? "destructive" : "default"}>
                  {currentUser.isImpersonating ? 
                    `Impersonating: ${currentUser.impersonationInfo?.targetRole}` : 
                    currentUser.role}
                </Badge>
                {currentUser.isTestAccount && (
                  <Badge variant="outline">Test Account</Badge>
                )}
              </div>
            </div>
          </div>
          
          {currentUser.isImpersonating && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Active Impersonation Session
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleStopImpersonation}
                  disabled={stopImpersonationMutation.isPending}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Stop Impersonation
                </Button>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Started: {currentUser.impersonationInfo?.startedAt && 
                  new Date(currentUser.impersonationInfo.startedAt).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role Impersonation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5" />
              Role Impersonation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">Impersonate Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role to impersonate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">Role capabilities:</p>
              <ul className="text-xs space-y-1">
                {selectedRole === 'admin' && (
                  <>
                    <li>• Full module access (except owner functions)</li>
                    <li>• User management and settings</li>
                    <li>• View all fraud cases and metrics</li>
                  </>
                )}
                {selectedRole === 'manager' && (
                  <>
                    <li>• Dashboard and task management</li>
                    <li>• Limited fraud detection access</li>
                    <li>• Team oversight capabilities</li>
                  </>
                )}
                {selectedRole === 'analyst' && (
                  <>
                    <li>• Read-only dashboard access</li>
                    <li>• Fraud analysis and reporting</li>
                    <li>• Performance insights viewing</li>
                  </>
                )}
                {selectedRole === 'user' && (
                  <>
                    <li>• Basic dashboard access</li>
                    <li>• Personal task management</li>
                    <li>• Limited system access</li>
                  </>
                )}
              </ul>
            </div>
            
            <Button 
              onClick={handleImpersonate}
              disabled={impersonateMutation.isPending || currentUser.isImpersonating}
              className="w-full"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              {impersonateMutation.isPending ? 'Starting...' : `Impersonate ${selectedRole}`}
            </Button>
          </CardContent>
        </Card>

        {/* Test Account Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Test Account Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">Creates a complete owner test account with:</p>
              <ul className="text-xs space-y-1">
                <li>• Full permissions across all modules</li>
                <li>• Demo tenant with sample data</li>
                <li>• Non-billable test account flag</li>
                <li>• Email: owner+demo@pulseboard.ai</li>
              </ul>
            </div>
            
            <div className={`p-3 rounded-lg border ${isCreatingAccount ? 
              'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : 
              'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'}`}>
              <div className="flex items-center gap-2">
                {isCreatingAccount ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Creating test environment...
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Safe for testing - no billing impact
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleCreateOwnerAccount}
              disabled={createOwnerAccountMutation.isPending}
              className="w-full"
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              {createOwnerAccountMutation.isPending ? 'Creating...' : 'Create Owner Test Account'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Owner Permissions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">System Administration</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• View all tenants</li>
                <li>• Modify system settings</li>
                <li>• Create/delete owners</li>
                <li>• Cross-tenant data access</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Business Modules</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Full dashboard admin</li>
                <li>• Unlimited AI queries</li>
                <li>• Configure fraud detection</li>
                <li>• Modify tenant branding</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Security & Testing</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Role impersonation</li>
                <li>• Billing management</li>
                <li>• Export all data</li>
                <li>• Test account creation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}