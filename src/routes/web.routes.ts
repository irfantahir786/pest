import { Router, Request, Response } from 'express';

const router = Router();

// Home page - upload form
router.get('/', (req: Request, res: Response) => {
  res.render('index', { 
    title: 'Indian Motor Insurance Policy Extractor',
    result: null,
    error: null
  });
});

// Result page
router.post('/result', (req: Request, res: Response) => {
  // This route is called via AJAX, so we don't actually render here
  // The extraction happens via API
  res.redirect('/');
});

export default router;
