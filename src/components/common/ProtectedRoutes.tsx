import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import LoadingScreen from './LoadingScreen';
import { Box, Typography, Button } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user && requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            p: 3,
          }}
        >
          <Lock sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            Você não tem permissão para acessar esta página. Entre em contato com o
            administrador do sistema se acredita que isso é um erro.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Seu perfil atual: <strong>{user?.role}</strong>
          </Typography>
          <Button variant="contained" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </Box>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;