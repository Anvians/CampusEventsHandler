import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Other imports (database, routes, etc.)
import prisma from './api/db/prisma.connection.js';
import connectMongo from './api/db/mongoose.connection.js';
import redisClient from './api/db/redis.connection.js';
import authRoute from './api/routes/auth.routes.js';
import adminRoute from './api/routes/admin.routes.js';
import eventRoute from './api/routes/event.routes.js';
import clubRoute from './api/routes/club.routes.js';
import postRoute from './api/routes/post.routes.js';
import userRoute from './api/routes/user.routes.js';

// Initialize dotenv
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",      // Standard Vite Localhost
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,     // https://campus-events-handler.vercel.app
  // Add the render URL just in case you test backend-to-backend
  "https://campuseventshandler.onrender.com" 
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rate Limiter setup
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many requests, please try again after 1 minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  return limiter(req, res, next);
});

// Routes setup
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/events', eventRoute);
app.use('/api/clubs', clubRoute);
app.use('/api/posts', postRoute);
app.use('/api/users', userRoute);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'ok', db: 'PostgreSQL connected', mongo: 'connected', redis: redisStatus });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('College Connect API is up and running!');
});

// Create HTTP server with express app
const server = http.createServer(app);

// Initialize socket.io on the server
const io = new Server(server, {
  cors: {
    origin:  allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join', (userId) => {
    const room = `user_${userId}`;
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Export app, server, and io for other modules
export { app, server, io };

// Start the server
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on PORT: ${PORT}`);
});
