import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';
import { JwtPayload, UserRole } from '../../types';
import logger from '../../utils/logger';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh';
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
  private readonly jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    jobTitle?: string;
    employeeId?: string;
    organizationId?: string;
    departmentId?: string;
    role?: UserRole;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || UserRole.EMPLOYEE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        departmentId: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organizationId || undefined,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
        details: { method: 'email' },
      },
    });

    logger.info(`User registered: ${user.email}`);
    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organizationId || undefined,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    logger.info(`User logged in: ${user.email}`);
    return { user: userWithoutPassword, ...tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        organizationId: user.organizationId || undefined,
      });
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: { select: { id: true, name: true, logo: true } },
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        badges: true,
        _count: {
          select: {
            feedbacks: true,
            complaints: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) throw new Error('User not found');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    jobTitle: string;
  }>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        jobTitle: true,
        role: true,
      },
    });
    return user;
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
