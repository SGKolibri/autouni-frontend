import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
  BoltOutlined,
  DevicesOutlined,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { Building } from '@/types';
import BuildingDialog from './BuildingDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const BuildingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBuilding, setEditBuilding] = useState<Building | null>(null);
  const [deleteBuilding, setDeleteBuilding] = useState<Building | null>(null);

  const { data: buildings, isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => apiService.getBuildings(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setDeleteBuilding(null);
    },
  });

  const handleBuildingClick = (buildingId: string) => {
    navigate(`/buildings/${buildingId}`);
  };

  const handleAddBuilding = () => {
    setEditBuilding(null);
    setDialogOpen(true);
  };

  const handleEditBuilding = (e: React.MouseEvent, building: Building) => {
    e.stopPropagation();
    setEditBuilding(building);
    setDialogOpen(true);
  };

  const handleDeleteBuilding = (e: React.MouseEvent, building: Building) => {
    e.stopPropagation();
    setDeleteBuilding(building);
  };

  const getBuildingEnergy = (building: Building) =>
    building.todayEnergyKwh ?? building.dailyConsumptionKwh ?? building.totalEnergy ?? 0;

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Prédios
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' } }}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
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

      {/* Buildings */}
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {buildings?.map((building) => (
            <Box key={building.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 calc(25% - 18px)' } }}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  transition: 'all 0.3s',
                  '& .card-actions': { opacity: 0, transition: 'opacity 0.2s' },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    '& .card-actions': { opacity: 1 },
                  },
                }}
              >
                {/* Hover action buttons - outside CardActionArea */}
                <Box
                  className="card-actions"
                  sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 0.5 }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => handleEditBuilding(e, building)}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteBuilding(e, building)}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                <CardActionArea onClick={() => handleBuildingClick(building.id)}>
                  <CardContent>
                    {/* Building icon */}
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
                          Consumo{building.energyPeriod === 'today' ? ' hoje' : building.energyPeriod === 'week' ? ' (semana)' : building.energyPeriod === 'month' ? ' (mês)' : ''}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {getBuildingEnergy(building).toFixed(2)} kWh
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <BuildingDialog
        open={dialogOpen}
        building={editBuilding}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteBuilding}
        title="Excluir Prédio"
        message={`Tem certeza que deseja excluir "${deleteBuilding?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteBuilding && deleteMutation.mutate(deleteBuilding.id)}
        onClose={() => setDeleteBuilding(null)}
      />
    </Box>
  );
};

export default BuildingsPage;