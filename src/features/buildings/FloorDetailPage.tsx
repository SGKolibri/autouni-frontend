import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Button,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  NavigateNext,
  MeetingRoom,
  BoltOutlined,
  DevicesOutlined,
  Person,
  Add,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@services/api";
import { Floor, Room, RoomType } from "@/types";
import EnergyChart from "@components/charts/EnergyChart";
import FloorDialog from "./FloorDialog";
import RoomDialog from "./RoomDialog";
import ConfirmDialog from "@components/common/ConfirmDialog";

const FloorDetailPage = () => {
  const { floorId } = useParams<{ floorId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editFloorOpen, setEditFloorOpen] = useState(false);
  const [deleteFloorOpen, setDeleteFloorOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);

  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'details'] });
      setDeleteRoom(null);
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: () => apiService.deleteFloor(floorId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      if (floor?.buildingId) {
        navigate(`/buildings/${floor.buildingId}`);
      } else {
        navigate('/buildings');
      }
    },
  });

  const { data: floor, isLoading } = useQuery({
    queryKey: ["floors", floorId, "details"],
    queryFn: () => apiService.getFloorDetails(floorId!),
    enabled: !!floorId,
  });

  const { data: building } = useQuery({
    queryKey: ["buildings", floor?.buildingId],
    queryFn: () => apiService.getBuildingById(floor!.buildingId),
    enabled: !!floor?.buildingId,
  });

  const { data: energyData, isLoading: isLoadingEnergy } = useQuery({
    queryKey: ["floors", floorId, "energy"],
    queryFn: async () => {
      const response = await apiService.get(`/energy/floors/${floorId}/stats`);
      return response.data;
    },
    enabled: !!floorId,
  });

  const roomIds = floor?.rooms?.map((r) => r.id) ?? [];
  const roomEnergyResults = useQueries({
    queries: roomIds.map((roomId) => ({
      queryKey: ['rooms', roomId, 'energy'],
      queryFn: () => apiService.getRoomEnergyStats(roomId),
      enabled: !!floor,
    })),
  });
  const roomEnergyMap = Object.fromEntries(
    roomIds.map((id, i) => [id, roomEnergyResults[i]?.data?.totalKwh ?? roomEnergyResults[i]?.data?.totalEnergy ?? 0])
  );

  const handleRoomClick = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
  };

  const getRoomTypeLabel = (type: RoomType) => {
    const labels = {
      [RoomType.CLASSROOM]: "Sala de Aula",
      [RoomType.LAB]: "Laboratório",
      [RoomType.OFFICE]: "Escritório",
      [RoomType.AUDITORIUM]: "Auditório",
      [RoomType.LIBRARY]: "Biblioteca",
      [RoomType.OTHER]: "Outro",
    };
    return labels[type] || type;
  };

  const getRoomTypeColor = (
    type: RoomType
  ): "primary" | "secondary" | "info" | "warning" | "default" => {
    const colors = {
      [RoomType.CLASSROOM]: "primary" as const,
      [RoomType.LAB]: "secondary" as const,
      [RoomType.OFFICE]: "info" as const,
      [RoomType.AUDITORIUM]: "warning" as const,
      [RoomType.LIBRARY]: "info" as const,
      [RoomType.OTHER]: "default" as const,
    };
    return colors[type] || "default";
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={200} sx={{ mb: 3 }} />
      </Box>
    );
  }

  if (!floor) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6">Andar não encontrado</Typography>
      </Box>
    );
  }

  // Calcular dispositivos ativos a partir dos dados aninhados
  const activeDevices = floor.rooms?.reduce((acc, room) => {
    return acc + (room.devices?.filter(d => d.status === 'ON').length || 0);
  }, 0) || 0;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 4 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate("/buildings")}
          sx={{ 
            cursor: "pointer",
            fontWeight: 500,
            '&:hover': { color: 'primary.main' },
          }}
        >
          Prédios
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate(`/buildings/${floor.buildingId}`)}
          sx={{ 
            cursor: "pointer",
            fontWeight: 500,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {building?.name || "Prédio"}
        </Link>
        <Typography color="text.primary" fontWeight={600}>{floor.name}</Typography>
      </Breadcrumbs>

      {/* Floor Info */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mb: 1.5, letterSpacing: '-0.02em' }}
              >
                {floor.name}
              </Typography>
              <Chip label={`${floor.number}º andar`} color="primary" sx={{ fontWeight: 600 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => setEditFloorOpen(true)}
                sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteFloorOpen(true)}
                sx={{ '&:hover': { backgroundColor: 'error.main', color: 'white' } }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          {/* Stats */}
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
              }}
            >
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                p: 3,
                backgroundColor: "#F9FAFB",
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'info.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <MeetingRoom sx={{ fontSize: 32, color: "info.main", mb: 1.5 }} />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {floor.rooms?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Salas
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                p: 3,
                backgroundColor: "#F9FAFB",
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'success.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <DevicesOutlined
                sx={{ fontSize: 32, color: "success.main", mb: 1.5 }}
              />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {activeDevices}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dispositivos Ativos
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                p: 3,
                backgroundColor: "#F9FAFB",
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'warning.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <BoltOutlined
                sx={{ fontSize: 32, color: "warning.main", mb: 1.5 }}
              />
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                {floor.totalEnergy?.toFixed(2) || "0.00"}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                kWh Consumidos
              </Typography>
            </Box>
          </Box>
          )}
        </CardContent>
      </Card>

      {/* Rooms */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              Salas
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {isLoading ? 'Carregando...' : `${floor.rooms?.length || 0} sala(s) neste andar`}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setRoomDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Nova Sala
          </Button>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
              </Box>
            ))}
          </Box>
        ) : floor.rooms && floor.rooms.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <MeetingRoom sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Nenhuma sala cadastrada neste andar
          </Typography>
        </Card>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {floor.rooms?.map((room) => (
            <Card
              key={room.id}
              sx={{
                flex: {
                  xs: "1 1 100%",
                  sm: "1 1 calc(50% - 12px)",
                  md: "1 1 calc(33.333% - 16px)",
                },
                minWidth: { xs: "100%", sm: 275 },
                position: "relative",
                borderRadius: 3,
                transition: "all 0.2s ease-in-out",
                "& .card-actions": { opacity: 0, transition: "opacity 0.2s" },
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "primary.main",
                  "& .card-actions": { opacity: 1 },
                },
              }}
            >
              <Box
                className="card-actions"
                sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, display: "flex", gap: 0.5 }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setEditRoom(room as Room); }}
                  sx={{ bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "primary.light", color: "white" } }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); setDeleteRoom(room as Room); }}
                  sx={{ bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "error.main", color: "white" } }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
              <CardActionArea onClick={() => handleRoomClick(room.id)}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {room.name}
                    </Typography>
                    {room.occupied && (
                      <Chip
                        icon={<Person sx={{ fontSize: 16 }} />}
                        label="Ocupada"
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>

                  <Chip
                    label={getRoomTypeLabel(room.type)}
                    size="small"
                    color={getRoomTypeColor(room.type)}
                    sx={{ mb: 2 }}
                  />

                  {room.capacity && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Capacidade: {room.capacity} pessoas
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      icon={<DevicesOutlined sx={{ fontSize: 16 }} />}
                      label={`${room.devices?.length || 0} dispositivos`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                      backgroundColor: "#F5F5F5",
                      borderRadius: 1,
                    }}
                  >
                    <BoltOutlined
                      sx={{ fontSize: 20, color: "warning.main" }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Consumo
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {(roomEnergyMap[room.id] ?? 0).toFixed(2)} kWh
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

      <FloorDialog
        open={editFloorOpen}
        buildingId={floor.buildingId}
        floor={floor as Floor}
        onClose={() => {
          setEditFloorOpen(false);
          queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'details'] });
        }}
      />

      {/* Create new room */}
      <RoomDialog
        open={roomDialogOpen}
        floorId={floorId!}
        onClose={() => {
          setRoomDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'details'] });
        }}
      />

      {/* Edit specific room */}
      <RoomDialog
        open={!!editRoom}
        floorId={floorId!}
        room={editRoom}
        onClose={() => {
          setEditRoom(null);
          queryClient.invalidateQueries({ queryKey: ['floors', floorId, 'details'] });
        }}
      />

      {/* Delete specific room */}
      <ConfirmDialog
        open={!!deleteRoom}
        title="Excluir Sala"
        message={`Tem certeza que deseja excluir "${deleteRoom?.name}"? Todos os dispositivos associados serão removidos.`}
        loading={deleteRoomMutation.isPending}
        onConfirm={() => deleteRoom && deleteRoomMutation.mutate(deleteRoom.id)}
        onClose={() => setDeleteRoom(null)}
      />

      <ConfirmDialog
        open={deleteFloorOpen}
        title="Excluir Andar"
        message={`Tem certeza que deseja excluir "${floor.name}"? Todas as salas associadas serão removidas.`}
        loading={deleteFloorMutation.isPending}
        onConfirm={() => deleteFloorMutation.mutate()}
        onClose={() => setDeleteFloorOpen(false)}
      />
    </Box>
  );
};

export default FloorDetailPage;
