import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { storage } from '../storage.js';
// Update the import path to the correct relative location if '@shared/schema' does not exist
import { accountingTransactions, profitLeaks } from '../../shared/schema.js';
import { eq, and, desc, gte, lte, count, sum } from 'drizzle-orm';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AccountingService {
  /**
   * Analyze accounting data for profit leaks using AI
   */
  async detectProfitLeaks(tenantId: string): Promise<any[]> {
    const transactions = await db.select()
      .from(accountingTransactions)
      .where(eq(accountingTransactions.tenantId, tenantId))
      .orderBy(desc(accountingTransactions.date))
      .limit(1000);

    if (transactions.length === 0) {
      return [];
    }

    const analysisPrompt = `
You are a financial analyst AI. Analyze these accounting transactions to identify potential profit leaks.

TRANSACTION DATA:
${transactions.map(t => 
  `Date: ${t.date}, Type: ${t.type}, Amount: $${(t.amount || 0) / 100}, Description: ${t.description}, Category: ${t.category}`
).join('\n')}

Look for these patterns:
1. Duplicate billing (same amount, vendor, date range)
2. Unused subscriptions (recurring payments with no corresponding activity)
3. Missed invoices (income gaps or irregular patterns)
4. Overpayments (amounts significantly higher than usual for same vendor)
5. Suspicious recurring charges

Return a JSON array of profit leaks found:
[
  {
    "leakType": "duplicate_billing|unused_subscription|missed_invoice|overpayment",
    "title": "Brief title",
    "description": "Detailed explanation",
    "estimatedLoss": 50000,
    "frequency": "one_time|monthly|yearly",
    "relatedTransactionIds": ["id1", "id2"],
    "confidence": 85
  }
]

Only return leaks you're confident about (>70% confidence).
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
        throw new Error('Unexpected response type from Claude');
      }

      const leaks = JSON.parse(content.text);
      
      // Store detected leaks in database
      const storedLeaks = [];
      for (const leak of leaks) {
        const stored = await storage.createProfitLeak({
          tenantId,
          leakType: leak.leakType,
          title: leak.title,
          description: leak.description,
          estimatedLoss: leak.estimatedLoss,
          frequency: leak.frequency,
          relatedTransactionIds: leak.relatedTransactionIds,
          aiAnalysis: {
            confidence: leak.confidence,
            detectionMethod: 'ai_pattern_analysis',
            analysisDate: new Date().toISOString()
          }
        });
        storedLeaks.push(stored);
      }

      return storedLeaks;
    } catch (error) {
      console.error('Error detecting profit leaks:', error);
      throw new Error('Failed to analyze transactions for profit leaks');
    }
  }

  /**
   * Generate business insights from accounting data
   */
  async generateBusinessInsights(tenantId: string): Promise<any[]> {
    const transactions = await db.select()
      .from(accountingTransactions)
      .where(eq(accountingTransactions.tenantId, tenantId))
      .orderBy(desc(accountingTransactions.date))
      .limit(500);

    if (transactions.length === 0) {
      return [];
    }

    const analysisPrompt = `
You are a business intelligence AI. Analyze these accounting transactions to generate actionable business insights.

TRANSACTION DATA:
${transactions.map(t => 
  `Date: ${t.date}, Type: ${t.type}, Amount: $${(t.amount || 0) / 100}, Description: ${t.description}, Category: ${t.category}`
).join('\n')}

Generate insights in these categories:
1. Trend Analysis - Revenue/expense trends, seasonal patterns
2. Performance Recommendations - Areas for improvement
3. Risk Alerts - Unusual spending patterns or financial risks
4. Profit Optimization - Ways to increase profitability

Return a JSON array of insights:
[
  {
    "title": "Insight title",
    "description": "Detailed explanation",
    "insightType": "trend_analysis|recommendation|alert|profit_optimization",
    "category": "accounting",
    "severity": "low|medium|high|critical",
    "estimatedImpact": 25000,
    "recommendations": ["Action 1", "Action 2"],
    "dataPoints": {"key": "value"},
    "confidence": 90
  }
]

Focus on actionable insights that can help improve business performance.
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const insights = JSON.parse(content.text);
      
      // Store insights in database
      const storedInsights = [];
      for (const insight of insights) {
        const stored = await storage.createBusinessInsight({
          tenantId,
          title: insight.title,
          description: insight.description,
          insightType: insight.insightType,
          category: insight.category,
          severity: insight.severity,
          estimatedImpact: insight.estimatedImpact,
          aiAnalysis: {
            confidence: insight.confidence,
            generatedAt: new Date().toISOString(),
            dataSource: 'accounting_transactions'
          },
          recommendations: insight.recommendations,
          dataPoints: insight.dataPoints
        });
        storedInsights.push(stored);
      }

      return storedInsights;
    } catch (error) {
      console.error('Error generating business insights:', error);
      throw new Error('Failed to generate business insights');
    }
  }

  /**
   * Generate plain-English financial summary
   */
  async generateFinancialSummary(tenantId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<string> {
    const startDate = this.getStartDate(period);
    
    const transactions = await db.select()
      .from(accountingTransactions)
      .where(and(
        eq(accountingTransactions.tenantId, tenantId),
        gte(accountingTransactions.date, startDate)
      ))
      .orderBy(desc(accountingTransactions.date));

    if (transactions.length === 0) {
      return `No financial data available for the selected ${period}.`;
    }

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const profit = income - expenses;

    const summaryPrompt = `
Create a plain-English financial summary for this ${period}:

FINANCIAL DATA:
- Total Income: $${income / 100}
- Total Expenses: $${expenses / 100}
- Net Profit: $${profit / 100}
- Transaction Count: ${transactions.length}

TOP INCOME SOURCES:
${this.getTopCategories(transactions.filter(t => t.type === 'income'))}

TOP EXPENSE CATEGORIES:
${this.getTopCategories(transactions.filter(t => t.type === 'expense'))}

Write a clear, conversational summary that:
1. Explains the financial performance in simple terms
2. Highlights key trends and patterns
3. Provides context about what the numbers mean
4. Suggests 2-3 actionable next steps

Keep it under 300 words and avoid financial jargon.
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: summaryPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return content.text;
    } catch (error) {
      console.error('Error generating financial summary:', error);
      throw new Error('Failed to generate financial summary');
    }
  }

  private getStartDate(period: 'month' | 'quarter' | 'year'): Date {
    const now = new Date();
    const start = new Date(now);
    
    switch (period) {
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  private getTopCategories(transactions: any[]): string {
    const categoryTotals = transactions.reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (t.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([category, amount]) => `- ${category}: $${(amount as number) / 100}`)
      .join('\n');
  }
}

export const accountingService = new AccountingService();