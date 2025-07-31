import { pgTable, uuid, text, jsonb, timestamp, boolean, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// API Keys and Access Management
export const apiKeys = pgTable("api_keys", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(), // Hashed API key
    keyPrefix: text("key_prefix").notNull(), // First 8 chars for display
    permissions: jsonb("permissions").$type().default([]).notNull(),
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
    ipWhitelist: jsonb("ip_whitelist").$type().default([]),
    sessionTimeoutMinutes: integer("session_timeout_minutes").default(480).notNull(), // 8 hours
    passwordPolicy: jsonb("password_policy").$type().default({
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
    dimensions: jsonb("dimensions").$type(),
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
    customVariables: jsonb("custom_variables").$type().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Enterprise Integrations
export const integrations = pgTable("integrations", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    integrationType: varchar("integration_type", { length: 50 }).notNull(), // quickbooks, stripe, slack, etc.
    integrationName: text("integration_name").notNull(),
    configuration: jsonb("configuration").$type().notNull(),
    credentials: jsonb("credentials").$type().notNull(), // Encrypted
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
    events: jsonb("events").$type().notNull(), // user.created, task.completed, etc.
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
    exportFormats: jsonb("export_formats").$type().default(["csv", "xlsx", "pdf"]).notNull(),
    scheduledReports: jsonb("scheduled_reports").$type().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Schema exports for validation
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true });
export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandingAssetSchema = createInsertSchema(brandingAssets).omit({ id: true, createdAt: true });
export const insertThemeConfigurationSchema = createInsertSchema(themeConfigurations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true });
export const insertAnalyticsSettingsSchema = createInsertSchema(analyticsSettings).omit({ id: true, createdAt: true, updatedAt: true });