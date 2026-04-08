import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  FileDownload,
  TrendingUp,
  TrendingDown,
  BoltOutlined,
  WifiTethering,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { Building, EnergyComparisonItem, EnergyStats } from '@/types';
import EnergyChart from '@components/charts/EnergyChart';
import GaugeChart from '@components/charts/GaugeChart';
import HeatmapChart, { HeatmapData } from '@components/charts/HeatmapChart';
import TreeMapChart, { TreeMapNode } from '@components/charts/TreeMapChart';
import RadarChartComponent, { RadarSeries } from '@components/charts/RadarChartComponent';
import ComposedEnergyChart, { ComposedDataPoint } from '@components/charts/ComposedEnergyChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUIStore } from '@store/uiStore';

type Period = 'today' | 'week' | 'month' | 'custom';
type Level = 'general' | 'building' | 'floor' | 'room';

const COLORS = ['#1976D2', '#388E3C', '#FF9800', '#D32F2F', '#0288D1', '#7B1FA2'];

// ── helpers to build demo data from stats ────────────────────────────────────
function buildHeatmapData(comparison: EnergyComparisonItem[] | undefined): HeatmapData[] {
  if (!comparison || comparison.length === 0) return [];
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return comparison.slice(0, 6).map((item) => ({
    id: item.name,
    data: days.map((d, i) => ({
      x: d,
      y: parseFloat((item.energy * (0.1 + Math.sin(i + item.energy) * 0.05)).toFixed(2)),
    })),
  }));
}

function buildTreeMapData(stats: EnergyStats | undefined): TreeMapNode {
  const byType = stats?.byDeviceType ?? {};
  const children = Object.entries(byType).map(([name, value]) => ({ name, value: Number(value) }));
  return { name: 'Consumo', children: children.length ? children : [{ name: 'Sem dados', value: 1 }] };
}

function buildRadarData(comparison: EnergyComparisonItem[] | undefined) {
  const metrics = ['Consumo', 'Eficiência', 'Pico', 'Custo', 'Ocupação'];
  return metrics.map((m, mi) => {
    const entry: Record<string, number | string> = { subject: m };
    comparison?.slice(0, 3).forEach((item) => {
      entry[item.name] = parseFloat((item.energy * (0.6 + mi * 0.1)).toFixed(1));
    });
    return entry;
  });
}

function buildComposedData(comparison: EnergyComparisonItem[] | undefined): ComposedDataPoint[] {
  if (!comparison) return [];
  return comparison.slice(0, 8).map((item) => ({
    label: item.name,
    consumption: item.energy,
    cost: item.energy * 0.85,
    target: item.energy * 0.9,
  }));
}

const EnergyPage = () => {
  const [period, setPeriod] = useState<Period>('today');
  const [level, setLevel] = useState<Level>('general');
  const [selectedId, setSelectedId] = useState<string>('');
  const realtimeEnergy = useUIStore((state) => state.realtimeEnergy);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['energy', 'stats', period, level, selectedId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (level !== 'general' && selectedId) {
        params.append('level', level);
        params.append('id', selectedId);
      }
      const response = await apiService.get<EnergyStats>(`/energy/stats?${params.toString()}`);
      return response.data;
    },
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ['energy', 'chart', period, level, selectedId],
    queryFn: async () => {
      const response = await apiService.get<any[]>(`/energy/history?period=${period}&level=${level}&id=${selectedId}`);
      return response.data;
    },
  });

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await apiService.get<Building[]>('/buildings');
      return response.data;
    },
    enabled: level === 'building',
  });

  const { data: comparison } = useQuery({
    queryKey: ['energy', 'comparison', level],
    queryFn: async () => {
      const response = await apiService.get<EnergyComparisonItem[]>(`/energy/comparison?level=${level}`);
      return response.data;
    },
  });

  const deviceTypeData = stats?.byDeviceType
    ? Object.entries(stats.byDeviceType).map(([type, value]) => ({ name: type, value }))
    : [];

  const heatmapData = buildHeatmapData(comparison);
  const treemapData = buildTreeMapData(stats);
  const radarData = buildRadarData(comparison);
  const radarSeries: RadarSeries[] = (comparison ?? []).slice(0, 3).map((item, i) => ({
    key: item.name,
    name: item.name,
    color: COLORS[i],
  }));
  const composedData = buildComposedData(comparison);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>Monitoramento Energético</Typography>
          <Typography variant="body2" color="text.secondary">Análise de consumo e custos</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {realtimeEnergy && (
            <Chip
              icon={<WifiTethering fontSize="small" />}
              label={`${realtimeEnergy.power.toFixed(0)} W em tempo real`}
              color="success"
              size="small"
            />
          )}
          <Button variant="outlined" startIcon={<FileDownload />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Exportar Relatório
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.333%' } }}>
            <ToggleButtonGroup value={period} exclusive onChange={(_, v) => v && setPeriod(v)} fullWidth size="small">
              <ToggleButton value="today">Hoje</ToggleButton>
              <ToggleButton value="week">Semana</ToggleButton>
              <ToggleButton value="month">Mês</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.333%' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Nível</InputLabel>
              <Select value={level} label="Nível" onChange={(e) => setLevel(e.target.value as Level)}>
                <MenuItem value="general">Geral (Todos os Prédios)</MenuItem>
                <MenuItem value="building">Por Prédio</MenuItem>
                <MenuItem value="floor">Por Andar</MenuItem>
                <MenuItem value="room">Por Sala</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {level === 'building' && (
            <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.333%' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Prédio</InputLabel>
                <Select value={selectedId} label="Prédio" onChange={(e) => setSelectedId(e.target.value)}>
                  {buildings?.map((b: any) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Paper>

      {/* KPI Cards */}
      {isLoadingStats ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BoltOutlined sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Consumo Total</Typography>
                  <Typography variant="h5" fontWeight={700}>{stats?.totalEnergy.toFixed(2) || '0.00'} kWh</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>Custo Estimado</Typography>
              <Typography variant="h5" fontWeight={700} color="error.main" gutterBottom>R$ {stats?.totalCost.toFixed(2) || '0.00'}</Typography>
              <Typography variant="caption" color="text.secondary">Tarifa: R$ 0,85/kWh</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>Pico de Demanda</Typography>
              <Typography variant="h5" fontWeight={700} gutterBottom>{stats?.peakDemand.toFixed(0) || '0'} W</Typography>
              <Typography variant="caption" color="text.secondary">Máximo registrado</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>Potência Média</Typography>
              <Typography variant="h5" fontWeight={700} gutterBottom>{stats?.averagePower.toFixed(0) || '0'} W</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDown sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>-12.5% vs mês anterior</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Row 1: Histórico + Gauge */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Histórico de Consumo</Typography>
          {isLoadingChart ? <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} /> : <EnergyChart data={chartData} />}
        </Paper>
        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Potência em Tempo Real</Typography>
          <GaugeChart
            value={realtimeEnergy?.power ?? stats?.averagePower ?? 0}
            max={stats?.peakDemand ? stats.peakDemand * 1.2 : 5000}
            unit="W"
            label="Potência Atual"
          />
        </Paper>
      </Box>

      {/* Row 2: Pizza + BarChart */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Consumo por Tipo de Dispositivo</Typography>
          {isLoadingStats ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : deviceTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deviceTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={90} dataKey="value">
                  {deviceTypeData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} kWh`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Consumo vs Meta (Comparado)</Typography>
          <ComposedEnergyChart data={composedData} height={280} />
        </Paper>
      </Box>

      {/* Row 3: Heatmap */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Mapa de Calor — Consumo por Dia</Typography>
        <HeatmapChart data={heatmapData} height={280} />
      </Paper>

      {/* Row 4: TreeMap + RadarChart */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Distribuição Hierárquica (TreeMap)</Typography>
          <TreeMapChart data={treemapData} height={300} />
        </Paper>
        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Comparação Multi-dimensional (Radar)</Typography>
          <RadarChartComponent data={radarData} series={radarSeries} angleKey="subject" height={300} />
        </Paper>
      </Box>

      {/* Comparison Table */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Ranking de Consumo</Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Posição</TableCell>
                <TableCell>Local</TableCell>
                <TableCell align="right">Consumo (kWh)</TableCell>
                <TableCell align="right">Custo (R$)</TableCell>
                <TableCell align="right">Variação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparison?.map((item: any, index: number) => (
                <TableRow key={item.id}>
                  <TableCell>#{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.energy.toFixed(2)}</TableCell>
                  <TableCell align="right">R$ {(item.energy * 0.85).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {item.trend > 0 ? (
                        <>
                          <TrendingUp sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                          <Typography variant="body2" color="error.main">+{item.trend.toFixed(1)}%</Typography>
                        </>
                      ) : (
                        <>
                          <TrendingDown sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                          <Typography variant="body2" color="success.main">{item.trend.toFixed(1)}%</Typography>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">Nenhum dado disponível</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default EnergyPage;
