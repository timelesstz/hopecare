import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware, roleCheck } from '../middleware/auth';
import prisma from '../services/prisma';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status === 'INACTIVE') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role: role.toUpperCase() }),
        ...(status && { status: status.toUpperCase() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', authMiddleware, roleCheck(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
