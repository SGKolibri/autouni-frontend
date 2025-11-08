import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
} from '@mui/material';
import {
  DateRange,
  FileDownload,
  TrendingUp,
  TrendingDown,
  BoltOutlined,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { EnergyStats } from '@types/index';
import EnergyChart from '@components/charts/EnergyChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Period = 'today' | 'week' | 'month' | 'custom';
type Level = 'general' | 'building' | 'floor' | 'room';

const EnergyPage = () => {
  const [period, setPeriod] = useState<Period>('today');
  const [level, setLevel] = useState<Level>('general');
  const [selectedId, setSelectedId] = useState<string>('');

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['energy', 'stats', period, level, selectedId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', period);
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
      const response = await apiService.get(`/energy/history?period=${period}&level=${level}&id=${selectedId}`);
      return response.data;
    },
  });

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await apiService.get('/buildings');
      return response.data;
    },
    enabled: level === 'building',
  });

  const { data: comparison } = useQuery({
    queryKey: ['energy', 'comparison', level],
    queryFn: async () => {
      const response = await apiService.get(`/energy/comparison?level=${level}`);
      return response.data;
    },
  });

  const handleExport = () => {
    // TODO: Implementar exportação
    console.log('Export energy data');
  };

  const COLORS = ['#1976D2', '#388E3C', '#FF9800', '#D32F2F', '#0288D1', '#7B1FA2'];

  const deviceTypeData = stats?.byDeviceType
    ? Object.entries(stats.byDeviceType).map(([type, value]) => ({
        name: type,
        value,
      }))
    : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Monitoramento Energético
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análise de consumo e custos
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExport}
        >
          Exportar Relatório
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={(_, value) => value && setPeriod(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="today">Hoje</ToggleButton>
              <ToggleButton value="week">Semana</ToggleButton>
              <ToggleButton value="month">Mês</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Nível</InputLabel>
              <Select
                value={level}
                label="Nível"
                onChange={(e) => setLevel(e.target.value as Level)}
              >
                <MenuItem value="general">Geral (Todos os Prédios)</MenuItem>
                <MenuItem value="building">Por Prédio</MenuItem>
                <MenuItem value="floor">Por Andar</MenuItem>
                <MenuItem value="room">Por Sala</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {level === 'building' && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Prédio</InputLabel>
                <Select
                  value={selectedId}
                  label="Prédio"
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {buildings?.map((building: any) => (
                    <MenuItem key={building.id} value={building.id}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* KPI Cards */}
      {isLoadingStats ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 3,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      ) : (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mb: 3,
        }}
      >
        <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 275 } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BoltOutlined sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Consumo Total
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stats?.totalEnergy.toFixed(2) || '0.00'} kWh
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 275 } }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Custo Estimado
            </Typography>
            <Typography variant="h5" fontWeight={700} color="error.main" gutterBottom>
              R$ {stats?.totalCost.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tarifa: R$ 0,85/kWh
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 275 } }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Pico de Demanda
            </Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {stats?.peakDemand.toFixed(0) || '0'} W
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Máximo registrado
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 275 } }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Potência Média
            </Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {stats?.averagePower.toFixed(0) || '0'} W
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingDown sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              <Typography variant="caption" color="success.main" fontWeight={600}>
                -12.5% vs mês anterior
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      )}

      {/* Charts Row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
        {/* Energy Timeline */}
        <Paper sx={{ flex: 1, minWidth: 0, p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Histórico de Consumo
          </Typography>
          {isLoadingChart ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : (
            <EnergyChart data={chartData} />
          )}
        </Paper>

        {/* Device Type Distribution */}
        <Paper sx={{ flex: 1, minWidth: 0, p: 3, maxWidth: { lg: '400px' } }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Consumo por Tipo
          </Typography>
          {isLoadingStats ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : deviceTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} kWh`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Sem dados disponíveis
                </Typography>
              </Box>
            )}
          </Paper>
      </Box>

      {/* Comparison Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Ranking de Consumo
        </Typography>
        <TableContainer>
          <Table>
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
                          <Typography variant="body2" color="error.main">
                            +{item.trend.toFixed(1)}%
                          </Typography>
                        </>
                      ) : (
                        <>
                          <TrendingDown sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                          <Typography variant="body2" color="success.main">
                            {item.trend.toFixed(1)}%
                          </Typography>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum dado disponível
                    </Typography>
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