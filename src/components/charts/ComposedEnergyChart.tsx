import { Box, Typography } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ComposedDataPoint {
  label: string;
  consumption: number;  // kWh
  cost: number;         // R$
  target?: number;      // kWh meta
}

interface ComposedEnergyChartProps {
  data: ComposedDataPoint[];
  height?: number;
}

const ComposedEnergyChart = ({ data, height = 320 }: ComposedEnergyChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#616161" />
        <YAxis
          yAxisId="kwh"
          orientation="left"
          tick={{ fontSize: 12 }}
          stroke="#1976D2"
          label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
        />
        <YAxis
          yAxisId="cost"
          orientation="right"
          tick={{ fontSize: 12 }}
          stroke="#D32F2F"
          label={{ value: 'R$', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0E0E0', borderRadius: 4 }}
          formatter={(value: number, name: string) => {
            if (name === 'Consumo' || name === 'Meta') return [`${value.toFixed(2)} kWh`, name];
            if (name === 'Custo') return [`R$ ${value.toFixed(2)}`, name];
            return [value, name];
          }}
        />
        <Legend />
        <Bar yAxisId="kwh" dataKey="consumption" name="Consumo" fill="#1976D2" opacity={0.8} radius={[4, 4, 0, 0]} />
        {data.some((d) => d.target !== undefined) && (
          <Line
            yAxisId="kwh"
            type="monotone"
            dataKey="target"
            name="Meta"
            stroke="#388E3C"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
        )}
        <Line
          yAxisId="cost"
          type="monotone"
          dataKey="cost"
          name="Custo"
          stroke="#D32F2F"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ComposedEnergyChart;
