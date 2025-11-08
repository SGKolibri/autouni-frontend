import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Chip,
  Switch,
  Divider,
  Alert,
  Button,
} from "@mui/material";
import {
  NavigateNext,
  MeetingRoom,
  DevicesOutlined,
  LightbulbOutlined,
  AcUnitOutlined,
  SlideshowOutlined,
  VolumeUpOutlined,
  SensorsOutlined,
  PowerSettingsNew,
  Refresh,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@services/api";
import { Room, Device, DeviceType, DeviceStatus } from "@types/index";
import { useDeviceStore } from "@store/deviceStore";

const RoomDetailPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateDevice = useDeviceStore((state) => state.updateDevice);
  const wsConnected = useDeviceStore((state) => state.wsConnected);

  const { data: room, isLoading, refetch: refetchRoom } = useQuery({
    queryKey: ["rooms", roomId],
    queryFn: () => apiService.get<Room>(`/rooms/${roomId}/details`).then((res) => res.data),
    enabled: !!roomId,
  });

  const deviceControlMutation = useMutation({
    mutationFn: async ({
      deviceId,
      command,
      value,
    }: {
      deviceId: string;
      command: string;
      value?: any;
    }) => {
      const response = await apiService.post(`/devices/${deviceId}/control`, {
        command,
        value,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Atualiza store local
      updateDevice(variables.deviceId, { status: data.status });
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["rooms", roomId] });
    },
  });

  const getDeviceIcon = (type: DeviceType) => {
    const icons = {
      [DeviceType.LIGHT]: <LightbulbOutlined />,
      [DeviceType.AC]: <AcUnitOutlined />,
      [DeviceType.PROJECTOR]: <SlideshowOutlined />,
      [DeviceType.SPEAKER]: <VolumeUpOutlined />,
      [DeviceType.SENSOR]: <SensorsOutlined />,
      [DeviceType.LOCK]: <PowerSettingsNew />,
      [DeviceType.OTHER]: <DevicesOutlined />,
    };
    return icons[type] || <DevicesOutlined />;
  };

  const getDeviceTypeLabel = (type: DeviceType) => {
    const labels = {
      [DeviceType.LIGHT]: "Iluminação",
      [DeviceType.AC]: "Ar Condicionado",
      [DeviceType.PROJECTOR]: "Projetor",
      [DeviceType.SPEAKER]: "Alto-falante",
      [DeviceType.SENSOR]: "Sensor",
      [DeviceType.LOCK]: "Trava",
      [DeviceType.OTHER]: "Outro",
    };
    return labels[type] || type;
  };

  const handleDeviceToggle = (device: Device) => {
    const newStatus =
      device.status === DeviceStatus.ON ? DeviceStatus.OFF : DeviceStatus.ON;
    deviceControlMutation.mutate({
      deviceId: device.id,
      command: "toggle",
      value: newStatus,
    });
  };

  const handleRefreshRoom = () => {
    queryClient.invalidateQueries({ queryKey: ["rooms", roomId] });
  };

  const handleTurnOffAll = () => {
    if (!room?.devices) return;

    const deviceIds = room.devices
      .filter((d) => d.status === DeviceStatus.ON)
      .map((d) => d.id);

    if (deviceIds.length === 0) {
      alert("Não há dispositivos ligados");
      return;
    }

    if (confirm(`Desligar ${deviceIds.length} dispositivo(s)?`)) {
      // Bulk control
      apiService
        .post("/devices/bulk-control", {
          deviceIds,
          command: "off",
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["rooms", roomId] });
        });
    }
  };

  if (isLoading || !room) {
    return <Box sx={{ p: 3 }}>Carregando...</Box>;
  }

  // Calcular se dispositivo está "online" baseado em lastSeen (últimas 5 minutos)
  const isDeviceOnline = (device: Device) => {
    if (!device.lastSeen) return false;
    const lastSeenDate = new Date(device.lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 1000 / 60;
    return diffMinutes <= 5; // Online se visto nos últimos 5 minutos
  };

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
        <Typography color="text.primary" fontWeight={600}>{room.name}</Typography>
      </Breadcrumbs>

      {/* Connection Status */}
      {!wsConnected && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Conexão WebSocket desconectada. Os controles podem não funcionar em
          tempo real.
        </Alert>
      )}

      {/* Room Info */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: { xs: "stretch", md: "flex-start" }, mb: 4 }}>
            <Box
              sx={{
                width: { xs: "100%", md: 80 },
                height: 80,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
              }}
            >
              <MeetingRoom sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                {room.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Sala {room.name}
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box 
              sx={{ 
                flex: 1, 
                p: 3,
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                Capacidade
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {room.capacity || 0}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                flex: 1, 
                p: 3,
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                Dispositivos
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {room.devices?.length || 0}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                flex: 1, 
                p: 3,
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
                Ativos
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {room.devices?.filter((d: Device) => d.status === DeviceStatus.ON).length || 0}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Devices Control */}
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
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Dispositivos
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Controle e monitore todos os dispositivos desta sala
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefreshRoom}
              sx={{ borderRadius: 2 }}
            >
              Atualizar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<PowerSettingsNew />}
              onClick={handleTurnOffAll}
              sx={{ borderRadius: 2 }}
            >
              Desligar Todos
            </Button>
          </Box>
        </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {room.devices?.map((device) => {
          const isOnline = isDeviceOnline(device);
          const devicePower = device.metadata?.power || device.metadata?.powerRating;
          
          return (
            <Card
              key={device.id}
              sx={{
                flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                minWidth: { xs: "100%", sm: 275 },
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        backgroundColor:
                          device.status === DeviceStatus.ON
                            ? "success.main"
                            : "#E0E0E0",
                        color:
                          device.status === DeviceStatus.ON ? "white" : "#616161",
                      }}
                    >
                      {getDeviceIcon(device.type)}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {device.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getDeviceTypeLabel(device.type)}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={device.status === DeviceStatus.ON}
                    onChange={() => handleDeviceToggle(device)}
                    disabled={!isOnline || deviceControlMutation.isPending}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Status Chips */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={isOnline ? "Online" : "Offline"}
                    size="small"
                    color={isOnline ? "success" : "error"}
                  />
                  <Chip label={device.status} size="small" variant="outlined" />
                </Box>

                {/* Device Metadata */}
                {device.metadata && (
                  <Box sx={{ mt: 2 }}>
                    {device.metadata.brand && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Marca: {device.metadata.brand}
                      </Typography>
                    )}
                    {device.metadata.model && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Modelo: {device.metadata.model}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Power Info */}
                {devicePower && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      backgroundColor: "#F5F5F5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Potência: {devicePower}
                    </Typography>
                  </Box>
                )}

                {/* Last Seen */}
                {device.lastSeen && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Última comunicação: {new Date(device.lastSeen).toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}

        {(!room.devices || room.devices.length === 0) && (
          <Card sx={{ p: 4, textAlign: "center", width: "100%", borderRadius: 3 }}>
            <DevicesOutlined
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary">
              Nenhum dispositivo cadastrado nesta sala
            </Typography>
          </Card>
        )}
      </Box>
      </Box>
    </Box>
  );
};

export default RoomDetailPage;
