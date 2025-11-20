import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A helper function to safely select user data to return
const selectUserFields = {
  id: true,
  name: true,
  profile_photo: true,
};

// A helper function to select club data
const selectClubFields = {
  id: true,
  name: true,
  description: true,
  club_logo_url: true,
  created_at: true,
  organizer: {
    select: selectUserFields,
  },
  _count: {
    select: { members: true, events: true },
  },
};


export const createClub = async (req, res) => {
  try {
    const { name, description, organizer_id } = req.body;
    const { id: adminId } = req.user; // Admin who is creating the club

    if (!name || !organizer_id) {
      return res
        .status(400)
        .json({ message: 'Name and organizer_id are required' });
    }

    const organizerIdInt = parseInt(organizer_id, 10);
    if (isNaN(organizerIdInt)) {
      return res.status(400).json({ message: 'Invalid organizer ID' });
    }

    // Check if organizer exists and has the correct role
    const organizer = await prisma.user.findFirst({
      where: {
        id: organizerIdInt,
        role: 'ORGANIZER',
      },
    });

    if (!organizer) {
      return res
        .status(404)
        .json({ message: 'Organizer user not found or user is not an organizer' });
    }

    const club = await prisma.club.create({
      data: {
        name,
        description: description || null,
        organizer_id: organizerIdInt,
      },
    });

    res.status(201).json({ message: 'Club created successfully', club });
  } catch (err) {
    console.error('Create Club Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getAllClubs = async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      select: selectClubFields,
      orderBy: {
        name: 'asc',
      },
    });
    res.json(clubs);
  } catch (err) {
    console.error('Get All Clubs Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getClubById = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    if (isNaN(clubId)) {
      return res.status(400).json({ message: 'Invalid club ID' });
    }

    const club = await prisma.club.findUnique({
      where: {
        id: clubId, 
      },
      include: {
        organizer: {
          select: {
            name: true,
            profile_photo: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_photo: true,
              },
            },
          },
        },
        events: {
          where: {
            is_active: true,
          },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json(club);
  } catch (err) {
    console.error('Get Club By ID Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const joinClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const { id: userId } = req.user;

    if (isNaN(clubId)) {
      return res.status(400).json({ message: 'Invalid club ID' });
    }

    // Check if user is already a member
    const existingMembership = await prisma.clubMember.findUnique({
      where: {
        user_id_club_id: {
          user_id: userId,
          club_id: clubId,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Create the membership
    const newMember = await prisma.clubMember.create({
      data: {
        user_id: userId,
        club_id: clubId,
      },
      include: {
        user: { select: selectUserFields },
      }
    });

    res.status(201).json({ message: 'Joined club successfully', membership: newMember });
  } catch (err) {
    console.error('Join Club Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const leaveClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id, 10);
    const { id: userId } = req.user;

    if (isNaN(clubId)) {
      return res.status(400).json({ message: 'Invalid club ID' });
    }

    // Check if membership exists
    const existingMembership = await prisma.clubMember.findUnique({
      where: {
        user_id_club_id: {
          user_id: userId,
          club_id: clubId,
        },
      },
    });

    if (!existingMembership) {
      return res.status(404).json({ message: 'User is not a member of this club' });
    }

    // Delete the membership
    await prisma.clubMember.delete({
      where: {
        user_id_club_id: {
          user_id: userId,
          club_id: clubId,
        },
      },
    });

    res.status(200).json({ message: 'Left club successfully' });
  } catch (err) {
    console.error('Leave Club Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getOrganizerClubs = async (req, res) => {
  try {
    const { id: organizerId } = req.user;

    const clubs = await prisma.club.findMany({
      where: {
        organizer_id: organizerId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(clubs);
  } catch (err) {
    console.error('Get Organizer Clubs Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

