import express from 'express';
import {
  createPost,
  getFeedPosts,
  getPostById,
  likePost,
  commentOnPost,
} from '../controllers/social.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();
//Access: Private (All logged-in users)

// POST /api/posts

router.post('/', verifyAuth, upload.single('image'), createPost);

// GET /api/posts/feed

router.get('/feed', verifyAuth, getFeedPosts);

// GET /api/posts/:id

router.get('/:id', verifyAuth, getPostById);

// POST /api/posts/:id/like

router.post('/:id/like', verifyAuth, likePost);

// POST /api/posts/:id/comment

router.post('/:id/comment', verifyAuth, commentOnPost);

export default router;

