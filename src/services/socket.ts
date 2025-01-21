import { Server, Socket } from 'socket.io';
import Session from '../models/session'; 
import { statusInt } from '../interface';
import Chat from '../models/chat';

export const setupSocket = (io: Server) => {
  // Middleware for authenticating socket connections
  io.use(async (socket, next) => {
    const sessionId = socket.handshake.query.sessionId as string;
    const userId = socket.handshake.query.userId as string;

    if (!sessionId || !userId) {
      return next(new Error('Authentication error: Missing sessionId or userId'));
    }

    try {
      const session = await Session.findById(sessionId);
      if (!session) {
        return next(new Error('Authentication error: Session not found'));
      }

      if (session.userId.toString() !== userId) {
        return next(new Error('Authentication error: Unauthorized user'));
      }

      if (session.status !== statusInt.STARTED) {
        return next(new Error('Authentication error: Session not active'));
      }

      socket.data.session = session;
      return next();
    } catch (error) {
      console.error('Authentication error:', error);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const session = socket.data.session; // Retrieved from middleware
  
    console.log(`User connected to session: ${session._id}`);
  
    // Join the session's room
    socket.join(session._id.toString());
  
    // Listen for messages
    socket.on('send_message', async (data) => {
      const { text } = data;
  
      if (!text) {
        return socket.emit('error', { message: 'Message text is required.' });
      }
  
      // Save the message in the database
      const message = {
        sessionId: session._id,
        sender: socket.id, // Replace with userId/username in production
        text,
        timestamp: new Date(),
      };
      await Chat.create(message);
  
      // Broadcast the message to the other participant
      socket.to(session._id.toString()).emit('receive_message', message);
    });
  
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected from session: ${session._id}`);
    });
  });
}
  