import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

//Detect if we need a secure connection (Production) vs local
const isProduction = redisUrl.startsWith('rediss://');

const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: isProduction,
    // This is critical for Render/Heroku/Upstash
    // It accepts self-signed certificates common in managed services
    rejectUnauthorized: false, 
  },
});

redisClient.on('error', (err) => {
  // Don't crash the app if Redis blips, just log it
  console.error(' Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log(' Connected to Redis');
});

export default redisClient;