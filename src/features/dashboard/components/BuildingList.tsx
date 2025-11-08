import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Skeleton,
} from '@mui/material';
import { ChevronRight, Business } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { Building } from '@types/index';

const BuildingsList = () => {
  const navigate = useNavigate();

  const { data: buildings, isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await apiService.get<Building[]>('/buildings');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (!buildings || buildings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Nenhum prédio cadastrado
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Prédio</TableCell>
            <TableCell align="center">Andares</TableCell>
            <TableCell align="center">Dispositivos Ativos</TableCell>
            <TableCell align="right">Consumo (kWh)</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buildings.map((building) => (
            <TableRow
              key={building.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/buildings/${building.id}`)}
            >
              <TableCell>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {building.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {building.location}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={building.floors?.length || 0}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={building.floors?.reduce((accFloor, floor) => {
                    return accFloor + (floor.rooms?.reduce((accRoom, room) => {
                      return accRoom + (room.devices?.filter(d => d.status === 'ON').length || 0);
                    }, 0) || 0);
                  }, 0) || 0}
                  size="small"
                  color="success"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {building.totalEnergy?.toFixed(2) || '0.00'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton size="small">
                  <ChevronRight />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BuildingsList;