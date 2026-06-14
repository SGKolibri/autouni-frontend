import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDeviceStore } from '@store/deviceStore';
import { useUIStore } from '@store/uiStore';
import { DeviceUpdateMessage, WebSocketMessage, NotificationType } from '@/types';
import { normalizeDeviceStatus } from '@utils/device';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const MAX_RECONNECT_ATTEMPTS = 10;

function requestPushPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendPushNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg' });
  }
}

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const updateDevice = useDeviceStore((state) => state.updateDevice);
  const updateDeviceStatus = useDeviceStore((state) => state.updateDeviceStatus);
  const updateDeviceOnline = useDeviceStore((state) => state.updateDeviceOnline);
  const setWsConnected = useDeviceStore((state) => state.setWsConnected);
  const addNotification = useUIStore((state) => state.addNotification);
  const updateRealtimeEnergy = useUIStore((state) => state.updateRealtimeEnergy);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setWsError(`Não foi possível reconectar após ${MAX_RECONNECT_ATTEMPTS} tentativas.`);
      return;
    }
    const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => connect(), delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    requestPushPermission();

    const token = localStorage.getItem('accessToken');

    socketRef.current = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false, // reconexão manual com backoff exponencial
    });

    // ── Conexão ──────────────────────────────────────────────────────────
    socketRef.current.on('connect', () => {
      reconnectAttemptRef.current = 0;
      setWsError(null);
      setWsConnected(true);
    });

    socketRef.current.on('disconnect', (reason) => {
      setWsConnected(false);
      if (reason !== 'io client disconnect') {
        scheduleReconnect();
      }
    });

    socketRef.current.on('connect_error', (error) => {
      setWsConnected(false);
      setWsError(`Erro de conexão: ${error.message}`);
      scheduleReconnect();
    });

    // ── Dispositivos ──────────────────────────────────────────────────────
    socketRef.current.on('device:update', (message: DeviceUpdateMessage) => {
      const { deviceId, status, online, intensity, temperature } = message;
      const updates: Partial<DeviceUpdateMessage> = {};
      if (status !== undefined) updates.status = normalizeDeviceStatus(status);
      if (online !== undefined) updates.online = online;
      if (intensity !== undefined) updates.intensity = intensity;
      if (temperature !== undefined) updates.temperature = temperature;
      updateDevice(deviceId, updates);
    });

    socketRef.current.on('device:status', (message: DeviceUpdateMessage) => {
      if (message.status) {
        updateDeviceStatus(message.deviceId, normalizeDeviceStatus(message.status));
      }
    });

    socketRef.current.on('device:online', (message: { deviceId: string; online: boolean; name?: string }) => {
      updateDeviceOnline(message.deviceId, message.online);

      if (!message.online) {
        const title = 'Dispositivo Offline';
        const body = `O dispositivo ${message.name || message.deviceId} está offline`;
        addNotification({
          id: `offline-${message.deviceId}-${Date.now()}`,
          userId: 'system',
          type: NotificationType.WARNING,
          title,
          message: body,
          read: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        sendPushNotification(title, body);
      }
    });

    // ── Energia em tempo real ─────────────────────────────────────────────
    socketRef.current.on('energy:update', (message: { power: number; energy: number; timestamp: string; deviceId?: string }) => {
      updateRealtimeEnergy(message);
    });

    socketRef.current.on('energy:alert', (message: { message?: string; threshold?: number; current?: number }) => {
      const title = 'Alerta de Consumo';
      const body = message.message || 'Consumo elevado detectado';
      addNotification({
        id: `energy-alert-${Date.now()}`,
        userId: 'system',
        type: NotificationType.WARNING,
        title,
        message: body,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      sendPushNotification(title, body);
    });

    // ── Notificações do sistema ───────────────────────────────────────────
    socketRef.current.on('notification', (message: WebSocketMessage) => {
      const title = 'Notificação do Sistema';
      const body = (message.data as any)?.message || 'Nova notificação';
      addNotification({
        id: `notification-${Date.now()}`,
        userId: 'system',
        type: NotificationType.INFO,
        title,
        message: body,
        read: false,
        createdAt: message.timestamp,
        updatedAt: message.timestamp,
      });
      sendPushNotification(title, body);
    });
  }, [updateDevice, updateDeviceStatus, updateDeviceOnline, setWsConnected, addNotification, updateRealtimeEnergy, scheduleReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptRef.current = MAX_RECONNECT_ATTEMPTS; // impede reconexão automática
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setWsConnected(false);
    }
  }, [setWsConnected]);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  const unsubscribe = useCallback((event: string, callback?: (data: unknown) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  useEffect(() => {
    reconnectAttemptRef.current = 0;
    connect();
    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connect,
    disconnect,
    emit,
    subscribe,
    unsubscribe,
    isConnected: socketRef.current?.connected ?? false,
    wsError,
  };
};
