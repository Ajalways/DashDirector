import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class DocumentService {
  /**
   * Process uploaded document with OCR and AI analysis
   */
  async processDocument(
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
    category: string = 'general',
    entityType?: string,
    entityId?: string
  ) {
    try {
      // Store document metadata
      const document = await storage.createDocument({
        tenantId,
        uploadedById: userId,
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: file.path,
        category,
        entityType,
        entityId,
      });

      // Process document with AI if it's an image or PDF
      if (this.isProcessableFile(file.mimetype)) {
        const analysisResult = await this.analyzeDocument(file.path, file.mimetype);
        
        // Update document with OCR results
        await storage.updateDocument(document.id, tenantId, {
          ocrText: analysisResult.text,
          ocrMetadata: analysisResult.metadata,
        });

        return {
          ...document,
          ocrText: analysisResult.text,
          ocrMetadata: analysisResult.metadata,
        };
      }

      return document;
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  /**
   * Analyze document content using AI
   */
  private async analyzeDocument(filePath: string, mimeType: string) {
    try {
      // Read file as base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      const analysisPrompt = `
Analyze this document and extract all relevant information. Focus on:

1. Document type and purpose
2. Key financial information (amounts, dates, vendors)
3. Important dates and deadlines
4. Action items or requirements
5. Contact information
6. Any other structured data

Return the response as JSON:
{
  "documentType": "receipt|invoice|contract|permit|report|other",
  "text": "Full text content extracted",
  "keyInformation": {
    "amounts": ["$100.00"],
    "dates": ["2024-01-15"],
    "vendors": ["Company Name"],
    "categories": ["office supplies"]
  },
  "actionItems": ["Pay by March 1st"],
  "confidence": 95
}
`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: this.getClaudeMediaType(mimeType),
                data: base64Data
              }
            }
          ]
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const analysis = JSON.parse(content.text);
      
      return {
        text: analysis.text,
        metadata: {
          documentType: analysis.documentType,
          keyInformation: analysis.keyInformation,
          actionItems: analysis.actionItems,
          confidence: analysis.confidence,
          analyzedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      return {
        text: '',
        metadata: {
          error: 'Failed to analyze document',
          analyzedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Search documents by content or metadata
   */
  async searchDocuments(tenantId: string, query: string, category?: string) {
    const documents = await storage.getDocuments(tenantId, category);
    
    if (!query.trim()) {
      return documents;
    }

    // Simple text search in OCR content and metadata
    const searchTerms = query.toLowerCase().split(' ');
    
    return documents.filter(doc => {
      const searchableText = [
        doc.originalName,
        doc.ocrText || '',
        JSON.stringify(doc.ocrMetadata || {}),
        (doc.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  /**
   * Get document insights using AI
   */
  async getDocumentInsights(tenantId: string, documentId: string) {
    const document = await storage.getDocument(documentId, tenantId);
    
    if (!document || !document.ocrText) {
      throw new Error('Document not found or not processed');
    }

    const insightPrompt = `
Analyze this document and provide business insights:

DOCUMENT: ${document.originalName}
CATEGORY: ${document.category}
CONTENT: ${document.ocrText}

Provide insights about:
1. Financial implications
2. Compliance requirements
3. Action items and deadlines
4. Related business processes
5. Potential risks or opportunities

Return as JSON:
{
  "summary": "Brief overview",
  "insights": [
    {
      "type": "financial|compliance|operational|risk",
      "title": "Insight title",
      "description": "Detailed explanation",
      "priority": "low|medium|high",
      "actionRequired": true/false
    }
  ],
  "recommendations": ["Action 1", "Action 2"]
}
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: insightPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return JSON.parse(content.text);
    } catch (error) {
      console.error('Error generating document insights:', error);
      throw new Error('Failed to generate document insights');
    }
  }

  private isProcessableFile(mimeType: string): boolean {
    const processableTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    return processableTypes.includes(mimeType);
  }

  private getClaudeMediaType(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'image/jpeg';
      case 'image/png':
        return 'image/png';
      case 'image/webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }
}

export const documentService = new DocumentService();