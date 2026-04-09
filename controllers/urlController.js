import urlService from '../services/urlService.js';
import Url from '../models/Url.js';

const urlController = {
  async shortenUrl(req, res) {
    try {
      const { url, customCode } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const shortUrl = await urlService.shortenUrl(url, customCode);

      res.json({
        success: true,
        shortUrl,
        originalUrl: url
      });
    } catch (error) {
      if (error.message.includes('already in use')) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.includes('Invalid') || error.message.includes('max 50')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async redirectUrl(req, res) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({ error: 'Short code is required' });
      }

      const originalUrl = await urlService.getOriginalUrl(code);
      res.redirect(originalUrl);
    } catch (error) {
      if (error.message === 'Short URL not found') {
        return res.status(404).json({ error: 'Short URL not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getStats(req, res) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({ error: 'Short code is required' });
      }

      const url = await Url.findOne({ shortCode: code.toLowerCase() });

      if (!url) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

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

  renderHome(req, res) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL Shortener</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
          }
          button {
            width: 100%;
            padding: 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover {
            background: #0056b3;
          }
          .result {
            margin-top: 25px;
            padding: 15px;
            background: #e7f3ff;
            border-radius: 4px;
            display: none;
          }
          .result.show {
            display: block;
          }
          .short-url {
            font-weight: bold;
            color: #007bff;
            word-break: break-all;
          }
          .error {
            color: #dc3545;
            margin-top: 10px;
          }
          .api-info {
            margin-top: 30px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 14px;
          }
          .api-info h3 {
            margin-top: 0;
            color: #333;
          }
          code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔗 URL Shortener</h1>
          <form id="shortenForm">
            <div class="form-group">
              <label for="url">URL to shorten:</label>
              <input type="url" id="url" name="url" required placeholder="https://example.com/very-long-url">
            </div>
            <div class="form-group">
              <label for="customCode">Custom short code (optional):</label>
              <input type="text" id="customCode" name="customCode" placeholder="mylink" pattern="[a-zA-Z0-9_-]+" title="Only letters, numbers, hyphens, and underscores allowed">
            </div>
            <button type="submit">Shorten URL</button>
          </form>
          <div id="result" class="result">
            <div>✅ Short URL: <span class="short-url" id="shortUrl"></span></div>
            <div id="error" class="error"></div>
          </div>
          <div class="api-info">
            <h3>API Usage</h3>
            <p>You can also use the API directly:</p>
            <p><code>POST /shorten</code></p>
            <p>Body: <code>{ "url": "https://example.com", "customCode": "optional" }</code></p>
            <p>Get stats: <code>GET /stats/:code</code></p>
          </div>
        </div>
        <script>
          document.getElementById('shortenForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = document.getElementById('url').value;
            const customCode = document.getElementById('customCode').value;
            const result = document.getElementById('result');
            const shortUrlEl = document.getElementById('shortUrl');
            const errorEl = document.getElementById('error');

            result.classList.remove('show');
            errorEl.textContent = '';

            try {
              const response = await fetch('/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, customCode })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten URL');
              }

              shortUrlEl.textContent = data.shortUrl;
              result.classList.add('show');
            } catch (error) {
              errorEl.textContent = error.message;
              result.classList.add('show');
            }
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
  }
};

export default urlController;