import { Box, Typography } from '@mui/material';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface RadarSeries {
  key: string;
  name: string;
  color: string;
}

interface RadarChartComponentProps {
  data: Array<Record<string, number | string>>;
  series: RadarSeries[];
  angleKey?: string;
  height?: number;
}

const RadarChartComponent = ({
  data,
  series,
  angleKey = 'subject',
  height = 320,
}: RadarChartComponentProps) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 12 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0E0E0', borderRadius: 4 }}
          formatter={(value: number) => value.toFixed(2)}
        />
        {series.map((s) => (
          <Radar
            key={s.key}
            name={s.name}
            dataKey={s.key}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
