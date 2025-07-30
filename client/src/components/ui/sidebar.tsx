import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
        className
      )}
      {...props}
    />
  )
);
Sidebar.displayName = "Sidebar";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-full flex-col", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-3 p-6 border-b border-gray-200 dark:border-gray-700", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex-1 p-4 overflow-y-auto", className)}
    {...props}
  />
));
SidebarNav.displayName = "SidebarNav";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-t border-gray-200 dark:border-gray-700", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarNav,
  SidebarFooter,
};
