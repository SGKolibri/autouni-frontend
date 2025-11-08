import { Box, CircularProgress } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
};

export default LoadingScreen;