import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// ============================================
// Socket Context Types
// ============================================

interface SocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onBotUpdate?: (data: any) => void;
  onNewRecording?: (data: any) => void;
  onSystemAlert?: (data: any) => void;
  onPaymentStatus?: (data: any) => void;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any, callback?: (response: any) => void) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// ============================================
// Socket Provider Component
// ============================================

interface SocketProviderProps {
  children: ReactNode;
  url?: string;
  options?: any;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function SocketProvider({
  children,
  url = SOCKET_URL,
  options = {},
}: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const eventHandlersRef = useRef<SocketEventHandlers>({});

  // Initialize socket connection
  const connect = () => {
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const newSocket = io(url, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
        ...options,
      });

      // Store reference
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection handlers
      newSocket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        eventHandlersRef.current.onConnect?.();
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        setIsConnecting(false);
        eventHandlersRef.current.onDisconnect?.();
      });

      newSocket.on('connect_error', (error: Error) => {
        setIsConnecting(false);
        setConnectionError(error.message);
        eventHandlersRef.current.onError?.(error);
      });

      newSocket.on('error', (error: Error) => {
        setConnectionError(error.message);
        eventHandlersRef.current.onError?.(error);
      });

      // Custom event handlers
      newSocket.on('bot_update', (data) => {
        eventHandlersRef.current.onBotUpdate?.(data);
      });

      newSocket.on('new_recording', (data) => {
        eventHandlersRef.current.onNewRecording?.(data);
      });

      newSocket.on('system_alert', (data) => {
        eventHandlersRef.current.onSystemAlert?.(data);
      });

      newSocket.on('payment_status', (data) => {
        eventHandlersRef.current.onPaymentStatus?.(data);
      });

    } catch (error) {
      setIsConnecting(false);
      setConnectionError((error as Error).message);
      console.error('[SocketProvider] Connection error:', error);
    }
  };

  // Disconnect socket
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Emit event
  const emit = (event: string, data?: any, callback?: (response: any) => void) => {
    if (socketRef.current && socketRef.current.connected) {
      if (callback) {
        socketRef.current.emit(event, data, callback);
      } else {
        socketRef.current.emit(event, data);
      }
    } else {
      console.warn(`[SocketProvider] Cannot emit event "${event}": socket not connected`);
    }
  };

  // Register event handler
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Remove event handler
  const off = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [url, JSON.stringify(options)]);

  // Reconnect if not connected
  useEffect(() => {
    if (!isConnected && !isConnecting && !connectionError) {
      const timer = setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, connectionError]);

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketProvider;
