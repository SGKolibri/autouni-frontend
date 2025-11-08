import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { EnergyStats, EnergyReading } from '@types/index';

interface UseEnergyDataOptions {
  level?: 'general' | 'building' | 'floor' | 'room';
  id?: string;
  period?: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useEnergyData = (options: UseEnergyDataOptions = {}) => {
  const {
    level = 'general',
    id,
    period = 'today',
    startDate,
    endDate,
    enabled = true,
    refetchInterval = 60000, // 1 minute
  } = options;

  // Fetch energy statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['energy', 'stats', level, id, period, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', period);
      
      if (level !== 'general' && id) {
        params.append('level', level);
        params.append('id', id);
      }
      
      if (period === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const response = await apiService.get<EnergyStats>(
        `/energy/stats?${params.toString()}`
      );
      return response.data;
    },
    enabled,
    refetchInterval,
  });

  // Fetch energy history for charts
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ['energy', 'history', level, id, period, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', period);
      
      if (level !== 'general' && id) {
        params.append('level', level);
        params.append('id', id);
      }
      
      if (period === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const response = await apiService.get<EnergyReading[]>(
        `/energy/history?${params.toString()}`
      );
      return response.data;
    },
    enabled,
    refetchInterval,
  });

  // Fetch real-time power consumption
  const {
    data: realtime,
    isLoading: realtimeLoading,
    error: realtimeError,
  } = useQuery({
    queryKey: ['energy', 'realtime', level, id],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (level !== 'general' && id) {
        params.append('level', level);
        params.append('id', id);
      }

      const response = await apiService.get<{ power: number; timestamp: string }>(
        `/energy/realtime?${params.toString()}`
      );
      return response.data;
    },
    enabled,
    refetchInterval: 5000, // 5 seconds for realtime
  });

  return {
    stats,
    history,
    realtime,
    isLoading: statsLoading || historyLoading || realtimeLoading,
    error: statsError || historyError || realtimeError,
  };
};