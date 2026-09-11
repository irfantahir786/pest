import { Request, Response } from 'express';
import { extractionService } from '../services/extraction.service';

export class ExtractionController {
  async extract(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded. Please upload a PDF or image file.'
        });
        return;
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(mimeType)) {
        res.status(400).json({
          success: false,
          error: `Unsupported file type: ${mimeType}. Allowed types: PDF, JPG, JPEG, PNG`
        });
        return;
      }

      // Perform extraction
      const result = await extractionService.extract(filePath, mimeType);

      res.json({
        success: true,
        data: {
          document: result.document,
          extraction: result.extraction
        },
        rawText: result.rawText
      });
    } catch (error) {
      console.error('Extraction error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }
}

export const extractionController = new ExtractionController();
