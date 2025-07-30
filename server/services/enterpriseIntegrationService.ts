import { db } from '../storage';
import { integrations, webhooks } from '../../shared/enterprise-schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export class EnterpriseIntegrationService {

  // Integration Management
  async createIntegration(
    tenantId: string, 
    integrationType: string, 
    integrationName: string,
    configuration: Record<string, any>,
    credentials: Record<string, string>
  ) {
    // Encrypt sensitive credentials
    const encryptedCredentials = this.encryptCredentials(credentials);

    const [integration] = await db.insert(integrations).values({
      tenantId,
      integrationType,
      integrationName,
      configuration,
      credentials: encryptedCredentials
    }).returning();

    return integration;
  }

  async getIntegrations(tenantId: string) {
    const results = await db.select({
      id: integrations.id,
      integrationType: integrations.integrationType,
      integrationName: integrations.integrationName,
      configuration: integrations.configuration,
      isActive: integrations.isActive,
      lastSync: integrations.lastSync,
      syncFrequency: integrations.syncFrequency,
      createdAt: integrations.createdAt
    }).from(integrations)
      .where(eq(integrations.tenantId, tenantId));

    return results;
  }

  async updateIntegration(
    tenantId: string, 
    integrationId: string, 
    updates: Partial<typeof integrations.$inferInsert>
  ) {
    if (updates.credentials) {
      updates.credentials = this.encryptCredentials(updates.credentials);
    }

    await db.update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(integrations.id, integrationId),
        eq(integrations.tenantId, tenantId)
      ));
  }

  async deleteIntegration(tenantId: string, integrationId: string) {
    await db.update(integrations)
      .set({ isActive: false })
      .where(and(
        eq(integrations.id, integrationId),
        eq(integrations.tenantId, tenantId)
      ));
  }

  // Webhook Management
  async createWebhook(
    tenantId: string,
    name: string,
    url: string,
    events: string[]
  ) {
    const secret = crypto.randomBytes(32).toString('hex');

    const [webhook] = await db.insert(webhooks).values({
      tenantId,
      name,
      url,
      events,
      secret
    }).returning();

    return webhook;
  }

  async getWebhooks(tenantId: string) {
    return await db.select({
      id: webhooks.id,
      name: webhooks.name,
      url: webhooks.url,
      events: webhooks.events,
      isActive: webhooks.isActive,
      lastTriggered: webhooks.lastTriggered,
      createdAt: webhooks.createdAt
    }).from(webhooks)
      .where(eq(webhooks.tenantId, tenantId));
  }

  async triggerWebhook(tenantId: string, event: string, data: any) {
    const activeWebhooks = await db.select()
      .from(webhooks)
      .where(and(
        eq(webhooks.tenantId, tenantId),
        eq(webhooks.isActive, true)
      ));

    const relevantWebhooks = activeWebhooks.filter(webhook => 
      webhook.events.includes(event) || webhook.events.includes('*')
    );

    const promises = relevantWebhooks.map(webhook => 
      this.sendWebhookPayload(webhook, event, data)
    );

    return Promise.allSettled(promises);
  }

  private async sendWebhookPayload(webhook: any, event: string, data: any) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook_id: webhook.id
    };

    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'User-Agent': 'PulseBoardAI-Webhooks/1.0'
        },
        body: JSON.stringify(payload)
      });

      // Update last triggered timestamp
      await db.update(webhooks)
        .set({ lastTriggered: new Date() })
        .where(eq(webhooks.id, webhook.id));

      return { success: true, status: response.status };
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Data Export Service
  async exportData(tenantId: string, format: 'csv' | 'xlsx' | 'json', options: {
    tables?: string[];
    dateRange?: { start: Date; end: Date };
    filters?: Record<string, any>;
  }) {
    // This would implement data export functionality
    // For now, return a placeholder
    return {
      exportId: crypto.randomUUID(),
      format,
      status: 'processing',
      downloadUrl: null,
      createdAt: new Date()
    };
  }

  // Third-party Integration Templates
  getIntegrationTemplates() {
    return {
      quickbooks: {
        name: 'QuickBooks Online',
        type: 'accounting',
        description: 'Sync financial data from QuickBooks',
        requiredCredentials: ['client_id', 'client_secret', 'access_token'],
        configuration: {
          syncFrequency: 'daily',
          syncTables: ['transactions', 'customers', 'vendors'],
          autoMatch: true
        }
      },
      stripe: {
        name: 'Stripe',
        type: 'payment',
        description: 'Import payment and subscription data',
        requiredCredentials: ['secret_key'],
        configuration: {
          syncFrequency: 'hourly',
          webhookEvents: ['payment_intent.succeeded', 'subscription.created'],
          includeFees: true
        }
      },
      slack: {
        name: 'Slack',
        type: 'communication',
        description: 'Send notifications to Slack channels',
        requiredCredentials: ['bot_token', 'webhook_url'],
        configuration: {
          defaultChannel: '#alerts',
          notificationTypes: ['fraud_detected', 'task_completed', 'anomaly_detected']
        }
      },
      salesforce: {
        name: 'Salesforce',
        type: 'crm',
        description: 'Sync customer and opportunity data',
        requiredCredentials: ['client_id', 'client_secret', 'username', 'password'],
        configuration: {
          syncFrequency: 'daily',
          objectTypes: ['Account', 'Opportunity', 'Contact'],
          customFields: []
        }
      }
    };
  }

  // Credential Encryption/Decryption
  private encryptCredentials(credentials: Record<string, string>): Record<string, string> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    
    const encrypted: Record<string, string> = {};
    
    for (const [key_name, value] of Object.entries(credentials)) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, key);
      
      let encryptedValue = cipher.update(value, 'utf8', 'hex');
      encryptedValue += cipher.final('hex');
      
      encrypted[key_name] = `${iv.toString('hex')}:${encryptedValue}`;
    }
    
    return encrypted;
  }

  private decryptCredentials(encryptedCredentials: Record<string, string>): Record<string, string> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    
    const decrypted: Record<string, string> = {};
    
    for (const [key_name, encryptedValue] of Object.entries(encryptedCredentials)) {
      const [ivHex, encrypted] = encryptedValue.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipher(algorithm, key);
      
      let decryptedValue = decipher.update(encrypted, 'hex', 'utf8');
      decryptedValue += decipher.final('utf8');
      
      decrypted[key_name] = decryptedValue;
    }
    
    return decrypted;
  }
}

export const enterpriseIntegrationService = new EnterpriseIntegrationService();