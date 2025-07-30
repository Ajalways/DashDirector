import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../storage';
import { apiKeys, securitySettings } from '../../shared/enterprise-schema.js';
import { eq, and, desc } from 'drizzle-orm';

export class EnterpriseSecurityService {
  
  // API Key Management
  async generateApiKey(tenantId: string, name: string, permissions: string[] = []) {
    // Generate a secure API key
    const keyBytes = crypto.randomBytes(32);
    const apiKey = `pk_${Buffer.from(keyBytes).toString('base64url')}`;
    const keyHash = await bcrypt.hash(apiKey, 12);
    const keyPrefix = apiKey.substring(0, 12) + '...';

    const [insertedKey] = await db.insert(apiKeys).values({
      tenantId,
      name,
      keyHash,
      keyPrefix,
      permissions,
      rateLimitPerHour: 1000
    }).returning();

    return {
      id: insertedKey.id,
      apiKey, // Only returned once
      keyPrefix: insertedKey.keyPrefix,
      permissions: insertedKey.permissions,
      rateLimitPerHour: insertedKey.rateLimitPerHour
    };
  }

  async validateApiKey(apiKey: string): Promise<{ tenantId: string; permissions: string[] } | null> {
    if (!apiKey.startsWith('pk_')) {
      return null;
    }

    const keys = await db.select().from(apiKeys).where(eq(apiKeys.isActive, true));
    
    for (const key of keys) {
      const isValid = await bcrypt.compare(apiKey, key.keyHash);
      if (isValid) {
        // Update last used timestamp
        await db.update(apiKeys)
          .set({ lastUsed: new Date() })
          .where(eq(apiKeys.id, key.id));

        return {
          tenantId: key.tenantId,
          permissions: key.permissions
        };
      }
    }

    return null;
  }

  async revokeApiKey(keyId: string, tenantId: string) {
    await db.update(apiKeys)
      .set({ isActive: false })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.tenantId, tenantId)));
  }

  async listApiKeys(tenantId: string) {
    return await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      permissions: apiKeys.permissions,
      lastUsed: apiKeys.lastUsed,
      createdAt: apiKeys.createdAt,
      isActive: apiKeys.isActive,
      rateLimitPerHour: apiKeys.rateLimitPerHour
    }).from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId))
      .orderBy(desc(apiKeys.createdAt));
  }

  // Security Settings Management
  async getSecuritySettings(tenantId: string) {
    const [settings] = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.tenantId, tenantId))
      .limit(1);

    if (!settings) {
      // Create default security settings
      const [newSettings] = await db.insert(securitySettings)
        .values({ tenantId })
        .returning();
      return newSettings;
    }

    return settings;
  }

  async updateSecuritySettings(tenantId: string, updates: Partial<typeof securitySettings.$inferInsert>) {
    await db.update(securitySettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(securitySettings.tenantId, tenantId));
  }

  // IP Whitelist Validation
  async isIpAllowed(tenantId: string, clientIp: string): Promise<boolean> {
    const settings = await this.getSecuritySettings(tenantId);
    
    if (!settings.ipWhitelist || settings.ipWhitelist.length === 0) {
      return true; // No whitelist means all IPs allowed
    }

    return settings.ipWhitelist.includes(clientIp);
  }

  // Password Policy Validation
  validatePassword(password: string, policy: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Audit Logging
  async logSecurityEvent(tenantId: string, event: {
    type: string;
    userId?: string;
    ip: string;
    userAgent: string;
    details: Record<string, any>;
  }) {
    // This would integrate with your existing audit service
    console.log(`Security Event [${tenantId}]:`, event);
  }

  // Rate Limiting
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  async checkRateLimit(apiKeyId: string, limit: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000); // Hour window
    const key = `${apiKeyId}:${windowStart}`;
    
    const current = this.rateLimitStore.get(key) || { count: 0, resetTime: windowStart + (60 * 60 * 1000) };
    
    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = windowStart + (60 * 60 * 1000);
    }
    
    const allowed = current.count < limit;
    if (allowed) {
      current.count++;
      this.rateLimitStore.set(key, current);
    }
    
    return {
      allowed,
      remaining: Math.max(0, limit - current.count),
      resetTime: current.resetTime
    };
  }
}

export const enterpriseSecurityService = new EnterpriseSecurityService();