import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Database connections
import prisma from './api/db/prisma.connection.js';
import connectMongo from './api/db/mongoose.connection.js';

// Routes
import authRoute from './api/routes/auth.routes.js';
import adminRoute from './api/routes/admin.routes.js';
import eventRoute from './api/routes/event.routes.js';
import clubRoute from './api/routes/club.routes.js';
import postRoute from './api/routes/post.routes.js';
import userRoute from './api/routes/user.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Trust Proxy (CRITICAL for Render/Vercel)
// Without this, rate limiting will block the Load Balancer instead of individual users
app.set('trust proxy', 1);

// 2. Define Allowed Origins (Centralized)
// This list allows Localhost, your specific LAN IP, and the Production URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://10.31.33.6:5173", // Your LAN IP
  process.env.FRONTEND_URL  // The Render/Vercel URL (e.g. https://myapp.vercel.app)
].filter(Boolean); // Filters out undefined if env var is missing

console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`📦 Port: ${PORT}`);
console.log(`🛡️ Allowed Origins:`, allowedOrigins);

// 3. Middleware
app.use(helmet());
app.use(express.json());

// CORS for Express
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Increased to 100 for better UX (20 is very low for a social app)
  message: {
    success: false,
    message: 'Too many requests, please try again after 1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to API routes
app.use('/api', limiter);

// 4. HTTP + Socket.io setup
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same list as Express
    credentials: true,
    methods: ["GET", "POST"]
  },
});

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on('join', (userId) => {
    const room = `user_${userId}`;
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Connect databases with retry
async function connectDatabasesWithRetry(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Connected to PostgreSQL (Prisma)');
      await connectMongo();
      console.log('✅ Connected to MongoDB (Mongoose)');
      return;
    } catch (err) {
      console.error(`❌ DB connection failed (attempt ${attempt}/${retries}):`, err.message);
      if (attempt === retries) process.exit(1);
      console.log(`🔁 Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
connectDatabasesWithRetry();

// Routes
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/events', eventRoute);
app.use('/api/clubs', clubRoute);
app.use('/api/posts', postRoute);
app.use('/api/users', userRoute);

// Health route for Docker/Render checks
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    res
      .status(200)
      .json({ status: 'ok', db: 'PostgreSQL connected', mongo: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('College Connect API is up and running!');
});

// Start server
// Listen on 0.0.0.0 to ensure Docker/Render can map the port
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { io, server };