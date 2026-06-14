import { Box, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnergyChartProps {
  data?: Array<{ timestamp: string; power: number; energy: number }> | any;
}

const StatCaption = ({
  label,
  value,
  color = '#1F2937',
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <Box sx={{ textAlign: 'center', px: { xs: 1, sm: 2 } }}>
    <Typography variant="subtitle2" fontWeight={700} sx={{ color }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const GRADIENT_ID = 'energyAreaGradient';

const EnergyChart = ({ data }: EnergyChartProps) => {
  if (!data) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum dado disponível
        </Typography>
      </Box>
    );
  }

  // ── EnergyStats object ───────────────────────────────────────────────────────
  if (!Array.isArray(data)) {
    const history: Array<{ timestamp: string; value: number }> = data.history ?? [];
    const totalKwh: number = data.totalKwh ?? data.totalEnergy ?? 0;
    // GlobalEnergyStats uses avgWh/maxWh; EnergyStats uses averagePower/peakDemand
    const peakDemand: number = data.peakDemand ?? data.maxWh ?? 0;
    const averagePower: number = data.averagePower ?? data.avgWh ?? 0;
    const peakUnit: string = data.peakDemand !== undefined ? 'W' : 'Wh';
    const avgUnit: string = data.averagePower !== undefined ? 'W' : 'Wh';
    const totalCost: number = data.totalCost ?? totalKwh * 0.85;

    const captions = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 4 },
          pt: 2,
          borderTop: '1px solid #F3F4F6',
          flexWrap: 'wrap',
        }}
      >
        <StatCaption label="Consumo Total" value={`${totalKwh.toFixed(2)} kWh`} color="#667eea" />
        <StatCaption label="Pico de Demanda" value={`${peakDemand.toFixed(0)} ${peakUnit}`} color="#ef4444" />
        <StatCaption label="Potência Média" value={`${averagePower.toFixed(0)} ${avgUnit}`} color="#3b82f6" />
        <StatCaption label="Custo Estimado" value={`R$ ${totalCost.toFixed(2)}`} color="#10b981" />
      </Box>
    );

    if (history.length === 0) {
      return (
        <Box>
          <Box
            sx={{
              height: 240,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h3" fontWeight={700} sx={{ color: '#667eea' }}>
              {totalKwh.toFixed(2)} kWh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consumo Total
            </Typography>
          </Box>
          {captions}
        </Box>
      );
    }

    const chartData = history.map((item) => ({
      time: format(new Date(item.timestamp), 'HH:mm', { locale: ptBR }),
      value: item.value,
    }));

    const avgLine =
      history.reduce((s, h) => s + h.value, 0) / history.length;

    return (
      <Box>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} stroke="#E5E7EB" />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
              formatter={(value: number) => [`${value.toFixed(3)} kWh`, 'Consumo']}
              labelFormatter={(label) => `Hora: ${label}`}
            />
            <ReferenceLine
              y={avgLine}
              stroke="#94A3B8"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              label={{ value: 'Média', position: 'insideTopRight', fontSize: 10, fill: '#94A3B8' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#667eea"
              strokeWidth={2.5}
              fill={`url(#${GRADIENT_ID})`}
              dot={false}
              activeDot={{ r: 4, fill: '#667eea' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {captions}
      </Box>
    );
  }

  // ── Raw readings array ───────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum dado disponível
        </Typography>
      </Box>
    );
  }

  const chartData = data.map((item: any) => ({
    ...item,
    time: format(new Date(item.timestamp), 'HH:mm', { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          stroke="#E5E7EB"
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} stroke="#E5E7EB" />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
          formatter={(value: number) => [`${value.toFixed(2)} W`, 'Potência']}
          labelFormatter={(label) => `Horário: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="power"
          stroke="#667eea"
          strokeWidth={2.5}
          fill={`url(#${GRADIENT_ID})`}
          dot={false}
          activeDot={{ r: 4, fill: '#667eea' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EnergyChart;
