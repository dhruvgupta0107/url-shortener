import { nanoid } from 'nanoid';
import Url from '../models/Url.js';

class UrlService {
  validateUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async shortenUrl(originalUrl, customCode = null) {
    if (!this.validateUrl(originalUrl)) {
      throw new Error('Invalid URL format');
    }

    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return `${process.env.BASE_URL}/${existingUrl.shortCode}`;
    }

    let shortCode;

    if (customCode) {
      // Validate custom code format
      if (!/^[a-zA-Z0-9_-]+$/.test(customCode) || customCode.length > 50) {
        throw new Error('Custom code must be alphanumeric and max 50 characters');
      }

      // Check if custom code is already taken
      const existingCode = await Url.findOne({ shortCode: customCode.toLowerCase() });
      if (existingCode) {
        throw new Error('Custom code already in use');
      }

      shortCode = customCode.toLowerCase();
    } else {
      // Generate random short code
      do {
        shortCode = nanoid(8);
      } while (await Url.findOne({ shortCode }));
    }

    // Create and save new URL
    const url = new Url({
      originalUrl,
      shortCode
    });

    await url.save();

    return `${process.env.BASE_URL}/${shortCode}`;
  }

  async getOriginalUrl(shortCode) {
    const url = await Url.findOne({ shortCode: shortCode.toLowerCase() });

    if (!url) {
      throw new Error('Short URL not found');
    }

    // Update click tracking
    url.clicks += 1;
    url.lastAccessed = new Date();
    await url.save();

    return url.originalUrl;
  }
}

export default new UrlService();