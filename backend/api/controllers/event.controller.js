import { PrismaClient } from '@prisma/client';
import { createNotification } from '../utils/notifications.js';

const prisma = new PrismaClient();

// Helper functions for selecting fields
const selectUserFields = {
  id: true,
  name: true,
  profile_photo: true,
  email: true, 
};

const selectEventFields = {
  id: true,
  title: true,
  description: true,
  category: true,
  event_datetime: true,
  venue: true,
  banner_url: true,
  registration_limit: true,
  price: true,
  is_team_event: true,
  created_at: true,
  club: {
    select: {
      id: true,
      name: true,
      club_logo_url: true,
    },
  },
  creator: {
    select: {
      id: true,
      name: true,
      profile_photo: true,
    },
  },
  _count: {
    select: { registrations: true },
  },
};


export const createEvent = async (req, res) => {
  try {
    const { id: creatorId, role } = req.user;
    const {
      title,
      description,
      club_id,
      category,
      event_datetime, 
      venue,
      banner_url,
      registration_limit,
      price,
      is_team_event,
      min_team_size,
      max_team_size,
    } = req.body;

    const club = await prisma.club.findUnique({
      where: { id: club_id },
    });

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.organizer_id !== creatorId && role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'You are not the organizer of this club' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        event_datetime: new Date(event_datetime), // Convert ISO string to Date
        venue,
        banner_url,
        registration_limit: parseInt(registration_limit, 10),
        price: parseFloat(price),
        is_team_event: Boolean(is_team_event),
        min_team_size: parseInt(min_team_size, 10),
        max_team_size: parseInt(max_team_size, 10),
        
        // Connect to the creator (User) relation
        creator: {
          connect: {
            id: creatorId
          }
        },
        
        // Connect to the club (Club) relation
        club: {
          connect: {
            id: club_id
          }
        }
      },
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    console.error('Create Event Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        is_active: true,
      },
      select: selectEventFields,
      orderBy: {
        event_datetime: 'asc',
      },
    });
    res.json(events);
  } catch (err) {
    console.error('Get All Events Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getEventById = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
        creator: { select: { id: true, name: true, profile_photo: true } },
        registrations: {
          select: {
            individual_user_id: true,
            team_id: true,
            individual_user: {
              select: selectUserFields
            }
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error('Get Event By ID Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const registerIndividual = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { id: userId } = req.user;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.is_team_event) {
      return res
        .status(400)
        .json({ message: 'This is a team event. Please register as a team.' });
    }

    if (event._count.registrations >= event.registration_limit) {
      return res.status(400).json({ message: 'Event registrations are full.' });
    }

    const existingRegistration = await prisma.registration.findFirst({
      where: {
        event_id: eventId,
        individual_user_id: userId,
      },
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: 'You are already registered for this event.' });
    }

    const registration = await prisma.registration.create({
      data: {
        event_id: eventId,
        individual_user_id: userId,
        // If price > 0, set to PENDING, otherwise SUCCESS
        payment_status: event.price > 0 ? 'PENDING' : 'SUCCESS',
      },
    });

    await createNotification(
      userId, 
      `You have successfully registered for ${event.title}!`, 
      `/event/${event.id}`, 
      'REGISTRATION_CONFIRMED', 
      event.created_by 
    );

    res.status(201).json({ message: 'Registered successfully', registration });
  } catch (err) {
    console.error('Individual Registration Error:', err);
    // Check for unique constraint violation (just in case)
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'You are already registered.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

export const registerTeam = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { id: leaderId } = req.user;
    const { team_name, member_ids } = req.body; 

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.is_team_event)
      return res.status(400).json({ message: 'This is not a team event.' });
    if (event._count.registrations >= event.registration_limit)
      return res.status(400).json({ message: 'Event registrations are full.' });

    const allMemberIds = [...new Set([...(member_ids || []), leaderId])]; // Include leader
    if (
      allMemberIds.length < event.min_team_size ||
      allMemberIds.length > event.max_team_size
    ) {
      return res.status(400).json({
        message: `Team must have between ${event.min_team_size} and ${event.max_team_size} members.`,
      });
    }

    const existingRegistrations = await prisma.registration.findFirst({
      where: {
        event_id: eventId,
        OR: [
          { team: { members: { some: { user_id: { in: allMemberIds } } } } },
          { individual_user_id: { in: allMemberIds } },
        ],
      },
    });

    if (existingRegistrations) {
      return res
        .status(400)
        .json({
          message: 'One or more team members are already registered for this event.',
        });
    }

    const newRegistration = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name: team_name,
          event_id: eventId,
          members: {
            create: allMemberIds.map((userId) => ({
              user_id: userId,
              is_leader: userId === leaderId,
            })),
          },
        },
      });

      const registration = await tx.registration.create({
        data: {
          event_id: eventId,
          team_id: newTeam.id,
          payment_status: event.price > 0 ? 'PENDING' : 'SUCCESS',
        },
      });
      return registration;
    });

    for (const userId of allMemberIds) {
      await createNotification(
        userId,
        `Your team "${team_name}" has successfully registered for ${event.title}!`,
        `/event/${event.id}`,
        'REGISTRATION_CONFIRMED',
        event.created_by
      );
    }

    res
      .status(201)
      .json({ message: 'Team registered successfully', registration: newRegistration });
  } catch (err) {
    console.error('Team Registration Error:', err);
    if (err.code === 'P2002') {
      return res
        .status(400)
        .json({
          message: 'A team member is already registered or team name is taken.',
        });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};


export const createEventAnnouncement = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { title, message } = req.body;
    const { id: creatorId, role } = req.user;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.created_by !== creatorId && role !== 'ADMIN') {
      return res
        .status(403)
        .json({ message: 'You are not the creator of this event' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        event_id: eventId,
        title,
        message,
        created_by: creatorId,
      },
    });

    //Notify all registered users
    const registrations = await prisma.registration.findMany({
      where: { event_id: eventId },
      include: { user: true, team: { include: { members: { include: { user: true } } } } },
    });

    let notifiedUserIds = new Set();

    for (const reg of registrations) {
      if (reg.user && !notifiedUserIds.has(reg.user.id)) {
        // Notify individual user
        await createNotification(
          reg.user.id,
          `New announcement for ${event.title}: ${title}`, 
          `/event/${event.id}`, 
          'EVENT_ANNOUNCEMENT',
          creatorId 
        );
        notifiedUserIds.add(reg.user.id);
      } else if (reg.team) {
        // Notify all team members
        for (const member of reg.team.members) {
          if (!notifiedUserIds.has(member.user.id)) {
            await createNotification(
              member.user.id,
              `New announcement for ${event.title}: ${title}`,
              `/event/${event.id}`,
              'EVENT_ANNOUNCEMENT',
              creatorId
            );
            notifiedUserIds.add(member.user.id);
          }
        }
      }
    }

    res
      .status(201)
      .json({ message: 'Announcement created and users notified', announcement });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getEventRegistrants = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const { id: creatorId, role } = req.user;

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    //  Find event to verify organizer
    const event = await prisma.event.findFirst({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.created_by !== creatorId && role !== 'ADMIN') {
      return res.status(403).json({ message: 'You are not the creator of this event' });
    }
    
    const registrations = await prisma.registration.findMany({
      where: { event_id: eventId },
      include: {
        individual_user: { select: selectUserFields }, 
        team: {
          include: {
            members: {
              include: {
                user: { select: selectUserFields }
              }
            }
          }
        }
      }
    });

    const userMap = new Map();
    for (const reg of registrations) {
      if (reg.individual_user) {
        // Add email for the dropdown
        userMap.set(reg.individual_user.id, { ...reg.individual_user });
      } else if (reg.team) {
        for (const member of reg.team.members) {
          userMap.set(member.user.id, { ...member.user });
        }
      }
    }

    const allRegistrants = Array.from(userMap.values());

    res.json(allRegistrants);

  } catch (err) {
    console.error('Get Registrants Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

