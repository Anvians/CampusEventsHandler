import { PrismaClient } from '@prisma/client';
import { createNotification } from '../utils/notifications.js';

const prisma = new PrismaClient();


export const postEventResult = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { id: creatorId, role } = req.user;
    const { winner_id, runner_up_id, certification_url } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    if (!winner_id) {
      return res.status(400).json({ message: 'Winner ID is required' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.created_by !== creatorId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'You are not the creator of this event' });
    }

    const existingResult = await prisma.result.findFirst({
      where: { event_id: eventId },
    });

    if (existingResult) {
      return res.status(400).json({ message: 'Results for this event have already been posted' });
    }

 
    const dataToCreate = {
      event: {
        connect: { id: eventId }
      },
      winner: {
        connect: { id: parseInt(winner_id, 10) }
      },
      certification_url: certification_url || null,
    };

    if (runner_up_id) {
      dataToCreate.runner_up = {
        connect: { id: parseInt(runner_up_id, 10) }
      };
    }
    
   

    const newResult = await prisma.result.create({
      data: dataToCreate,
    });

    //  Notify the winner
    await createNotification(
      parseInt(winner_id, 10),
      `Congratulations! You won the event: ${event.title}!`,
      `/event/${eventId}`,
      'NEW_RESULT',
      creatorId
    );
    
    //  Notify the runner-up if they exist
    if (runner_up_id) {
      await createNotification(
        parseInt(runner_up_id, 10),
        `Congratulations! You are the runner-up for: ${event.title}!`,
        `/event/${eventId}`,
        'NEW_RESULT',
        creatorId
      );
    }

    res.status(201).json({ message: 'Results posted successfully', result: newResult });
  } catch (err) {
    console.error('Post Result Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

