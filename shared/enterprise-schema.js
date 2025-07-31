"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAnalyticsSettingsSchema = exports.insertWebhookSchema = exports.insertIntegrationSchema = exports.insertThemeConfigurationSchema = exports.insertBrandingAssetSchema = exports.insertSecuritySettingsSchema = exports.insertApiKeySchema = exports.analyticsSettings = exports.webhooks = exports.integrations = exports.themeConfigurations = exports.brandingAssets = exports.securitySettings = exports.apiKeys = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// API Keys and Access Management
exports.apiKeys = (0, pg_core_1.pgTable)("api_keys", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    keyHash: (0, pg_core_1.text)("key_hash").notNull(), // Hashed API key
    keyPrefix: (0, pg_core_1.text)("key_prefix").notNull(), // First 8 chars for display
    permissions: (0, pg_core_1.jsonb)("permissions").$type().default([]).notNull(),
    lastUsed: (0, pg_core_1.timestamp)("last_used"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    rateLimitPerHour: (0, pg_core_1.integer)("rate_limit_per_hour").default(1000).notNull()
});
// Security Settings
exports.securitySettings = (0, pg_core_1.pgTable)("security_settings", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull().unique(),
    twoFactorRequired: (0, pg_core_1.boolean)("two_factor_required").default(false).notNull(),
    ipWhitelist: (0, pg_core_1.jsonb)("ip_whitelist").$type().default([]),
    sessionTimeoutMinutes: (0, pg_core_1.integer)("session_timeout_minutes").default(480).notNull(), // 8 hours
    passwordPolicy: (0, pg_core_1.jsonb)("password_policy").$type().default({
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
    }).notNull(),
    auditLogRetentionDays: (0, pg_core_1.integer)("audit_log_retention_days").default(90).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Enhanced Branding Options
exports.brandingAssets = (0, pg_core_1.pgTable)("branding_assets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    assetType: (0, pg_core_1.varchar)("asset_type", { length: 50 }).notNull(), // logo, favicon, background, etc.
    assetUrl: (0, pg_core_1.text)("asset_url").notNull(),
    assetName: (0, pg_core_1.text)("asset_name").notNull(),
    mimeType: (0, pg_core_1.text)("mime_type").notNull(),
    fileSize: (0, pg_core_1.integer)("file_size").notNull(),
    dimensions: (0, pg_core_1.jsonb)("dimensions").$type(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Custom Theme Configurations
exports.themeConfigurations = (0, pg_core_1.pgTable)("theme_configurations", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull().unique(),
    primaryColor: (0, pg_core_1.text)("primary_color").default("#3b82f6").notNull(),
    secondaryColor: (0, pg_core_1.text)("secondary_color").default("#64748b").notNull(),
    accentColor: (0, pg_core_1.text)("accent_color").default("#10b981").notNull(),
    backgroundColor: (0, pg_core_1.text)("background_color").default("#ffffff").notNull(),
    textColor: (0, pg_core_1.text)("text_color").default("#1f2937").notNull(),
    sidebarColor: (0, pg_core_1.text)("sidebar_color").default("#f8fafc").notNull(),
    customCSS: (0, pg_core_1.text)("custom_css"),
    fontFamily: (0, pg_core_1.text)("font_family").default("Inter").notNull(),
    borderRadius: (0, pg_core_1.text)("border_radius").default("6px").notNull(),
    customVariables: (0, pg_core_1.jsonb)("custom_variables").$type().default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Enterprise Integrations
exports.integrations = (0, pg_core_1.pgTable)("integrations", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    integrationType: (0, pg_core_1.varchar)("integration_type", { length: 50 }).notNull(), // quickbooks, stripe, slack, etc.
    integrationName: (0, pg_core_1.text)("integration_name").notNull(),
    configuration: (0, pg_core_1.jsonb)("configuration").$type().notNull(),
    credentials: (0, pg_core_1.jsonb)("credentials").$type().notNull(), // Encrypted
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    lastSync: (0, pg_core_1.timestamp)("last_sync"),
    syncFrequency: (0, pg_core_1.varchar)("sync_frequency", { length: 20 }).default("daily").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Webhook Configurations
exports.webhooks = (0, pg_core_1.pgTable)("webhooks", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    url: (0, pg_core_1.text)("url").notNull(),
    events: (0, pg_core_1.jsonb)("events").$type().notNull(), // user.created, task.completed, etc.
    secret: (0, pg_core_1.text)("secret").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    lastTriggered: (0, pg_core_1.timestamp)("last_triggered"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
// Advanced Analytics Settings
exports.analyticsSettings = (0, pg_core_1.pgTable)("analytics_settings", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull().unique(),
    googleAnalyticsId: (0, pg_core_1.text)("google_analytics_id"),
    mixpanelToken: (0, pg_core_1.text)("mixpanel_token"),
    customTrackingCode: (0, pg_core_1.text)("custom_tracking_code"),
    dataRetentionDays: (0, pg_core_1.integer)("data_retention_days").default(365).notNull(),
    exportFormats: (0, pg_core_1.jsonb)("export_formats").$type().default(["csv", "xlsx", "pdf"]).notNull(),
    scheduledReports: (0, pg_core_1.jsonb)("scheduled_reports").$type().default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull()
});
// Schema exports for validation
exports.insertApiKeySchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiKeys).omit({ id: true, createdAt: true });
exports.insertSecuritySettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.securitySettings).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertBrandingAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.brandingAssets).omit({ id: true, createdAt: true });
exports.insertThemeConfigurationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.themeConfigurations).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertIntegrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.integrations).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhooks).omit({ id: true, createdAt: true });
exports.insertAnalyticsSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.analyticsSettings).omit({ id: true, createdAt: true, updatedAt: true });
