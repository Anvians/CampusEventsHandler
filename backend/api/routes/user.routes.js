import express from 'express';
import {
  editProfile,
  getMyProfile,
  getUserProfile,
  getMyNotifications,
  markNotificationsAsRead,
  markOneNotificationAsRead, 
} from '../controllers/user.controller.js';
import { followUser, unfollowUser } from '../controllers/social.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

//  GET /api/users/me
router.get('/me', verifyAuth, getMyProfile);

router.put('/me', verifyAuth, upload.single('profile_photo'), editProfile);//  GET /api/users/notifications
router.get('/notifications', verifyAuth, getMyNotifications);

//  PUT /api/users/notifications/read
router.put('/notifications/read', verifyAuth, markNotificationsAsRead);

//  PUT /api/users/notifications/:id/read
router.put('/notifications/:id/read', verifyAuth, markOneNotificationAsRead);

//  GET /api/users/:id
router.get('/:id', verifyAuth, getUserProfile);

//  POST /api/users/:id/follow
router.post('/:id/follow', verifyAuth, followUser);

//  DELETE /api/users/:id/unfollow
router.delete('/:id/unfollow', verifyAuth, unfollowUser);

export default router;

