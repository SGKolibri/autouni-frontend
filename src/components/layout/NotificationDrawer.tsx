import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Collapse,
  Stack,
} from '@mui/material';
import {
  Close,
  InfoOutlined,
  WarningAmberOutlined,
  ErrorOutline,
  CheckCircleOutline,
  DeleteOutline,
  MarkEmailRead,
  FilterList,
  NotificationsActive,
  OpenInNew,
  DoneAll,
} from '@mui/icons-material';
import { useUIStore } from '@store/uiStore';
import { NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ReadFilter = 'all' | 'unread' | 'read';

const TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.INFO]: 'Info',
  [NotificationType.WARNING]: 'Alertas',
  [NotificationType.ERROR]: 'Erros',
  [NotificationType.SUCCESS]: 'Sucesso',
};

const NotificationDrawer = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const notificationDrawerOpen = useUIStore((state) => state.notificationDrawerOpen);
  const setNotificationDrawerOpen = useUIStore((state) => state.setNotificationDrawerOpen);
  const notifications = useUIStore((state) => state.notifications);
  const markNotificationAsRead = useUIStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useUIStore((state) => state.markAllNotificationsAsRead);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const preferences = useUIStore((state) => state.notificationPreferences);
  const setNotificationPreferences = useUIStore((state) => state.setNotificationPreferences);

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (readFilter === 'unread' && n.read) return false;
    if (readFilter === 'read' && !n.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO:    return <InfoOutlined color="info" />;
      case NotificationType.WARNING: return <WarningAmberOutlined color="warning" />;
      case NotificationType.ERROR:   return <ErrorOutline color="error" />;
      case NotificationType.SUCCESS: return <CheckCircleOutline color="success" />;
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationAsRead(id);
    if (link) {
      navigate(link);
      setNotificationDrawerOpen(false);
    }
  };

  const handlePushToggle = () => {
    if (!preferences.pushEnabled) {
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          setNotificationPreferences({ pushEnabled: permission === 'granted' });
        });
      }
    } else {
      setNotificationPreferences({ pushEnabled: false });
    }
  };

  const handleTypePreferenceToggle = (type: NotificationType) => {
    const current = preferences.enabledTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setNotificationPreferences({ enabledTypes: next });
  };

  return (
    <Drawer
      anchor="right"
      open={notificationDrawerOpen}
      onClose={() => setNotificationDrawerOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 420 } } }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>Notificações</Typography>
            {unreadCount > 0 && (
              <Chip label={unreadCount} size="small" color="primary" />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Filtros">
              <IconButton size="small" onClick={() => setShowFilters((v) => !v)} color={showFilters ? 'primary' : 'default'}>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Tooltip title="Marcar todas como lidas">
                <IconButton size="small" onClick={markAllNotificationsAsRead}>
                  <DoneAll fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => setNotificationDrawerOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Filters Panel */}
        <Collapse in={showFilters}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
              FILTRAR POR STATUS
            </Typography>
            <ToggleButtonGroup
              value={readFilter}
              exclusive
              onChange={(_, v) => v && setReadFilter(v)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="all">Todas</ToggleButton>
              <ToggleButton value="unread">Não lidas</ToggleButton>
              <ToggleButton value="read">Lidas</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
              FILTRAR POR TIPO
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
              <Chip
                label="Todas"
                size="small"
                variant={typeFilter === 'all' ? 'filled' : 'outlined'}
                color={typeFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setTypeFilter('all')}
              />
              {Object.values(NotificationType).map((type) => (
                <Chip
                  key={type}
                  label={TYPE_LABELS[type]}
                  size="small"
                  variant={typeFilter === type ? 'filled' : 'outlined'}
                  color={typeFilter === type ? 'primary' : 'default'}
                  onClick={() => setTypeFilter(type)}
                />
              ))}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
              PREFERÊNCIAS
            </Typography>
            <FormControlLabel
              control={<Switch size="small" checked={preferences.pushEnabled} onChange={handlePushToggle} />}
              label={<Typography variant="body2">Notificações push</Typography>}
              sx={{ mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Tipos que desejo receber:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {Object.values(NotificationType).map((type) => (
                <Chip
                  key={type}
                  label={TYPE_LABELS[type]}
                  size="small"
                  icon={<NotificationsActive fontSize="small" />}
                  variant={preferences.enabledTypes.includes(type) ? 'filled' : 'outlined'}
                  color={preferences.enabledTypes.includes(type) ? 'primary' : 'default'}
                  onClick={() => handleTypePreferenceToggle(type)}
                />
              ))}
            </Stack>
          </Box>
        </Collapse>

        {/* Notification List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
              <InfoOutlined sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" align="center">
                {notifications.length === 0 ? 'Nenhuma notificação' : 'Nenhuma notificação para este filtro'}
              </Typography>
              {notifications.length > 0 && (
                <Button size="small" sx={{ mt: 1 }} onClick={() => { setTypeFilter('all'); setReadFilter('all'); }}>
                  Limpar filtros
                </Button>
              )}
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filtered.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      cursor: 'default',
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      pr: 10,
                    }}
                  >
                    <ListItemIcon sx={{ mt: 1, minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip label="Nova" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>

                  {/* Quick actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, px: 2, pb: 1, justifyContent: 'flex-end' }}>
                    {!notification.read && (
                      <Tooltip title="Marcar como lida">
                        <IconButton size="small" onClick={() => markNotificationAsRead(notification.id)}>
                          <MarkEmailRead fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {notification.link && (
                      <Tooltip title="Abrir">
                        <IconButton size="small" onClick={() => handleNotificationClick(notification.id, notification.link)}>
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remover">
                      <IconButton size="small" onClick={() => removeNotification(notification.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {index < filtered.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
