import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  IconButton,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Business,
  Layers,
  MeetingRoom,
  BoltOutlined,
  DevicesOutlined,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { Building } from '@types/index';

const BuildingsPage = () => {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const { data: buildings, isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await apiService.get<Building[]>('/buildings');
      return response.data;
    },
  });

  const handleBuildingClick = (buildingId: string) => {
    navigate(`/buildings/${buildingId}`);
  };

  const handleAddBuilding = () => {
    // TODO: Abrir modal de criação
    console.log('Add building');
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Prédios
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Prédios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {buildings?.length || 0} prédios cadastrados
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddBuilding}
        >
          Novo Prédio
        </Button>
      </Box>

      {/* Buildings Grid */}
      {buildings && buildings.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhum prédio cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comece adicionando o primeiro prédio do sistema
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddBuilding}>
            Adicionar Prédio
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {buildings?.map((building) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={building.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea onClick={() => handleBuildingClick(building.id)}>
                  <CardContent>
                    {/* Building Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        mb: 2,
                      }}
                    >
                      <Business sx={{ fontSize: 36, color: 'white' }} />
                    </Box>

                    {/* Building Name */}
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {building.name}
                    </Typography>

                    {/* Location */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {building.location}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        icon={<Layers sx={{ fontSize: 16 }} />}
                        label={`${building.floors?.length || 0} andares`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<DevicesOutlined sx={{ fontSize: 16 }} />}
                        label={`${building.activeDevices || 0} ativos`}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    </Box>

                    {/* Energy */}
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
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Consumo
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {building.totalEnergy?.toFixed(2) || '0.00'} kWh
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BuildingsPage;