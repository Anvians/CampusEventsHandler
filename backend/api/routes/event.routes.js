import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  registerIndividual,
  registerTeam,
  createEventAnnouncement,
  getEventRegistrants,
} from '../controllers/event.controller.js'; 
import { postEventResult } from '../controllers/results.controller.js';
import {
  verifyAuth,
  isOrganizerOrAdmin,
  isStudent,
} from '../middleware/auth.middleware.js';

const router = express.Router();
// Event Management (Organizer/Admin Only)

//    POST /api/events
router.post('/', verifyAuth, isOrganizerOrAdmin, createEvent);

//  POST /api/events/:id/announce

router.post(
  '/:id/announce',
  verifyAuth,
  isOrganizerOrAdmin,
  createEventAnnouncement,
);

//POST /api/events/:id/results

router.post('/:id/results', verifyAuth, isOrganizerOrAdmin, postEventResult);

//  GET /api/events/:id/registrants

router.get(
  '/:id/registrants',
  verifyAuth,
  isOrganizerOrAdmin,
  getEventRegistrants,
);

//  Event Viewing (All Logged-in Users) 

//    GET /api/events

router.get('/', verifyAuth, getAllEvents);

//  GET /api/events/:id

router.get('/:id', verifyAuth, getEventById);

//  Event Registration (Student Only) 

// POST /api/events/:id/register-individual

router.post(
  '/:id/register-individual',
  verifyAuth,
  isStudent,
  registerIndividual,
);

// POST /api/events/:id/register-team

router.post('/:id/register-team', verifyAuth, isStudent, registerTeam);

export default router;

