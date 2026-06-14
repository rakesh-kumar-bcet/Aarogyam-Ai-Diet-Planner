const subscribers = new Map();
let socket = null;
let reconnectTimer = null;

const getSocketUrl = () => {
  const token = localStorage.getItem('token');
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;
  const defaultPort = process.env.REACT_APP_WS_PORT || '5002';
  const baseUrl = process.env.REACT_APP_WS_URL || `${protocol}://${host}:${defaultPort}/ws`;
  return `${baseUrl}?token=${encodeURIComponent(token || '')}`;
};

const notifySubscribers = (event) => {
  const type = event?.type || '';
  if (subscribers.has('all')) {
    subscribers.get('all').forEach((handler) => handler(event));
  }
  if (subscribers.has(type)) {
    subscribers.get(type).forEach((handler) => handler(event));
  }
};

const connectSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  const url = getSocketUrl();
  socket = new WebSocket(url);

  socket.addEventListener('open', () => {
    notifySubscribers({ type: 'socket.connected', payload: { url } });
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  socket.addEventListener('message', (message) => {
    try {
      const event = JSON.parse(message.data);
      notifySubscribers(event);
    } catch (err) {
      console.warn('Socket receive error:', err);
    }
  });

  socket.addEventListener('close', () => {
    notifySubscribers({ type: 'socket.closed' });
    socket = null;
    reconnectTimer = setTimeout(() => {
      connectSocket();
    }, 5000);
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

const sendSocket = (type, payload = {}) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }
  socket.send(JSON.stringify({ type, payload }));
  return true;
};

const subscribe = (type, handler) => {
  if (!subscribers.has(type)) {
    subscribers.set(type, new Set());
  }
  subscribers.get(type).add(handler);
  return () => unsubscribe(type, handler);
};

const unsubscribe = (type, handler) => {
  if (!subscribers.has(type)) return;
  subscribers.get(type).delete(handler);
};

const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

export {
  connectSocket,
  subscribe,
  unsubscribe,
  sendSocket,
  disconnectSocket,
};
