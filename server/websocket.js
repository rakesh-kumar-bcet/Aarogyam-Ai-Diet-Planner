const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const clientsByUserId = new Map();
let wss;

const verifySocketToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('WebSocket token verification failed:', error.message);
    return null;
  }
};

const broadcastEvent = (userId, event) => {
  if (!userId || !clientsByUserId.has(userId)) return;
  const sockets = clientsByUserId.get(userId);
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(event));
    }
  });
};

const initWebSocket = (server) => {
  if (wss) return wss;
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const user = verifySocketToken(token);

    if (!user || !user.id) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const userId = user.id.toString();
    ws.userId = userId;
    ws.role = user.role;

    const sockets = clientsByUserId.get(userId) || new Set();
    sockets.add(ws);
    clientsByUserId.set(userId, sockets);

    ws.send(JSON.stringify({ type: 'socket.connected', payload: { userId, role: user.role } }));

    ws.on('message', (message) => {
      try {
        const event = JSON.parse(message.toString());
        if (event?.type === 'socket.ping') {
          ws.send(JSON.stringify({ type: 'socket.pong', payload: { timestamp: Date.now() } }));
        }

        if ([
          'call.offer',
          'call.answer',
          'call.ice',
          'call.end'
        ].includes(event?.type)) {
          const targetUserId = event.payload?.targetUserId;
          if (targetUserId) {
            const payload = {
              ...event.payload,
              fromUserId: userId,
              fromRole: user.role,
            };
            broadcastEvent(targetUserId.toString(), { type: event.type, payload });
          }
        }
      } catch (err) {
        console.warn('Invalid WebSocket message:', err.message);
      }
    });

    ws.on('close', () => {
      const set = clientsByUserId.get(userId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          clientsByUserId.delete(userId);
        }
      }
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  console.log('✅ WebSocket server initialized on path /ws');
  return wss;
};

const notifyUser = (userId, payload) => {
  broadcastEvent(userId, { type: 'notification', payload });
};

const notifyNutritionist = (nutritionistId, payload) => {
  broadcastEvent(nutritionistId, { type: 'notification', payload });
};

const sendToUser = (userId, eventType, payload) => {
  broadcastEvent(userId, { type: eventType, payload });
};

const sendToNutritionist = (nutritionistId, eventType, payload) => {
  broadcastEvent(nutritionistId, { type: eventType, payload });
};

module.exports = {
  initWebSocket,
  notifyUser,
  notifyNutritionist,
  sendToUser,
  sendToNutritionist,
};
