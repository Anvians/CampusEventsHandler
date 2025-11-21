import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error(' REDIS_URL is missing from environment variables');

}

const getRedisConfig = () => {
  if (redisUrl && redisUrl.startsWith('rediss://')) {
    console.log(' Configuring Redis with SSL (Production Mode)');
    return {
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false, 
      },
    };
  }


  console.log('Configuring Redis without SSL (Internal/Local Mode)');
  return {
    url: redisUrl || 'redis://localhost:6379',
  };
};

const redisClient = createClient(getRedisConfig());

redisClient.on('error', (err) => {
  // Filter out the "Socket closed" noise to keep logs clean
  if (err.message.includes('Socket closed unexpectedly')) {
    console.error(' Redis connection dropped, retrying...');
  } else {
    console.error(' Redis Client Error:', err.message);
  }
});

redisClient.on('connect', () => {
  console.log(' Connected to Redis');
});

export default redisClient;