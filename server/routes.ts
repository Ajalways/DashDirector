import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
// REMOVED: import { setupAuth, isAuthenticated } from "./replitAuth.js";
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

  // REMOVED: await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // ...existing code...

  // For every route that looked like this:
  // app.get('/api/tenant', isAuthenticated, async (req: any, res) => {
  // It should now look like this:
  // app.get('/api/tenant', async (req: any, res) => {
  // (Just remove isAuthenticated from all routes)

  // Go through your file and remove `isAuthenticated,` from every route definition.
  // For example:
  // app.get('/api/tasks', isAuthenticated, async (req, res) => { ... })
  // becomes:
  // app.get('/api/tasks', async (req, res) => { ... })

  // Do this for ALL routes that had isAuthenticated as a parameter.

  // ...rest of your code remains unchanged...
}