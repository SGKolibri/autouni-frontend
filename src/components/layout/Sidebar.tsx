import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Business,
  Devices,
  BoltOutlined,
  AutoMode,
  Assessment,
  Settings,
} from '@mui/icons-material';
import { useUIStore } from '@store/uiStore';

interface SidebarProps {
  drawerWidth: number;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactElement;
  category?: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/', icon: <Dashboard />, category: 'Geral' },
  { title: 'Prédios', path: '/buildings', icon: <Business />, category: 'Gestão' },
  { title: 'Dispositivos', path: '/devices', icon: <Devices />, category: 'Gestão' },
  { title: 'Energia', path: '/energy', icon: <BoltOutlined />, category: 'Gestão' },
  { title: 'Automações', path: '/automations', icon: <AutoMode />, category: 'Ferramentas' },
  { title: 'Relatórios', path: '/reports', icon: <Assessment />, category: 'Ferramentas' },
  { title: 'Configurações', path: '/settings', icon: <Settings />, category: 'Sistema' },
];

const Sidebar = ({ drawerWidth }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Agrupar itens por categoria
  const groupedItems = navItems.reduce((acc, item) => {
    const category = item.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pt: 10,
        px: 2,
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Logo/Título */}
      <Box sx={{ px: 2, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            letterSpacing: '-0.02em',
          }}
        >
          AutoUni
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Smart Campus
        </Typography>
      </Box>

      {/* Navegação */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
          <Box key={category} sx={{ mb: 3 }}>
            {/* Label da Categoria */}
            <Typography
              variant="caption"
              sx={{
                px: 2,
                mb: 1,
                display: 'block',
                color: theme.palette.text.secondary,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
              }}
            >
              {category}
            </Typography>

            {/* Items da Categoria */}
            <List disablePadding sx={{ mb: 1 }}>
              {items.map((item) => {
                const isSelected = location.pathname === item.path;
                
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        py: 1.25,
                        px: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.main,
                          color: '#FFFFFF',
                          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#FFFFFF',
                          },
                        },
                        '&:not(.Mui-selected)': {
                          '&:hover': {
                            backgroundColor: theme.palette.grey[50],
                            transform: 'translateX(4px)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isSelected
                            ? '#FFFFFF'
                            : theme.palette.text.secondary,
                          transition: 'color 0.2s ease-in-out',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.9375rem',
                          letterSpacing: '-0.01em',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* Divider entre categorias */}
            {categoryIndex < Object.keys(groupedItems).length - 1 && (
              <Divider sx={{ mx: 2, my: 2 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          px: 2,
          py: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: 'block',
            textAlign: 'center',
          }}
        >
          v1.0.0 • 2024
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;