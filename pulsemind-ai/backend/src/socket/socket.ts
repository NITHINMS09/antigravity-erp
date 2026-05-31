import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

let io: Server;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        (socket as any).user = decoded;
        next();
      } catch { next(new Error('Authentication error')); }
    } else { next(new Error('Authentication required')); }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info(`Socket connected: ${user?.email}`);
    socket.join(`user:${user?.userId}`);
    if (user?.organizationId) socket.join(`org:${user.organizationId}`);

    socket.on('join:department', (deptId: string) => { socket.join(`dept:${deptId}`); });
    socket.on('join:chat', (roomId: string) => { socket.join(`chat:${roomId}`); });

    socket.on('chat:message', (data: { roomId: string; content: string }) => {
      io.to(`chat:${data.roomId}`).emit('chat:message', { senderId: user.userId, content: data.content, timestamp: new Date() });
    });

    socket.on('typing', (data: { roomId: string }) => {
      socket.to(`chat:${data.roomId}`).emit('typing', { userId: user.userId });
    });

    socket.on('disconnect', () => { logger.info(`Socket disconnected: ${user?.email}`); });
  });

  return io;
}

export function getIO() { return io; }

export function emitToUser(userId: string, event: string, data: any) { io?.to(`user:${userId}`).emit(event, data); }
export function emitToOrg(orgId: string, event: string, data: any) { io?.to(`org:${orgId}`).emit(event, data); }
export function emitToDept(deptId: string, event: string, data: any) { io?.to(`dept:${deptId}`).emit(event, data); }
export function emitToAll(event: string, data: any) { io?.emit(event, data); }
