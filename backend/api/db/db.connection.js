import {Pool} from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const databaseUrl = process.env.DATABASE_URL


const pool = new Pool ({
    connectionString : databaseUrl
})


pool.connect()
    .then(()=>console.log('Database connected successfully'))
    .catch((e)=>console.log('Database connection error', e))

export default pool