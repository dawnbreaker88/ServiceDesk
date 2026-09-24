import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join user room for targeted notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Join role-specific channels (e.g., 'role:TECHNICIAN', 'role:MANAGER', 'role:ADMIN')
    socket.on('join_role', (role) => {
      if (role) {
        socket.join(`role:${role}`);
      }
    });

    // Join ticket-specific live updates
    socket.on('join_ticket', (ticketId) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
      }
    });

    socket.on('leave_ticket', (ticketId) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean up handled automatically by socket.io
    });
  });

  console.log('⚡ [Socket.io] Realtime engine initialized');
  return io;
};

export const getIO = () => io;

export const emitEvent = (event, data, room = null) => {
  if (!io) return;
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};
