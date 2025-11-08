import { Box, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnergyChartProps {
  data?: Array<{
    timestamp: string;
    power: number;
    energy: number;
  }> | any; // Aceita também objetos de stats
}

const EnergyChart = ({ data }: EnergyChartProps) => {
  console.log('EnergyChart data:', data);
  
  // Se data não existe
  if (!data) {
    return (
      <Box
        sx={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Nenhum dado disponível
        </Typography>
      </Box>
    );
  }

  // Se data é um objeto de stats (não um array), mostra resumo
  if (!Array.isArray(data)) {
    return (
      <Box
        sx={{
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
            {data.totalKwh?.toFixed(2) || '0.00'} kWh
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Consumo Total
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {data.avgWh?.toFixed(0) || '0'} Wh
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Média
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {data.maxWh?.toFixed(0) || '0'} Wh
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Máximo
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {data.minWh?.toFixed(0) || '0'} Wh
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mínimo
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Baseado em {data.count || 0} leituras
        </Typography>
      </Box>
    );
  }

  // Se é array mas está vazio
  if (data.length === 0) {
    return (
      <Box
        sx={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Nenhum dado disponível
        </Typography>
      </Box>
    );
  }

  // Se é array com dados, renderiza o gráfico
  const chartData = data.map((item) => ({
    ...item,
    time: format(new Date(item.timestamp), 'HH:mm', { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1976D2" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1976D2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          stroke="#616161"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#616161"
          label={{ value: 'Potência (W)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: 4,
          }}
          formatter={(value: number) => [`${value.toFixed(2)} W`, 'Potência']}
          labelFormatter={(label) => `Horário: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="power"
          stroke="#1976D2"
          strokeWidth={2}
          fill="url(#colorPower)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EnergyChart;