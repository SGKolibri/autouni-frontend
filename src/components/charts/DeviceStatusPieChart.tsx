import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DeviceStats, DeviceStatus } from '@/types';

interface DeviceStatusPieChartProps {
  data?: DeviceStats;
  height?: number;
}

const STATUS_COLORS: Record<string, string> = {
  Ligados: '#10b981',
  Desligados: '#6b7280',
  Standby: '#f59e0b',
  Erro: '#ef4444',
};

const STATUS_KEY_MAP: Record<DeviceStatus, string> = {
  [DeviceStatus.ON]: 'Ligados',
  [DeviceStatus.OFF]: 'Desligados',
  [DeviceStatus.STANDBY]: 'Standby',
  [DeviceStatus.ERROR]: 'Erro',
};

const DeviceStatusPieChart = ({ data, height = 300 }: DeviceStatusPieChartProps) => {
  if (!data) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  let chartData: { name: string; value: number }[];

  if (data.byStatus) {
    chartData = Object.entries(data.byStatus)
      .map(([key, value]) => ({
        name: STATUS_KEY_MAP[key as DeviceStatus] ?? key,
        value,
      }))
      .filter((d) => d.value > 0);
  } else {
    const active = data.activeDevices ?? 0;
    const inactive = (data.totalDevices ?? 0) - active;
    chartData = [
      { name: 'Ligados', value: active },
      { name: 'Desligados', value: inactive > 0 ? inactive : 0 },
    ].filter((d) => d.value > 0);
  }

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  // Chart occupies ~80% of the height; legend the rest
  const chartHeight = Math.round(height * 0.8);

  return (
    <Box>
      {/* Pie with center label as absolute overlay — never put custom components inside <Pie> */}
      <Box sx={{ position: 'relative', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="72%"
              dataKey="value"
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label overlay — positioned at pie cx/cy (50%/50%) */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
        {chartData.map((entry) => (
          <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_COLORS[entry.name] ?? '#94a3b8' }}
            />
            <Typography variant="caption" color="text.secondary">
              {entry.name}: {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DeviceStatusPieChart;
