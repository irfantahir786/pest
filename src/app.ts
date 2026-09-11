import express, { Application, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import webRoutes from './routes/web.routes';
import extractionRoutes from './routes/extraction.routes';

export function createApp(): Application {
  const app = express();

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Static files
  app.use(express.static(path.join(__dirname, '../public')));

  // Routes
  app.use('/', webRoutes);
  app.use('/api', extractionRoutes);

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Not Found'
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: unknown) => {
    console.error('Error:', err.message);
    
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });

  return app;
}

export default createApp;
