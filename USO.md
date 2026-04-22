# AutoUni - Exemplos de Uso

Este documento contém exemplos práticos de como usar o frontend do AutoUni.

---

## 📋 Índice

- [Autenticação](#autenticação)
- [Navegação Hierárquica](#navegação-hierárquica)
- [Controle de Dispositivos](#controle-de-dispositivos)
- [Monitoramento Energético](#monitoramento-energético)
- [Automações](#automações)
- [Relatórios](#relatórios)
- [Customização](#customização)

---

## 🔐 Autenticação

### Login Programático

```typescript
import { useAuth } from '@hooks/useAuth';

function LoginExample() {
  const { login, isLoggingIn } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'admin@autouni.com',
        password: 'admin123'
      });
      // Redirecionamento automático para /
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoggingIn}>
      {isLoggingIn ? 'Entrando...' : 'Login'}
    </button>
  );
}
```

### Proteção de Rotas com Roles

```typescript
import ProtectedRoute from '@components/common/ProtectedRoute';
import { UserRole } from '@/types';

// Rota acessível apenas para Admin
<ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
  <AdminPage />
</ProtectedRoute>

// Rota acessível para Admin e Coordenador
<ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}>
  <ManagementPage />
</ProtectedRoute>

// Rota acessível para qualquer usuário autenticado
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

---

## 🏢 Navegação Hierárquica

### Buscar Dados de um Prédio

```typescript
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';

function BuildingDetail({ buildingId }: { buildingId: string }) {
  const { data: building, isLoading } = useQuery({
    queryKey: ['buildings', buildingId],
    queryFn: async () => {
      const response = await apiService.get(`/buildings/${buildingId}`);
      return response.data;
    }
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>{building.name}</h1>
      <p>Andares: {building.floors?.length}</p>
      <p>Consumo: {building.totalEnergy} kWh</p>
    </div>
  );
}
```

### Navegar na Hierarquia

```typescript
import { useNavigate } from 'react-router-dom';

function HierarchyNavigation() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Ir para prédio específico */}
      <button onClick={() => navigate('/buildings/building-123')}>
        Ver Prédio A
      </button>

      {/* Ir para andar específico */}
      <button onClick={() => navigate('/floors/floor-456')}>
        Ver 2º Andar
      </button>

      {/* Ir para sala específica */}
      <button onClick={() => navigate('/rooms/room-789')}>
        Ver Sala 201
      </button>
    </div>
  );
}
```

---

## 🔌 Controle de Dispositivos

### Toggle de Dispositivo Individual

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import deviceService from '@services/device.service';

function DeviceToggle({ device }: { device: Device }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => deviceService.toggleDevice(device.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  return (
    <button
      onClick={() => toggleMutation.mutate()}
      disabled={toggleMutation.isPending || !device.online}
    >
      {device.status === 'on' ? 'Desligar' : 'Ligar'}
    </button>
  );
}
```

### Controle de Intensidade (Dimmer)

```typescript
import { Slider } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import deviceService from '@services/device.service';

function DimmerControl({ device }: { device: Device }) {
  const [intensity, setIntensity] = useState(device.intensity || 100);

  const setIntensityMutation = useMutation({
    mutationFn: (value: number) =>
      deviceService.setIntensity(device.id, value)
  });

  const handleChange = (value: number) => {
    setIntensity(value);
    setIntensityMutation.mutate(value);
  };

  return (
    <Slider
      value={intensity}
      onChange={(_, value) => handleChange(value as number)}
      min={0}
      max={100}
      disabled={!device.online || device.status !== 'on'}
    />
  );
}
```

### Controle em Massa (Bulk Control)

```typescript
import deviceService from '@services/device.service';

async function turnOffMultipleDevices(deviceIds: string[]) {
  try {
    await deviceService.bulkControl({
      deviceIds,
      command: 'off'
    });
    console.log('Dispositivos desligados com sucesso');
  } catch (error) {
    console.error('Erro ao desligar dispositivos:', error);
  }
}

// Uso
const selectedDevices = ['device-1', 'device-2', 'device-3'];
turnOffMultipleDevices(selectedDevices);
```

---

## ⚡ Monitoramento Energético

### Buscar Estatísticas de Energia

```typescript
import { useEnergyData } from '@hooks/useEnergyData';

function EnergyDashboard() {
  const { stats, history, isLoading } = useEnergyData({
    level: 'general',
    period: 'today',
    refetchInterval: 60000 // 1 minuto
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Consumo Total: {stats?.totalEnergy.toFixed(2)} kWh</h2>
      <h3>Custo: R$ {stats?.totalCost.toFixed(2)}</h3>
      <h3>Pico: {stats?.peakDemand} W</h3>

      {/* Renderizar gráfico com history */}
      <EnergyChart data={history} />
    </div>
  );
}
```

### Filtrar por Nível e Período

```typescript
// Consumo de um prédio específico
const { stats } = useEnergyData({
  level: 'building',
  id: 'building-123',
  period: 'month'
});

// Consumo de uma sala específica na última semana
const { stats } = useEnergyData({
  level: 'room',
  id: 'room-456',
  period: 'week'
});

// Período customizado
const { stats } = useEnergyData({
  level: 'general',
  period: 'custom',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

### Calcular Custos

```typescript
import { calculateEnergyCost, formatCurrency } from '@utils/formatters';
import { ENERGY_TARIFF } from '@utils/constants';

function EnergyCostCalculator({ energyKWh }: { energyKWh: number }) {
  const cost = calculateEnergyCost(energyKWh, ENERGY_TARIFF);

  return (
    <div>
      <p>Energia: {energyKWh} kWh</p>
      <p>Custo: {formatCurrency(cost)}</p>
      <p>Tarifa: R$ {ENERGY_TARIFF}/kWh</p>
    </div>
  );
}
```

---

## 🤖 Automações

### Criar Automação Simples

```typescript
import apiService from '@services/api';

async function createScheduleAutomation() {
  const automation = {
    name: 'Ligar luzes às 18h',
    description: 'Liga todas as luzes do prédio A às 18h',
    enabled: true,
    trigger: {
      type: 'schedule',
      schedule: {
        time: '18:00',
        days: [1, 2, 3, 4, 5] // Segunda a Sexta
      }
    },
    actions: [
      {
        deviceId: 'light-1',
        command: 'on'
      },
      {
        deviceId: 'light-2',
        command: 'on'
      }
    ]
  };

  try {
    const response = await apiService.post('/automations', automation);
    console.log('Automação criada:', response.data);
  } catch (error) {
    console.error('Erro ao criar automação:', error);
  }
}
```

### Executar Automação Manualmente

```typescript
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';

function RunAutomationButton({ automationId }: { automationId: string }) {
  const runMutation = useMutation({
    mutationFn: () => apiService.post(`/automations/${automationId}/run`)
  });

  return (
    <button
      onClick={() => runMutation.mutate()}
      disabled={runMutation.isPending}
    >
      {runMutation.isPending ? 'Executando...' : 'Executar Agora'}
    </button>
  );
}
```

---

## 📊 Relatórios

### Gerar Relatório de Consumo

```typescript
import { useMutation } from '@tanstack/react-query';
import apiService from '@services/api';
import { ReportType, ReportFormat } from '@/types';

function GenerateEnergyReport() {
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.post('/reports', {
        type: ReportType.ENERGY_CONSUMPTION,
        format: ReportFormat.PDF,
        filters: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          buildingIds: ['building-123']
        }
      });
      return response.data;
    }
  });

  return (
    <button
      onClick={() => generateMutation.mutate()}
      disabled={generateMutation.isPending}
    >
      Gerar Relatório PDF
    </button>
  );
}
```

### Download de Relatório

```typescript
function DownloadReport({ report }: { report: Report }) {
  const handleDownload = () => {
    if (report.status === 'completed' && report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={report.status !== 'completed'}
    >
      {report.status === 'completed' ? 'Download' : 'Processando...'}
    </button>
  );
}
```

---

## 🎨 Customização

### Usar Formatadores

```typescript
import {
  formatCurrency,
  formatEnergy,
  formatDate,
  formatRelativeTime
} from '@utils/formatters';

function FormattedValues() {
  return (
    <div>
      <p>Custo: {formatCurrency(150.50)}</p>
      {/* Custo: R$ 150,50 */}

      <p>Energia: {formatEnergy(1234.56, 'kWh')}</p>
      {/* Energia: 1234.56 kWh */}

      <p>Data: {formatDate(new Date())}</p>
      {/* Data: 31/10/2025 */}

      <p>Atualizado: {formatRelativeTime(new Date())}</p>
      {/* Atualizado: há alguns segundos */}
    </div>
  );
}
```

### Validar Dados

```typescript
import {
  isValidEmail,
  isValidTemperature,
  validatePasswordStrength
} from '@utils/validators';

// Validar email
if (isValidEmail('user@example.com')) {
  console.log('Email válido');
}

// Validar temperatura
if (isValidTemperature(22)) {
  console.log('Temperatura no range permitido (16-30°C)');
}

// Validar força da senha
const passwordCheck = validatePasswordStrength('MyP@ssw0rd123');
console.log(passwordCheck.strength); // 'weak' | 'medium' | 'strong'
console.log(passwordCheck.errors); // Array de erros
```

### Usar Constantes

```typescript
import {
  DEVICE_TYPE_LABELS,
  DEVICE_STATUS_LABELS,
  USER_ROLE_LABELS
} from '@utils/constants';

function DeviceInfo({ device }: { device: Device }) {
  return (
    <div>
      <p>Tipo: {DEVICE_TYPE_LABELS[device.type]}</p>
      {/* Tipo: Iluminação */}

      <p>Status: {DEVICE_STATUS_LABELS[device.status]}</p>
      {/* Status: Ligado */}
    </div>
  );
}
```

### Criar Custom Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';

// Hook para buscar dispositivos de uma sala
export function useRoomDevices(roomId: string) {
  return useQuery({
    queryKey: ['rooms', roomId, 'devices'],
    queryFn: async () => {
      const response = await apiService.get(`/rooms/${roomId}/devices`);
      return response.data;
    },
    enabled: !!roomId,
    refetchInterval: 10000 // Atualiza a cada 10s
  });
}

// Uso
function RoomDevicesList({ roomId }: { roomId: string }) {
  const { data: devices, isLoading } = useRoomDevices(roomId);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <ul>
      {devices?.map(device => (
        <li key={device.id}>{device.name}</li>
      ))}
    </ul>
  );
}
```

---

## 🔄 WebSocket em Tempo Real

### Usar WebSocket Hook

```typescript
import { useWebSocket } from '@hooks/useWebSocket';
import { useEffect } from 'react';

function RealtimeUpdates() {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    // Inscrever em eventos
    const handleDeviceUpdate = (data: any) => {
      console.log('Dispositivo atualizado:', data);
    };

    subscribe('device:update', handleDeviceUpdate);

    // Cleanup
    return () => {
      unsubscribe('device:update', handleDeviceUpdate);
    };
  }, [subscribe, unsubscribe]);

  return (
    <div>
      Status WebSocket: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
    </div>
  );
}
```

### Emitir Eventos WebSocket

```typescript
import { useWebSocket } from '@hooks/useWebSocket';

function SendCommand() {
  const { emit } = useWebSocket();

  const turnOnDevice = (deviceId: string) => {
    emit('device:control', {
      deviceId,
      command: 'on'
    });
  };

  return (
    <button onClick={() => turnOnDevice('device-123')}>
      Ligar Dispositivo
    </button>
  );
}
```

---

## 📝 Dicas e Boas Práticas

### 1. Sempre usar React Query para dados do servidor

```typescript
// ✅ Correto
const { data } = useQuery({
  queryKey: ['buildings'],
  queryFn: () => apiService.get('/buildings')
});

// ❌ Evitar
const [data, setData] = useState([]);
useEffect(() => {
  apiService.get('/buildings').then(setData);
}, []);
```

### 2. Usar Zustand para estado local/UI

```typescript
// ✅ Correto para estado global UI
const sidebarOpen = useUIStore((state) => state.sidebarOpen);

// ✅ Correto para estado local
const [localValue, setLocalValue] = useState('');
```

### 3. Sempre tratar erros

```typescript
const mutation = useMutation({
  mutationFn: someApiCall,
  onSuccess: () => {
    showSuccessMessage();
  },
  onError: (error) => {
    console.error('Erro:', error);
    showErrorMessage(error.message);
  }
});
```

### 4. Usar TypeScript

```typescript
// ✅ Com tipos
function DeviceCard({ device }: { device: Device }) {
  // TypeScript vai ajudar com autocomplete
}

// ❌ Sem tipos
function DeviceCard({ device }: any) {
  // Sem ajuda do TypeScript
}
```

---

## 🎯 Exemplos Completos

Veja exemplos completos de implementação na pasta `src/features/`.

- **Dashboard**: `src/features/dashboard/DashboardPage.tsx`
- **Controle**: `src/features/devices/DevicesPage.tsx`
- **Energia**: `src/features/energy/EnergyPage.tsx`
- **Automações**: `src/features/automations/AutomationsPage.tsx`

---

**Precisa de mais exemplos?** Abra uma [issue no GitHub](https://github.com/seu-usuario/autouni-frontend/issues)!