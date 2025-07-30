import { Router } from 'express';
import { enterpriseSecurityService } from '../services/enterpriseSecurityService';
import { enterpriseBrandingService } from '../services/enterpriseBrandingService';
import { enterpriseIntegrationService } from '../services/enterpriseIntegrationService';
import { isAuthenticated } from '../replitAuth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check if user has admin permissions
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// API Key Middleware for external access
const apiKeyAuth = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const validation = await enterpriseSecurityService.validateApiKey(apiKey);
  if (!validation) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Check rate limiting
  const rateLimit = await enterpriseSecurityService.checkRateLimit(apiKey, 1000);
  if (!rateLimit.allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      resetTime: rateLimit.resetTime 
    });
  }

  req.apiAuth = validation;
  next();
};

// Security Routes
router.get('/security', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const settings = await enterpriseSecurityService.getSecuritySettings(req.user.tenantId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security settings' });
  }
});

router.put('/security', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    await enterpriseSecurityService.updateSecuritySettings(req.user.tenantId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// API Key Management
router.get('/api-keys', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const keys = await enterpriseSecurityService.listApiKeys(req.user.tenantId);
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

router.post('/api-keys', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { name, permissions } = req.body;
    const apiKey = await enterpriseSecurityService.generateApiKey(
      req.user.tenantId, 
      name, 
      permissions
    );
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.delete('/api-keys/:keyId', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    await enterpriseSecurityService.revokeApiKey(req.params.keyId, req.user.tenantId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Theme and Branding Routes
router.get('/theme', isAuthenticated, async (req: any, res) => {
  try {
    const theme = await enterpriseBrandingService.getThemeConfiguration(req.user.tenantId);
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch theme configuration' });
  }
});

router.put('/theme', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    await enterpriseBrandingService.updateThemeConfiguration(req.user.tenantId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update theme configuration' });
  }
});

router.get('/theme/css', async (req: any, res) => {
  try {
    const tenantId = req.query.tenant || req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }
    
    const theme = await enterpriseBrandingService.getThemeConfiguration(tenantId);
    const css = enterpriseBrandingService.generateCustomCSS(theme);
    
    res.setHeader('Content-Type', 'text/css');
    res.send(css);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CSS' });
  }
});

router.get('/branding/assets', isAuthenticated, async (req: any, res) => {
  try {
    const assets = await enterpriseBrandingService.getBrandingAssets(req.user.tenantId);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branding assets' });
  }
});

router.post('/branding/assets', isAuthenticated, requireAdmin, upload.single('asset'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const asset = await enterpriseBrandingService.uploadBrandingAsset(
      req.user.tenantId,
      req.body.assetType,
      req.file
    );
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Integration Routes
router.get('/integrations', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const integrations = await enterpriseIntegrationService.getIntegrations(req.user.tenantId);
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

router.post('/integrations', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { integrationType, integrationName, configuration, credentials } = req.body;
    
    const integration = await enterpriseIntegrationService.createIntegration(
      req.user.tenantId,
      integrationType,
      integrationName,
      configuration,
      credentials
    );
    
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

router.get('/integrations/templates', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const templates = enterpriseIntegrationService.getIntegrationTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integration templates' });
  }
});

// Webhook Routes
router.get('/webhooks', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const webhooks = await enterpriseIntegrationService.getWebhooks(req.user.tenantId);
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

router.post('/webhooks', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { name, url, events } = req.body;
    
    const webhook = await enterpriseIntegrationService.createWebhook(
      req.user.tenantId,
      name,
      url,
      events
    );
    
    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Data Export Routes
router.post('/export', isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { format, options } = req.body;
    
    const exportJob = await enterpriseIntegrationService.exportData(
      req.user.tenantId,
      format,
      options
    );
    
    res.json(exportJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start export' });
  }
});

// Public API Routes (with API key authentication)
router.get('/api/v1/data', apiKeyAuth, async (req: any, res) => {
  try {
    // Example API endpoint for external access
    res.json({ 
      message: 'Data endpoint',
      tenant: req.apiAuth.tenantId,
      permissions: req.apiAuth.permissions
    });
  } catch (error) {
    res.status(500).json({ error: 'API error' });
  }
});

export default router;