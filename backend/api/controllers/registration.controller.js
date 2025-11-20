import { PrismaClient } from '@prisma/client';
import { createNotification } from '../utils/notifications.js';

const prisma = new PrismaClient();


export const registerIndividual = async (req, res) => {
  try {
    const { id: event_id } = req.params;
    const user_id = req.user.id;

    //  Find event and check settings
    const event = await prisma.event.findUnique({
      where: { id: parseInt(event_id) },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.is_team_event) {
      return res.status(400).json({ message: 'This is a team event. Please register as a team.' });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        event_id: parseInt(event_id),
        individual_user_id: user_id,
      },
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        event_id: parseInt(event_id),
        individual_user_id: user_id,
        payment_status: event.price > 0 ? 'PENDING' : 'SUCCESS', // Handle free events
      },
    });

    // Create notification
    await createNotification(
        user_id,
        `You have successfully registered for ${event.title}!`,
        `/events/${event.id}`,
        'REGISTRATION_CONFIRMED',
        null // System notification
    );

    res.status(201).json({ message: 'Registration successful', registration });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const createTeamAndRegister = async (req, res) => {
  try {
    const { id: event_id } = req.params;
    const { team_name, member_user_ids } = req.body; // ["1", "5", "10"]
    const leader_id = req.user.id;

    if (!team_name || !member_user_ids || !Array.isArray(member_user_ids)) {
      return res.status(400).json({ message: 'Team name and an array of member_user_ids are required' });
    }
    
    const event = await prisma.event.findUnique({
      where: { id: parseInt(event_id) },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (!event.is_team_event) {
      return res.status(400).json({ message: 'This is an individual event.' });
    }

    const allMemberIds = [...new Set([leader_id, ...member_user_ids.map(id => parseInt(id))])];

    if (allMemberIds.length < event.min_team_size || allMemberIds.length > event.max_team_size) {
      return res.status(400).json({
        message: `Team size must be between ${event.min_team_size} and ${event.max_team_size} members.`,
      });
    }
    
    const existingRegistration = await prisma.teamMember.findFirst({
        where: {
            user_id: { in: allMemberIds },
            team: { event_id: parseInt(event_id) }
        }
    });

    if (existingRegistration) {
        return res.status(400).json({ message: `A user (ID: ${existingRegistration.user_id}) is already on a team for this event.` });
    }

    // Use a transaction to create team, members, and registration
    const result = await prisma.$transaction(async (tx) => {
      // Create the Team
      const team = await tx.team.create({
        data: {
          name: team_name,
          event_id: parseInt(event_id),
        },
      });

      // Create TeamMember entries
      const teamMemberData = allMemberIds.map(user_id => ({
        team_id: team.id,
        user_id: user_id,
        is_leader: user_id === leader_id, // Mark the creator as leader
      }));
      
      await tx.teamMember.createMany({
        data: teamMemberData,
      });

      // Create the Registration for the team
      const registration = await tx.registration.create({
        data: {
          event_id: parseInt(event_id),
          team_id: team.id,
          payment_status: event.price > 0 ? 'PENDING' : 'SUCCESS',
        },
      });

      return { team, registration };
    });

    // Notify all team members
    for (const user_id of allMemberIds) {
        const message = user_id === leader_id
            ? `You successfully created and registered team '${team_name}' for ${event.title}!`
            : `You have been added to team '${team_name}' for ${event.title} by ${req.user.name}.`;
        
        await createNotification(
            user_id,
            message,
            `/events/${event.id}`,
            'REGISTRATION_CONFIRMED',
            user_id === leader_id ? null : leader_id
        );
    }
    
    res.status(201).json({ message: 'Team created and registered successfully', ...result });
  } catch (err) {
    console.log(err);
    if (err.code === 'P2002') {
        return res.status(400).json({ message: 'A team with this name already exists for this event.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
