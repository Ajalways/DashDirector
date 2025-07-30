import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { TenantBranding } from '@/components/settings/TenantBranding';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Palette, Layout, Users, Bell, Lock, CreditCard, Database } from 'lucide-react';

export default function Settings() {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your PulseBoardAI configuration and preferences
          </p>
        </div>
        <SettingsModal>
          <Button>
            <SettingsIcon className="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        </SettingsModal>
      </div>

      {/* Settings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Company Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium">{tenant?.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subdomain:</span>
                  <span className="font-medium">{tenant?.subdomain || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Demo Mode:</span>
                  <Badge variant={tenant?.isDemo ? 'secondary' : 'outline'}>
                    {tenant?.isDemo ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Theme & Branding
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                  <span className="font-medium capitalize">{tenant?.theme || 'Light'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Primary Color:</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: tenant?.primaryColor || '#6366F1' }}
                    />
                    <span className="font-medium text-xs">
                      {tenant?.primaryColor || '#6366F1'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Logo:</span>
                  <Badge variant={tenant?.logoUrl ? 'secondary' : 'outline'}>
                    {tenant?.logoUrl ? 'Uploaded' : 'Default'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layout className="w-5 h-5" />
              <span>Layout</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Navigation & Layout
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Navigation:</span>
                  <span className="font-medium capitalize">
                    {tenant?.navigationLayout || 'Sidebar'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Task Module:</span>
                  <span className="font-medium">
                    {(tenant?.settings as any)?.taskModuleName || 'Tasks'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Enabled Modules</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {((tenant?.enabledModules as any) || []).map((module: string) => (
              <div key={module} className="flex items-center space-x-2">
                <Badge variant="secondary" className="capitalize">
                  {module}
                </Badge>
              </div>
            ))}
          </div>
          {(!tenant?.enabledModules || (tenant.enabledModules as any)?.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No modules configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team & Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage team members, roles, and permissions
            </p>
            <Button variant="outline" className="w-full">
              Manage Team
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure alerts, email notifications, and digest frequency
            </p>
            <Button variant="outline" className="w-full">
              Notification Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Reset Demo Data
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              This will reset all demo data to its initial state. This action cannot be undone.
            </p>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
              Reset Demo Data
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Delete Tenant
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Permanently delete this tenant and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive">
              Delete Tenant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
