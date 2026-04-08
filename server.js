const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const urlRoutes = require('./routes/urlRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to databases
async function initializeConnections() {
  try {
    await connectDB();
    await connectRedis();
    console.log('All database connections established');
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', urlRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

// Start server
async function startServer() {
  await initializeConnections();

  app.listen(PORT, () => {
    console.log(`🚀 URL Shortener server running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;