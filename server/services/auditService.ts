import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { storage } from '../storage';
import { accountingTransactions, auditAlerts, activities } from '@shared/schema';
import { eq, and, desc, gte, count } from 'drizzle-orm';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AuditService {
  /**
   * Run daily audit checks for suspicious activity
   */
  async runDailyAudit(tenantId: string): Promise<any[]> {
    const alerts: any[] = [];

    // Check for suspicious spending patterns
    const suspiciousSpending = await this.detectSuspiciousSpending(tenantId);
    alerts.push(...suspiciousSpending);

    // Check for missing data
    const missingData = await this.detectMissingData(tenantId);
    alerts.push(...missingData);

    // Check for duplicate billing
    const duplicateBilling = await this.detectDuplicateBilling(tenantId);
    alerts.push(...duplicateBilling);

    // Check for late payments
    const latePayments = await this.detectLatePayments(tenantId);
    alerts.push(...latePayments);

    return alerts;
  }

  /**
   * Detect suspicious spending patterns using AI
   */
  private async detectSuspiciousSpending(tenantId: string): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await db.select()
      .from(accountingTransactions)
      .where(and(
        eq(accountingTransactions.tenantId, tenantId),
        gte(accountingTransactions.date, thirtyDaysAgo)
      ))
      .orderBy(desc(accountingTransactions.date));

    if (recentTransactions.length < 10) {
      return [];
    }

    const analysisPrompt = `
Analyze these recent transactions for suspicious spending patterns:

${recentTransactions.map(t => 
  `Date: ${t.date}, Amount: $${(t.amount || 0) / 100}, Description: ${t.description}, Category: ${t.category}, Vendor: ${t.vendorId || 'Unknown'}`
).join('\n')}

Look for:
1. Unusually large expenses compared to historical patterns
2. Off-hours or weekend transactions
3. Round number amounts that seem suspicious
4. New vendors with large initial transactions
5. Rapid-fire transactions that could indicate fraud

Return JSON array of suspicious patterns:
[
  {
    "alertType": "suspicious_spending",
    "title": "Alert title",
    "description": "Detailed explanation",
    "severity": "low|medium|high|critical",
    "aiConfidence": 85,
    "relatedTransactionIds": ["id1", "id2"]
  }
]

Only flag genuinely suspicious patterns (confidence > 70%).
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return [];
      }

      const suspiciousPatterns = JSON.parse(content.text);
      const alerts = [];

      for (const pattern of suspiciousPatterns) {
        const alert = await storage.createAuditAlert({
          tenantId,
          alertType: pattern.alertType,
          title: pattern.title,
          description: pattern.description,
          severity: pattern.severity,
          aiConfidence: pattern.aiConfidence,
          metadata: {
            relatedTransactionIds: pattern.relatedTransactionIds,
            detectionMethod: 'ai_pattern_analysis'
          }
        });
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error('Error detecting suspicious spending:', error);
      return [];
    }
  }

  /**
   * Detect missing data patterns
   */
  private async detectMissingData(tenantId: string): Promise<any[]> {
    const alerts = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check for gaps in transaction data
    const transactionCount = await db.select({ count: count() })
      .from(accountingTransactions)
      .where(and(
        eq(accountingTransactions.tenantId, tenantId),
        gte(accountingTransactions.date, thirtyDaysAgo)
      ));

    if (transactionCount[0]?.count < 5) {
      const alert = await storage.createAuditAlert({
        tenantId,
        alertType: 'missing_data',
        title: 'Low Transaction Volume',
        description: 'Very few transactions recorded in the last 30 days. This could indicate missing data or connectivity issues.',
        severity: 'medium',
        aiConfidence: 90,
        metadata: {
          transactionCount: transactionCount[0]?.count || 0,
          period: '30 days'
        }
      });
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Detect duplicate billing
   */
  private async detectDuplicateBilling(tenantId: string): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTransactions = await db.select()
      .from(accountingTransactions)
      .where(and(
        eq(accountingTransactions.tenantId, tenantId),
        gte(accountingTransactions.date, sevenDaysAgo)
      ));

    const alerts = [];
    const transactionGroups = new Map();

    // Group transactions by amount and vendor
    for (const transaction of recentTransactions) {
      const key = `${transaction.amount}-${transaction.vendorId || 'unknown'}`;
      if (!transactionGroups.has(key)) {
        transactionGroups.set(key, []);
      }
      transactionGroups.get(key).push(transaction);
    }

    // Check for duplicates
    for (const [key, transactions] of transactionGroups) {
      if (transactions.length > 1) {
        const [amount, vendor] = key.split('-');
        const alert = await storage.createAuditAlert({
          tenantId,
          alertType: 'duplicate_billing',
          title: 'Potential Duplicate Billing',
          description: `Found ${transactions.length} transactions of $${Number(amount) / 100} from vendor ${vendor} within 7 days.`,
          severity: 'medium',
          aiConfidence: 80,
          metadata: {
            transactionIds: transactions.map(t => t.id),
            amount: Number(amount),
            vendor
          }
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  /**
   * Detect late payments (simplified version)
   */
  private async detectLatePayments(tenantId: string): Promise<any[]> {
    // This would typically integrate with invoice/payment systems
    // For now, we'll create a placeholder implementation
    
    const alerts = [];
    
    // Example: Check for recurring expenses that might be overdue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recurringTransactions = await db.select()
      .from(accountingTransactions)
      .where(and(
        eq(accountingTransactions.tenantId, tenantId),
        eq(accountingTransactions.isRecurring, true)
      ));

    for (const transaction of recurringTransactions) {
      const lastOccurrence = new Date(transaction.date);
      const daysSince = Math.floor((Date.now() - lastOccurrence.getTime()) / (1000 * 60 * 60 * 24));
      
      // If it's been more than 35 days since a monthly recurring transaction
      if (transaction.recurringPattern === 'monthly' && daysSince > 35) {
        const alert = await storage.createAuditAlert({
          tenantId,
          alertType: 'late_payment',
          title: 'Potentially Overdue Payment',
          description: `Recurring payment to ${transaction.vendorId || 'vendor'} may be overdue. Last payment was ${daysSince} days ago.`,
          severity: 'medium',
          aiConfidence: 70,
          relatedEntityType: 'accounting_transaction',
          relatedEntityId: transaction.id,
          metadata: {
            daysSinceLastPayment: daysSince,
            expectedFrequency: transaction.recurringPattern
          }
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(tenantId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<string> {
    const startDate = this.getStartDate(period);
    
    const alerts = await storage.getAuditAlerts(tenantId, startDate);
    const activities = await storage.getActivities(tenantId, 100);

    const reportPrompt = `
Generate an audit report for the past ${period}:

ALERTS GENERATED:
${alerts.map(alert => 
  `- ${alert.alertType}: ${alert.title} (Severity: ${alert.severity}, Confidence: ${alert.aiConfidence}%)`
).join('\n')}

RECENT ACTIVITIES:
${activities.slice(0, 20).map(activity => 
  `- ${activity.action} ${activity.entityType} by ${activity.userId} on ${activity.createdAt}`
).join('\n')}

Create a comprehensive audit report that includes:
1. Executive summary of findings
2. Risk assessment and severity breakdown
3. Recommended actions
4. System health overview
5. Compliance status

Write in professional audit language but keep it accessible.
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: reportPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return content.text;
    } catch (error) {
      console.error('Error generating audit report:', error);
      throw new Error('Failed to generate audit report');
    }
  }

  private getStartDate(period: 'week' | 'month' | 'quarter'): Date {
    const now = new Date();
    const start = new Date(now);
    
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
    }
    
    return start;
  }
}

export const auditService = new AuditService();