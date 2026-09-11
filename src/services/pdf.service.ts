/**
 * PDF text extraction service
 * Extracts text from digitally generated PDFs
 */

import pdfParse from 'pdf-parse';
import { cleanPDFText } from '../utils/text.utils';

export interface PDFExtractionResult {
  text: string;
  pages: number;
  metadata: {
    info?: Record<string, unknown>;
    version?: string;
  };
}

export class PDFService {
  /**
   * Extract text from a PDF file
   */
  async extractText(filePath: string): Promise<PDFExtractionResult> {
    try {
      const dataBuffer = await this.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: cleanPDFText(data.text),
        pages: data.numpages,
        metadata: {
          info: data.info as Record<string, unknown> | undefined,
          version: data.version
        }
      };
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if PDF has extractable text
   */
  async hasExtractableText(filePath: string): Promise<boolean> {
    try {
      const result = await this.extractText(filePath);
      // Consider it has text if we got more than 50 characters
      return result.text.trim().length > 50;
    } catch {
      return false;
    }
  }

  /**
   * Read file as buffer
   */
  private async readFile(filePath: string): Promise<Buffer> {
    const fs = await import('fs');
    return fs.promises.readFile(filePath);
  }

  /**
   * Check if PDF is password protected
   */
  async isPasswordProtected(filePath: string): Promise<boolean> {
    try {
      const dataBuffer = await this.readFile(filePath);
      await pdfParse(dataBuffer);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        return true;
      }
      throw error;
    }
  }
}

export const pdfService = new PDFService();
