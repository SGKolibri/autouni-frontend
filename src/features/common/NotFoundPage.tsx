import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 600,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '120px',
            fontWeight: 700,
            color: 'primary.main',
            lineHeight: 1,
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography variant="h4" fontWeight={600} gutterBottom>
          Página Não Encontrada
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Desculpe, a página que você está procurando não existe ou foi movida.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
          >
            Ir para o Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;