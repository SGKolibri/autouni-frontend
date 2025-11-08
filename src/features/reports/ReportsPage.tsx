import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Assessment,
  BoltOutlined,
  Devices,
  Schedule,
  ErrorOutline,
  Add,
  Download,
  Visibility,
  Delete,
  CheckCircle,
  HourglassEmpty,
  Cancel,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { Report, ReportType, ReportFormat, ReportStatus } from '@types/index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsPage = () => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [reportForm, setReportForm] = useState({
    type: ReportType.ENERGY_CONSUMPTION,
    format: ReportFormat.PDF,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await apiService.get<Report[]>('/reports');
      return response.data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: typeof reportForm) => {
      const response = await apiService.post('/reports/generate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setCreateDialogOpen(false);
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiService.delete(`/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const reportTypes = [
    {
      type: ReportType.ENERGY_CONSUMPTION,
      title: 'Consumo Energético',
      description: 'Análise detalhada do consumo de energia por período, prédio, andar ou sala',
      icon: <BoltOutlined sx={{ fontSize: 40 }} />,
      color: '#FF9800',
    },
    {
      type: ReportType.DEVICE_STATUS,
      title: 'Status dos Dispositivos',
      description: 'Relatório de status, disponibilidade e histórico de dispositivos',
      icon: <Devices sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
    },
    {
      type: ReportType.ROOM_USAGE,
      title: 'Uso de Salas',
      description: 'Ocupação e utilização das salas por período',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#2196F3',
    },
    {
      type: ReportType.INCIDENTS,
      title: 'Incidentes',
      description: 'Histórico de falhas, alertas e problemas detectados',
      icon: <ErrorOutline sx={{ fontSize: 40 }} />,
      color: '#D32F2F',
    },
  ];

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case ReportStatus.PROCESSING:
        return <HourglassEmpty color="warning" />;
      case ReportStatus.FAILED:
        return <Cancel color="error" />;
      default:
        return <HourglassEmpty />;
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    const labels = {
      [ReportStatus.PENDING]: 'Pendente',
      [ReportStatus.PROCESSING]: 'Processando',
      [ReportStatus.COMPLETED]: 'Concluído',
      [ReportStatus.FAILED]: 'Falhou',
    };
    return labels[status];
  };

  const handleSelectType = (type: ReportType) => {
    setSelectedType(type);
    setReportForm({ ...reportForm, type });
    setCreateDialogOpen(true);
  };

  const handleGenerateReport = () => {
    generateReportMutation.mutate(reportForm);
  };

  const handleDownload = (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          gutterBottom
          sx={{ 
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Relatórios
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Gere relatórios personalizados sobre consumo, dispositivos e utilização
        </Typography>
      </Box>

      {/* Report Types */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Tipos de Relatório
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Selecione o tipo de relatório que deseja gerar
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {reportTypes.map((reportType) => (
          <Grid item xs={12} sm={6} md={3} key={reportType.type}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardActionArea
                onClick={() => handleSelectType(reportType.type)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      backgroundColor: reportType.color + '15',
                      color: reportType.color,
                      mb: 2,
                    }}
                  >
                    {reportType.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {reportType.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {reportType.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Reports */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Relatórios Recentes
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Histórico de relatórios gerados
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Novo Relatório
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Formato</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : reports && reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {report.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={report.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={report.format.toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(report.status)}
                        <Typography variant="body2">
                          {getStatusLabel(report.status)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {report.status === ReportStatus.COMPLETED && report.fileUrl && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleDownload(report)}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteReportMutation.mutate(report.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4 }}>
                      <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Nenhum relatório gerado ainda
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Generate Report Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Gerar Novo Relatório</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Relatório</InputLabel>
              <Select
                value={reportForm.type}
                label="Tipo de Relatório"
                onChange={(e) => setReportForm({ ...reportForm, type: e.target.value as ReportType })}
              >
                <MenuItem value={ReportType.ENERGY_CONSUMPTION}>Consumo Energético</MenuItem>
                <MenuItem value={ReportType.DEVICE_STATUS}>Status dos Dispositivos</MenuItem>
                <MenuItem value={ReportType.ROOM_USAGE}>Uso de Salas</MenuItem>
                <MenuItem value={ReportType.INCIDENTS}>Incidentes</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Formato</InputLabel>
              <Select
                value={reportForm.format}
                label="Formato"
                onChange={(e) => setReportForm({ ...reportForm, format: e.target.value as ReportFormat })}
              >
                <MenuItem value={ReportFormat.PDF}>PDF</MenuItem>
                <MenuItem value={ReportFormat.CSV}>CSV</MenuItem>
                <MenuItem value={ReportFormat.XLSX}>Excel (XLSX)</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Data Início"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={reportForm.startDate}
                  onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Data Fim"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={reportForm.endDate}
                  onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending}
          >
            {generateReportMutation.isPending ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;