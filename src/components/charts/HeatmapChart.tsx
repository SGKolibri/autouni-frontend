import { Box, Typography } from '@mui/material';
import { ResponsiveHeatMap } from '@nivo/heatmap';

export interface HeatmapData {
  id: string;
  data: Array<{ x: string; y: number | null }>;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  xLabel?: string;
  yLabel?: string;
  valueFormat?: string;
  height?: number;
  colors?: { scheme: string } | { type: 'sequential'; scheme: string };
}

const HeatmapChart = ({
  data,
  height = 320,
}: HeatmapChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height }}>
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
        valueFormat=">-.2f"
        axisTop={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -30,
          legend: '',
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendOffset: -72,
        }}
        colors={{
          type: 'sequential',
          scheme: 'blues',
        }}
        emptyColor="#f5f5f5"
        borderRadius={2}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        enableLabels={false}
        legends={[
          {
            anchor: 'bottom',
            translateX: 0,
            translateY: 30,
            length: 200,
            thickness: 10,
            direction: 'row',
            tickPosition: 'after',
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            tickFormat: '>-.2s',
            title: 'kWh →',
            titleAlign: 'start',
            titleOffset: 4,
          },
        ]}
        tooltip={({ cell }) => (
          <Box
            sx={{
              bgcolor: 'white',
              border: '1px solid #E0E0E0',
              borderRadius: 1,
              p: 1,
              fontSize: 12,
            }}
          >
            <strong>{cell.serieId}</strong> / {cell.data.x}
            <br />
            Consumo: <strong>{typeof cell.value === 'number' ? cell.value.toFixed(2) : '-'} kWh</strong>
          </Box>
        )}
      />
    </Box>
  );
};

export default HeatmapChart;
