import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Schedule,
  PlayArrow,
  AccessTime,
  Thermostat,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { Automation, TriggerType } from '@types/index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AutomationsPage = () => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      const response = await apiService.get<Automation[]>('/automations');
      return response.data;
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiService.patch(`/automations/${id}`, { enabled });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiService.delete(`/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const runAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.post(`/automations/${id}/execute`);
      return response.data;
    },
  });

  const handleToggle = (automation: Automation) => {
    toggleAutomationMutation.mutate({
      id: automation.id,
      enabled: !automation.enabled,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta automação?')) {
      deleteAutomationMutation.mutate(id);
    }
  };

  const handleRun = (id: string) => {
    runAutomationMutation.mutate(id);
  };

  const getTriggerLabel = (automation: Automation) => {
    if (automation.triggerType === TriggerType.SCHEDULE && automation.cron) {
      return `Agendado: ${automation.cron}`;
    }
    if (automation.triggerType === TriggerType.CONDITION && automation.condition) {
      try {
        const cond = JSON.parse(automation.condition);
        return `Condição: ${cond.field || ''} ${cond.operator || ''} ${cond.value || ''}`;
      } catch {
        return `Condição: ${automation.condition}`;
      }
    }
    return 'Manual';
  };

  const getTriggerIcon = (type: TriggerType) => {
    const icons = {
      [TriggerType.SCHEDULE]: <Schedule />,
      [TriggerType.CONDITION]: <Thermostat />,
      [TriggerType.MANUAL]: <PlayArrow />,
    };
    return icons[type];
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Automações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {automations?.length || 0} automações cadastradas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Nova Automação
        </Button>
      </Box>

      {/* Automations Grid */}
      {isLoading ? (
        <Typography>Carregando...</Typography>
      ) : automations && automations.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma automação configurada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crie automações para controlar dispositivos automaticamente
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Criar Primeira Automação
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {automations?.map((automation) => (
            <Card key={automation.id} sx={{ width: '100%' }}>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {automation.name}
                      </Typography>
                      {automation.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {automation.description}
                        </Typography>
                      )}
                    </Box>
                    <Switch
                      checked={automation.enabled}
                      onChange={() => handleToggle(automation)}
                      color="success"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Trigger Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getTriggerIcon(automation.triggerType)}
                    <Typography variant="body2">
                      {getTriggerLabel(automation)}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Ação:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      <Chip
                        label={automation.action ? 'Configurada' : 'Não configurada'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {/* Last Run */}
                  {automation.lastRunAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Última execução: {format(new Date(automation.lastRunAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<PlayArrow />}
                    onClick={() => handleRun(automation.id)}
                    disabled={runAutomationMutation.isPending}
                  >
                    Executar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => setSelectedAutomation(automation)}
                  >
                    Editar
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(automation.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || !!selectedAutomation}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedAutomation(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAutomation ? 'Editar Automação' : 'Nova Automação'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Nome"
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Descrição"
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
              Gatilho
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Gatilho</InputLabel>
              <Select label="Tipo de Gatilho" defaultValue="schedule">
                <MenuItem value="schedule">Agendamento</MenuItem>
                <MenuItem value="condition">Condição</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Horário"
                  type="time"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Dias da Semana</InputLabel>
                  <Select label="Dias da Semana" multiple defaultValue={[1, 2, 3, 4, 5]}>
                    <MenuItem value={0}>Domingo</MenuItem>
                    <MenuItem value={1}>Segunda</MenuItem>
                    <MenuItem value={2}>Terça</MenuItem>
                    <MenuItem value={3}>Quarta</MenuItem>
                    <MenuItem value={4}>Quinta</MenuItem>
                    <MenuItem value={5}>Sexta</MenuItem>
                    <MenuItem value={6}>Sábado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
              Ações
            </Typography>

            <Button variant="outlined" startIcon={<Add />} fullWidth>
              Adicionar Ação
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setSelectedAutomation(null);
          }}>
            Cancelar
          </Button>
          <Button variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationsPage;