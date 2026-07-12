import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export function useSocket(user) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Reuse existing connection
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    }
    socketRef.current = socketInstance;

    // Join appropriate room based on role
    if (user.role === 'consumer') {
      socketInstance.emit('join_user_room', user.id);
    } else if (user.role === 'vendor') {
      socketInstance.emit('join_vendor_room', user.id);
    }
    // Riders join region room only when they go online (handled in RiderDashboard)

    return () => {
      // Don't disconnect on unmount — keep connection alive across pages
    };
  }, [user]);

  return socketRef;
}

export function getSocket() {
  return socketInstance;
}

export function connectSocket() {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  }
  return socketInstance;
}
