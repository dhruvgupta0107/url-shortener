const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

module.exports = { redisClient, connectRedis };