import express from 'express';
import urlController from '../controllers/urlController.js';
import rateLimiter from '../middlewares/rateLimiter.js';

const router = express.Router();

// Root route - Web UI
router.get('/', urlController.renderHome);

// API routes
router.post('/shorten', rateLimiter(10), urlController.shortenUrl);
router.get('/stats/:code', urlController.getStats);

// Redirect route
router.get('/:code', urlController.redirectUrl);

export default router;