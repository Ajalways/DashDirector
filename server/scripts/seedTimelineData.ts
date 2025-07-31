import { storage } from '../storage.js';
import type { InsertKpiMetric, InsertTimelineEvent, InsertBusinessChange } from '../../shared/schema.js';

export async function seedTimelineData(tenantId: string) {
  // Seed some KPI metrics to demonstrate change detection
  const kpiMetrics: InsertKpiMetric[] = [
    // Revenue metrics showing a significant drop
    {
      tenantId,
      metricType: 'revenue',
      value: 50000, // Current value
      date: new Date(),
      metadata: { period: 'monthly', currency: 'USD' }
    },
    {
      tenantId,
      metricType: 'revenue',
      value: 58000, // Previous value - 15% drop
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      metadata: { period: 'monthly', currency: 'USD' }
    },
    // Profit metrics showing decline
    {
      tenantId,
      metricType: 'profit',
      value: 12000, // Current
      date: new Date(),
      metadata: { period: 'monthly', currency: 'USD' }
    },
    {
      tenantId,
      metricType: 'profit',
      value: 15000, // Previous - 20% drop
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      metadata: { period: 'monthly', currency: 'USD' }
    },
    // Customer metrics showing growth
    {
      tenantId,
      metricType: 'customers',
      value: 450, // Current
      date: new Date(),
      metadata: { period: 'monthly' }
    },
    {
      tenantId,
      metricType: 'customers',
      value: 380, // Previous - 18% growth
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      metadata: { period: 'monthly' }
    }
  ];

  // Seed timeline events that correlate with the metric changes
  const timelineEvents: InsertTimelineEvent[] = [
    {
      tenantId,
      eventType: 'hire',
      title: 'Hired 2 new sales representatives',
      description: 'Expanded sales team with experienced professionals from competing firms',
      category: 'team',
      entityType: 'employee',
      metadata: { 
        department: 'sales', 
        count: 2, 
        totalSalary: 120000,
        startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      impactScore: 75,
      eventDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      tenantId,
      eventType: 'subscription_change',
      title: 'Increased software subscription costs',
      description: 'Upgraded CRM and analytics tools to enterprise plans',
      category: 'financial',
      entityType: 'subscription',
      metadata: { 
        previousCost: 2500, 
        newCost: 4200, 
        increase: 1700,
        provider: 'Salesforce Enterprise'
      },
      impactScore: 60,
      eventDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      tenantId,
      eventType: 'invoice',
      title: 'Large client delayed payment',
      description: 'MegaCorp Inc. requested 60-day extension on $15,000 invoice',
      category: 'financial',
      entityType: 'invoice',
      metadata: { 
        amount: 15000, 
        client: 'MegaCorp Inc.', 
        originalDueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        newDueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString()
      },
      impactScore: 85,
      eventDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      tenantId,
      eventType: 'contract',
      title: 'Signed new enterprise contract',
      description: 'TechStart LLC committed to 12-month agreement worth $24,000',
      category: 'financial',
      entityType: 'contract',
      metadata: { 
        amount: 24000, 
        client: 'TechStart LLC', 
        duration: '12 months',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      impactScore: 90,
      eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      tenantId,
      eventType: 'payment',
      title: 'Received overdue payment',
      description: 'ClientCorp finally paid outstanding $8,500 invoice',
      category: 'financial',
      entityType: 'invoice',
      metadata: { 
        amount: 8500, 
        client: 'ClientCorp', 
        daysPastDue: 45
      },
      impactScore: 70,
      eventDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  // Seed a sample business change that demonstrates the AI analysis
  const businessChanges: InsertBusinessChange[] = [
    {
      tenantId,
      changeType: 'metric_shift',
      title: 'Profits dropped 15% in March',
      description: 'Significant decline in profit margins detected despite customer growth',
      impactCategory: 'financial',
      impactMagnitude: 'major',
      metricAffected: 'profit',
      previousValue: 15000,
      newValue: 12000,
      changePercentage: -20,
      relatedEvents: [
        {
          type: 'hire',
          title: 'Hired 2 new sales representatives', 
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          impact: 75
        },
        {
          type: 'subscription_change',
          title: 'Increased software subscription costs',
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          impact: 60
        },
        {
          type: 'invoice',
          title: 'Large client delayed payment',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          impact: 85
        }
      ],
      detectedAt: new Date(),
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      aiAnalysis: `The 20% profit decline appears to be driven by three major factors: 1) New sales hires increased payroll costs by $10,000/month but haven't yet generated offsetting revenue, 2) Enterprise software subscriptions jumped 68% ($1,700 monthly increase) for enhanced capabilities, and 3) A delayed $15,000 payment from MegaCorp created immediate cash flow impact. This is likely a temporary adjustment period - the investments in people and tools should drive revenue growth within 2-3 months. Consider accelerating onboarding for new sales staff and following up on the delayed payment.`,
      status: 'active'
    }
  ];

  console.log('Seeding timeline data...');
  
  // Insert the data
  for (const metric of kpiMetrics) {
    await storage.createKpiMetric(metric);
  }
  
  for (const event of timelineEvents) {
    await storage.createTimelineEvent(event);
  }
  
  for (const change of businessChanges) {
    await storage.createBusinessChange(change);
  }
  
  console.log('Timeline data seeded successfully!');
  console.log(`- ${kpiMetrics.length} KPI metrics`);
  console.log(`- ${timelineEvents.length} timeline events`);
  console.log(`- ${businessChanges.length} business changes`);
}