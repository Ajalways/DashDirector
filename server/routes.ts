import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated } from "./replitAuth.js";
import { insertTaskSchema, insertFraudCaseSchema, insertTenantSchema, insertFraudPatternSchema, insertTransactionSchema } from "../shared/schema.js";
import { fraudDetectionService } from "./services/fraudDetection.js";
import { accountingService } from "./services/accountingService.js";
import { documentService } from "./services/documentService.js";
import { auditService } from "./services/auditService.js";
import { performanceInsightsService } from "./services/performanceInsights.js";
import { financialAnalysisService } from "./services/financialAnalysis.js";
import { spendingAnalyzerService } from "./services/spendingAnalyzer.js";
import { businessRecommendationEngine } from "./services/businessRecommendationEngine.js";
import enterpriseRoutes from "./routes/enterpriseRoutes.js";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/x-icon'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, SVG, and ICO files are allowed.'));
    }
  }
});

// Separate multer config for financial documents
const financialUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'financial-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for financial documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, CSV, and Excel files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for load balancers
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Demo route - creates a temporary demo session
  app.get('/api/demo', async (req, res) => {
    try {
      // Create or get demo tenant
      let demoTenant = await storage.getTenantBySubdomain('demo');
      if (!demoTenant) {
        demoTenant = await storage.createTenant({
          name: 'PulseBoardAI Demo',
          subdomain: 'demo',
          logoUrl: null,
          faviconUrl: null,
          primaryColor: '#6366F1',
          theme: 'light',
          navigationLayout: 'sidebar',
          customDomain: null,
          settings: {},
          enabledModules: ["dashboard", "tasks", "fraud", "team", "accounting", "documents", "performance"],
          isDemo: true
        });
      }

      // Create demo user session
      const demoUser = {
        id: 'demo-user',
        email: 'demo@pulseboardai.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null,
        tenantId: demoTenant.id,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store demo user if doesn't exist
      await storage.upsertUser(demoUser);

      // Create basic sample data for demo tenant
      console.log('Demo tenant created:', demoTenant.id);

      // Create demo session manually
      (req.session as any).demo = true;
      (req.session as any).user = {
        claims: {
          sub: 'demo-user',
          email: 'demo@pulseboardai.com',
          first_name: 'Demo',
          last_name: 'User',
          profile_image_url: null
        }
      };

      res.redirect('/');
    } catch (error) {
      console.error('Error creating demo session:', error);
      res.status(500).json({ message: 'Failed to start demo' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for demo session first
      if ((req.session as any).demo && (req.session as any).user) {
        const userId = (req.session as any).user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }

      // Normal authenticated user
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tenant routes
  app.get('/api/tenant', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const tenant = await storage.getTenant(user.tenantId);
      res.json(tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  app.post('/api/tenant', isAuthenticated, async (req: any, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);
      
      // Update user with tenant ID
      await storage.upsertUser({
        id: req.user.claims.sub,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        tenantId: tenant.id,
        role: 'admin',
      });
      
      res.json(tenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: "Failed to create tenant" });
    }
  });

  app.put('/api/tenant/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.claims.sub);
      
      if (!user || user.tenantId !== id || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updates = insertTenantSchema.partial().parse(req.body);
      const tenant = await storage.updateTenant(id, updates);
      res.json(tenant);
    } catch (error) {
      console.error("Error updating tenant:", error);
      res.status(500).json({ message: "Failed to update tenant" });
    }
  });

  // File upload routes
  app.post('/api/upload/logo', isAuthenticated, upload.single('logo'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const logoUrl = `/uploads/${req.file.filename}`;
      await storage.updateTenant(user.tenantId, { logoUrl });
      
      res.json({ logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.post('/api/upload/favicon', isAuthenticated, upload.single('favicon'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const faviconUrl = `/uploads/${req.file.filename}`;
      await storage.updateTenant(user.tenantId, { faviconUrl });
      
      res.json({ faviconUrl });
    } catch (error) {
      console.error("Error uploading favicon:", error);
      res.status(500).json({ message: "Failed to upload favicon" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const tasks = await storage.getTasks(user.tenantId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
        createdById: user.id,
      });
      
      const task = await storage.createTask(taskData);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'created',
        entityType: 'task',
        entityId: task.id,
        details: { taskTitle: task.title },
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, user.tenantId, updates);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'updated',
        entityType: 'task',
        entityId: task.id,
        details: { changes: updates },
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      await storage.deleteTask(id, user.tenantId);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'deleted',
        entityType: 'task',
        entityId: id,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Advanced Fraud Detection Routes
  app.get('/api/fraud-cases', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const fraudCases = await storage.getFraudCases(user.tenantId);
      res.json(fraudCases);
    } catch (error) {
      console.error("Error fetching fraud cases:", error);
      res.status(500).json({ message: "Failed to fetch fraud cases" });
    }
  });

  app.post('/api/fraud-cases', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const fraudCaseData = insertFraudCaseSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
      });
      
      const fraudCase = await storage.createFraudCase(fraudCaseData);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'created',
        entityType: 'fraud_case',
        entityId: fraudCase.id,
        details: { transactionId: fraudCase.transactionId },
      });
      
      res.json(fraudCase);
    } catch (error) {
      console.error("Error creating fraud case:", error);
      res.status(500).json({ message: "Failed to create fraud case" });
    }
  });

  // AI-powered transaction analysis
  app.post('/api/fraud/analyze-transaction', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }

      const transactionData = req.body;
      const analysis = await fraudDetectionService.analyzeTransaction(user.tenantId, transactionData);

      // Auto-create fraud case if high risk
      if (analysis.riskScore > 70) {
        await fraudDetectionService.createFraudCase(
          user.tenantId,
          transactionData.transactionId,
          analysis,
          user.id
        );
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      res.status(500).json({ message: "Failed to analyze transaction" });
    }
  });

  // Fraud patterns management
  app.get('/api/fraud/patterns', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }

      const patterns = await storage.getFraudPatterns(user.tenantId);
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching fraud patterns:", error);
      res.status(500).json({ message: "Failed to fetch fraud patterns" });
    }
  });

  app.post('/api/fraud/patterns', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }

      const patternData = insertFraudPatternSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
      });

      const pattern = await storage.createFraudPattern(patternData);
      res.json(pattern);
    } catch (error) {
      console.error("Error creating fraud pattern:", error);
      res.status(500).json({ message: "Failed to create fraud pattern" });
    }
  });

  // Transaction monitoring
  app.get('/api/fraud/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }

      const { flagged } = req.query;
      const transactions = flagged === 'true' 
        ? await storage.getFlaggedTransactions(user.tenantId)
        : await storage.getTransactions(user.tenantId);
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/fraud/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }

      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        tenantId: user.tenantId,
      });

      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Fraud detection statistics
  app.get('/api/fraud/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }

      const { days = 30 } = req.query;
      const stats = await fraudDetectionService.getFraudStats(user.tenantId, Number(days));
      res.json(stats);
    } catch (error) {
      console.error("Error fetching fraud stats:", error);
      res.status(500).json({ message: "Failed to fetch fraud stats" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const activities = await storage.getActivities(user.tenantId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const stats = await storage.getTenantStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Employee Directory Routes
  app.get('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any)?.demo ? 'demo-user' : req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const employees = await storage.getEmployees(user.tenantId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any)?.demo ? 'demo-user' : req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const employeeData = {
        ...req.body,
        tenantId: user.tenantId,
        id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Team management routes
  app.get('/api/team', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const team = await storage.getTeamMembers(user.tenantId);
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post('/api/team/invite', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId || !['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { email, role } = req.body;
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const invitation = await storage.createInvitation({
        tenantId: user.tenantId,
        email,
        role,
        token,
        invitedById: user.id,
        expiresAt,
      });
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'invited',
        entityType: 'user',
        details: { email, role },
      });
      
      res.json({ success: true, token });
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  // Accounting Intelligence API routes
  app.get('/api/accounting/profit-leaks', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const leaks = await storage.getProfitLeaks(user.tenantId);
      res.json(leaks);
    } catch (error) {
      console.error("Error fetching profit leaks:", error);
      res.status(500).json({ message: "Failed to fetch profit leaks" });
    }
  });

  app.post('/api/accounting/detect-profit-leaks', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const leaks = await accountingService.detectProfitLeaks(user.tenantId);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'analyzed',
        entityType: 'accounting',
        details: { leaksFound: leaks.length },
      });
      
      res.json(leaks);
    } catch (error) {
      console.error("Error detecting profit leaks:", error);
      res.status(500).json({ message: "Failed to detect profit leaks" });
    }
  });

  app.get('/api/accounting/business-insights', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const insights = await storage.getBusinessInsights(user.tenantId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching business insights:", error);
      res.status(500).json({ message: "Failed to fetch business insights" });
    }
  });

  app.post('/api/accounting/generate-insights', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const insights = await accountingService.generateBusinessInsights(user.tenantId);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'generated',
        entityType: 'insights',
        details: { insightsGenerated: insights.length },
      });
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating business insights:", error);
      res.status(500).json({ message: "Failed to generate business insights" });
    }
  });

  app.get('/api/accounting/financial-summary', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const period = req.query.period as 'month' | 'quarter' | 'year' || 'month';
      const summary = await accountingService.generateFinancialSummary(user.tenantId, period);
      
      res.json({ summary });
    } catch (error) {
      console.error("Error generating financial summary:", error);
      res.status(500).json({ message: "Failed to generate financial summary" });
    }
  });

  // Document Management API routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const category = req.query.category as string;
      const documents = await storage.getDocuments(user.tenantId, category);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { category, entityType, entityId } = req.body;
      
      const document = await documentService.processDocument(
        user.tenantId,
        user.id,
        req.file,
        category,
        entityType,
        entityId
      );
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'uploaded',
        entityType: 'document',
        details: { fileName: req.file.originalname },
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/documents/search', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const query = req.query.q as string;
      const category = req.query.category as string;
      
      const documents = await documentService.searchDocuments(user.tenantId, query, category);
      res.json(documents);
    } catch (error) {
      console.error("Error searching documents:", error);
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  // Audit System API routes
  app.get('/api/audit/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const alerts = await storage.getAuditAlerts(user.tenantId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching audit alerts:", error);
      res.status(500).json({ message: "Failed to fetch audit alerts" });
    }
  });

  app.post('/api/audit/run-daily-audit', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const alerts = await auditService.runDailyAudit(user.tenantId);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'ran_audit',
        entityType: 'audit',
        details: { alertsGenerated: alerts.length },
      });
      
      res.json(alerts);
    } catch (error) {
      console.error("Error running daily audit:", error);
      res.status(500).json({ message: "Failed to run daily audit" });
    }
  });

  app.get('/api/audit/report', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const period = req.query.period as 'week' | 'month' | 'quarter' || 'month';
      const report = await auditService.generateAuditReport(user.tenantId, period);
      
      res.json({ report });
    } catch (error) {
      console.error("Error generating audit report:", error);
      res.status(500).json({ message: "Failed to generate audit report" });
    }
  });

  // Performance Insights API routes
  app.get('/api/performance/insights', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const category = req.query.category as string;
      const insights = await performanceInsightsService.getPerformanceInsights(user.tenantId, category);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching performance insights:", error);
      res.status(500).json({ message: "Failed to fetch performance insights" });
    }
  });

  app.post('/api/performance/generate-insights', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const insights = await performanceInsightsService.generatePerformanceInsights(user.tenantId);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'generated',
        entityType: 'performance_insights',
        details: { insightsGenerated: insights.length },
      });
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating performance insights:", error);
      res.status(500).json({ message: "Failed to generate performance insights" });
    }
  });

  app.get('/api/performance/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const metrics = await performanceInsightsService.getPerformanceMetrics(user.tenantId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.post('/api/performance/generate-report', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const report = await performanceInsightsService.generatePerformanceReport(user.tenantId);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'generated',
        entityType: 'performance_report',
        details: { reportGenerated: true },
      });
      
      res.json({ report });
    } catch (error) {
      console.error("Error generating performance report:", error);
      res.status(500).json({ message: "Failed to generate performance report" });
    }
  });

  // Business timeline routes
  app.get('/api/timeline/changes', isAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.user.claims.tenantId;
      const limit = parseInt(req.query.limit as string) || 50;
      const changes = await storage.getBusinessChanges(tenantId, limit);
      res.json(changes);
    } catch (error) {
      console.error('Error fetching business changes:', error);
      res.status(500).json({ message: 'Failed to fetch business changes' });
    }
  });

  app.get('/api/timeline/events', isAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.user.claims.tenantId;
      const limit = parseInt(req.query.limit as string) || 100;
      const events = await storage.getTimelineEvents(tenantId, limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      res.status(500).json({ message: 'Failed to fetch timeline events' });
    }
  });

  app.get('/api/timeline/comprehensive', isAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.user.claims.tenantId;
      const limit = parseInt(req.query.limit as string) || 50;
      const { timelineService } = await import('./services/timelineService.js');
      const timeline = await timelineService.getComprehensiveTimeline(tenantId, limit);
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching comprehensive timeline:', error);
      res.status(500).json({ message: 'Failed to fetch comprehensive timeline' });
    }
  });

  app.post('/api/timeline/detect-changes', isAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.user.claims.tenantId;
      const { timelineService } = await import('./services/timelineService.js');
      const changes = await timelineService.detectBusinessChanges(tenantId);
      res.json(changes);
    } catch (error) {
      console.error('Error detecting business changes:', error);
      res.status(500).json({ message: 'Failed to detect business changes' });
    }
  });

  // Seed timeline data for demonstration
  app.post('/api/timeline/seed-demo-data', isAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.user.claims.tenantId;
      const { seedTimelineData } = await import('./scripts/seedTimelineData.js');
      await seedTimelineData(tenantId);
      res.json({ message: 'Demo data seeded successfully' });
    } catch (error) {
      console.error('Error seeding demo data:', error);
      res.status(500).json({ message: 'Failed to seed demo data' });
    }
  });

  // Business Assistant routes
  app.post('/api/business-assistant/ask', isAuthenticated, async (req: any, res) => {
    try {
      const tenantId = req.user.claims.tenantId;
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: 'Question is required' });
      }

      const { businessAssistantService } = await import('./services/businessAssistantService.js');
      const response = await businessAssistantService.askQuestion(tenantId, question);
      
      res.json(response);
    } catch (error) {
      console.error('Error in business assistant:', error);
      res.status(500).json({ message: 'Failed to process business question' });
    }
  });

  // Owner/Admin routes
  app.post('/api/admin/create-owner-account', async (req, res) => {
    try {
      const { createOwnerTestAccount } = await import('./scripts/createOwnerAccount.js');
      const result = await createOwnerTestAccount();
      res.json(result);
    } catch (error) {
      console.error('Error creating owner account:', error);
      res.status(500).json({ message: 'Failed to create owner account' });
    }
  });

  // Role impersonation (owner only)
  app.post('/api/admin/impersonate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'owner' || !user.canImpersonate) {
        return res.status(403).json({ message: 'Insufficient permissions for impersonation' });
      }
      
      const { targetUserId, targetRole, targetTenantId } = req.body;
      
      // Store original identity and switch to target
      req.session.originalUser = req.user;
      req.session.impersonating = {
        targetUserId,
        targetRole,
        targetTenantId,
        startedAt: new Date()
      };
      
      res.json({ 
        message: 'Impersonation started',
        impersonating: req.session.impersonating 
      });
    } catch (error) {
      console.error('Error in impersonation:', error);
      res.status(500).json({ message: 'Failed to start impersonation' });
    }
  });

  app.post('/api/admin/stop-impersonation', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.session.originalUser || !req.session.impersonating) {
        return res.status(400).json({ message: 'No active impersonation session' });
      }
      
      // Restore original identity
      req.user = req.session.originalUser;
      delete req.session.originalUser;
      delete req.session.impersonating;
      
      res.json({ message: 'Impersonation stopped' });
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      res.status(500).json({ message: 'Failed to stop impersonation' });
    }
  });

  // Get current user with role info
  app.get('/api/auth/user-with-permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { getUserPermissions } = await import('./middleware/roleBasedAccess.js');
      const permissions = getUserPermissions(user.role, user.permissions);
      
      res.json({
        ...user,
        permissions,
        isImpersonating: !!req.session.impersonating,
        impersonationInfo: req.session.impersonating || null
      });
    } catch (error) {
      console.error('Error fetching user with permissions:', error);
      res.status(500).json({ message: 'Failed to fetch user information' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      domain: req.hostname,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Domain verification endpoint
  app.get('/api/domain-info', (req, res) => {
    res.json({
      hostname: req.hostname,
      protocol: req.protocol,
      fullUrl: `${req.protocol}://${req.get('host')}`,
      headers: {
        host: req.get('host'),
        origin: req.get('origin'),
        referer: req.get('referer')
      },
     
      customDomain: process.env.CUSTOM_DOMAIN,
      isCustomDomain: !req.hostname.includes('.replit.app')
    });
  });

  // Financial Analysis API routes
  app.get('/api/financial/documents', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const documents = await financialAnalysisService.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching financial documents:", error);
      res.status(500).json({ message: "Failed to fetch financial documents" });
    }
  });

  app.get('/api/financial/summary', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const period = req.query.period as string || 'current-month';
      const summary = await financialAnalysisService.getSummary(period);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  app.post('/api/financial/upload', isAuthenticated, financialUpload.single('file'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const document = await financialAnalysisService.uploadDocument(req.file);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'uploaded',
        entityType: 'financial_document',
        details: { fileName: req.file.originalname, documentType: 'financial-statement' },
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading financial document:", error);
      res.status(500).json({ message: "Failed to upload financial document" });
    }
  });

  app.get('/api/financial/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const { id } = req.params;
      const document = await financialAnalysisService.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching financial document:", error);
      res.status(500).json({ message: "Failed to fetch financial document" });
    }
  });

  // Spending Analyzer API routes
  app.get('/api/spending/documents', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const query = req.query.q as string;
      const category = req.query.category as string;
      
      let documents;
      if (query || category) {
        documents = await spendingAnalyzerService.searchDocuments(query, category);
      } else {
        documents = await spendingAnalyzerService.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching spending documents:", error);
      res.status(500).json({ message: "Failed to fetch spending documents" });
    }
  });

  app.get('/api/spending/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const period = req.query.period as string || 'current-month';
      const category = req.query.category as string;
      const analytics = await spendingAnalyzerService.getAnalytics(period, category);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching spending analytics:", error);
      res.status(500).json({ message: "Failed to fetch spending analytics" });
    }
  });

  app.post('/api/spending/upload', isAuthenticated, financialUpload.single('file'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const document = await spendingAnalyzerService.uploadDocument(req.file);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'uploaded',
        entityType: 'spending_document',
        details: { fileName: req.file.originalname, documentType: 'spending-analysis' },
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading spending document:", error);
      res.status(500).json({ message: "Failed to upload spending document" });
    }
  });

  app.get('/api/spending/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const { id } = req.params;
      const document = await spendingAnalyzerService.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching spending document:", error);
      res.status(500).json({ message: "Failed to fetch spending document" });
    }
  });

  // Business Recommendation Engine API routes
  app.get('/api/business/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const metrics = await businessRecommendationEngine.analyzeBusinessMetrics(user.tenantId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching business metrics:", error);
      res.status(500).json({ message: "Failed to fetch business metrics" });
    }
  });

  app.get('/api/business/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const type = req.query.type as string;
      const priority = req.query.priority as string;
      
      const metrics = await businessRecommendationEngine.analyzeBusinessMetrics(user.tenantId);
      let recommendations = await businessRecommendationEngine.generateRecommendations(metrics);
      
      // Apply filters
      if (type && type !== 'all') {
        recommendations = recommendations.filter(rec => rec.type === type);
      }
      if (priority && priority !== 'all') {
        recommendations = recommendations.filter(rec => rec.priority === priority);
      }
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating business recommendations:", error);
      res.status(500).json({ message: "Failed to generate business recommendations" });
    }
  });

  app.get('/api/business/insights', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const metrics = await businessRecommendationEngine.analyzeBusinessMetrics(user.tenantId);
      const insights = await businessRecommendationEngine.generateBusinessInsights(metrics);
      res.json(insights);
    } catch (error) {
      console.error("Error generating business insights:", error);
      res.status(500).json({ message: "Failed to generate business insights" });
    }
  });

  app.post('/api/business/generate-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.tenantId) {
        return res.status(404).json({ message: "No tenant found" });
      }
      
      const metrics = await businessRecommendationEngine.analyzeBusinessMetrics(user.tenantId);
      const recommendations = await businessRecommendationEngine.generateRecommendations(metrics);
      const insights = await businessRecommendationEngine.generateBusinessInsights(metrics);
      
      // Log activity
      await storage.createActivity({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'generated',
        entityType: 'ai_recommendations',
        details: { 
          recommendationCount: recommendations.length, 
          insightCount: insights.length,
          aiModel: 'claude-sonnet-4-20250514'
        },
      });
      
      res.json({ 
        success: true, 
        recommendationCount: recommendations.length,
        insightCount: insights.length
      });
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      res.status(500).json({ message: "Failed to generate AI analysis" });
    }
  });

  // Mount enterprise routes
  app.use('/api/enterprise', enterpriseRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
