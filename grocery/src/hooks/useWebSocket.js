import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function useWebSocket(user) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (isConnecting || isConnected || !user) return;

    setIsConnecting(true);

    import('socket.io-client').then(({ io }) => {
      try {

        const socket = io(API_BASE_URL, {
          auth: {
            token: localStorage.getItem('token') || '',
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setIsConnecting(false);
          reconnectAttemptsRef.current = 0;

          if (user._id) {
            socket.emit('join-user-room', user._id);
          }

          if (user.role === 'admin') {
            socket.emit('join-admin-room');
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          setIsConnected(false);
          setIsConnecting(false);

          if (reason !== 'io client disconnect') {
            attemptReconnect();
          }
        });

        socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          setIsConnecting(false);

          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            attemptReconnect();
          }
        });

        socket.on('error', (error) => {
          console.error('WebSocket error:', error);
        });

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnecting(false);
        attemptReconnect();
      }
    }).catch((error) => {
      console.error('Failed to load socket.io-client:', error);
      setIsConnecting(false);
    });
  }, [user, isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = 0;
      }
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts || !user) return;

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);

    console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, user]);

  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  useEffect(() => {
    if (user && !isConnected && !isConnecting) {
      connect();
    } else if (!user) {
      disconnect();
    }

    return () => {

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, connect, disconnect, isConnected, isConnecting]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    emit,
  };
}

export function useOrderWebSocket(user, onOrderStatusUpdate, onNewOrder) {
  const socketRef = useRef(null);
  const { isConnected } = useWebSocket(user);

  useEffect(() => {
    if (!user || !isConnected) return;

    import('socket.io-client').then(({ io }) => {

      const socket = io(API_BASE_URL, {
        auth: {
          token: localStorage.getItem('token') || '',
        },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('order_status_updated', (data) => {
        console.log('Order status updated:', data);
        if (onOrderStatusUpdate) {
          onOrderStatusUpdate(data);
        }
      });

      if (user.role === 'admin' && onNewOrder) {
        socket.on('new_order', (data) => {
          console.log('New order received:', data);
          onNewOrder(data);
        });
      }

      return () => {
        socket.off('order_status_updated');
        if (user.role === 'admin') {
          socket.off('new_order');
        }
      };
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('order_status_updated');
        if (user.role === 'admin') {
          socketRef.current.off('new_order');
        }
      }
    };
  }, [user, isConnected, onOrderStatusUpdate, onNewOrder]);

  return { isConnected };
}