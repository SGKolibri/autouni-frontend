import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDeviceStore } from '@store/deviceStore';
import { useUIStore } from '@store/uiStore';
import { DeviceUpdateMessage, WebSocketMessage, NotificationType } from '@types/index';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const updateDevice = useDeviceStore((state) => state.updateDevice);
  const updateDeviceStatus = useDeviceStore((state) => state.updateDeviceStatus);
  const updateDeviceOnline = useDeviceStore((state) => state.updateDeviceOnline);
  const setWsConnected = useDeviceStore((state) => state.setWsConnected);
  const addNotification = useUIStore((state) => state.addNotification);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('accessToken');
    
    socketRef.current = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setWsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setWsConnected(false);
    });

    // Device update events
    socketRef.current.on('device:update', (message: DeviceUpdateMessage) => {
      const { deviceId, status, online, intensity, temperature, energy } = message;
      
      const updates: any = {};
      if (status !== undefined) updates.status = status;
      if (online !== undefined) updates.online = online;
      if (intensity !== undefined) updates.intensity = intensity;
      if (temperature !== undefined) updates.temperature = temperature;
      
      updateDevice(deviceId, updates);
    });

    socketRef.current.on('device:status', (message: DeviceUpdateMessage) => {
      if (message.status) {
        updateDeviceStatus(message.deviceId, message.status);
      }
    });

    socketRef.current.on('device:online', (message: { deviceId: string; online: boolean }) => {
      updateDeviceOnline(message.deviceId, message.online);
      
      // Criar notificação se dispositivo ficar offline
      if (!message.online) {
        addNotification({
          id: `offline-${message.deviceId}-${Date.now()}`,
          type: NotificationType.WARNING,
          title: 'Dispositivo Offline',
          message: `O dispositivo ${message.deviceId} está offline`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Energy alerts
    socketRef.current.on('energy:alert', (message: any) => {
      addNotification({
        id: `energy-alert-${Date.now()}`,
        type: NotificationType.WARNING,
        title: 'Alerta de Consumo',
        message: message.message || 'Consumo elevado detectado',
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    // System notifications
    socketRef.current.on('notification', (message: WebSocketMessage) => {
      addNotification({
        id: `notification-${Date.now()}`,
        type: NotificationType.INFO,
        title: 'Notificação do Sistema',
        message: message.data.message || 'Nova notificação',
        read: false,
        createdAt: message.timestamp,
      });
    });

  }, [updateDevice, updateDeviceStatus, updateDeviceOnline, setWsConnected, addNotification]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setWsConnected(false);
    }
  }, [setWsConnected]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const unsubscribe = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    emit,
    subscribe,
    unsubscribe,
    isConnected: socketRef.current?.connected || false,
  };
};