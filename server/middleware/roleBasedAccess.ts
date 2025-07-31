import type { RequestHandler } from 'express';
import { storage } from '../storage.js';

export interface RolePermissions {
  dashboard?: { read?: boolean; write?: boolean; admin?: boolean };
  tasks?: { read?: boolean; write?: boolean; admin?: boolean; manage_all?: boolean };
  fraud?: { read?: boolean; write?: boolean; admin?: boolean; view_all_cases?: boolean };
  aiFraud?: { read?: boolean; write?: boolean; admin?: boolean; configure_ai?: boolean };
  accounting?: { read?: boolean; write?: boolean; admin?: boolean; view_financials?: boolean };
  documents?: { read?: boolean; write?: boolean; admin?: boolean; manage_all?: boolean };
  performance?: { read?: boolean; write?: boolean; admin?: boolean; view_all_metrics?: boolean };
  timeline?: { read?: boolean; write?: boolean; admin?: boolean; view_all_changes?: boolean };
  businessAssistant?: { read?: boolean; write?: boolean; admin?: boolean; unlimited_queries?: boolean };
  team?: { read?: boolean; write?: boolean; admin?: boolean; manage_all_users?: boolean };
  employees?: { read?: boolean; write?: boolean; admin?: boolean; manage_directory?: boolean };
  settings?: { read?: boolean; write?: boolean; admin?: boolean; modify_tenant?: boolean };
  billing?: { read?: boolean; write?: boolean; admin?: boolean; manage_subscriptions?: boolean };
  impersonate?: { any_role?: boolean; any_tenant?: boolean };
  tenant_management?: { create?: boolean; modify?: boolean; delete?: boolean; transfer?: boolean };
  user_management?: { create_owners?: boolean; modify_any?: boolean; delete_any?: boolean };
  system_administration?: { view_all_tenants?: boolean; modify_system_settings?: boolean };
  data_access?: { export_all?: boolean; view_all_analytics?: boolean; cross_tenant?: boolean };
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  owner: {
    // Full access to everything
    dashboard: { read: true, write: true, admin: true },
    tasks: { read: true, write: true, admin: true, manage_all: true },
    fraud: { read: true, write: true, admin: true, view_all_cases: true },
    aiFraud: { read: true, write: true, admin: true, configure_ai: true },
    accounting: { read: true, write: true, admin: true, view_financials: true },
    documents: { read: true, write: true, admin: true, manage_all: true },
    performance: { read: true, write: true, admin: true, view_all_metrics: true },
    timeline: { read: true, write: true, admin: true, view_all_changes: true },
    businessAssistant: { read: true, write: true, admin: true, unlimited_queries: true },
    team: { read: true, write: true, admin: true, manage_all_users: true },
    employees: { read: true, write: true, admin: true, manage_directory: true },
    settings: { read: true, write: true, admin: true, modify_tenant: true },
    billing: { read: true, write: true, admin: true, manage_subscriptions: true },
    impersonate: { any_role: true, any_tenant: true },
    tenant_management: { create: true, modify: true, delete: true, transfer: true },
    user_management: { create_owners: true, modify_any: true, delete_any: true },
    system_administration: { view_all_tenants: true, modify_system_settings: true },
    data_access: { export_all: true, view_all_analytics: true, cross_tenant: true }
  },
  admin: {
    dashboard: { read: true, write: true, admin: true },
    tasks: { read: true, write: true, admin: true, manage_all: true },
    fraud: { read: true, write: true, admin: true, view_all_cases: true },
    aiFraud: { read: true, write: true, admin: false, configure_ai: false },
    accounting: { read: true, write: true, admin: true, view_financials: true },
    documents: { read: true, write: true, admin: true, manage_all: true },
    performance: { read: true, write: true, admin: true, view_all_metrics: true },
    timeline: { read: true, write: true, admin: false, view_all_changes: true },
    businessAssistant: { read: true, write: true, admin: false, unlimited_queries: false },
    team: { read: true, write: true, admin: true, manage_all_users: true },
    employees: { read: true, write: true, admin: true, manage_directory: true },
    settings: { read: true, write: true, admin: true, modify_tenant: false },
    billing: { read: true, write: false, admin: false, manage_subscriptions: false }
  },
  manager: {
    dashboard: { read: true, write: true, admin: false },
    tasks: { read: true, write: true, admin: false, manage_all: false },
    fraud: { read: true, write: true, admin: false, view_all_cases: false },
    aiFraud: { read: true, write: false, admin: false, configure_ai: false },
    accounting: { read: true, write: false, admin: false, view_financials: false },
    documents: { read: true, write: true, admin: false, manage_all: false },
    performance: { read: true, write: false, admin: false, view_all_metrics: false },
    timeline: { read: true, write: false, admin: false, view_all_changes: false },
    businessAssistant: { read: true, write: true, admin: false, unlimited_queries: false },
    team: { read: true, write: true, admin: false, manage_all_users: false },
    employees: { read: true, write: false, admin: false, manage_directory: false },
    settings: { read: true, write: false, admin: false, modify_tenant: false }
  },
  analyst: {
    dashboard: { read: true, write: false, admin: false },
    tasks: { read: true, write: true, admin: false, manage_all: false },
    fraud: { read: true, write: true, admin: false, view_all_cases: false },
    aiFraud: { read: true, write: false, admin: false, configure_ai: false },
    accounting: { read: true, write: false, admin: false, view_financials: false },
    documents: { read: true, write: false, admin: false, manage_all: false },
    performance: { read: true, write: false, admin: false, view_all_metrics: false },
    timeline: { read: true, write: false, admin: false, view_all_changes: false },
    businessAssistant: { read: true, write: true, admin: false, unlimited_queries: false },
    team: { read: true, write: false, admin: false, manage_all_users: false },
    employees: { read: true, write: false, admin: false, manage_directory: false },
    settings: { read: true, write: false, admin: false, modify_tenant: false }
  },
  user: {
    dashboard: { read: true, write: false, admin: false },
    tasks: { read: true, write: true, admin: false, manage_all: false },
    fraud: { read: false, write: false, admin: false, view_all_cases: false },
    aiFraud: { read: false, write: false, admin: false, configure_ai: false },
    accounting: { read: false, write: false, admin: false, view_financials: false },
    documents: { read: true, write: true, admin: false, manage_all: false },
    performance: { read: false, write: false, admin: false, view_all_metrics: false },
    timeline: { read: false, write: false, admin: false, view_all_changes: false },
    businessAssistant: { read: true, write: true, admin: false, unlimited_queries: false },
    team: { read: true, write: false, admin: false, manage_all_users: false },
    employees: { read: true, write: false, admin: false, manage_directory: false },
    settings: { read: true, write: false, admin: false, modify_tenant: false }
  }
};

export function getUserPermissions(role: string, customPermissions?: any): RolePermissions {
  const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.user;
  
  // Merge custom permissions with defaults
  if (customPermissions && typeof customPermissions === 'object') {
    return mergePermissions(defaultPermissions, customPermissions);
  }
  
  return defaultPermissions;
}

function mergePermissions(defaults: RolePermissions, custom: any): RolePermissions {
  const merged = { ...defaults };
  
  for (const [module, permissions] of Object.entries(custom)) {
    if (typeof permissions === 'object' && permissions !== null) {
      merged[module as keyof RolePermissions] = {
        ...defaults[module as keyof RolePermissions],
        ...permissions
      };
    }
  }
  
  return merged;
}

export function hasPermission(
  userPermissions: RolePermissions,
  module: keyof RolePermissions,
  action: string
): boolean {
  const modulePermissions = userPermissions[module];
  if (!modulePermissions) return false;
  
  return modulePermissions[action as keyof typeof modulePermissions] === true;
}

export function requirePermission(module: keyof RolePermissions, action: string): RequestHandler {
  return async (req: any, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const permissions = getUserPermissions(user.role, user.permissions);
      
      if (!hasPermission(permissions, module, action)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions', 
          required: `${module}.${action}`,
          userRole: user.role 
        });
      }
      
      // Add permissions to request for further use
      req.userPermissions = permissions;
      req.userRole = user.role;
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

export function requireRole(allowedRoles: string[]): RequestHandler {
  return async (req: any, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Insufficient role', 
          required: allowedRoles,
          userRole: user.role 
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Role check failed' });
    }
  };
}

export function requireOwnerOrAdmin(): RequestHandler {
  return requireRole(['owner', 'admin']);
}

export function requireOwnerOnly(): RequestHandler {
  return requireRole(['owner']);
}