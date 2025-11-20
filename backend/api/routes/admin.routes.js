import express from 'express';
import { promoteToOrganizer, getAllUsers } from '../controllers/auth.controller.js';
import { verifyAuth, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes here are protected and require the user to be an ADMIN

// GET /api/admin/users
// Gets a list of all users for the admin dashboard
router.get('/users', verifyAuth, isAdmin, getAllUsers);

// PUT /api/admin/promote
// Promotes a student to an organizer. We'll send the ID in the request body.
router.put('/promote', verifyAuth, isAdmin, promoteToOrganizer);

export default router;

