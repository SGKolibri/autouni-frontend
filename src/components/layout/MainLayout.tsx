import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import Sidebar from './Sidebar';
import NotificationDrawer from './NotificationDrawer';

const DRAWER_WIDTH = 240;

const MainLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const unreadCount = useUIStore((state) => state.unreadCount);
  const toggleNotificationDrawer = useUIStore((state) => state.toggleNotificationDrawer);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleProfileMenuClose();
    navigate('/settings');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* AppBar Moderna */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleSidebar}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.grey[100],
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                AutoUni
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              onClick={toggleNotificationDrawer}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.grey[100],
                },
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.625rem',
                    height: 18,
                    minWidth: 18,
                    fontWeight: 600,
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                ml: 1,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              {user?.avatar ? (
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ 
                    width: 36, 
                    height: 36,
                    border: `2px solid ${theme.palette.grey[200]}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    border: `2px solid ${theme.palette.grey[200]}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} />
                Perfil
              </MenuItem>
              <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
                <Settings sx={{ mr: 1.5, fontSize: 20 }} />
                Configurações
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar drawerWidth={DRAWER_WIDTH} />

      {/* Notification Drawer */}
      <NotificationDrawer />

      {/* Main Content - Clean & Modern */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          mt: 8,
          backgroundColor: '#F9FAFB',
          minHeight: 'calc(100vh - 64px)',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;