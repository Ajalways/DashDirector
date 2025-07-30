import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { theme, setTheme, actualTheme } = useTheme();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [location] = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/tasks':
        return (tenant?.settings as any)?.taskModuleName || 'Tasks';
      case '/fraud-detection':
        return 'Fraud Detection';
      case '/ai-fraud-detection':
        return 'AI Fraud Detection';
      case '/accounting':
        return 'Accounting Intelligence';
      case '/financial-analysis':
        return 'Financial Analysis';
      case '/spending-analyzer':
        return 'Spending Analyzer';
      case '/documents':
        return 'Document Management';
      case '/performance':
        return 'Performance Insights';
      case '/what-changed':
        return 'What Changed?';
      case '/business-assistant':
        return 'Business Assistant';
      case '/employees':
        return 'Employee Directory';
      case '/team':
        return 'Team Management';
      case '/settings':
        return 'Settings';
      case '/enterprise':
        return 'Enterprise Settings';
      case '/owner-panel':
        return 'Owner Panel';
      case '/domain-setup':
        return 'Domain Setup';
      default:
        return 'Dashboard';
    }
  };

  const toggleTheme = () => {
    // Toggle between light and dark, use actualTheme to determine current state
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {getPageTitle()}
          </h2>
          
          {tenant?.isDemo && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex-shrink-0 hidden sm:inline-flex">
              <i className="fas fa-flask mr-1" />
              Demo Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="flex-shrink-0">
            {actualTheme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative flex-shrink-0 hidden sm:inline-flex">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.firstName && (
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  )}
                  {user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
