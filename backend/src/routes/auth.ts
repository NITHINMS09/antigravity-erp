// @ts-nocheck
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'staff',
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
        details: `User ${user.name} registered`,
      },
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `User ${user.name} logged in`,
      },
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user info.' });
  }
});

// GET /api/auth/users (admin only)
router.get('/users', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'super_admin' && req.user!.role !== 'manager') {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { email, newPassword, newEmail } = req.body;
    
    // Only admins or the user themselves can change password
    if (req.user!.role !== 'super_admin' && req.user!.role !== 'manager' && req.user!.email !== email) {
      res.status(403).json({ error: 'Insufficient permissions to change account details.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const updateData: any = { password: hashedPassword };
    if (newEmail) {
      // check if new email is already in use
      if (newEmail !== email) {
        const existing = await prisma.user.findUnique({ where: { email: newEmail } });
        if (existing) {
          res.status(400).json({ error: 'Email already in use.' });
          return;
        }
      }
      updateData.email = newEmail;
    }

    await prisma.user.update({
      where: { email },
      data: updateData
    });

    res.json({ message: 'Account details updated successfully.' });
  } catch (error: any) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

export default router;
