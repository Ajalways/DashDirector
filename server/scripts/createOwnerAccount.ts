import { storage } from '../storage.js';
// Update the import path to the correct location of your schema types
// Update the import path below to the actual location of your schema types file
import type { UpsertUser, InsertTenant } from '../../shared/schema.js';

export async function createOwnerTestAccount() {
  console.log('Creating OWNER test account...');
  
  try {
    // Create a demo tenant for testing
    const demoTenant: InsertTenant = {
      name: 'PulseBoardAI Demo Company',
      subdomain: 'demo-pulseboard',
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#6366F1',
      theme: 'light',
      navigationLayout: 'sidebar',
      customDomain: null,
      settings: {
        taskModuleName: 'Tasks',
        enableFraudDetection: true,
        enableAIAnalysis: true,
        enableTimelineFeature: true,
        enableBusinessAssistant: true,
        companyName: 'PulseBoardAI Demo Company',
        industry: 'Technology',
        currency: 'USD'
      },
      enabledModules: [
        'dashboard', 
        'tasks', 
        'fraud', 
        'ai-fraud', 
        'accounting', 
        'documents', 
        'performance', 
        'timeline', 
        'business-assistant',
        'team', 
        'employees',
        'settings'
      ],
      isDemo: true
    };
    
    const tenant = await storage.createTenant(demoTenant);
    console.log('Demo tenant created:', tenant.id);
    
    // Create owner user with full permissions
    const ownerUser: UpsertUser = {
      id: 'owner-demo-account-001',
      email: 'owner+demo@pulseboard.ai',
      firstName: 'Demo',
      lastName: 'Owner',
      profileImageUrl: null,
      tenantId: tenant.id,
      role: 'owner',
      department: 'Executive',
      jobTitle: 'Owner / CEO',
      phone: '+1-555-0100',
      isActive: true,
      permissions: {
        // Full access to all modules
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
        
        // Special owner permissions
        impersonate: { any_role: true, any_tenant: true },
        tenant_management: { create: true, modify: true, delete: true, transfer: true },
        user_management: { create_owners: true, modify_any: true, delete_any: true },
        system_administration: { view_all_tenants: true, modify_system_settings: true },
        data_access: { export_all: true, view_all_analytics: true, cross_tenant: true }
      },
      isTestAccount: true,
      canImpersonate: true
    };
    
    const user = await storage.upsertUser(ownerUser);
    console.log('Owner user created:', user.id);
    
    // Create some sample data for demonstration
    await seedOwnerTestData(tenant.id);
    
    console.log('✅ OWNER test account setup complete!');
    console.log('📧 Email: owner+demo@pulseboard.ai');
    console.log('🔑 Role: owner (full permissions)');
    console.log('🏢 Tenant: PulseBoardAI Demo Company');
    console.log('🔐 Test Account: Yes (non-billable)');
    console.log('👤 Can Impersonate: Yes (any role/tenant)');
    
    return {
      user,
      tenant,
      message: 'Owner test account created successfully'
    };
    
  } catch (error) {
    console.error('Failed to create owner test account:', error);
    throw error;
  }
}

async function seedOwnerTestData(tenantId: string) {
  console.log('Seeding owner test data...');
  
  // Seed timeline data for demonstration
  const { seedTimelineData } = await import('./seedTimelineData.js');
  await seedTimelineData(tenantId);
  
  // Add some fraud cases
  await storage.createFraudCase({
    tenantId,
    status: 'open',
    amount: 2500,
    // If metadata is needed, update the type definition to include it
    // Otherwise, remove metadata as shown here
  });
  
  // Add some tasks
  await storage.createTask({
    tenantId,
    title: 'Review Q4 Financial Reports',
    createdById: 'owner-demo-account-001',
    description: 'Comprehensive review of quarterly financial performance',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'owner-demo-account-001',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tags: ['finance', 'quarterly', 'review']
  });
  
  await storage.createTask({
    tenantId,
    title: 'Investigate Fraud Alert #12',
    createdById: 'owner-demo-account-001',
    description: 'Follow up on automated fraud detection alert',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'owner-demo-account-001',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    tags: ['fraud', 'security', 'urgent']
  });

  console.log('Owner test data seeded successfully');
}