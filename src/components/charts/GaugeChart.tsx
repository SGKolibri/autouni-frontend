import { Box, Typography } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number;      // current value
  max: number;        // maximum value
  unit?: string;
  label?: string;
  color?: string;
  warningThreshold?: number; // 0-1 fraction
  dangerThreshold?: number;  // 0-1 fraction
}

const GaugeChart = ({
  value,
  max,
  unit = 'W',
  label = 'Potência Atual',
  color,
  warningThreshold = 0.7,
  dangerThreshold = 0.9,
}: GaugeChartProps) => {
  const fraction = max > 0 ? Math.min(value / max, 1) : 0;
  const percentage = Math.round(fraction * 100);

  const resolvedColor =
    color ??
    (fraction >= dangerThreshold
      ? '#D32F2F'
      : fraction >= warningThreshold
      ? '#FF9800'
      : '#388E3C');

  const data = [
    { name: 'value', value: percentage, fill: resolvedColor },
    { name: 'empty', value: 100 - percentage, fill: '#E0E0E0' },
  ];

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="70%"
          innerRadius="60%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={data}
          barSize={20}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center label */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ color: resolvedColor, lineHeight: 1 }}>
          {value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {unit}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {percentage}% de {max.toLocaleString('pt-BR')} {unit}
        </Typography>
      </Box>
    </Box>
  );
};

export default GaugeChart;
