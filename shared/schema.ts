import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enterprise Schema Tables (moved from separate file to avoid import issues)

// API Keys and Access Management
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(), // Hashed API key
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for display
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  rateLimitPerHour: integer("rate_limit_per_hour").default(1000).notNull()
});

// Security Settings
export const securitySettings = pgTable("security_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().unique(),
  twoFactorRequired: boolean("two_factor_required").default(false).notNull(),
  ipWhitelist: jsonb("ip_whitelist").$type<string[]>().default([]),
  sessionTimeoutMinutes: integer("session_timeout_minutes").default(480).notNull(), // 8 hours
  passwordPolicy: jsonb("password_policy").$type<{
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  }>().default({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  }).notNull(),
  auditLogRetentionDays: integer("audit_log_retention_days").default(90).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Enhanced Branding Options
export const brandingAssets = pgTable("branding_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  assetType: varchar("asset_type", { length: 50 }).notNull(), // logo, favicon, background, etc.
  assetUrl: text("asset_url").notNull(),
  assetName: text("asset_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  dimensions: jsonb("dimensions").$type<{ width: number; height: number }>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Custom Theme Configurations
export const themeConfigurations = pgTable("theme_configurations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().unique(),
  primaryColor: text("primary_color").default("#3b82f6").notNull(),
  secondaryColor: text("secondary_color").default("#64748b").notNull(),
  accentColor: text("accent_color").default("#10b981").notNull(),
  backgroundColor: text("background_color").default("#ffffff").notNull(),
  textColor: text("text_color").default("#1f2937").notNull(),
  sidebarColor: text("sidebar_color").default("#f8fafc").notNull(),
  customCSS: text("custom_css"),
  fontFamily: text("font_family").default("Inter").notNull(),
  borderRadius: text("border_radius").default("6px").notNull(),
  customVariables: jsonb("custom_variables").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Enterprise Integrations
export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  integrationType: varchar("integration_type", { length: 50 }).notNull(), // quickbooks, stripe, slack, etc.
  integrationName: text("integration_name").notNull(),
  configuration: jsonb("configuration").$type<Record<string, any>>().notNull(),
  credentials: jsonb("credentials").$type<Record<string, string>>().notNull(), // Encrypted
  isActive: boolean("is_active").default(true).notNull(),
  lastSync: timestamp("last_sync"),
  syncFrequency: varchar("sync_frequency", { length: 20 }).default("daily").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Webhook Configurations
export const webhooks = pgTable("webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: jsonb("events").$type<string[]>().notNull(), // user.created, task.completed, etc.
  secret: text("secret").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Advanced Analytics Settings
export const analyticsSettings = pgTable("analytics_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().unique(),
  googleAnalyticsId: text("google_analytics_id"),
  mixpanelToken: text("mixpanel_token"),
  customTrackingCode: text("custom_tracking_code"),
  dataRetentionDays: integer("data_retention_days").default(365).notNull(),
  exportFormats: jsonb("export_formats").$type<string[]>().default(["csv", "xlsx", "pdf"]).notNull(),
  scheduledReports: jsonb("scheduled_reports").$type<{
    frequency: string;
    recipients: string[];
    reportTypes: string[];
  }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Enterprise Schema exports for validation
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true });
export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandingAssetSchema = createInsertSchema(brandingAssets).omit({ id: true, createdAt: true });
export const insertThemeConfigurationSchema = createInsertSchema(themeConfigurations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true });
export const insertAnalyticsSettingsSchema = createInsertSchema(analyticsSettings).omit({ id: true, createdAt: true, updatedAt: true });

// Enterprise Types
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type SecuritySettings = typeof securitySettings.$inferSelect;
export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;
export type BrandingAsset = typeof brandingAssets.$inferSelect;
export type InsertBrandingAsset = z.infer<typeof insertBrandingAssetSchema>;
export type ThemeConfiguration = typeof themeConfigurations.$inferSelect;
export type InsertThemeConfiguration = z.infer<typeof insertThemeConfigurationSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type AnalyticsSettings = typeof analyticsSettings.$inferSelect;
export type InsertAnalyticsSettings = z.infer<typeof insertAnalyticsSettingsSchema>;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  role: varchar("role").notNull().default("user"), // owner, admin, manager, analyst, user
  permissions: jsonb("permissions").default({}), // Custom permissions object
  isTestAccount: boolean("is_test_account").default(false), // Safe testing flag
  canImpersonate: boolean("can_impersonate").default(false), // Role override capability
  department: varchar("department"),
  jobTitle: varchar("job_title"),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenants table for multi-tenant support
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").unique(),
  logoUrl: varchar("logo_url"),
  faviconUrl: varchar("favicon_url"),
  primaryColor: varchar("primary_color").default("#6366F1"),
  theme: varchar("theme").default("light"), // light, dark, auto
  navigationLayout: varchar("navigation_layout").default("sidebar"), // sidebar, topbar
  customDomain: varchar("custom_domain"),
  settings: jsonb("settings").default({}),
  enabledModules: jsonb("enabled_modules").default(["dashboard", "tasks", "fraud", "team"]),
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks/Cases table (customizable per tenant)
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("todo"), // todo, in_progress, review, done
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  assigneeId: varchar("assignee_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id).notNull(),
  dueDate: timestamp("due_date"),
  customFields: jsonb("custom_fields").default({}),
  tags: jsonb("tags").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fraud detection cases with AI capabilities
export const fraudCases = pgTable("fraud_cases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  transactionId: varchar("transaction_id"),
  amount: integer("amount"), // in cents
  currency: varchar("currency").default("USD"),
  riskScore: integer("risk_score"), // 0-100
  status: varchar("status").default("pending"), // pending, investigating, resolved, false_positive
  flags: jsonb("flags").default([]),
  assigneeId: varchar("assignee_id").references(() => users.id),
  notes: text("notes"),
  resolvedAt: timestamp("resolved_at"),
  // AI-powered fraud detection fields
  aiAnalysis: jsonb("ai_analysis"), // Claude analysis results
  detectionMethod: varchar("detection_method").default("manual"), // manual, rule_based, ai_pattern, ml_anomaly
  patternMatches: jsonb("pattern_matches"), // Detected patterns
  anomalyScore: integer("anomaly_score"), // 0-100 for anomaly detection
  customerProfile: jsonb("customer_profile"), // Customer behavior analysis
  transactionContext: jsonb("transaction_context"), // Transaction environment data
  confidenceLevel: integer("confidence_level"), // 0-100 AI confidence
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Pattern definitions for fraud detection
export const fraudPatterns = pgTable("fraud_patterns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patternName: varchar("pattern_name").notNull(),
  patternType: varchar("pattern_type").notNull(), // velocity, geographic, behavioral, device
  description: text("description"),
  riskLevel: varchar("risk_level").default("medium"), // low, medium, high, critical
  detectionRules: jsonb("detection_rules"),
  thresholds: jsonb("thresholds"),
  isActive: boolean("is_active").default(true),
  matchCount: integer("match_count").default(0),
  accuracy: integer("accuracy"), // 0-100
  lastMatchedAt: timestamp("last_matched_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction monitoring for real-time detection
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  transactionId: varchar("transaction_id").notNull(),
  userId: varchar("user_id"),
  amount: integer("amount"), // in cents
  currency: varchar("currency").default("USD"),
  transactionType: varchar("transaction_type"),
  merchantInfo: jsonb("merchant_info"),
  deviceInfo: jsonb("device_info"),
  locationInfo: jsonb("location_info"),
  riskScore: integer("risk_score").default(0), // 0-100
  isFlagged: boolean("is_flagged").default(false),
  flaggedReasons: jsonb("flagged_reasons").default([]),
  aiProcessed: boolean("ai_processed").default(false),
  processedAt: timestamp("processed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ML Model performance tracking
export const fraudModels = pgTable("fraud_models", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  modelName: varchar("model_name").notNull(),
  modelType: varchar("model_type").notNull(), // anomaly_detection, pattern_recognition, risk_scoring
  version: varchar("version").default("1.0"),
  accuracy: integer("accuracy"), // 0-100
  precision: integer("precision"), // 0-100
  recall: integer("recall"), // 0-100
  isActive: boolean("is_active").default(true),
  parameters: jsonb("parameters"),
  lastTrainedAt: timestamp("last_trained_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log for audit trail
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // created, updated, deleted, etc.
  entityType: varchar("entity_type").notNull(), // task, fraud_case, user, etc.
  entityId: varchar("entity_id"),
  details: jsonb("details").default({}),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// KPI metrics storage
export const kpiMetrics = pgTable("kpi_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  metricType: varchar("metric_type").notNull(), // revenue, tasks, fraud, users
  value: integer("value").notNull(),
  date: timestamp("date").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team invitations
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull(),
  token: varchar("token").notNull().unique(),
  invitedById: varchar("invited_by_id").references(() => users.id).notNull(),
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  tasks: many(tasks),
  fraudCases: many(fraudCases),
  fraudPatterns: many(fraudPatterns),
  transactions: many(transactions),
  fraudModels: many(fraudModels),
  activities: many(activities),
  kpiMetrics: many(kpiMetrics),
  invitations: many(invitations),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  assignedTasks: many(tasks, { relationName: "assignee" }),
  createdTasks: many(tasks, { relationName: "creator" }),
  assignedFraudCases: many(fraudCases),
  activities: many(activities),
}));

export const taskRelations = relations(tasks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tasks.tenantId],
    references: [tenants.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "creator",
  }),
}));

export const fraudCaseRelations = relations(fraudCases, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fraudCases.tenantId],
    references: [tenants.id],
  }),
  assignee: one(users, {
    fields: [fraudCases.assigneeId],
    references: [users.id],
  }),
}));

export const activityRelations = relations(activities, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activities.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudCaseSchema = createInsertSchema(fraudCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertKpiMetricSchema = createInsertSchema(kpiMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export const insertFraudPatternSchema = createInsertSchema(fraudPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertFraudModelSchema = createInsertSchema(fraudModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type FraudCase = typeof fraudCases.$inferSelect;
export type InsertFraudCase = z.infer<typeof insertFraudCaseSchema>;
export type FraudPattern = typeof fraudPatterns.$inferSelect;
export type InsertFraudPattern = z.infer<typeof insertFraudPatternSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type FraudModel = typeof fraudModels.$inferSelect;
export type InsertFraudModel = z.infer<typeof insertFraudModelSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;

// Accounting Integration tables
export const accountingConnections = pgTable("accounting_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  provider: varchar("provider").notNull(), // quickbooks, xero, etc
  connectionId: varchar("connection_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  companyId: varchar("company_id"),
  companyName: varchar("company_name"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accountingTransactions = pgTable("accounting_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  connectionId: uuid("connection_id").references(() => accountingConnections.id).notNull(),
  externalId: varchar("external_id").notNull(),
  type: varchar("type").notNull(), // income, expense, transfer
  category: varchar("category"),
  description: text("description"),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("USD"),
  date: timestamp("date").notNull(),
  account: varchar("account"),
  customerId: varchar("customer_id"),
  vendorId: varchar("vendor_id"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Management System
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type").notNull(),
  filePath: varchar("file_path").notNull(),
  category: varchar("category").default("general"), // receipt, permit, contract, report, etc
  entityType: varchar("entity_type"), // task, fraud_case, accounting_transaction
  entityId: uuid("entity_id"),
  ocrText: text("ocr_text"),
  ocrMetadata: jsonb("ocr_metadata").default({}),
  tags: jsonb("tags").default([]),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business Insights and AI Analysis
export const businessInsights = pgTable("business_insights", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  insightType: varchar("insight_type").notNull(), // profit_leak, trend_analysis, recommendation, alert
  severity: varchar("severity").default("medium"), // low, medium, high, critical
  category: varchar("category").notNull(), // accounting, fraud, operations, performance
  aiAnalysis: jsonb("ai_analysis").notNull(),
  dataPoints: jsonb("data_points").default({}),
  recommendations: jsonb("recommendations").default([]),
  estimatedImpact: integer("estimated_impact"), // monetary impact in cents
  status: varchar("status").default("active"), // active, resolved, dismissed
  resolvedById: varchar("resolved_by_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  isRecurring: boolean("is_recurring").default(false),
  nextCheckDate: timestamp("next_check_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit and Alert System
export const auditAlerts = pgTable("audit_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  alertType: varchar("alert_type").notNull(), // suspicious_spending, missing_data, duplicate_billing, late_payment
  title: varchar("title").notNull(),
  description: text("description"),
  severity: varchar("severity").default("medium"), // low, medium, high, critical
  status: varchar("status").default("pending"), // pending, investigating, resolved, dismissed
  relatedEntityType: varchar("related_entity_type"), // accounting_transaction, document, fraud_case
  relatedEntityId: uuid("related_entity_id"),
  aiConfidence: integer("ai_confidence"), // 0-100
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  resolvedById: varchar("resolved_by_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profit Leak Detection
export const profitLeaks = pgTable("profit_leaks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  leakType: varchar("leak_type").notNull(), // duplicate_billing, unused_subscription, missed_invoice, overpayment
  title: varchar("title").notNull(),
  description: text("description"),
  estimatedLoss: integer("estimated_loss").notNull(), // in cents
  currency: varchar("currency").default("USD"),
  frequency: varchar("frequency").default("one_time"), // one_time, monthly, yearly
  detectedAt: timestamp("detected_at").defaultNow(),
  status: varchar("status").default("open"), // open, investigating, resolved, false_positive
  resolution: text("resolution"),
  actualSavings: integer("actual_savings"), // in cents
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  resolvedById: varchar("resolved_by_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  relatedTransactionIds: jsonb("related_transaction_ids").default([]),
  aiAnalysis: jsonb("ai_analysis").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for new tables
export const insertAccountingConnectionSchema = createInsertSchema(accountingConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountingTransactionSchema = createInsertSchema(accountingTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessInsightSchema = createInsertSchema(businessInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditAlertSchema = createInsertSchema(auditAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfitLeakSchema = createInsertSchema(profitLeaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type InsertAccountingConnection = z.infer<typeof insertAccountingConnectionSchema>;
export type AccountingConnection = typeof accountingConnections.$inferSelect;
export type InsertAccountingTransaction = z.infer<typeof insertAccountingTransactionSchema>;
export type AccountingTransaction = typeof accountingTransactions.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertBusinessInsight = z.infer<typeof insertBusinessInsightSchema>;
export type BusinessInsight = typeof businessInsights.$inferSelect;
export type InsertAuditAlert = z.infer<typeof insertAuditAlertSchema>;
export type AuditAlert = typeof auditAlerts.$inferSelect;
export type InsertProfitLeak = z.infer<typeof insertProfitLeakSchema>;
export type ProfitLeak = typeof profitLeaks.$inferSelect;

// Performance Insights table
export const performanceInsights = pgTable("performance_insights", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  title: varchar("title").notNull(),
  category: varchar("category").notNull(), // 'financial', 'operational', 'team', 'risk', 'growth'
  priority: varchar("priority").notNull(), // 'high', 'medium', 'low'
  description: text("description").notNull(),
  impact: text("impact").notNull(),
  recommendation: text("recommendation").notNull(),
  actionItems: jsonb("action_items").default([]),
  estimatedImpact: varchar("estimated_impact"),
  timeframe: varchar("timeframe"),
  metrics: jsonb("metrics").default({}), // Store performance metrics as JSON
  status: varchar("status").notNull().default('active'), // 'active', 'implemented', 'dismissed'
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPerformanceInsightSchema = createInsertSchema(performanceInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PerformanceInsight = typeof performanceInsights.$inferSelect;
export type InsertPerformanceInsight = z.infer<typeof insertPerformanceInsightSchema>;

// Business change timeline tracking
export const businessChanges = pgTable("business_changes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  changeType: varchar("change_type").notNull(), // 'metric_shift', 'team_change', 'financial_event', 'operational_change'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  impactCategory: varchar("impact_category").notNull(), // 'financial', 'operational', 'team', 'customer'
  impactMagnitude: varchar("impact_magnitude").notNull(), // 'major', 'moderate', 'minor'
  metricAffected: varchar("metric_affected"), // Which KPI was affected
  previousValue: integer("previous_value"),
  newValue: integer("new_value"),
  changePercentage: integer("change_percentage"),
  relatedEvents: jsonb("related_events"), // Array of related business events
  detectedAt: timestamp("detected_at").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  aiAnalysis: text("ai_analysis"), // AI-generated explanation
  status: varchar("status").default('active'), // 'active', 'resolved', 'monitoring'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timeline events for business activity tracking
export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  eventType: varchar("event_type").notNull(), // 'hire', 'fire', 'subscription_change', 'invoice', 'payment', 'contract'
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'team', 'financial', 'operational', 'customer'
  entityType: varchar("entity_type"), // 'employee', 'invoice', 'subscription', 'contract'
  entityId: varchar("entity_id"), // Reference to related entity
  metadata: jsonb("metadata"), // Additional event-specific data
  impactScore: integer("impact_score").default(0), // 0-100 score of business impact
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusinessChangeSchema = createInsertSchema(businessChanges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
});

export type BusinessChange = typeof businessChanges.$inferSelect;
export type InsertBusinessChange = z.infer<typeof insertBusinessChangeSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
