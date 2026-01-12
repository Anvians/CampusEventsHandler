import express from 'express';
import {
  createClub,
  getAllClubs,
  getClubById,
  joinClub,
  leaveClub,
  getOrganizerClubs,
  deleteClub
} from '../controllers/club.controller.js'; 
import {
  verifyAuth,
  isAdmin,
  isOrganizer,
  isStudent,
} from '../middleware/auth.middleware.js'; 

const router = express.Router();

// POST /api/clubs
router.post('/', verifyAuth, isAdmin, createClub);

// GET /api/clubs/my-clubs
router.get('/my-clubs', verifyAuth, isOrganizer, getOrganizerClubs);

//POST /api/clubs/id/delete
router.delete('/:id', verifyAuth, deleteClub); 
// controller checks admin / organizer

// GET /api/clubs
router.get('/', verifyAuth, getAllClubs);

// GET /api/clubs/:id

router.get('/:id', verifyAuth, getClubById);

//POST /api/clubs/:id/join

router.post('/:id/join', verifyAuth, isStudent, joinClub);

// DELETE /api/clubs/:id/leave
router.delete('/:id/leave', verifyAuth, isStudent, leaveClub);

export default router;

