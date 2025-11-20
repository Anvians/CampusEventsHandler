import {createClient} from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const redis = createClient({
    url : process.env.REDIS_URL
})

redis.on('error', (err) => console.error('Redis Client Error:', err));

//Connect Redis once when this module loads
await redis.connect();
console.log(" Redis connected successfully");


export default redis