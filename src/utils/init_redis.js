const { red } = require("colors");
const Redis = require("ioredis");
require("dotenv").config();

// Create and configure Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST, // Hostname for your Redis server (mapped to localhost by Docker)
  port: process.env.REDIS_PORT, // Port number for Redis
});

// Redis connection success event
redisClient.on("connect", () => {
  console.log("Connected to Redis!");
});

// Redis connection error event
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
  
  // Exit the Node.js process on connection error
  console.error("Exiting Node.js process due to Redis connection error...");
  process.exit(1); // Use an error exit code
});

// Redis connection closed event
redisClient.on("close", () => {
  console.log("Redis connection closed");
});

// Redis connection ended event
redisClient.on("end", () => {
  console.log("Redis connection ended");
});

// Graceful shutdown on application termination
process.on("SIGINT", () => {
  console.log("Gracefully shutting down...");
  redisClient.quit(() => {
    console.log("Redis client disconnected");
    process.exit(0);
  });
});

// Export the Redis client for use in other files
module.exports = redisClient;
