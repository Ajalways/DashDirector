import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CompanyBranding } from './TenantBranding.js';
import { Settings } from 'lucide-react';

interface SettingsModalProps {
  children?: React.ReactNode;
}

export function SettingsModal({ children }: SettingsModalProps) {
  const { tenant, updateTenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    primaryColor: tenant?.primaryColor || '#6366F1',
    theme: tenant?.theme || 'light',
    navigationLayout: tenant?.navigationLayout || 'sidebar',
    taskModuleName: (tenant?.settings as any)?.taskModuleName || 'Tasks',
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!tenant?.id) throw new Error('No tenant ID');
      return await apiRequest('PUT', `/api/tenant/${tenant.id}`, updates);
    },
    onSuccess: (response: any) => {
      updateTenant(response);
      queryClient.invalidateQueries({ queryKey: ['/api/tenant'] });
      toast({
        title: 'Settings Updated',
        description: 'Your settings have been saved successfully.',
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    const updates = {
      ...formData,
      settings: {
        ...(tenant?.settings || {}),
        taskModuleName: formData.taskModuleName,
      },
    };
    updateTenantMutation.mutate(updates);
  };

  const handleCancel = () => {
    setFormData({
      name: tenant?.name || '',
      primaryColor: tenant?.primaryColor || '#6366F1',
      theme: tenant?.theme || 'light',
      navigationLayout: tenant?.navigationLayout || 'sidebar',
      taskModuleName: (tenant?.settings as any)?.taskModuleName || 'Tasks',
    });
    setOpen(false);
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Settings</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
          {/* General Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="taskModuleName">Task Module Name</Label>
                  <Input
                    id="taskModuleName"
                    value={formData.taskModuleName}
                    onChange={(e) =>
                      setFormData({ ...formData, taskModuleName: e.target.value })
                    }
                    placeholder="Tasks"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Customize what you call your tasks (e.g., "Cases", "Tickets", "Leads")
                  </p>
                </div>

                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-3 mt-1">
                    <input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryColor: e.target.value })
                      }
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryColor: e.target.value })
                      }
                      placeholder="#6366F1"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) =>
                      setFormData({ ...formData, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="navigationLayout">Navigation Layout</Label>
                  <Select
                    value={formData.navigationLayout}
                    onValueChange={(value) =>
                      setFormData({ ...formData, navigationLayout: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sidebar">Sidebar Navigation</SelectItem>
                      <SelectItem value="topbar">Top Navigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Branding Upload */}
          <div>
            <CompanyBranding />
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateTenantMutation.isPending}
          >
            {updateTenantMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
