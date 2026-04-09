import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL, // ✅ full Redis URL (IMPORTANT)
});

// Event listeners (for debugging)
redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// Prevent multiple connections (important for serverless)
let isConnected = false;

// Connect function
export const connectRedis = async () => {
  try {
    if (!isConnected) {
      await redisClient.connect();
      isConnected = true;
    }
  } catch (error) {
    console.error("❌ Redis connection error:", error);
  }
};

// Export client
export { redisClient };