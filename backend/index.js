import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './api/db/prisma.connection.js';
import connectMongo from './api/db/mongoose.connection.js';
import rateLimit from 'express-rate-limit';
import authRoute from './api/routes/auth.routes.js';
import adminRoute from './api/routes/admin.routes.js';
import eventRoute from './api/routes/event.routes.js';
import clubRoute from './api/routes/club.routes.js';
import postRoute from './api/routes/post.routes.js';
import userRoute from './api/routes/user.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// HTTP + Socket.io setup
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://10.31.33.6:5173",
    ],
    credentials: true,
  },
});


io.on('connection', (socket) => {
  console.log(` User connected: ${socket.id}`);

  socket.on('join', (userId) => {
    const room = `user_${userId}`;
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Rate Limiter
const Limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: 'Too many request, Please try after 1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
});

// app.use(Limiter)
console.log(` Environment: ${process.env.NODE_ENV}`);
console.log(` Port: ${PORT}`);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://10.31.33.6:5173",
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());

// Connect databases with retry
async function connectDatabasesWithRetry(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('Connected to PostgreSQL (Prisma)');
      await connectMongo();
      console.log('Connected to MongoDB (Mongoose)');
      return;
    } catch (err) {
      console.error(` DB connection failed (attempt ${attempt}/${retries}):`, err.message);
      if (attempt === retries) process.exit(1);
      console.log(`Retrying in ${delay / 1000}s...`);
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

// Health route for Docker checks
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
server.listen(PORT, "0.0.0.0",() => {
  console.log(`Server + Socket.IO running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { io, server };
