import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Key, 
  Palette, 
  Plug, 
  Webhook, 
  Download,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Upload
} from "lucide-react";

export default function EnterpriseSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("security");
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Security Settings
  const { data: securitySettings } = useQuery({
    queryKey: ['/api/enterprise/security'],
  });

  const updateSecurityMutation = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/enterprise/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/security'] });
      toast({ title: "Security settings updated successfully" });
    }
  });

  // API Keys
  const { data: apiKeys } = useQuery({
    queryKey: ['/api/enterprise/api-keys'],
  });

  const createApiKeyMutation = useMutation({
    mutationFn: (data: { name: string; permissions: string[] }) =>
      fetch('/api/enterprise/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/api-keys'] });
      toast({ 
        title: "API Key Created", 
        description: `Key: ${data.apiKey} (save this - it won't be shown again)` 
      });
    }
  });

  // Theme Configuration
  const { data: themeConfig } = useQuery({
    queryKey: ['/api/enterprise/theme'],
  });

  const updateThemeMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/enterprise/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/theme'] });
      toast({ title: "Theme updated successfully" });
    }
  });

  // Integrations
  const { data: integrations } = useQuery({
    queryKey: ['/api/enterprise/integrations'],
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/enterprise/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/integrations'] });
      toast({ title: "Integration created successfully" });
    }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enterprise Settings</h1>
        <p className="text-muted-foreground">
          Advanced security, branding, and integration settings for your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Access
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data Export
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Policy</CardTitle>
              <CardDescription>Configure security requirements for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                </div>
                <Switch 
                  id="2fa" 
                  checked={securitySettings?.twoFactorRequired}
                  onCheckedChange={(checked) => 
                    updateSecurityMutation.mutate({ twoFactorRequired: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings?.sessionTimeoutMinutes || 480}
                  onChange={(e) => 
                    updateSecurityMutation.mutate({ sessionTimeoutMinutes: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <Textarea
                  id="ip-whitelist"
                  placeholder="Enter IP addresses, one per line"
                  value={securitySettings?.ipWhitelist?.join('\n') || ''}
                  onChange={(e) => 
                    updateSecurityMutation.mutate({ 
                      ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to allow all IPs. Enter one IP address per line.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Set password requirements for your users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-length">Minimum Length</Label>
                  <Input
                    id="min-length"
                    type="number"
                    value={securitySettings?.passwordPolicy?.minLength || 8}
                    onChange={(e) => 
                      updateSecurityMutation.mutate({
                        passwordPolicy: {
                          ...securitySettings?.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <div className="space-y-2">
                    {[
                      { key: 'requireUppercase', label: 'Uppercase letters' },
                      { key: 'requireLowercase', label: 'Lowercase letters' },
                      { key: 'requireNumbers', label: 'Numbers' },
                      { key: 'requireSpecialChars', label: 'Special characters' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          checked={securitySettings?.passwordPolicy?.[key]}
                          onCheckedChange={(checked) => 
                            updateSecurityMutation.mutate({
                              passwordPolicy: {
                                ...securitySettings?.passwordPolicy,
                                [key]: checked
                              }
                            })
                          }
                        />
                        <Label>{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Access Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for external integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="API Key name" id="api-key-name" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write</SelectItem>
                      <SelectItem value="admin">Admin Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      const nameInput = document.getElementById('api-key-name') as HTMLInputElement;
                      if (nameInput.value) {
                        createApiKeyMutation.mutate({
                          name: nameInput.value,
                          permissions: ['read'] // Default permission
                        });
                        nameInput.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Key
                  </Button>
                </div>

                <div className="space-y-2">
                  {apiKeys?.map((key: any) => (
                    <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {showApiKeys[key.id] ? key.keyPrefix : key.keyPrefix}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {key.permissions.map((perm: string) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(key.keyPrefix)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your platform's color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'primaryColor', label: 'Primary Color', default: '#3b82f6' },
                  { key: 'secondaryColor', label: 'Secondary Color', default: '#64748b' },
                  { key: 'accentColor', label: 'Accent Color', default: '#10b981' }
                ].map(({ key, label, default: defaultColor }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={themeConfig?.[key] || defaultColor}
                        onChange={(e) => 
                          updateThemeMutation.mutate({ [key]: e.target.value })
                        }
                        className="w-12 h-10 border rounded"
                      />
                      <Input
                        value={themeConfig?.[key] || defaultColor}
                        onChange={(e) => 
                          updateThemeMutation.mutate({ [key]: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
              <CardDescription>Upload your company logos and assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Drop logo here or click to upload</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Drop favicon here or click to upload</p>
                    <p className="text-xs text-gray-400">ICO, PNG 32x32px</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Connect with external services and APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'QuickBooks', type: 'Accounting', icon: '📊', status: 'Available' },
                  { name: 'Stripe', type: 'Payments', icon: '💳', status: 'Connected' },
                  { name: 'Slack', type: 'Communication', icon: '💬', status: 'Available' },
                  { name: 'Salesforce', type: 'CRM', icon: '👥', status: 'Available' }
                ].map((integration) => (
                  <div key={integration.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.type}</p>
                        </div>
                      </div>
                      <Badge variant={integration.status === 'Connected' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={integration.status === 'Connected'}
                    >
                      {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Export Tab */}
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export your data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}