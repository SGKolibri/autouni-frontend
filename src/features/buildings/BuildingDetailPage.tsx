import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  NavigateNext,
  Layers,
  MeetingRoom,
  Edit,
  Delete,
  BoltOutlined,
  DevicesOutlined,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { Building } from '@types/index';
import EnergyChart from '@components/charts/EnergyChart';

const BuildingDetailPage = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();

  const { data: building, isLoading } = useQuery({
    queryKey: ['buildings', buildingId, 'details'],
    queryFn: async () => {
      // Usa /details para obter building com floors incluídos
      const response = await apiService.get<Building>(`/buildings/${buildingId}/details`);
      return response.data;
    },
    enabled: !!buildingId,
  });

  const { data: energyData, isLoading: isLoadingEnergy } = useQuery({
    queryKey: ['buildings', buildingId, 'energy'],
    queryFn: async () => {
      // Stats retorna objeto agregado, não array de readings
      // Como não há endpoint específico para readings de building no swagger,
      // vamos usar stats e adaptar ou deixar o gráfico vazio
      const response = await apiService.get(`/energy/buildings/${buildingId}/stats`);
      return response.data;
    },
    enabled: !!buildingId,
  });

  const handleFloorClick = (floorId: string) => {
    navigate(`/floors/${floorId}`);
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!building) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Prédio não encontrado</Typography>
      </Box>
    );
  }

  // Calcular métricas a partir dos dados aninhados
  const totalRooms = building.floors?.reduce((acc, floor) => acc + (floor.rooms?.length || 0), 0) || 0;
  
  const totalDevices = building.floors?.reduce((accFloor, floor) => {
    return accFloor + (floor.rooms?.reduce((accRoom, room) => {
      return accRoom + (room.devices?.length || 0);
    }, 0) || 0);
  }, 0) || 0;

  const activeDevices = building.floors?.reduce((accFloor, floor) => {
    return accFloor + (floor.rooms?.reduce((accRoom, room) => {
      return accRoom + (room.devices?.filter(d => d.status === 'ON').length || 0);
    }, 0) || 0);
  }, 0) || 0;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 4 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/buildings')}
          sx={{ 
            cursor: 'pointer',
            fontWeight: 500,
            '&:hover': { color: 'primary.main' },
          }}
        >
          Prédios
        </Link>
        <Typography color="text.primary" fontWeight={600}>{building.name}</Typography>
      </Breadcrumbs>

      {/* Building Info Card */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Layers sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  fontWeight={700}
                  sx={{ 
                    mb: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {building.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                  📍 {building.location}
                </Typography>
                {building.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                    {building.description}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                }}
              >
                <Edit />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          {/* Stats */}
          {isLoading ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
            }}
          >
            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              textAlign: 'center', 
              p: 3, 
              backgroundColor: '#F9FAFB', 
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateY(-2px)',
              },
            }}>
              <Layers sx={{ fontSize: 32, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {building.floors?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Andares
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              textAlign: 'center', 
              p: 3, 
              backgroundColor: '#F9FAFB', 
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'info.main',
                transform: 'translateY(-2px)',
              },
            }}>
              <MeetingRoom sx={{ fontSize: 32, color: 'info.main', mb: 1.5 }} />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {totalRooms}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Salas
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              textAlign: 'center', 
              p: 3, 
              backgroundColor: '#F9FAFB', 
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'success.main',
                transform: 'translateY(-2px)',
              },
            }}>
              <DevicesOutlined sx={{ fontSize: 32, color: 'success.main', mb: 1.5 }} />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {activeDevices}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dispositivos Ativos
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              textAlign: 'center', 
              p: 3, 
              backgroundColor: '#F9FAFB', 
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'warning.main',
                transform: 'translateY(-2px)',
              },
            }}>
              <BoltOutlined sx={{ fontSize: 32, color: 'warning.main', mb: 1.5 }} />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {building.totalEnergy?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                kWh Consumidos
              </Typography>
            </Box>
          </Box>
          )}
        </CardContent>
      </Card>

      {/* Floors Grid */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Andares
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {isLoading ? 'Carregando...' : `${building.floors?.length || 0} andar(es) neste prédio`}
          </Typography>
        </Box>

        {isLoading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: 4,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
              </Box>
            ))}
          </Box>
        ) : building.floors && building.floors.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Layers sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Nenhum andar cadastrado neste prédio
          </Typography>
        </Card>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {building.floors?.map((floor) => (
            <Card
              key={floor.id}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 275 },
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardActionArea onClick={() => handleFloorClick(floor.id)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                      {floor.name}
                    </Typography>
                    <Chip
                      label={`${floor.number}º andar`}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<MeetingRoom sx={{ fontSize: 16 }} />}
                      label={`${floor.rooms?.length || 0} salas`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<DevicesOutlined sx={{ fontSize: 16 }} />}
                      label={`${floor.rooms?.reduce((acc, room) => acc + (room.devices?.filter(d => d.status === 'ON').length || 0), 0) || 0} ativos`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      backgroundColor: '#F5F5F5',
                      borderRadius: 1,
                    }}
                  >
                    <BoltOutlined sx={{ fontSize: 20, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Consumo
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {floor.totalEnergy?.toFixed(2) || '0.00'} kWh
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
      </Box>

      {/* Energy Chart */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            Consumo Energético
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Últimas 24 horas
          </Typography>
        </Box>
        {isLoadingEnergy ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ) : (
          <EnergyChart data={energyData || []} />
        )}
      </Paper>
    </Box>
  );
};

export default BuildingDetailPage;