import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Globe, 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Shield,
  ArrowLeft,
  Server,
  Network,
  Settings
} from 'lucide-react';
import { Link } from 'wouter';

interface DomainInfo {
  hostname: string;
  protocol: string;
  fullUrl: string;
  headers: {
    host: string;
    origin: string;
    referer: string;
  };
  replitDomains: string[];
  customDomain?: string;
  isCustomDomain: boolean;
}

export default function DomainSetup() {
  const [customDomain, setCustomDomain] = useState('');
  const [dnsChecked, setDnsChecked] = useState(false);
  const { toast } = useToast();

  // Get current domain info
  const { data: domainInfo, isLoading } = useQuery({
    queryKey: ['/api/domain-info'],
    retry: false,
  }) as { data: DomainInfo | undefined; isLoading: boolean };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  const checkDNS = () => {
    setDnsChecked(true);
    toast({
      title: 'DNS Check Started',
      description: 'Use online tools to verify DNS propagation',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="w-8 h-8" />
              Domain Setup
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connect your custom domain to PulseBoardAI
            </p>
          </div>
        </div>
        <Badge variant={domainInfo?.isCustomDomain ? "default" : "outline"}>
          {domainInfo?.isCustomDomain ? "Custom Domain" : "Replit Domain"}
        </Badge>
      </div>

      {/* Current Domain Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Current Domain Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Current Hostname</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {domainInfo?.hostname}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(domainInfo?.hostname || '')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Full URL</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {domainInfo?.fullUrl}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(domainInfo?.fullUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {domainInfo?.isCustomDomain ? (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Custom domain is active and working
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Using default Replit domain. Follow the guide below to set up your custom domain.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* DNS Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              DNS Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain-input">Your Domain Name</Label>
              <Input
                id="domain-input"
                placeholder="example.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Required DNS Records:</h4>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  A Record (for main domain):
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                  <div>Type: A</div>
                  <div>Host: @</div>
                  <div>Value: {domainInfo?.hostname.includes('.replit.app') ? domainInfo.hostname : 'your-replit-deployment-ip'}</div>
                  <div>TTL: 300</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  CNAME Record (for www):
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                  <div>Type: CNAME</div>
                  <div>Host: www</div>
                  <div>Value: {customDomain || 'yourdomain.com'}</div>
                  <div>TTL: 300</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Wildcard CNAME (for subdomains):
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                  <div>Type: CNAME</div>
                  <div>Host: *</div>
                  <div>Value: {domainInfo?.hostname}</div>
                  <div>TTL: 300</div>
                </div>
              </div>
            </div>

            <Button onClick={checkDNS} variant="outline" className="w-full">
              <Network className="w-4 h-4 mr-2" />
              Check DNS Propagation
            </Button>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Environment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Required Environment Variables:</h4>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  CUSTOM_DOMAIN:
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono flex items-center justify-between">
                  <span>{customDomain || 'yourdomain.com'}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(customDomain || 'yourdomain.com')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
             </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  ALLOWED_ORIGINS:
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs font-mono flex items-center justify-between">
                  <span>{customDomain ? `https://${customDomain},https://www.${customDomain}` : 'https://yourdomain.com,https://www.yourdomain.com'}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(customDomain ? `https://${customDomain},https://www.${customDomain}` : 'https://yourdomain.com,https://www.yourdomain.com')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    SSL Certificate
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Replit automatically provides SSL certificates for custom domains. Allow 5-15 minutes for certificate provisioning.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Setup Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                1
              </div>
              <div>
                <div className="font-medium text-sm">Configure DNS Records</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Add the A and CNAME records to your domain's DNS settings
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                2
              </div>
              <div>
                <div className="font-medium text-sm">Update Environment Variables</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                3
              </div>
              <div>
                <div className="font-medium text-sm">Wait for DNS Propagation</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  DNS changes can take 5-60 minutes to propagate globally
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                4
              </div>
              <div>
                <div className="font-medium text-sm">Verify SSL Certificate</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  HTTPS should work automatically once DNS is propagated
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                5
              </div>
              <div>
                <div className="font-medium text-sm">Test Authentication</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Verify login/logout works correctly on your custom domain
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" asChild>
              <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Check DNS Propagation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener noreferrer">
                <Shield className="w-4 h-4 mr-2" />
                Test SSL Certificate
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}