import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const redisEnabled = Boolean(redisUrl);

const createNoopRedis = () => {
  const noop = async () => null;
  return {
    isOpen: false,
    isReady: false,
    connect: async () => null,
    get: noop,
    setEx: noop,
    del: noop,
    on: () => {},
  };
};

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

const redisClient = redisEnabled ? createClient(getRedisConfig()) : createNoopRedis();

const disableRedis = () => {
  if (!redisEnabled) return;
  redisClient.connect = async () => null;
  redisClient.get = async () => null;
  redisClient.setEx = async () => null;
  redisClient.del = async () => null;
};

if (!redisEnabled) {
  console.warn('Redis is disabled because REDIS_URL is missing. Caching and realtime notifications are disabled.');
  disableRedis();
} else {
  redisClient.on('error', (err) => {
    if (err.message.includes('Socket closed unexpectedly')) {
      console.error(' Redis connection dropped, retrying...');
    } else {
      console.error(' Redis Client Error:', err.message);
    }
    disableRedis();
  });

  redisClient.on('connect', () => {
    console.log(' Connected to Redis');
  });
}

export default redisClient;