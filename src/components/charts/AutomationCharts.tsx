import { Box, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Automation, AutomationStats } from '@/types';

// ─── AutomationTypePieChart ───────────────────────────────────────────────────

interface AutomationTypePieChartProps {
  byType?: { SCHEDULE: number; CONDITION: number; MANUAL: number };
  total?: number;
  height?: number;
}

const TYPE_COLORS = {
  SCHEDULE: '#667eea',
  CONDITION: '#10b981',
  MANUAL: '#f59e0b',
};

const TYPE_LABELS: Record<string, string> = {
  SCHEDULE: 'Agendado',
  CONDITION: 'Condição',
  MANUAL: 'Manual',
};

const CenterLabel = ({ cx, cy, total }: { cx: number; cy: number; total: number }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 26, fontWeight: 700, fill: '#1F2937' }}>
      {total}
    </text>
    <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: '#6B7280' }}>
      Total
    </text>
  </>
);

export const AutomationTypePieChart = ({ byType, total, height = 280 }: AutomationTypePieChartProps) => {
  if (!byType) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  const chartData = Object.entries(byType)
    .map(([key, value]) => ({ name: TYPE_LABELS[key] ?? key, value, color: TYPE_COLORS[key as keyof typeof TYPE_COLORS] ?? '#94a3b8' }))
    .filter((d) => d.value > 0);

  const displayTotal = total ?? chartData.reduce((s, d) => s + d.value, 0);

  if (displayTotal === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="72%"
            dataKey="value"
            labelLine={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
            <CenterLabel cx={0} cy={0} total={displayTotal} />
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 0.5 }}>
        {chartData.map((entry) => (
          <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="caption" color="text.secondary">{entry.name}: {entry.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── TopAutomationsChart ──────────────────────────────────────────────────────

interface TopAutomationsChartProps {
  automations?: Automation[];
  height?: number;
}

export const TopAutomationsChart = ({ automations, height = 300 }: TopAutomationsChartProps) => {
  if (!automations || automations.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  const chartData = automations
    .slice(0, 10)
    .map((a) => ({
      name: a.name.length > 25 ? a.name.slice(0, 25) + '…' : a.name,
      value: a.enabled ? 1 : 0.5,
      enabled: a.enabled,
      color: a.enabled ? '#10b981' : '#9ca3af',
    }));

  return (
    <Box>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis type="number" domain={[0, 1]} tick={false} stroke="#9CA3AF" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={150} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
            formatter={(value: number, _name: string, props: any) => [
              props.payload.enabled ? 'Habilitada' : 'Desabilitada',
              'Status',
            ]}
          />
          <Bar dataKey="value" maxBarSize={20} radius={[0, 4, 4, 0]}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#10b981' }} />
          <Typography variant="caption" color="text.secondary">Habilitada</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#9ca3af' }} />
          <Typography variant="caption" color="text.secondary">Desabilitada</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── AutomationExecutionsChart ────────────────────────────────────────────────

interface AutomationExecutionsChartProps {
  stats?: AutomationStats;
  height?: number;
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid #E5E7EB',
      textAlign: 'center',
      flex: '1 1 0',
      minWidth: 0,
    }}
    elevation={0}
  >
    <Typography variant="h5" fontWeight={700} sx={{ color }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
      {label}
    </Typography>
  </Paper>
);

export const AutomationExecutionsChart = ({ stats, height = 160 }: AutomationExecutionsChartProps) => {
  if (!stats) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', height: 'auto' }}>
      <StatCard label="Total" value={stats.total} color="#1F2937" />
      <StatCard label="Habilitadas" value={stats.enabled} color="#10b981" />
      <StatCard label="Desabilitadas" value={stats.disabled} color="#9ca3af" />
      <StatCard label="Execuções Recentes" value={stats.recentExecutions} color="#667eea" />
    </Box>
  );
};
