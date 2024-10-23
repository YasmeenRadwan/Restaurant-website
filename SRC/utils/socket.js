import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const connectionId = socket.id;
    const userId = socket.handshake.query.id;
    console.log(`New client connected with ID: ${connectionId}`);

    socket.join(userId);

    socket.on('disconnect', () => {
      console.log(`Client with ID ${connectionId} disconnected`);
    });
  });
};

export const push = (userId, data) => {
  if (io) {
    console.log("push to ", userId);
    io.to(userId).emit('notification', data);
  }
};

export const updateOrder = (userId, data) => {
  if (io) {
    io.to(userId).emit('orderStatus', data);
  }
};
