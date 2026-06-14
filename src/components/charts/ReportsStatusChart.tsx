import { Box, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Report, ReportStatus, ReportType } from '@/types';

interface ReportsStatusChartProps {
  reports?: Report[];
  height?: number;
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  [ReportStatus.PENDING]: { label: 'Pendente', color: '#f59e0b' },
  [ReportStatus.PROCESSING]: { label: 'Processando', color: '#3b82f6' },
  [ReportStatus.COMPLETED]: { label: 'Concluído', color: '#10b981' },
  [ReportStatus.FAILED]: { label: 'Falhou', color: '#ef4444' },
};

const TYPE_CONFIG: Record<ReportType, { label: string; color: string }> = {
  [ReportType.ENERGY_CONSUMPTION]: { label: 'Energia', color: '#f59e0b' },
  [ReportType.DEVICE_STATUS]: { label: 'Dispositivos', color: '#3b82f6' },
  [ReportType.ROOM_USAGE]: { label: 'Salas', color: '#10b981' },
  [ReportType.INCIDENTS]: { label: 'Incidentes', color: '#ef4444' },
};

const StatusCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid #E5E7EB',
      textAlign: 'center',
      flex: '1 1 0',
      minWidth: 0,
    }}
  >
    <Typography variant="h5" fontWeight={700} sx={{ color }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
      {label}
    </Typography>
  </Paper>
);

const ReportsStatusChart = ({ reports, height = 240 }: ReportsStatusChartProps) => {
  if (!reports || reports.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sem dados disponíveis
        </Typography>
      </Box>
    );
  }

  const statusCounts = Object.values(ReportStatus).reduce(
    (acc, s) => { acc[s] = 0; return acc; },
    {} as Record<ReportStatus, number>
  );
  reports.forEach((r) => { if (statusCounts[r.status] !== undefined) statusCounts[r.status]++; });

  const typeCounts = Object.values(ReportType).reduce(
    (acc, t) => { acc[t] = 0; return acc; },
    {} as Record<ReportType, number>
  );
  reports.forEach((r) => { if (typeCounts[r.type] !== undefined) typeCounts[r.type]++; });

  const typeChartData = Object.entries(typeCounts)
    .map(([type, value]) => ({
      name: TYPE_CONFIG[type as ReportType]?.label ?? type,
      value,
      color: TYPE_CONFIG[type as ReportType]?.color ?? '#94a3b8',
    }))
    .filter((d) => d.value > 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        {Object.values(ReportStatus).map((s) => (
          <StatusCard
            key={s}
            label={STATUS_CONFIG[s].label}
            value={statusCounts[s]}
            color={STATUS_CONFIG[s].color}
          />
        ))}
      </Box>

      {typeChartData.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Distribuição por Tipo
          </Typography>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                outerRadius="65%"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine
              >
                {typeChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
            {typeChartData.map((entry) => (
              <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
                <Typography variant="caption" color="text.secondary">
                  {entry.name}: {entry.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default ReportsStatusChart;
