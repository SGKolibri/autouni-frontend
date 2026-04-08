import { Box, Typography } from '@mui/material';
import { ResponsiveTreeMap } from '@nivo/treemap';

export interface TreeMapNode {
  name: string;
  value?: number;
  children?: TreeMapNode[];
  color?: string;
}

interface TreeMapChartProps {
  data: TreeMapNode;
  height?: number;
  valueFormat?: string;
  label?: string;
}

const TreeMapChart = ({
  data,
  height = 320,
  label = 'Consumo por Local (kWh)',
}: TreeMapChartProps) => {
  if (!data) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height }}>
      <ResponsiveTreeMap
        data={data}
        identity="name"
        value="value"
        valueFormat=">-.2f"
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        labelSkipSize={18}
        label={(node) => `${node.id}: ${node.formattedValue} kWh`}
        parentLabelSize={20}
        parentLabelPadding={8}
        colors={{ scheme: 'blues' }}
        borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        borderWidth={2}
        tooltip={({ node }) => (
          <Box
            sx={{
              bgcolor: 'white',
              border: '1px solid #E0E0E0',
              borderRadius: 1,
              p: 1,
              fontSize: 12,
            }}
          >
            <strong>{node.id}</strong>
            <br />
            {label.includes('kWh') ? 'Consumo' : 'Valor'}: <strong>{node.formattedValue} kWh</strong>
          </Box>
        )}
      />
    </Box>
  );
};

export default TreeMapChart;
