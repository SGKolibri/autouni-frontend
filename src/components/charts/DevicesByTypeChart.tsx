import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DeviceStats, DeviceType } from '@/types';

interface DevicesByTypeChartProps {
  data?: DeviceStats;
  height?: number;
}

const TYPE_LABELS: Record<DeviceType, string> = {
  [DeviceType.LIGHT]: 'Iluminação',
  [DeviceType.AC]: 'Ar Condicionado',
  [DeviceType.PROJECTOR]: 'Projetor',
  [DeviceType.SPEAKER]: 'Alto-falante',
  [DeviceType.LOCK]: 'Fechadura',
  [DeviceType.SENSOR]: 'Sensor',
  [DeviceType.OTHER]: 'Outro',
};

const TYPE_COLORS: Record<DeviceType, string> = {
  [DeviceType.LIGHT]: '#fbbf24',
  [DeviceType.AC]: '#3b82f6',
  [DeviceType.PROJECTOR]: '#8b5cf6',
  [DeviceType.SPEAKER]: '#ec4899',
  [DeviceType.LOCK]: '#6b7280',
  [DeviceType.SENSOR]: '#10b981',
  [DeviceType.OTHER]: '#64748b',
};

const DevicesByTypeChart = ({ data, height = 300 }: DevicesByTypeChartProps) => {
  if (!data?.byType) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sem dados disponíveis
        </Typography>
      </Box>
    );
  }

  const chartData = Object.entries(data.byType)
    .map(([type, total]) => ({
      type: type as DeviceType,
      label: TYPE_LABELS[type as DeviceType] ?? type,
      total,
      color: TYPE_COLORS[type as DeviceType] ?? '#94a3b8',
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  if (chartData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sem dados disponíveis
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={100} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
            formatter={(value: number) => [value, 'Dispositivos']}
          />
          <Bar dataKey="total" maxBarSize={24} radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.type} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
        {chartData.map((entry) => (
          <Box key={entry.type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: entry.color }} />
            <Typography variant="caption" color="text.secondary">
              {entry.label}: {entry.total}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DevicesByTypeChart;
