const express = require('express');
const urlController = require('../controllers/urlController');
const rateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Root route - Web UI
router.get('/', urlController.renderHome);

// API routes
router.post('/shorten', rateLimiter(10), urlController.shortenUrl);
router.get('/stats/:code', urlController.getStats);

// Redirect route
router.get('/:code', urlController.redirectUrl);

module.exports = router;