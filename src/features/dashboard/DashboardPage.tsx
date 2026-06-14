import { Box, Typography, Paper, Skeleton } from "@mui/material";
import {
  BoltOutlined,
  DevicesOutlined,
  WarningAmberOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import KPICard from "@components/common/KPICard";
import { useWebSocket } from "@hooks/useWebSocket";
import apiService from "@services/api";
import EnergyChart from "@components/charts/EnergyChart";
import DeviceStatusPieChart from "@components/charts/DeviceStatusPieChart";
import BuildingsList from "./components/BuildingList";
import { DeviceType, GlobalEnergyStats } from "@/types";

const DEVICE_TYPE_COLORS: Record<string, string> = {
  LIGHT: "#fbbf24",
  AC: "#3b82f6",
  PROJECTOR: "#8b5cf6",
  SPEAKER: "#ec4899",
  LOCK: "#6b7280",
  SENSOR: "#10b981",
  OTHER: "#64748b",
};

const DEVICE_TYPE_LABELS: Record<string, string> = {
  [DeviceType.LIGHT]: "Iluminação",
  [DeviceType.AC]: "Ar Condicionado",
  [DeviceType.PROJECTOR]: "Projetor",
  [DeviceType.SPEAKER]: "Alto-falante",
  [DeviceType.LOCK]: "Fechadura",
  [DeviceType.SENSOR]: "Sensor",
  [DeviceType.OTHER]: "Outro",
};

const BUILDING_BAR_COLORS = [
  "#667eea",
  "#764ba2",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

const DashboardPage = () => {
  useWebSocket();

  const { data: deviceStats, isLoading: statsLoading } = useQuery({
    queryKey: ["devices", "stats"],
    queryFn: () => apiService.getDeviceStats(),
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => apiService.getUnreadNotifications(),
    refetchInterval: 30000,
  });

  const { data: buildings } = useQuery({
    queryKey: ["buildings"],
    queryFn: () => apiService.getBuildings(),
  });

  const { data: energyData, isLoading: energyLoading } = useQuery<GlobalEnergyStats>({
    queryKey: ["dashboard", "energy"],
    queryFn: () => apiService.getGlobalEnergyStats('today'),
    refetchInterval: 60000,
  });

  const stats = {
    totalEnergy: energyData?.totalKwh ?? 0,
    activeDevices: deviceStats?.activeDevices ?? 0,
    totalDevices: deviceStats?.totalDevices ?? 0,
    estimatedCost: energyData?.totalKwh ? energyData.totalKwh * 0.85 : 0,
    activeAlerts: Array.isArray(notifications) ? notifications.length : 0,
  };

  // Device type energy breakdown — not available from /energy/stats; left for future endpoint
  const deviceTypeChartData: { name: string; value: number; color: string }[] = [];

  // Buildings energy ranking
  const buildingChartData = buildings
    ? [...buildings]
        .filter((b) => (b.totalEnergy ?? 0) > 0)
        .sort((a, b) => (b.totalEnergy ?? 0) - (a.totalEnergy ?? 0))
        .slice(0, 6)
        .map((b, i) => ({
          name: b.name.length > 18 ? b.name.slice(0, 18) + "…" : b.name,
          value: b.totalEnergy ?? 0,
          color: BUILDING_BAR_COLORS[i % BUILDING_BAR_COLORS.length],
        }))
    : [];

  const paperSx = {
    p: { xs: 2, sm: 3, md: 4 },
    background: "#FFFFFF",
    borderRadius: 3,
    border: "1px solid #E5E7EB",
    minWidth: 0,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 1,
            background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Visão geral do sistema em tempo real
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: { xs: 2, md: 3 },
          mb: 4,
        }}
      >
        <KPICard
          title="Consumo Total"
          value={stats.totalEnergy ? `${stats.totalEnergy.toFixed(2)} kWh` : "0 kWh"}
          icon={<BoltOutlined />}
          color="primary"
          loading={energyLoading}
        />
        <KPICard
          title="Dispositivos Ativos"
          value={stats.activeDevices}
          subtitle={`de ${stats.totalDevices} dispositivos`}
          icon={<DevicesOutlined />}
          color="success"
          loading={statsLoading}
        />
        <KPICard
          title="Custo Estimado"
          value={stats.estimatedCost ? `R$ ${stats.estimatedCost.toFixed(2)}` : "R$ 0,00"}
          subtitle="este mês"
          icon={<TrendingUpOutlined />}
          color="info"
          loading={energyLoading}
        />
        <KPICard
          title="Alertas Ativos"
          value={stats.activeAlerts}
          icon={<WarningAmberOutlined />}
          color="warning"
          loading={statsLoading}
        />
      </Box>

      {/* Row 1: Energy history + Device status */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" },
          gap: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        <Paper sx={paperSx}>
          <Box sx={{ mb: 2 }}>
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

        <Paper sx={paperSx}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Status dos Dispositivos
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Distribuição por estado
            </Typography>
          </Box>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          ) : (
            <DeviceStatusPieChart data={deviceStats} height={280} />
          )}
        </Paper>
      </Box>

      {/* Row 2: Device type energy + Building ranking */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        {/* Device type energy breakdown */}
        <Paper sx={paperSx}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Consumo por Tipo
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Distribuição de energia por tipo de dispositivo
            </Typography>
          </Box>
          {energyLoading ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
          ) : deviceTypeChartData.length > 0 ? (
            <Box>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={deviceTypeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="75%"
                    dataKey="value"
                    labelLine={false}
                  >
                    {deviceTypeChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                    formatter={(value: number) => [`${value.toFixed(2)} kWh`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center",
                  mt: 1,
                }}
              >
                {deviceTypeChartData.map((entry) => (
                  <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: entry.color }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {entry.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box
              sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                Sem dados disponíveis
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Building energy ranking */}
        <Paper sx={paperSx}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              Consumo por Prédio
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Ranking de consumo energético
            </Typography>
          </Box>
          {!buildings ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
          ) : buildingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={buildingChartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  stroke="#E5E7EB"
                  tickFormatter={(v) => `${v.toFixed(0)}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  stroke="#E5E7EB"
                  width={110}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                  formatter={(value: number) => [`${value.toFixed(2)} kWh`, "Consumo"]}
                />
                <Bar dataKey="value" maxBarSize={22} radius={[0, 4, 4, 0]}>
                  {buildingChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                Sem dados de consumo por prédio
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Buildings List */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          background: "#FFFFFF",
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
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
