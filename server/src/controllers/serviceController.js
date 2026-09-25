const prisma = require('../config/db');

const getExpertProfile = async (userId) => {
  return await prisma.expertProfile.findUnique({
    where: { userId },
  });
};

const createService = async (req, res) => {
  const { serviceTitle, description, duration, price, meetingType, isActive, thumbnail } = req.body;
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found. Please create a profile first.' });
    }

    // Check duplicate serviceTitle for this expert
    const existingService = await prisma.expertService.findFirst({
      where: {
        expertProfileId: profile.id,
        serviceTitle: { equals: serviceTitle.trim(), mode: 'insensitive' },
      },
    });

    if (existingService) {
      return res.status(400).json({ error: 'A service with this title already exists.' });
    }

    const service = await prisma.expertService.create({
      data: {
        expertProfileId: profile.id,
        serviceTitle: serviceTitle.trim(),
        description,
        duration: parseInt(duration, 10),
        price: parseFloat(price),
        meetingType,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        thumbnail: thumbnail || null,
      },
    });

    return res.status(201).json({
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ error: 'Internal server error creating service.' });
  }
};

const listServices = async (req, res) => {
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const services = await prisma.expertService.findMany({
      where: { expertProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ services });
  } catch (error) {
    console.error('Error listing services:', error);
    return res.status(500).json({ error: 'Internal server error listing services.' });
  }
};

const getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.expertService.findUnique({
      where: { id },
      include: {
        expertProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    return res.status(200).json({ service });
  } catch (error) {
    console.error('Error getting service:', error);
    return res.status(500).json({ error: 'Internal server error fetching service.' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { serviceTitle, description, duration, price, meetingType, isActive, thumbnail } = req.body;
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const service = await prisma.expertService.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Owner check
    if (service.expertProfileId !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this service.' });
    }

    // Duplicate check
    const duplicateService = await prisma.expertService.findFirst({
      where: {
        expertProfileId: profile.id,
        serviceTitle: { equals: serviceTitle.trim(), mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (duplicateService) {
      return res.status(400).json({ error: 'A service with this title already exists.' });
    }

    const updatedService = await prisma.expertService.update({
      where: { id },
      data: {
        serviceTitle: serviceTitle.trim(),
        description,
        duration: parseInt(duration, 10),
        price: parseFloat(price),
        meetingType,
        isActive: isActive !== undefined ? Boolean(isActive) : service.isActive,
        thumbnail: thumbnail !== undefined ? thumbnail : service.thumbnail,
      },
    });

    return res.status(200).json({
      message: 'Service updated successfully',
      service: updatedService,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ error: 'Internal server error updating service.' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const profile = await getExpertProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Expert profile not found.' });
    }

    const service = await prisma.expertService.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Owner check
    if (service.expertProfileId !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this service.' });
    }

    await prisma.expertService.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ error: 'Internal server error deleting service.' });
  }
};

module.exports = {
  createService,
  listServices,
  getServiceById,
  updateService,
  deleteService,
};
