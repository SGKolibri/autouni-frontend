import { Card, CardContent, Box, Typography, Skeleton, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  loading = false,
}) => {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };

  if (loading) {
    return (
      <Card 
        sx={{ 
          minHeight: 160,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        minHeight: 160,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {/* Background Gradient Accent */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `linear-gradient(135deg, ${colorMap[color]}15 0%, ${colorMap[color]}05 100%)`,
          borderRadius: '0 0 0 100%',
        }}
      />

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
            sx={{ 
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${colorMap[color]}15`,
              color: colorMap[color],
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography 
            variant="h4" 
            fontWeight={700}
            sx={{ 
              mb: 0.5,
              color: theme.palette.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {trend.isPositive ? (
              <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                color: trend.isPositive ? 'success.main' : 'error.main',
              }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              vs. período anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;