import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { Plus, UserPlus, Shield, Download } from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  iconBg: string;
}

function QuickAction({ icon, title, description, onClick, iconBg }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="w-full h-auto p-3 justify-start hover:bg-gray-50 dark:hover:bg-gray-700"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Button>
  );
}

export function QuickActions() {
  const { tenant } = useTenant();

  const actions = [
    {
      icon: <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      title: 'Create New Task',
      description: 'Add a new task to your board',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      onClick: () => {
        // TODO: Open task creation modal
        console.log('Create new task');
      },
    },
    {
      icon: <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />,
      title: 'Invite Team Member',
      description: 'Add someone to your workspace',
      iconBg: 'bg-green-100 dark:bg-green-900',
      onClick: () => {
        // TODO: Open team invitation modal
        console.log('Invite team member');
      },
    },
    {
      icon: <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />,
      title: 'Run Fraud Scan',
      description: 'Check recent transactions',
      iconBg: 'bg-red-100 dark:bg-red-900',
      onClick: () => {
        // TODO: Trigger fraud detection scan
        console.log('Run fraud scan');
      },
    },
    {
      icon: <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      title: 'Export Data',
      description: 'Download reports and analytics',
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      onClick: () => {
        // TODO: Generate and download reports
        console.log('Export data');
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>

        {/* Tenant Customization Preview */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Tenant Customization
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Theme:</span>
              <span className="font-medium capitalize">
                {tenant?.theme || 'Light'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Primary Color:</span>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: tenant?.primaryColor || '#6366F1' }}
                />
                <span className="font-medium">
                  {tenant?.primaryColor || '#6366F1'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Layout:</span>
              <span className="font-medium capitalize">
                {tenant?.navigationLayout || 'Sidebar'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
