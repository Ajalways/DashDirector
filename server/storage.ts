import {
  users,
  tenants,
  tasks,
  fraudCases,
  fraudPatterns,
  transactions,
  fraudModels,
  activities,
  kpiMetrics,
  invitations,
  accountingConnections,
  accountingTransactions,
  documents,
  businessInsights,
  auditAlerts,
  profitLeaks,
  apiKeys,
  securitySettings,
  brandingAssets,
  themeConfigurations,
  integrations,
  webhooks,
  analyticsSettings,
  type User,
  type UpsertUser,
  type Tenant,
  type InsertTenant,
  type Task,
  type InsertTask,
  type FraudCase,
  type InsertFraudCase,
  type FraudPattern,
  type InsertFraudPattern,
  type Transaction,
  type InsertTransaction,
  type FraudModel,
  type InsertFraudModel,
  type Activity,
  type InsertActivity,
  type KpiMetric,
  type InsertKpiMetric,
  type Invitation,
  type InsertInvitation,
  type AccountingConnection,
  type InsertAccountingConnection,
  type AccountingTransaction,
  type InsertAccountingTransaction,
  type Document,
  type InsertDocument,
  type BusinessInsight,
  type InsertBusinessInsight,
  type AuditAlert,
  type InsertAuditAlert,
  type ProfitLeak,
  type InsertProfitLeak,
  type PerformanceInsight,
  type InsertPerformanceInsight,
  businessChanges,
  type BusinessChange,
  type InsertBusinessChange,
  timelineEvents,
  type TimelineEvent,
  type InsertTimelineEvent,
  employees,
  type Employee,
  type InsertEmployee,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sum, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant>;
  
  // Task operations
  getTasks(tenantId: string, limit?: number): Promise<Task[]>;
  getTask(id: string, tenantId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, tenantId: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string, tenantId: string): Promise<void>;
  
  // Fraud case operations
  getFraudCases(tenantId: string, limit?: number): Promise<FraudCase[]>;
  getFraudCase(id: string, tenantId: string): Promise<FraudCase | undefined>;
  createFraudCase(fraudCase: InsertFraudCase): Promise<FraudCase>;
  updateFraudCase(id: string, tenantId: string, updates: Partial<InsertFraudCase>): Promise<FraudCase>;
  
  // Fraud pattern operations
  getFraudPatterns(tenantId: string): Promise<FraudPattern[]>;
  createFraudPattern(pattern: InsertFraudPattern): Promise<FraudPattern>;
  updateFraudPattern(id: string, tenantId: string, updates: Partial<InsertFraudPattern>): Promise<FraudPattern>;
  deleteFraudPattern(id: string, tenantId: string): Promise<void>;
  
  // Transaction operations
  getTransactions(tenantId: string, limit?: number): Promise<Transaction[]>;
  getTransaction(id: string, tenantId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getFlaggedTransactions(tenantId: string, limit?: number): Promise<Transaction[]>;
  
  // Activity operations
  getActivities(tenantId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // KPI operations
  getKpiMetrics(tenantId: string, metricType?: string, startDate?: Date, endDate?: Date): Promise<KpiMetric[]>;
  createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric>;
  
  // Team operations
  getTeamMembers(tenantId: string): Promise<User[]>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitation(token: string): Promise<Invitation | undefined>;
  acceptInvitation(token: string, userId: string): Promise<void>;
  
  // Documents
  async getDocuments(tenantId: string, category?: string): Promise<Document[]>;
  async createDocument(document: InsertDocument): Promise<Document>;

  // Business insights
  async getBusinessInsights(tenantId: string): Promise<BusinessInsight[]>;
  async createBusinessInsight(insight: InsertBusinessInsight): Promise<BusinessInsight>;

  // Audit alerts
  async getAuditAlerts(tenantId: string): Promise<AuditAlert[]>;
  async createAuditAlert(alert: InsertAuditAlert): Promise<AuditAlert>;

  // Profit leaks
  async getProfitLeaks(tenantId: string): Promise<ProfitLeak[]>;
  async createProfitLeak(leak: InsertProfitLeak): Promise<ProfitLeak>;

  // Performance insights
  async getPerformanceInsights(tenantId: string, category?: string): Promise<PerformanceInsight[]>;
  async createPerformanceInsight(insight: InsertPerformanceInsight): Promise<PerformanceInsight>;

  // Employee operations
  getEmployees(tenantId: string): Promise<User[]>;
  createEmployee(employeeData: any): Promise<User>;

  // Analytics
  getTenantStats(tenantId: string): Promise<{
    totalTasks: number;
    activeTasks: number;
    fraudAlerts: number;
    teamMembers: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  // Task operations
  async getTasks(tenantId: string, limit = 50): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.tenantId, tenantId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }

  async getTask(id: string, tenantId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, tenantId: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)))
      .returning();
    return task;
  }

  async deleteTask(id: string, tenantId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)));
  }

  // Fraud case operations
  async getFraudCases(tenantId: string, limit = 50): Promise<FraudCase[]> {
    return await db
      .select()
      .from(fraudCases)
      .where(eq(fraudCases.tenantId, tenantId))
      .orderBy(desc(fraudCases.createdAt))
      .limit(limit);
  }

  async getFraudCase(id: string, tenantId: string): Promise<FraudCase | undefined> {
    const [fraudCase] = await db
      .select()
      .from(fraudCases)
      .where(and(eq(fraudCases.id, id), eq(fraudCases.tenantId, tenantId)));
    return fraudCase;
  }

  async createFraudCase(fraudCase: InsertFraudCase): Promise<FraudCase> {
    const [newFraudCase] = await db.insert(fraudCases).values(fraudCase).returning();
    return newFraudCase;
  }

  async updateFraudCase(id: string, tenantId: string, updates: Partial<InsertFraudCase>): Promise<FraudCase> {
    const [fraudCase] = await db
      .update(fraudCases)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(fraudCases.id, id), eq(fraudCases.tenantId, tenantId)))
      .returning();
    return fraudCase;
  }

  // Activity operations
  async getActivities(tenantId: string, limit = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.tenantId, tenantId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // KPI operations
  async getKpiMetrics(tenantId: string, metricType?: string, startDate?: Date, endDate?: Date): Promise<KpiMetric[]> {
    const conditions = [eq(kpiMetrics.tenantId, tenantId)];
    
    if (metricType) {
      conditions.push(eq(kpiMetrics.metricType, metricType));
    }
    
    if (startDate) {
      conditions.push(gte(kpiMetrics.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(kpiMetrics.date, endDate));
    }
    
    return await db
      .select()
      .from(kpiMetrics)
      .where(and(...conditions))
      .orderBy(desc(kpiMetrics.date));
  }

  async createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric> {
    const [newMetric] = await db.insert(kpiMetrics).values(metric).returning();
    return newMetric;
  }

  // Team operations
  async getTeamMembers(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db.insert(invitations).values(invitation).returning();
    return newInvitation;
  }

  async getInvitation(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token));
    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<void> {
    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.token, token));
  }

  // Analytics
  async getTenantStats(tenantId: string): Promise<{
    totalTasks: number;
    activeTasks: number;
    fraudAlerts: number;
    teamMembers: number;
    totalRevenue: number;
  }> {
    const [taskStats] = await db
      .select({ 
        total: count(),
        active: count(eq(tasks.status, 'in_progress'))
      })
      .from(tasks)
      .where(eq(tasks.tenantId, tenantId));

    const [fraudStats] = await db
      .select({ count: count() })
      .from(fraudCases)
      .where(and(eq(fraudCases.tenantId, tenantId), eq(fraudCases.status, 'pending')));

    const [teamStats] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    const [revenueStats] = await db
      .select({ total: sum(kpiMetrics.value) })
      .from(kpiMetrics)
      .where(and(eq(kpiMetrics.tenantId, tenantId), eq(kpiMetrics.metricType, 'revenue')));

    return {
      totalTasks: taskStats?.total || 0,
      activeTasks: taskStats?.active || 0,
      fraudAlerts: fraudStats?.count || 0,
      teamMembers: teamStats?.count || 0,
      totalRevenue: Number(revenueStats?.total) || 0,
    };
  }

  // Fraud pattern operations
  async getFraudPatterns(tenantId: string): Promise<FraudPattern[]> {
    return await db.select()
      .from(fraudPatterns)
      .where(eq(fraudPatterns.tenantId, tenantId))
      .orderBy(desc(fraudPatterns.createdAt));
  }

  async createFraudPattern(pattern: InsertFraudPattern): Promise<FraudPattern> {
    const [created] = await db.insert(fraudPatterns)
      .values(pattern)
      .returning();
    return created;
  }

  async updateFraudPattern(id: string, tenantId: string, updates: Partial<InsertFraudPattern>): Promise<FraudPattern> {
    const [updated] = await db.update(fraudPatterns)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(fraudPatterns.id, id), eq(fraudPatterns.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async deleteFraudPattern(id: string, tenantId: string): Promise<void> {
    await db.delete(fraudPatterns)
      .where(and(eq(fraudPatterns.id, id), eq(fraudPatterns.tenantId, tenantId)));
  }

  // Transaction operations
  async getTransactions(tenantId: string, limit: number = 50): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.tenantId, tenantId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransaction(id: string, tenantId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions)
      .values(transaction)
      .returning();
    return created;
  }

  async getFlaggedTransactions(tenantId: string, limit: number = 50): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.isFlagged, true)
      ))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Accounting operations
  async createAccountingConnection(connection: InsertAccountingConnection): Promise<AccountingConnection> {
    const [created] = await db
      .insert(accountingConnections)
      .values(connection)
      .returning();
    return created;
  }

  async getAccountingConnections(tenantId: string): Promise<AccountingConnection[]> {
    return await db
      .select()
      .from(accountingConnections)
      .where(eq(accountingConnections.tenantId, tenantId));
  }

  async createAccountingTransaction(transaction: InsertAccountingTransaction): Promise<AccountingTransaction> {
    const [created] = await db
      .insert(accountingTransactions)
      .values(transaction)
      .returning();
    return created;
  }

  async getAccountingTransactions(tenantId: string, limit?: number): Promise<AccountingTransaction[]> {
    return await db
      .select()
      .from(accountingTransactions)
      .where(eq(accountingTransactions.tenantId, tenantId))
      .orderBy(desc(accountingTransactions.date))
      .limit(limit || 100);
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db
      .insert(documents)
      .values(document)
      .returning();
    return created;
  }

  async getDocument(id: string, tenantId: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)));
    return document;
  }

  async getDocuments(tenantId: string, category?: string): Promise<Document[]> {
    const query = db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId));
    
    if (category) {
      return await db
        .select()
        .from(documents)
        .where(and(eq(documents.tenantId, tenantId), eq(documents.category, category)))
        .orderBy(desc(documents.createdAt));
    }
    
    return await query.orderBy(desc(documents.createdAt));
  }

  async updateDocument(id: string, tenantId: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
      .returning();
    return updated;
  }

  // Business insights operations
  async createBusinessInsight(insight: InsertBusinessInsight): Promise<BusinessInsight> {
    const [created] = await db
      .insert(businessInsights)
      .values(insight)
      .returning();
    return created;
  }

  async getBusinessInsights(tenantId: string, status?: string): Promise<BusinessInsight[]> {
    if (status) {
      return await db
        .select()
        .from(businessInsights)
        .where(and(eq(businessInsights.tenantId, tenantId), eq(businessInsights.status, status)))
        .orderBy(desc(businessInsights.createdAt));
    }
    
    return await db
      .select()
      .from(businessInsights)
      .where(eq(businessInsights.tenantId, tenantId))
      .orderBy(desc(businessInsights.createdAt));
  }

  // Audit alert operations
  async createAuditAlert(alert: InsertAuditAlert): Promise<AuditAlert> {
    const [created] = await db
      .insert(auditAlerts)
      .values(alert)
      .returning();
    return created;
  }

  async getAuditAlerts(tenantId: string, since?: Date): Promise<AuditAlert[]> {
    if (since) {
      return await db
        .select()
        .from(auditAlerts)
        .where(and(eq(auditAlerts.tenantId, tenantId), gte(auditAlerts.createdAt, since)))
        .orderBy(desc(auditAlerts.createdAt));
    }
    
    return await db
      .select()
      .from(auditAlerts)
      .where(eq(auditAlerts.tenantId, tenantId))
      .orderBy(desc(auditAlerts.createdAt));
  }

  // Profit leak operations
  async createProfitLeak(leak: InsertProfitLeak): Promise<ProfitLeak> {
    const [created] = await db
      .insert(profitLeaks)
      .values(leak)
      .returning();
    return created;
  }

  async getProfitLeaks(tenantId: string, status?: string): Promise<ProfitLeak[]> {
    if (status) {
      return await db
        .select()
        .from(profitLeaks)
        .where(and(eq(profitLeaks.tenantId, tenantId), eq(profitLeaks.status, status)))
        .orderBy(desc(profitLeaks.detectedAt));
    }
    
    return await db
      .select()
      .from(profitLeaks)
      .where(eq(profitLeaks.tenantId, tenantId))
      .orderBy(desc(profitLeaks.detectedAt));
  }

  // Performance insights operations
  async createPerformanceInsight(insight: InsertPerformanceInsight): Promise<PerformanceInsight> {
    const [created] = await db
      .insert(performanceInsights)
      .values(insight)
      .returning();
    return created;
  }

  async getPerformanceInsights(tenantId: string, category?: string): Promise<PerformanceInsight[]> {
    if (category) {
      return await db
        .select()
        .from(performanceInsights)
        .where(and(eq(performanceInsights.tenantId, tenantId), eq(performanceInsights.category, category)))
        .orderBy(desc(performanceInsights.createdAt));
    }
    
    return await db
      .select()
      .from(performanceInsights)
      .where(eq(performanceInsights.tenantId, tenantId))
      .orderBy(desc(performanceInsights.createdAt));
  }

  // Employee operations
  async getEmployees(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  async createEmployee(employeeData: any): Promise<User> {
    const [employee] = await db
      .insert(users)
      .values(employeeData)
      .returning();
    return employee;
  }

  // Business timeline operations
  async getBusinessChanges(tenantId: string, limit: number = 50): Promise<BusinessChange[]> {
    return await db
      .select()
      .from(businessChanges)
      .where(eq(businessChanges.tenantId, tenantId))
      .orderBy(desc(businessChanges.detectedAt))
      .limit(limit);
  }

  async createBusinessChange(changeData: InsertBusinessChange): Promise<BusinessChange> {
    const [change] = await db
      .insert(businessChanges)
      .values(changeData)
      .returning();
    return change;
  }

  async getTimelineEvents(tenantId: string, limit: number = 100): Promise<TimelineEvent[]> {
    return await db
      .select()
      .from(timelineEvents)
      .where(eq(timelineEvents.tenantId, tenantId))
      .orderBy(desc(timelineEvents.eventDate))
      .limit(limit);
  }

  async createTimelineEvent(eventData: InsertTimelineEvent): Promise<TimelineEvent> {
    const [event] = await db
      .insert(timelineEvents)
      .values(eventData)
      .returning();
    return event;
  }
}

export const storage = new DatabaseStorage();
export { db };
