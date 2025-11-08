import { Box, Typography, Paper, Skeleton } from "@mui/material";
import {
  BoltOutlined,
  DevicesOutlined,
  WarningAmberOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import KPICard from "@components/common/KPICard";
import { useWebSocket } from "@hooks/useWebSocket";
import apiService from "@services/api";
import EnergyChart from "@components/charts/EnergyChart";
import BuildingsList from "./components/BuildingList";

const DashboardPage = () => {
  // Inicializa WebSocket para atualizações em tempo real
  useWebSocket();

  // Fetch device stats
  const { data: deviceStats, isLoading: statsLoading } = useQuery({
    queryKey: ["devices", "stats"],
    queryFn: async () => {
      const response = await apiService.get("/devices/stats");
      return response.data;
    },
    refetchInterval: 30000, // Refetch a cada 30s
  });

  // Fetch notifications (for alerts count)
  const { data: notifications } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const response = await apiService.get("/notifications/me/unread");
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch buildings for energy aggregation
  const { data: buildings } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const response = await apiService.get("/buildings");
      return response.data;
    },
  });

  // Fetch energy data from first building (or aggregate)
  const { data: energyData, isLoading: energyLoading } = useQuery({
    queryKey: ["dashboard", "energy", buildings?.[0]?.id],
    queryFn: async () => {
      if (!buildings || buildings.length === 0) return [];
      // Usa estatísticas de energia do primeiro prédio como exemplo
      const response = await apiService.get(`/energy/buildings/${buildings[0].id}/stats`);
      return response.data;
    },
    enabled: !!buildings && buildings.length > 0,
    refetchInterval: 60000, // Refetch a cada 1min
  });

  // Aggregate stats from available data
  const stats = {
    totalEnergy: energyData?.totalKwh || 0,
    activeDevices: deviceStats?.activeDevices || 0,
    totalDevices: deviceStats?.totalDevices || 0,
    estimatedCost: energyData?.totalKwh ? energyData.totalKwh * 0.85 : 0,
    activeAlerts: Array.isArray(notifications) ? notifications.length : 0,
    energyTrend: energyData?.trend,
    costTrend: energyData?.trend,
  };

  return (
    <Box>
      {/* Header Moderno */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={700}
          sx={{ 
            mb: 1,
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Visão geral do sistema em tempo real
        </Typography>
      </Box>

      {/* KPI Cards - Full Width Flex */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <KPICard
            title="Consumo Total"
            value={
              stats?.totalEnergy
                ? `${stats.totalEnergy.toFixed(2)} kWh`
                : "0 kWh"
            }
            icon={<BoltOutlined />}
            color="primary"
            trend={stats?.energyTrend}
            loading={energyLoading}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <KPICard
            title="Dispositivos Ativos"
            value={stats?.activeDevices || 0}
            subtitle={`de ${stats?.totalDevices || 0} dispositivos`}
            icon={<DevicesOutlined />}
            color="success"
            loading={statsLoading}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <KPICard
            title="Custo Estimado"
            value={
              stats?.estimatedCost
                ? `R$ ${stats.estimatedCost.toFixed(2)}`
                : "R$ 0,00"
            }
            subtitle="este mês"
            icon={<TrendingUpOutlined />}
            color="info"
            trend={stats?.costTrend}
            loading={energyLoading}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <KPICard
            title="Alertas Ativos"
            value={stats?.activeAlerts || 0}
            icon={<WarningAmberOutlined />}
            color="warning"
            loading={statsLoading}
          />
        </Box>
      </Box>

      {/* Charts & Info Row */}
      <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
          mb: 4,
        }}>
        {/* Energy Chart - Takes ~70% width on desktop */}
        <Paper 
          sx={{ 
            flex: 2,
            minWidth: 0,
            p: 4, 
            background: '#FFFFFF',
            borderRadius: 3,
            border: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Consumo Energético
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Últimas 24 horas
            </Typography>
          </Box>
          {energyLoading ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : (
            <EnergyChart data={energyData} />
          )}
        </Paper>

        {/* Device Status - Takes ~30% width on desktop */}
        <Paper 
          sx={{ 
            flex: 1,
            minWidth: 0,
            maxWidth: { lg: '400px' },
            p: 4, 
            background: '#FFFFFF',
            borderRadius: 3,
            border: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Status dos Dispositivos
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Distribuição por estado
            </Typography>
          </Box>
          
          {statsLoading ? (
            <Box>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Box>
          ) : (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="body2" fontWeight={500}>Ativos</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  {stats?.activeDevices || 0}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'grey.400' }} />
                  <Typography variant="body2" fontWeight={500}>Inativos</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  {(stats?.totalDevices || 0) - (stats?.activeDevices || 0)}
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: '#F9FAFB', 
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Total de Dispositivos
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.totalDevices || 0}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Buildings List */}
      <Paper 
        sx={{ 
          p: 3,
          background: '#FFFFFF',
          borderRadius: 3,
          border: '1px solid #E5E7EB',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            Prédios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral de todos os prédios
          </Typography>
        </Box>
        <BuildingsList />
      </Paper>
    </Box>
  );
};

export default DashboardPage;
