import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart3, 
  CheckSquare, 
  Shield, 
  Brain,
  Folder, 
  Clock, 
  Users, 
  Settings, 
  History, 
  CreditCard,
  X,
  Building2,
  TrendingUp,
  MessageCircle,
  Crown,
  Receipt
} from 'lucide-react';

interface NavigationProps {
  onClose?: () => void;
}

export function Navigation({ onClose }: NavigationProps) {
  const [location] = useLocation();
  const { tenant } = useTenant();
  const { user } = useAuth();

  const navigationItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: (tenant?.settings as any)?.taskModuleName || 'Tasks', badge: '12' },
    { path: '/fraud-detection', icon: Shield, label: 'Fraud Detection', badge: '3', badgeVariant: 'destructive' as const },
    { path: '/ai-fraud-detection', icon: Brain, label: 'AI Fraud Detection' },
    { path: '/accounting', icon: CreditCard, label: 'Accounting Intelligence' },
    { path: '/financial-analysis', icon: TrendingUp, label: 'Financial Analysis', badge: 'AI', badgeVariant: 'default' as const },
    { path: '/spending-analyzer', icon: Receipt, label: 'Spending Analyzer', badge: 'NEW', badgeVariant: 'default' as const },
    { path: '/business-recommendations', icon: Brain, label: 'AI Business Recommendations', badge: 'AI', badgeVariant: 'default' as const },
    { path: '/documents', icon: Folder, label: 'Document Management' },
    { path: '/performance', icon: TrendingUp, label: 'Performance Insights' },
    { path: '/what-changed', icon: Clock, label: 'What Changed?', badge: 'NEW', badgeVariant: 'default' as const },
    { path: '/business-assistant', icon: MessageCircle, label: 'Business Assistant', badge: 'AI', badgeVariant: 'default' as const },
    { path: '/employees', icon: Users, label: 'Employee Directory' },
    { path: '/team', icon: Building2, label: 'Team Management' },
  ];

  const adminItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/enterprise', icon: Shield, label: 'Enterprise', badge: 'PRO', badgeVariant: 'default' as const },
    { path: '/audit', icon: History, label: 'Audit Logs' },
    { path: '/billing', icon: CreditCard, label: 'Billing' },
  ];

  const ownerItems = [
    { path: '/owner-panel', icon: Crown, label: 'Owner Panel', badge: 'OWNER', badgeVariant: 'default' as const },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Close button for mobile */}
      {onClose && (
        <div className="p-4 flex justify-end lg:hidden">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Company Branding Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/">
          <Button 
            variant="ghost" 
            className="w-full p-0 h-auto justify-start hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            onClick={onClose}
          >
            <div className="flex items-center space-x-3 p-3 w-full min-w-0">
              {tenant?.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="text-left min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {tenant?.name || 'Business Platform'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  Pro Plan
                </p>
              </div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || 'secondary'}
                        className="ml-auto"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Owner Section */}
        {user?.role === 'owner' && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-3">
              Owner
            </h3>
            <ul className="space-y-2">
              {ownerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <Button
                        variant={isActive(item.path) ? 'secondary' : 'ghost'}
                        className={`w-full justify-start ${
                          isActive(item.path)
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={onClose}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || 'secondary'}
                            className="ml-auto bg-yellow-100 text-yellow-800 border-yellow-200"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Admin Section */}
        {(user?.role === 'admin' || user?.role === 'owner') && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Admin
            </h3>
            <ul className="space-y-2">
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <Button
                        variant={isActive(item.path) ? 'secondary' : 'ghost'}
                        className={`w-full justify-start ${
                          isActive(item.path)
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={onClose}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
            <AvatarFallback>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
              {user?.role || 'User'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
          >
            <i className="fas fa-sign-out-alt text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </Button>
        </div>
      </div>
    </div>
  );
}
