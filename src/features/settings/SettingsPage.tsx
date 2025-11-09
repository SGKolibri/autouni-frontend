import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Save,
  Person,
  Business,
  Notifications,
  Security,
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import apiService from "@services/api";
import { User } from "@/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
};

const SettingsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiService.get<User[]>("/users");
      return response.data;
    },
  });

  const userColumns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 1 },
    { field: "email", headerName: "E-mail", flex: 1 },
    { field: "role", headerName: "Perfil", width: 150 },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: () => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small">Editar</Button>
          <Button size="small" color="error">
            Excluir
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie usuários, prédios e configurações do sistema
      </Typography>

      <Paper>
        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<Person />} label="Usuários" iconPosition="start" />
          <Tab icon={<Business />} label="Prédios" iconPosition="start" />
          <Tab
            icon={<Notifications />}
            label="Notificações"
            iconPosition="start"
          />
          <Tab icon={<Security />} label="Sistema" iconPosition="start" />
        </Tabs>

        {/* Users Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Usuários do Sistema
              </Typography>
              <Button variant="contained">Adicionar Usuário</Button>
            </Box>

            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={users || []}
                columns={userColumns}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Buildings Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Gerenciar Prédios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure prédios, andares e salas do sistema
            </Typography>
            <Button variant="outlined">Ver Prédios</Button>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Configurações de Notificações
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Receber notificações de dispositivos offline"
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Alertas de consumo elevado"
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Switch />}
                  label="Resumo diário por e-mail"
                />
              </Box>
              <Box>
                <TextField
                  label="Limite de consumo (kWh)"
                  type="number"
                  fullWidth
                  defaultValue={100}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" startIcon={<Save />}>
                Salvar Configurações
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* System Tab */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Configurações do Sistema
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="URL do Backend"
                    fullWidth
                    defaultValue="http://localhost:3001"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Tarifa de Energia (R$/kWh)"
                    type="number"
                    fullWidth
                    defaultValue={0.85}
                  />
                </Box>
              </Box>
              <Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Modo de desenvolvimento (logs detalhados)"
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-reconexão WebSocket"
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" startIcon={<Save />}>
                Salvar Configurações
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
