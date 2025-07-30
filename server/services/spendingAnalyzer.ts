import { z } from 'zod';

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'error';
  category: string;
  extractedData?: {
    vendor?: string;
    amount: number;
    date: string;
    description: string;
    category: string;
    paymentMethod?: string;
    lineItems?: Array<{
      description: string;
      amount: number;
    }>;
  };
}

export interface SpendingAnalytics {
  totalSpend: number;
  monthlySpend: number;
  previousMonthSpend: number;
  topVendors: Array<{
    vendor: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    change: number;
  }>;
  flaggedAnomalies: Array<{
    type: 'spike' | 'duplicate' | 'unusual' | 'recurring_increase';
    description: string;
    amount: number;
    vendor?: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
}

export class SpendingAnalyzerService {
  private documents: ParsedDocument[] = [];

  // Simulate realistic business spending data
  private generateSampleAnalytics(): SpendingAnalytics {
    return {
      totalSpend: 567890,
      monthlySpend: 47324,
      previousMonthSpend: 41230,
      topVendors: [
        { vendor: 'Office Depot', amount: 12450, percentage: 26.3, transactionCount: 8 },
        { vendor: 'AWS Services', amount: 8900, percentage: 18.8, transactionCount: 3 },
        { vendor: 'Slack Technologies', amount: 6780, percentage: 14.3, transactionCount: 1 },
        { vendor: 'Adobe Creative Suite', amount: 5200, percentage: 11.0, transactionCount: 1 },
        { vendor: 'FedEx', amount: 3940, percentage: 8.3, transactionCount: 15 },
        { vendor: 'Starbucks', amount: 2890, percentage: 6.1, transactionCount: 23 },
      ],
      categoryBreakdown: [
        { category: 'Office Supplies', amount: 15670, percentage: 33.1, change: 12.5 },
        { category: 'Software & SaaS', amount: 14880, percentage: 31.4, change: -2.1 },
        { category: 'Shipping & Logistics', amount: 6230, percentage: 13.2, change: 8.7 },
        { category: 'Travel & Meals', amount: 4890, percentage: 10.3, change: 145.2 },
        { category: 'Marketing', amount: 3450, percentage: 7.3, change: -15.4 },
        { category: 'Utilities', amount: 2204, percentage: 4.7, change: 3.2 },
      ],
      flaggedAnomalies: [
        {
          type: 'spike',
          description: 'Travel & Meals spending increased 145% this month',
          amount: 4890,
          vendor: 'Various',
          severity: 'high'
        },
        {
          type: 'duplicate',
          description: 'Potential duplicate payment to Adobe Creative Suite',
          amount: 1299,
          vendor: 'Adobe Creative Suite',
          severity: 'medium'
        },
        {
          type: 'unusual',
          description: 'Unusually high shipping costs compared to historical average',
          amount: 3940,
          vendor: 'FedEx',
          severity: 'medium'
        },
        {
          type: 'recurring_increase',
          description: 'AWS Services bill increased by 23% from last month',
          amount: 8900,
          vendor: 'AWS Services',
          severity: 'low'
        }
      ],
      monthlyTrend: [
        { month: 'Jul 2024', amount: 35600 },
        { month: 'Aug 2024', amount: 39200 },
        { month: 'Sep 2024', amount: 42100 },
        { month: 'Oct 2024', amount: 38900 },
        { month: 'Nov 2024', amount: 41230 },
        { month: 'Dec 2024', amount: 47324 },
      ]
    };
  }

  async uploadDocument(file: Express.Multer.File): Promise<ParsedDocument> {
    const document: ParsedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      category: this.categorizeDocument(file.originalname),
    };

    this.documents.push(document);

    // Simulate processing time
    setTimeout(() => {
      this.processDocument(document.id);
    }, 3000);

    return document;
  }

  private categorizeDocument(fileName: string): string {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('receipt') || lowerName.includes('purchase')) return 'receipt';
    if (lowerName.includes('invoice') || lowerName.includes('bill')) return 'invoice';
    if (lowerName.includes('statement') || lowerName.includes('bank')) return 'statement';
    if (lowerName.includes('credit') || lowerName.includes('card')) return 'credit_card';
    return 'general';
  }

  private async processDocument(documentId: string) {
    const document = this.documents.find(d => d.id === documentId);
    if (!document) return;

    try {
      // Simulate OCR/AI processing and data extraction
      const sampleExtractions = [
        {
          vendor: 'Office Depot',
          amount: 234.56,
          date: new Date().toISOString(),
          description: 'Office supplies - printer paper, pens, folders',
          category: 'Office Supplies',
          paymentMethod: 'Credit Card',
          lineItems: [
            { description: 'Printer Paper (5 reams)', amount: 45.99 },
            { description: 'Blue Pens (12 pack)', amount: 8.99 },
            { description: 'File Folders (50 pack)', amount: 12.99 },
            { description: 'Desk Organizer', amount: 24.99 },
            { description: 'Shipping', amount: 12.50 },
            { description: 'Tax', amount: 18.87 }
          ]
        },
        {
          vendor: 'AWS Services',
          amount: 2967.45,
          date: new Date().toISOString(),
          description: 'Cloud computing services - EC2, S3, RDS',
          category: 'Software & SaaS',
          paymentMethod: 'Auto Pay',
        },
        {
          vendor: 'FedEx',
          amount: 67.89,
          date: new Date().toISOString(),
          description: 'Express shipping to client',
          category: 'Shipping & Logistics',
          paymentMethod: 'Credit Card',
        },
        {
          vendor: 'Starbucks',
          amount: 12.45,
          date: new Date().toISOString(),
          description: 'Client meeting refreshments',
          category: 'Travel & Meals',
          paymentMethod: 'Credit Card',
        }
      ];

      // Randomly select one for demo
      const randomExtraction = sampleExtractions[Math.floor(Math.random() * sampleExtractions.length)];
      
      document.extractedData = randomExtraction;
      document.status = 'completed';
    } catch (error) {
      document.status = 'error';
    }
  }

  async getDocuments(): Promise<ParsedDocument[]> {
    return this.documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async getAnalytics(period: string, category?: string): Promise<SpendingAnalytics> {
    // In a real implementation, this would aggregate data from processed documents
    // and apply filters based on period and category
    const analytics = this.generateSampleAnalytics();
    
    // Apply category filter if specified
    if (category && category !== 'all') {
      analytics.categoryBreakdown = analytics.categoryBreakdown.filter(
        c => c.category.toLowerCase().includes(category.toLowerCase())
      );
      analytics.topVendors = analytics.topVendors.filter(
        v => this.getVendorCategory(v.vendor).toLowerCase().includes(category.toLowerCase())
      );
    }
    
    return analytics;
  }

  private getVendorCategory(vendor: string): string {
    const categoryMap: { [key: string]: string } = {
      'Office Depot': 'Office Supplies',
      'AWS Services': 'Software & SaaS',
      'Slack Technologies': 'Software & SaaS',
      'Adobe Creative Suite': 'Software & SaaS',
      'FedEx': 'Shipping & Logistics',
      'Starbucks': 'Travel & Meals',
    };
    return categoryMap[vendor] || 'Other';
  }

  async getDocument(documentId: string): Promise<ParsedDocument | null> {
    return this.documents.find(d => d.id === documentId) || null;
  }

  async searchDocuments(query: string, category?: string): Promise<ParsedDocument[]> {
    let filtered = this.documents;
    
    if (category && category !== 'all') {
      filtered = filtered.filter(d => d.category === category);
    }
    
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(d => 
        d.fileName.toLowerCase().includes(searchTerm) ||
        d.extractedData?.vendor?.toLowerCase().includes(searchTerm) ||
        d.extractedData?.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }

  // Financial leak detection algorithms
  async detectFinancialLeaks(tenantId: string): Promise<Array<{
    type: string;
    description: string;
    amount: number;
    confidence: number;
    recommendations: string[];
  }>> {
    // Simulate advanced financial analysis
    return [
      {
        type: 'Duplicate Subscriptions',
        description: 'Found multiple similar software subscriptions that could be consolidated',
        amount: 2580,
        confidence: 85,
        recommendations: [
          'Review Adobe and similar design software subscriptions',
          'Consider consolidating to a single enterprise plan',
          'Audit team usage to eliminate unused licenses'
        ]
      },
      {
        type: 'Vendor Price Increases',
        description: 'Several vendors have increased prices without notification',
        amount: 1240,
        confidence: 92,
        recommendations: [
          'Renegotiate contracts with high-increase vendors',
          'Consider alternative providers for price comparison',
          'Set up alerts for future price changes'
        ]
      }
    ];
  }
}

export const spendingAnalyzerService = new SpendingAnalyzerService();