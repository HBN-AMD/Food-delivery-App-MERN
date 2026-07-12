import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export function useSocket(user) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: { token }
      });
    }
    socketRef.current = socketInstance;

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
  const token = localStorage.getItem('token');
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });
  }
  return socketInstance;
}
