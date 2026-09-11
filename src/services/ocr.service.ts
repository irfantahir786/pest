import Tesseract from 'tesseract.js';
import * as fs from 'fs';

export interface OCRResult {
  text: string;
  confidence: number;
  pages: number;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker();
      await this.worker.reinitialize('eng');
    }
  }

  async extractTextFromImage(imagePath: string): Promise<OCRResult> {
    try {
      await this.initialize();
      
      const result = await this.worker!.recognize(imagePath);
      
      return {
        text: result.data.text,
        confidence: result.data.confidence / 100,
        pages: 1
      };
    } catch (error) {
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextFromPDF(pdfPath: string): Promise<OCRResult> {
    return {
      text: '',
      confidence: 0,
      pages: 1
    };
  }

  async processFile(filePath: string, mimeType: string): Promise<OCRResult> {
    if (mimeType.startsWith('image/')) {
      return this.extractTextFromImage(filePath);
    } else if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
