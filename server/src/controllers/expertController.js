const prisma = require('../config/db');

const upsertProfile = async (req, res) => {
  const {
    title,
    bio,
    yearsOfExperience,
    company,
    location,
    hourlyRate,
    profileImage,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    skills, // Array of skill IDs
  } = req.body;

  const userId = req.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create or update ExpertProfile
      const profile = await tx.expertProfile.upsert({
        where: { userId },
        update: {
          title,
          bio,
          yearsOfExperience: parseInt(yearsOfExperience, 10),
          company,
          location,
          hourlyRate: parseFloat(hourlyRate),
          profileImage,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
        },
        create: {
          userId,
          title,
          bio,
          yearsOfExperience: parseInt(yearsOfExperience, 10),
          company,
          location,
          hourlyRate: parseFloat(hourlyRate),
          profileImage,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
        },
      });

      // Sync Skills
      if (skills && Array.isArray(skills)) {
        // Delete existing connections
        await tx.expertSkill.deleteMany({
          where: { expertProfileId: profile.id },
        });

        // Create new connections
        if (skills.length > 0) {
          await tx.expertSkill.createMany({
            data: skills.map((skillId) => ({
              expertProfileId: profile.id,
              skillId,
            })),
          });
        }
      }

      // Fetch full profile with relations to return
      return await tx.expertProfile.findUnique({
        where: { id: profile.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    });

    return res.status(200).json({
      message: 'Expert profile updated successfully',
      profile: result,
    });
  } catch (error) {
    console.error('Error upserting expert profile:', error);
    return res.status(500).json({ error: 'Internal server error updating profile.' });
  }
};

const getOwnProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await prisma.expertProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        services: true,
        slots: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please onboarding.' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Error getting own profile:', error);
    return res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
};

const listExperts = async (req, res) => {
  try {
    const { skill, search } = req.query;

    let whereClause = {};

    if (skill) {
      whereClause.skills = {
        some: {
          skillId: skill,
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        {
          user: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          services: {
            some: {
              isActive: true,
              OR: [
                { serviceTitle: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          skills: {
            some: {
              skill: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const experts = await prisma.expertProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        services: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ experts });
  } catch (error) {
    console.error('Error listing experts:', error);
    return res.status(500).json({ error: 'Internal server error listing experts.' });
  }
};

const getExpertById = async (req, res) => {
  const { id } = req.params;

  try {
    const expert = await prisma.expertProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        services: {
          where: {
            isActive: true,
          },
        },
        slots: {
          where: {
            isBooked: false, // Only show available slots
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!expert) {
      return res.status(404).json({ error: 'Expert profile not found.' });
    }

    return res.status(200).json({ expert });
  } catch (error) {
    console.error('Error getting expert by ID:', error);
    return res.status(500).json({ error: 'Internal server error fetching expert details.' });
  }
};

module.exports = {
  upsertProfile,
  getOwnProfile,
  listExperts,
  getExpertById,
};
