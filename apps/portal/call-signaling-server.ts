import http from 'http';
import { Server } from 'socket.io';

type UserMap = Map<string, string>;

const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const users: UserMap = new Map();

function emitToUser(userId: string, event: string, payload: unknown) {
  const socketId = users.get(userId);
  if (!socketId) return false;
  io.to(socketId).emit(event, payload);
  return true;
}

io.on('connection', socket => {
  let currentUserId: string | null = null;

  socket.on('register', ({ userId }: { userId?: string }) => {
    if (!userId) return;
    currentUserId = String(userId);
    users.set(currentUserId, socket.id);
    socket.emit('registered', { userId: currentUserId });
    console.log(`[calls] ${currentUserId} online`);
  });

  socket.on('call:offer', payload => {
    const ok = emitToUser(String(payload.to), 'call:offer', payload);
    if (!ok) socket.emit('call:user-offline', { to: payload.to });
  });

  socket.on('call:answer', payload => {
    emitToUser(String(payload.to), 'call:answer', payload);
  });

  socket.on('call:ice-candidate', payload => {
    emitToUser(String(payload.to), 'call:ice-candidate', payload);
  });

  socket.on('call:end', payload => {
    emitToUser(String(payload.to), 'call:end', payload);
  });

  socket.on('disconnect', () => {
    if (currentUserId && users.get(currentUserId) === socket.id) {
      users.delete(currentUserId);
      console.log(`[calls] ${currentUserId} offline`);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`[calls] signaling server running on http://localhost:${PORT}`);
});
