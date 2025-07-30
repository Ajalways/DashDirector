import { z } from 'zod';

export interface FinancialDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  analysis?: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    categories: {
      category: string;
      amount: number;
      type: 'income' | 'expense';
    }[];
    insights: string[];
    trends: string[];
  };
}

export interface FinancialSummary {
  currentMonth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  previousMonth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  yearToDate: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topRevenueStreams: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export class FinancialAnalysisService {
  private documents: FinancialDocument[] = [];

  // Mock financial data for demonstration
  private generateSampleSummary(): FinancialSummary {
    return {
      currentMonth: {
        revenue: 125000,
        expenses: 85000,
        profit: 40000,
      },
      previousMonth: {
        revenue: 110000,
        expenses: 82000,
        profit: 28000,
      },
      yearToDate: {
        revenue: 1200000,
        expenses: 900000,
        profit: 300000,
      },
      topExpenseCategories: [
        { category: 'Payroll', amount: 45000, percentage: 53 },
        { category: 'Office Rent', amount: 12000, percentage: 14 },
        { category: 'Marketing', amount: 10000, percentage: 12 },
        { category: 'Utilities', amount: 8000, percentage: 9 },
        { category: 'Software & Tools', amount: 6000, percentage: 7 },
        { category: 'Other', amount: 4000, percentage: 5 },
      ],
      topRevenueStreams: [
        { category: 'SaaS Subscriptions', amount: 75000, percentage: 60 },
        { category: 'Professional Services', amount: 30000, percentage: 24 },
        { category: 'Training & Support', amount: 15000, percentage: 12 },
        { category: 'Add-on Features', amount: 5000, percentage: 4 },
      ],
    };
  }

  async uploadDocument(file: Express.Multer.File): Promise<FinancialDocument> {
    const document: FinancialDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
    };

    this.documents.push(document);

    // Simulate processing time
    setTimeout(() => {
      this.processDocument(document.id);
    }, 2000);

    return document;
  }

  private async processDocument(documentId: string) {
    const document = this.documents.find(d => d.id === documentId);
    if (!document) return;

    try {
      // Simulate AI processing and analysis
      document.analysis = {
        totalRevenue: 125000,
        totalExpenses: 85000,
        netIncome: 40000,
        profitMargin: 32,
        categories: [
          { category: 'Sales Revenue', amount: 125000, type: 'income' },
          { category: 'Payroll', amount: 45000, type: 'expense' },
          { category: 'Office Rent', amount: 12000, type: 'expense' },
          { category: 'Marketing', amount: 10000, type: 'expense' },
          { category: 'Utilities', amount: 8000, type: 'expense' },
          { category: 'Software & Tools', amount: 6000, type: 'expense' },
          { category: 'Other Expenses', amount: 4000, type: 'expense' },
        ],
        insights: [
          'Revenue increased by 13.6% compared to last month',
          'Payroll represents 53% of total expenses - consider optimization',
          'Marketing spend generated strong ROI based on revenue growth',
          'Profit margin improved from 25% to 32% month-over-month'
        ],
        trends: [
          'Consistent revenue growth over the past 3 months',
          'Operating expenses remain stable as percentage of revenue',
          'Cash flow positive with healthy profit margins'
        ]
      };

      document.status = 'completed';
    } catch (error) {
      document.status = 'error';
    }
  }

  async getDocuments(): Promise<FinancialDocument[]> {
    return this.documents;
  }

  async getSummary(period: string): Promise<FinancialSummary> {
    // In a real implementation, this would aggregate data from processed documents
    return this.generateSampleSummary();
  }

  async getDocument(documentId: string): Promise<FinancialDocument | null> {
    return this.documents.find(d => d.id === documentId) || null;
  }
}

export const financialAnalysisService = new FinancialAnalysisService();