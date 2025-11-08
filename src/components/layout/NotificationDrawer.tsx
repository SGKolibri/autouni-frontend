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
} from '@mui/material';
import {
  Close,
  InfoOutlined,
  WarningAmberOutlined,
  ErrorOutline,
  CheckCircleOutline,
  DeleteOutline,
} from '@mui/icons-material';
import { useUIStore } from '@store/uiStore';
import { NotificationType } from '@types/index';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationDrawer = () => {
  const navigate = useNavigate();
  
  const notificationDrawerOpen = useUIStore((state) => state.notificationDrawerOpen);
  const setNotificationDrawerOpen = useUIStore((state) => state.setNotificationDrawerOpen);
  const notifications = useUIStore((state) => state.notifications);
  const markNotificationAsRead = useUIStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useUIStore((state) => state.markAllNotificationsAsRead);
  const removeNotification = useUIStore((state) => state.removeNotification);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO:
        return <InfoOutlined color="info" />;
      case NotificationType.WARNING:
        return <WarningAmberOutlined color="warning" />;
      case NotificationType.ERROR:
        return <ErrorOutline color="error" />;
      case NotificationType.SUCCESS:
        return <CheckCircleOutline color="success" />;
      default:
        return <InfoOutlined />;
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationAsRead(id);
    if (link) {
      navigate(link);
      setNotificationDrawerOpen(false);
    }
  };

  const handleClose = () => {
    setNotificationDrawerOpen(false);
  };

  return (
    <Drawer
      anchor="right"
      open={notificationDrawerOpen}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E0E0E0',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Notificações
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Actions */}
        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
            <Button
              size="small"
              onClick={markAllNotificationsAsRead}
              fullWidth
              variant="outlined"
            >
              Marcar todas como lidas
            </Button>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <InfoOutlined sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" align="center">
                Nenhuma notificação
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      cursor: notification.link ? 'pointer' : 'default',
                      backgroundColor: notification.read ? 'transparent' : '#F5F5F5',
                      '&:hover': {
                        backgroundColor: notification.link ? '#EEEEEE' : 'inherit',
                      },
                    }}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ mt: 1 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip label="Nova" size="small" color="primary" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
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