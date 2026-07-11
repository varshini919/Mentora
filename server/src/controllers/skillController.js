const prisma = require('../config/db');

const listSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return res.status(200).json({ skills });
  } catch (error) {
    console.error('Error listing skills:', error);
    return res.status(500).json({ error: 'Internal server error listing skills.' });
  }
};

const createSkill = async (req, res) => {
  const { name } = req.body;

  try {
    const existingSkill = await prisma.skill.findUnique({
      where: { name: name.trim() },
    });

    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists.' });
    }

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
      },
    });

    return res.status(201).json({
      message: 'Skill created successfully',
      skill,
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return res.status(500).json({ error: 'Internal server error creating skill.' });
  }
};

const updateSkill = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    const duplicateSkill = await prisma.skill.findFirst({
      where: {
        name: name.trim(),
        id: { not: id },
      },
    });

    if (duplicateSkill) {
      return res.status(400).json({ error: 'Another skill with this name already exists.' });
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    return res.status(200).json({
      message: 'Skill updated successfully',
      skill: updatedSkill,
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return res.status(500).json({ error: 'Internal server error updating skill.' });
  }
};

const deleteSkill = async (req, res) => {
  const { id } = req.params;

  try {
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    await prisma.skill.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return res.status(500).json({ error: 'Internal server error deleting skill.' });
  }
};

module.exports = {
  listSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
