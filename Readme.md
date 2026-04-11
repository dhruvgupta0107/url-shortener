# URL Shortener

A full-stack URL shortener built with the MERN stack, featuring custom short codes, Redis caching, and link expiration.

## Live Demo
[Live App](https://tinify01.vercel.app/) · [GitHub Repo](https://github.com/dhruvgupta0107/url-shortener)

---

## Features

- Shorten any valid HTTP/HTTPS URL instantly
- Custom short codes — choose your own alias for a link
- Redis cache-aside strategy for sub-millisecond redirects
- Link expiration with automatic Redis TTL-based cache invalidation
- Base62 short code generation (56 billion unique combinations)
- Click tracking and last accessed timestamp per link

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Cache | Redis |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
Client → API Gateway → App Server (Node/Express)
                              ↓          ↓          ↓
                           Redis      MongoDB   Analytics
```

**Request flow — shorten a URL:**
1. Client submits a long URL
2. App server validates the URL format
3. Checks if URL already exists in MongoDB (deduplication)
4. Generates a Base62 short code (or uses custom code)
5. Saves to MongoDB and caches in Redis
6. Returns the short URL

**Request flow — redirect:**
1. Client visits `baseurl/abc123`
2. App server checks Redis first (cache hit = instant redirect)
3. On cache miss, queries MongoDB and populates Redis
4. Redirects to original URL and updates click count

---

## System Design Concepts

- **Cache-aside pattern** — Redis serves hot URLs from memory, reducing MongoDB load on a read-heavy system
- **Base62 encoding** — converts a random number to a 6-character URL-safe code (62^6 = ~56 billion combinations)
- **Redis TTL** — expiry is synced between Redis and MongoDB, enabling automatic cache invalidation
- **Service layer architecture** — business logic separated from controllers following SOLID principles
- **Database indexing** — index on `shortCode` field for O(log n) redirect lookups

---

## Project Structure

```
url-shortener/
├── config/
│   ├── db.js              # MongoDB connection
│   └── redis.js           # Redis connection
├── models/
│   └── Url.js             # URL schema
├── services/
│   └── urlService.js      # Core business logic
├── controllers/
│   └── urlController.js   # Handle req/res
├── routes/
│   └── urlRoutes.js       # API endpoints
├── middlewares/
│   └── rateLimiter.js     # Rate limiting
├── .env.example
└── server.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/dhruvgupta0107/url-shortener.git
cd url-shortener

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
REDIS_URL=redis://localhost:6379
BASE_URL=http://localhost:5000
```

### Run the App

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Reference

### Shorten a URL

```
POST /api/url/shorten
```

**Request body:**
```json
{
  "originalUrl": "https://www.example.com/some/very/long/url",
  "customCode": "mylink"   // optional
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:5000/mylink",
  "shortCode": "mylink"
}
```

### Redirect

```
GET /:shortCode
```
Redirects to the original URL. Returns `404` if not found or expired.

### Get URL Stats

```
GET /api/url/stats/:shortCode
```

**Response:**
```json
{
  "originalUrl": "https://www.example.com/...",
  "shortCode": "mylink",
  "clicks": 42,
  "lastAccessed": "2025-05-01T10:30:00.000Z",
  "createdAt": "2025-04-15T08:00:00.000Z"
}
```

---

## Short Code Generation

Short codes are generated using **Base62 encoding**:

```javascript
const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const num = Math.floor(Math.random() * 62 ** 6);
// Convert num to Base62 → always 6 URL-safe characters
```

This gives **56 billion unique combinations** from just 6 characters, with collision detection via a do-while loop.

---

## What I'd Add Next

- JWT authentication + user dashboards
- QR code generation per short link
- Analytics dashboard (clicks over time, referrer, geography)
- Rate limiting per IP using sliding window algorithm

---

## Author

**Dhruv Gupta**
- GitHub: [@dhruvgupta0107](https://github.com/dhruvgupta0107)
- Email: dhruvgupta010703@gmail.com
- LinkedIn: [linkedin.com/in/dhruvgupta](#)