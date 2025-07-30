import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTenant } from '@/contexts/TenantContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Building2, Upload } from 'lucide-react';

export function CompanyBranding() {
  const { tenant, updateTenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      updateTenant({ logoUrl: data.logoUrl });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant'] });
      toast({
        title: 'Logo Updated',
        description: 'Your company logo has been uploaded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const uploadFaviconMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('favicon', file);
      
      const response = await fetch('/api/upload/favicon', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload favicon');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      updateTenant({ faviconUrl: data.faviconUrl });
      queryClient.invalidateQueries({ queryKey: ['/api/tenant'] });
      toast({
        title: 'Favicon Updated',
        description: 'Your favicon has been uploaded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload favicon. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFaviconMutation.mutate(file);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Branding</h3>
      <div className="space-y-4">
        {/* Logo Upload */}
        <div>
          <Label>Company Logo</Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mt-2">
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt="Company Logo"
                className="w-16 h-16 mx-auto mb-3 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadLogoMutation.isPending}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadLogoMutation.isPending ? 'Uploading...' : 'Upload New Logo'}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG up to 2MB
            </p>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <Label>Favicon</Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mt-2">
            {tenant?.faviconUrl && (
              <img
                src={tenant.faviconUrl}
                alt="Favicon"
                className="w-8 h-8 mx-auto mb-2"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => faviconInputRef.current?.click()}
              disabled={uploadFaviconMutation.isPending}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadFaviconMutation.isPending ? 'Uploading...' : 'Upload Favicon'}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ICO, PNG 32x32
            </p>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/x-icon,image/png"
              onChange={handleFaviconUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
