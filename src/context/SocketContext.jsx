import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = connectSocket(user);
      setSocketInstance(socket);

      const onConnect = () => {
        setIsConnected(true);
      };

      const onDisconnect = () => {
        setIsConnected(false);
      };

      const onNotification = (notif) => {
        if (notif && notif.title) {
          toast.info(`${notif.title}: ${notif.message || ''}`);
        }
      };

      const onRoleNotification = (notif) => {
        if (notif && notif.title) {
          toast.info(`${notif.title}: ${notif.message || ''}`);
        }
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('notification:new', onNotification);
      socket.on('notification:role', onRoleNotification);

      if (socket.connected) {
        setIsConnected(true);
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('notification:new', onNotification);
        socket.off('notification:role', onRoleNotification);
      };
    } else {
      disconnectSocket();
      setIsConnected(false);
      setSocketInstance(null);
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
