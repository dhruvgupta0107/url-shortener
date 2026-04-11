import urlService from '../services/urlService.js';
import Url from '../models/Url.js';
import { redisClient } from '../config/redis.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urlController = {
  async shortenUrl(req, res) {
    try {
      const { url, customCode } = req.body;
      if (!url) return res.status(400).json({ error: 'URL is required' });
      const shortUrl = await urlService.shortenUrl(url, customCode);
      res.json({ success: true, shortUrl, originalUrl: url });
    } catch (error) {
      if (error.message.includes('already in use')) return res.status(409).json({ error: error.message });
      if (error.message.includes('Invalid') || error.message.includes('max 50')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async redirectUrl(req, res) {
    try {
      const { code } = req.params;
      if (!code) return res.status(400).json({ error: 'Short code is required' });
      const originalUrl = await urlService.getOriginalUrl(code);
      res.redirect(originalUrl);
    } catch (error) {
      if (error.message === 'Short URL not found') return res.status(404).json({ error: 'Short URL not found' });
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getStats(req, res) {
    try {
      const { code } = req.params;
      if (!code) return res.status(400).json({ error: 'Short code is required' });
      const url = await Url.findOne({ shortCode: code });
      if (!url) return res.status(404).json({ error: 'Short URL not found' });
      res.json({
        success: true,
        stats: {
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          clicks: url.clicks,
          lastAccessed: url.lastAccessed,
          createdAt: url.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteUrl(req, res) {
    try {
      const { code } = req.params;
      if (!code) return res.status(400).json({ error: 'Short code is required' });
      const url = await Url.findOneAndDelete({ shortCode: code });
      if (!url) return res.status(404).json({ error: 'Short URL not found' });
      const redisKey = `url:${code}`;
      if (await redisClient.exists(redisKey)) {
        await redisClient.del(redisKey);
      }
      res.json({ success: true, message: 'Short URL deleted successfully' });
    } catch (error) {
      console.error('deleteUrl error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  renderHome(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
};

export default urlController;