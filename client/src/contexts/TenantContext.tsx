import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { Tenant } from '@shared/schema';

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  updateTenant: (updates: Partial<Tenant>) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const { data, isLoading } = useQuery<Tenant>({
    queryKey: ['/api/tenant'],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (data && typeof data === 'object' && 'id' in data) {
      setTenant(data as Tenant);
      
      // Apply tenant theme
      const root = document.documentElement;
      root.style.setProperty('--primary', data.primaryColor || '#6366F1');
      
      // Apply dark/light theme
      if (data.theme === 'dark') {
        root.classList.add('dark');
      } else if (data.theme === 'light') {
        root.classList.remove('dark');
      }
      
      // Set favicon
      if (data.faviconUrl) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = data.faviconUrl;
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = data.faviconUrl;
          document.head.appendChild(newFavicon);
        }
      }
      
      // Set page title
      document.title = `${data.name} - PulseBoardAI`;
    }
  }, [data]);

  const updateTenant = (updates: Partial<Tenant>) => {
    if (tenant) {
      const updatedTenant = { ...tenant, ...updates };
      setTenant(updatedTenant);
      
      // Apply theme changes immediately
      if (updates.primaryColor) {
        document.documentElement.style.setProperty('--primary', updates.primaryColor);
      }
      
      if (updates.theme) {
        const root = document.documentElement;
        if (updates.theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, isLoading, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
