import { db } from '../storage';
import { brandingAssets, themeConfigurations } from '../../shared/enterprise-schema.js';
import { eq, and } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class EnterpriseBrandingService {

  // Theme Management
  async getThemeConfiguration(tenantId: string) {
    const [theme] = await db.select()
      .from(themeConfigurations)
      .where(eq(themeConfigurations.tenantId, tenantId))
      .limit(1);

    if (!theme) {
      // Create default theme
      const [newTheme] = await db.insert(themeConfigurations)
        .values({ tenantId })
        .returning();
      return newTheme;
    }

    return theme;
  }

  async updateThemeConfiguration(tenantId: string, updates: Partial<typeof themeConfigurations.$inferInsert>) {
    await db.update(themeConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(themeConfigurations.tenantId, tenantId));
  }

  // Generate dynamic CSS based on theme
  generateCustomCSS(theme: typeof themeConfigurations.$inferSelect): string {
    return `
      :root {
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --accent: ${theme.accentColor};
        --background: ${theme.backgroundColor};
        --foreground: ${theme.textColor};
        --sidebar: ${theme.sidebarColor};
        --radius: ${theme.borderRadius};
        --font-family: ${theme.fontFamily}, sans-serif;
        
        ${Object.entries(theme.customVariables || {})
          .map(([key, value]) => `--${key}: ${value};`)
          .join('\n        ')}
      }

      body {
        font-family: var(--font-family);
        background-color: var(--background);
        color: var(--foreground);
      }

      .sidebar {
        background-color: var(--sidebar);
      }

      .btn-primary {
        background-color: var(--primary);
        border-radius: var(--radius);
      }

      .btn-secondary {
        background-color: var(--secondary);
        border-radius: var(--radius);
      }

      .accent {
        color: var(--accent);
      }

      ${theme.customCSS || ''}
    `;
  }

  // Branding Assets Management
  async uploadBrandingAsset(
    tenantId: string,
    assetType: string,
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }
  ) {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${tenantId}-${assetType}-${crypto.randomUUID()}${fileExtension}`;
    const uploadPath = path.join('uploads', 'branding', fileName);

    // Ensure directory exists
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });

    // Save file
    await fs.writeFile(uploadPath, file.buffer);

    // Get image dimensions if it's an image
    let dimensions = null;
    if (file.mimetype.startsWith('image/')) {
      // You could use a library like 'sharp' here to get actual dimensions
      dimensions = { width: 0, height: 0 }; // Placeholder
    }

    // Deactivate previous asset of same type
    await db.update(brandingAssets)
      .set({ isActive: false })
      .where(and(
        eq(brandingAssets.tenantId, tenantId),
        eq(brandingAssets.assetType, assetType)
      ));

    // Insert new asset
    const [asset] = await db.insert(brandingAssets).values({
      tenantId,
      assetType,
      assetUrl: `/uploads/branding/${fileName}`,
      assetName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      dimensions
    }).returning();

    return asset;
  }

  async getBrandingAssets(tenantId: string) {
    return await db.select()
      .from(brandingAssets)
      .where(and(
        eq(brandingAssets.tenantId, tenantId),
        eq(brandingAssets.isActive, true)
      ));
  }

  async deleteBrandingAsset(tenantId: string, assetId: string) {
    const [asset] = await db.select()
      .from(brandingAssets)
      .where(and(
        eq(brandingAssets.id, assetId),
        eq(brandingAssets.tenantId, tenantId)
      ))
      .limit(1);

    if (asset) {
      // Delete file from filesystem
      try {
        await fs.unlink(path.join('.', asset.assetUrl));
      } catch (error) {
        console.warn('Failed to delete asset file:', asset.assetUrl);
      }

      // Remove from database
      await db.update(brandingAssets)
        .set({ isActive: false })
        .where(eq(brandingAssets.id, assetId));
    }
  }

  // Presets for common branding themes
  getThemePresets() {
    return {
      corporate: {
        primaryColor: '#1e40af',
        secondaryColor: '#64748b',
        accentColor: '#059669',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        sidebarColor: '#f8fafc',
        fontFamily: 'Inter',
        borderRadius: '6px'
      },
      modern: {
        primaryColor: '#7c3aed',
        secondaryColor: '#6b7280',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        sidebarColor: '#f9fafb',
        fontFamily: 'Poppins',
        borderRadius: '12px'
      },
      minimal: {
        primaryColor: '#000000',
        secondaryColor: '#9ca3af',
        accentColor: '#ef4444',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        sidebarColor: '#fafafa',
        fontFamily: 'System UI',
        borderRadius: '2px'
      },
      dark: {
        primaryColor: '#3b82f6',
        secondaryColor: '#6b7280',
        accentColor: '#10b981',
        backgroundColor: '#111827',
        textColor: '#f9fafb',
        sidebarColor: '#1f2937',
        fontFamily: 'Inter',
        borderRadius: '8px'
      }
    };
  }

  // White-label domain configuration
  async configureDomain(tenantId: string, domain: string, settings: {
    ssl: boolean;
    redirectWww: boolean;
    customHeaders?: Record<string, string>;
  }) {
    // This would integrate with your DNS/domain management system
    // For now, we'll store the configuration
    await this.updateThemeConfiguration(tenantId, {
      customVariables: {
        'custom-domain': domain,
        'ssl-enabled': settings.ssl.toString(),
        'redirect-www': settings.redirectWww.toString()
      }
    });
  }
}

export const enterpriseBrandingService = new EnterpriseBrandingService();