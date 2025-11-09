# AutoUni - Gráficos e Visualizações de Dados

**Versão:** 1.0.1  
**Projeto:** AutoUni - Sistema de Gerenciamento Inteligente para Universidades

---

## 📊 Sumário

1. [Dashboard Principal](#1-dashboard-principal)
2. [Gráficos de Energia](#2-gráficos-de-energia)
3. [Gráficos de Dispositivos](#3-gráficos-de-dispositivos)
4. [Gráficos de Ocupação e Uso](#4-gráficos-de-ocupação-e-uso)
5. [Gráficos de Automação](#5-gráficos-de-automação)
6. [Relatórios Visuais](#6-relatórios-visuais)
7. [Comparativos e Tendências](#7-comparativos-e-tendências)
8. [Mapas de Calor](#8-mapas-de-calor)

---

## 1. Dashboard Principal

### 1.1 KPIs (Cards de Métricas)

**Fonte de Dados:** `GET /devices/stats`, `GET /energy/buildings/:id/stats`

```typescript
interface DashboardKPIs {
  totalDevices: number;           // Total de dispositivos cadastrados
  activeDevices: number;          // Dispositivos atualmente ligados
  totalEnergyToday: number;       // kWh consumidos hoje
  energyCostToday: number;        // Custo em R$ de energia hoje
  offlineDevices: number;         // Dispositivos offline
  activeAutomations: number;      // Automações ativas
  unreadNotifications: number;    // Notificações não lidas
  criticalAlerts: number;         // Alertas críticos
}
```

**Visualização:**
- Cards com ícones coloridos
- Indicadores de tendência (↑↓)
- Comparação com período anterior

---

### 1.2 Consumo de Energia em Tempo Real

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats` (atualização a cada 5s via WebSocket)

**Tipo de Gráfico:** Gauge Chart (Velocímetro)

```typescript
interface RealTimePowerGauge {
  currentPower: number;      // Watts atuais
  peakDemand: number;        // Pico de demanda (máximo)
  averagePower: number;      // Potência média
  unit: 'W' | 'kW';
  status: 'normal' | 'warning' | 'critical';
}
```

**Configuração:**
- Min: 0 W
- Max: Pico de demanda + 20%
- Zonas:
  - Verde: 0-60% do pico
  - Amarelo: 60-85% do pico
  - Vermelho: 85-100% do pico

---

### 1.3 Histórico de Consumo (24h)

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats?from=hoje-24h&to=agora`

**Tipo de Gráfico:** Line Chart (Linha)

```typescript
interface EnergyHistoryData {
  history: Array<{
    timestamp: string;     // ISO 8601
    value: number;         // kWh
  }>;
  totalKwh: number;
  avgKwh: number;
  peakHour: string;        // Hora do pico
  peakValue: number;       // Valor do pico
}
```

**Configuração:**
- Eixo X: Tempo (horas do dia)
- Eixo Y: Energia (kWh)
- Área preenchida abaixo da linha
- Tooltip mostrando hora e consumo

---

## 2. Gráficos de Energia

### 2.1 Consumo por Tipo de Dispositivo

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats`

**Tipo de Gráfico:** Gráfico Donut

```typescript
interface EnergyByDeviceType {
  byDeviceType: {
    LIGHT: number;        // kWh
    AC: number;
    PROJECTOR: number;
    SPEAKER: number;
    LOCK: number;
    SENSOR: number;
    OTHER: number;
  };
  total: number;
  percentages: {
    LIGHT: number;        // %
    AC: number;
    // ... outros
  };
}
```

**Configuração:**
- Cores distintas por tipo
- Label com nome e porcentagem
- Legend interativo
- Total no centro do gráfico

---

### 2.2 Consumo por Prédio

**Fonte de Dados:** `GET /buildings` + `GET /energy/buildings/:id/stats` para cada prédio

**Tipo de Gráfico:** Bar Chart (Barras Horizontais)

```typescript
interface EnergyByBuilding {
  buildings: Array<{
    id: string;
    name: string;
    totalKwh: number;
    totalCost: number;      // R$
    trend: number;          // % vs período anterior
    activeDevices: number;
    totalDevices: number;
  }>;
  totalKwh: number;
  totalCost: number;
}
```

**Configuração:**
- Ordenado por consumo (maior para menor)
- Cores baseadas em consumo (verde → vermelho)
- Tooltip com detalhes (kWh, R$, % do total)
- Linha de média

---

### 2.3 Comparativo Mensal

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats` (últimos 12 meses)

**Tipo de Gráfico:** Bar Chart (Barras Verticais)

```typescript
interface MonthlyComparison {
  months: Array<{
    month: string;          // 'Jan', 'Fev', etc.
    year: number;
    totalKwh: number;
    totalCost: number;
    avgDailyKwh: number;
    peakDay: string;
    peakValue: number;
  }>;
  currentMonth: number;     // Índice do mês atual
  trend: number;            // % mudança vs mês anterior
  yearTotal: number;
}
```

**Configuração:**
- Destaque no mês atual
- Linha de tendência sobreposta
- Tooltip com comparativo mês anterior

---

### 2.4 Curva de Carga Diária

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats?from=hoje-00:00&to=hoje-23:59`

**Tipo de Gráfico:** Area Chart (Área)

```typescript
interface DailyLoadCurve {
  intervals: Array<{
    hour: number;           // 0-23
    avgPower: number;       // W
    peakPower: number;      // W
    totalKwh: number;
  }>;
  peakHour: number;
  offPeakHour: number;
  baseLoad: number;         // Carga base constante
}
```

**Configuração:**
- Eixo X: 0h - 23h
- Eixo Y: Potência (W ou kW)
- Marcação de horários de pico
- Área colorida por faixa de horário

---

### 2.5 Heatmap de Consumo Semanal

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats` (últimos 7 dias, por hora)

**Tipo de Gráfico:** Heatmap

```typescript
interface WeeklyHeatmap {
  data: Array<Array<{
    day: string;            // 'Seg', 'Ter', etc.
    hour: number;           // 0-23
    kwh: number;
    intensity: number;      // 0-100 (para cor)
  }>>;
  maxKwh: number;
  minKwh: number;
  avgKwh: number;
}
```

**Configuração:**
- Eixo X: Horas (0-23)
- Eixo Y: Dias da semana
- Escala de cores: Verde (baixo) → Vermelho (alto)
- Tooltip com valor exato

---

### 2.6 Custo de Energia

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats`

**Tipo de Gráfico:** Stacked Area Chart (Área Empilhada)

```typescript
interface EnergyCostBreakdown {
  timeline: Array<{
    date: string;
    energyCost: number;     // R$
    demandCost: number;     // R$
    taxes: number;          // R$
    total: number;          // R$
  }>;
  monthTotal: number;
  projectedMonthEnd: number;
  budgetLimit: number;
  budgetUsed: number;       // %
}
```

**Configuração:**
- Camadas: Energia + Demanda + Impostos
- Cores diferenciadas por tipo de custo
- Linha de orçamento
- Área de projeção

---

## 3. Gráficos de Dispositivos

### 3.1 Status dos Dispositivos

**Fonte de Dados:** `GET /devices/stats`

**Tipo de Gráfico:** Pie Chart (Pizza)

```typescript
interface DeviceStatusDistribution {
  byStatus: {
    ON: number;
    OFF: number;
    STANDBY: number;
    ERROR: number;
  };
  total: number;
  percentages: {
    ON: number;       // %
    OFF: number;
    STANDBY: number;
    ERROR: number;
  };
}
```

**Configuração:**
- Verde: ON
- Cinza: OFF
- Amarelo: STANDBY
- Vermelho: ERROR
- Total no centro

---

### 3.2 Dispositivos por Tipo

**Fonte de Dados:** `GET /devices/stats`

**Tipo de Gráfico:** Bar Chart (Barras Horizontais)

```typescript
interface DevicesByType {
  byType: {
    LIGHT: number;
    AC: number;
    PROJECTOR: number;
    SPEAKER: number;
    LOCK: number;
    SENSOR: number;
    OTHER: number;
  };
  totalDevices: number;
  activeByType: {
    LIGHT: number;
    AC: number;
    // ... outros
  };
}
```

**Configuração:**
- Barras empilhadas (ON + OFF + STANDBY + ERROR)
- Ícones ao lado de cada tipo
- Tooltip com detalhamento

---

### 3.3 Distribuição por Sala

**Fonte de Dados:** `GET /buildings/:id/details` (com rooms e devices)

**Tipo de Gráfico:** Treemap

```typescript
interface DevicesByRoom {
  floors: Array<{
    floorName: string;
    rooms: Array<{
      roomName: string;
      roomType: RoomType;
      deviceCount: number;
      activeDevices: number;
      energyKwh: number;
    }>;
  }>;
}
```

**Configuração:**
- Tamanho baseado em número de dispositivos
- Cor baseada em consumo de energia
- Hierarquia: Prédio → Andar → Sala

---

### 3.4 Timeline de Dispositivos Offline

**Fonte de Dados:** `GET /devices` + histórico de status

**Tipo de Gráfico:** Gantt Chart / Timeline

```typescript
interface OfflineTimeline {
  devices: Array<{
    deviceId: string;
    deviceName: string;
    offlineEvents: Array<{
      startTime: string;
      endTime: string | null;  // null = ainda offline
      duration: number;         // minutos
      reason?: string;
    }>;
  }>;
  totalDowntime: number;        // minutos
  mtbf: number;                 // Mean Time Between Failures
}
```

**Configuração:**
- Eixo X: Tempo (últimos 7 dias)
- Eixo Y: Dispositivos
- Barras vermelhas para períodos offline
- Tooltip com duração e motivo

---

### 3.5 Uso de Dispositivos por Horário

**Fonte de Dados:** WebSocket events + histórico

**Tipo de Gráfico:** Multi-Line Chart

```typescript
interface DeviceUsageByHour {
  deviceTypes: Array<{
    type: DeviceType;
    hourlyAverage: Array<{
      hour: number;       // 0-23
      activeCount: number;
      percentage: number;
    }>;
  }>;
}
```

**Configuração:**
- Uma linha por tipo de dispositivo
- Eixo X: Horas do dia
- Eixo Y: Quantidade ativa
- Legend interativo

---

## 4. Gráficos de Ocupação e Uso

### 4.1 Ocupação de Salas

**Fonte de Dados:** `GET /rooms` + detecção por sensores

**Tipo de Gráfico:** Grid/Matrix

```typescript
interface RoomOccupancy {
  floors: Array<{
    floorNumber: number;
    rooms: Array<{
      roomId: string;
      roomNumber: string;
      roomType: RoomType;
      capacity: number;
      currentOccupancy: number;
      occupied: boolean;
      occupancyRate: number;    // %
      lastUpdate: string;
    }>;
  }>;
}
```

**Configuração:**
- Grid visual de salas
- Cores: Verde (livre), Amarelo (parcial), Vermelho (cheio)
- Tooltip com detalhes

---

### 4.2 Taxa de Utilização Semanal

**Fonte de Dados:** Histórico de ocupação

**Tipo de Gráfico:** Heatmap

```typescript
interface WeeklyUtilization {
  rooms: Array<{
    roomName: string;
    roomType: RoomType;
    dailyUsage: Array<{
      dayOfWeek: string;
      utilizationRate: number;  // %
      hoursUsed: number;
      totalHours: number;       // Horário de funcionamento
    }>;
  }>;
}
```

**Configuração:**
- Eixo X: Dias da semana
- Eixo Y: Salas
- Cor baseada em % de utilização

---

### 4.3 Pico de Uso por Tipo de Sala

**Fonte de Dados:** Histórico de ocupação + tipo de sala

**Tipo de Gráfico:** Grouped Bar Chart

```typescript
interface PeakUsageByRoomType {
  roomTypes: Array<{
    type: RoomType;
    peakHours: Array<{
      hour: number;
      avgOccupancy: number;
      peakOccupancy: number;
    }>;
  }>;
}
```

**Configuração:**
- Barras agrupadas por tipo de sala
- Eixo X: Horas do dia
- Eixo Y: Taxa de ocupação (%)

---

## 5. Gráficos de Automação

### 5.1 Execuções de Automação

**Fonte de Dados:** `GET /automations/stats`, `GET /automations/:id/history`

**Tipo de Gráfico:** Line Chart + Bar Chart (Combo)

```typescript
interface AutomationExecutions {
  timeline: Array<{
    date: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    pendingExecutions: number;
  }>;
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    successRate: number;      // %
  };
}
```

**Configuração:**
- Linha: Total de execuções
- Barras empilhadas: Success + Failed + Pending
- Cores: Verde (success), Vermelho (failed), Amarelo (pending)

---

### 5.2 Automações por Tipo

**Fonte de Dados:** `GET /automations/stats`

**Tipo de Gráfico:** Doughnut Chart

```typescript
interface AutomationsByType {
  byType: {
    SCHEDULE: number;
    CONDITION: number;
    MANUAL: number;
  };
  total: number;
  recentExecutions: number;
}
```

**Configuração:**
- Cores distintas por tipo
- Total no centro
- Legend com contagem

---

### 5.3 Top Automações Mais Executadas

**Fonte de Dados:** `GET /automations` + histórico

**Tipo de Gráfico:** Horizontal Bar Chart

```typescript
interface TopAutomations {
  automations: Array<{
    id: string;
    name: string;
    executionCount: number;
    successRate: number;      // %
    avgDuration: number;      // ms
    lastExecutedAt: string;
  }>;
}
```

**Configuração:**
- Top 10 automações
- Ordenado por execuções
- Barra de sucesso sobreposta

---

### 5.4 Taxa de Sucesso de Automações

**Fonte de Dados:** `GET /automations/:id/history`

**Tipo de Gráfico:** Stacked Percentage Bar Chart

```typescript
interface AutomationSuccessRate {
  automations: Array<{
    id: string;
    name: string;
    totalExecutions: number;
    successCount: number;
    failureCount: number;
    pendingCount: number;
    successRate: number;      // %
  }>;
}
```

**Configuração:**
- 100% empilhado
- Verde (success) + Vermelho (failed) + Amarelo (pending)
- Ordenado por taxa de sucesso

---

## 6. Relatórios Visuais

### 6.1 Status de Relatórios

**Fonte de Dados:** `GET /reports/me`

**Tipo de Gráfico:** Progress Bars + Cards

```typescript
interface ReportsStatus {
  byStatus: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
  };
  byType: {
    ENERGY_CONSUMPTION: number;
    DEVICE_STATUS: number;
    ROOM_USAGE: number;
    INCIDENTS: number;
  };
  recentReports: Array<{
    id: string;
    title: string;
    type: ReportType;
    status: ReportStatus;
    progress: number;         // 0-100
    createdAt: string;
  }>;
}
```

**Configuração:**
- Cards com contadores por status
- Barras de progresso para reports em processamento
- Lista dos 5 mais recentes

---

### 6.2 Histórico de Geração de Relatórios

**Fonte de Dados:** `GET /reports/me`

**Tipo de Gráfico:** Timeline Chart

```typescript
interface ReportsTimeline {
  reports: Array<{
    id: string;
    title: string;
    type: ReportType;
    format: ReportFormat;
    createdAt: string;
    completedAt: string | null;
    duration: number | null;  // segundos
    status: ReportStatus;
  }>;
  avgGenerationTime: number;  // segundos
}
```

**Configuração:**
- Eixo X: Tempo
- Marcadores coloridos por status
- Tooltip com detalhes

---

## 7. Comparativos e Tendências

### 7.1 Comparativo de Prédios

**Fonte de Dados:** `GET /buildings` + stats de cada

**Tipo de Gráfico:** Radar Chart (Gráfico de Radar)

```typescript
interface BuildingComparison {
  buildings: Array<{
    id: string;
    name: string;
    metrics: {
      energyEfficiency: number;     // 0-100
      deviceUptime: number;          // %
      automationUsage: number;       // %
      occupancyRate: number;         // %
      maintenanceScore: number;      // 0-100
      costPerM2: number;            // R$/m²
    };
  }>;
}
```

**Configuração:**
- Eixos: 6 métricas principais
- Uma linha por prédio
- Cores distintas
- Área preenchida

---

### 7.2 Tendência de Consumo

**Fonte de Dados:** `GET /energy/buildings/:id/stats` (últimos 90 dias)

**Tipo de Gráfico:** Line Chart com Regressão

```typescript
interface ConsumptionTrend {
  daily: Array<{
    date: string;
    kwh: number;
    predictedKwh: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;           // % por mês
  projectedMonthEnd: number;    // kWh
  anomalies: Array<{
    date: string;
    kwh: number;
    deviation: number;          // %
  }>;
}
```

**Configuração:**
- Linha real + Linha de tendência
- Marcadores de anomalias
- Área de confiança

---

### 7.3 Comparativo Ano a Ano

**Fonte de Dados:** Histórico de múltiplos anos

**Tipo de Gráfico:** Multi-Line Chart

```typescript
interface YearOverYearComparison {
  years: Array<{
    year: number;
    monthlyData: Array<{
      month: number;      // 1-12
      kwh: number;
      cost: number;
      avgTemp: number;    // Temperatura média (correlação)
    }>;
    total: number;
    average: number;
  }>;
}
```

**Configuração:**
- Uma linha por ano
- Eixo X: Meses
- Eixo Y: kWh
- Destaque no ano atual

---

### 7.4 Eficiência Energética

**Fonte de Dados:** Cálculo baseado em consumo vs área útil

**Tipo de Gráfico:** Scatter Plot (Dispersão)

```typescript
interface EnergyEfficiency {
  buildings: Array<{
    id: string;
    name: string;
    area: number;             // m²
    kwhPerM2: number;
    costPerM2: number;
    deviceDensity: number;    // dispositivos/m²
    efficiency: number;       // 0-100
  }>;
  benchmarks: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}
```

**Configuração:**
- Eixo X: Área (m²)
- Eixo Y: kWh/m²
- Tamanho da bolha: Número de dispositivos
- Cor: Nível de eficiência
- Linhas de benchmark

---

## 8. Mapas de Calor

### 8.1 Mapa de Calor de Consumo por Andar

**Fonte de Dados:** `GET /energy/floors/:id/stats` para todos os andares

**Tipo de Gráfico:** Floor Heatmap

```typescript
interface FloorEnergyHeatmap {
  building: {
    id: string;
    name: string;
  };
  floors: Array<{
    floorNumber: number;
    rooms: Array<{
      roomId: string;
      roomNumber: string;
      position: { x: number; y: number };  // Coordenadas no grid
      energyKwh: number;
      intensity: number;          // 0-100 para cor
      temperature: number;        // °C (se disponível)
    }>;
    totalKwh: number;
    maxKwh: number;
  }>;
}
```

**Configuração:**
- Vista de planta baixa
- Cores: Azul (baixo) → Vermelho (alto)
- Tooltip com detalhes da sala
- Selecionável por andar

---

### 8.2 Mapa de Dispositivos Ativos

**Fonte de Dados:** `GET /buildings/:id/details` + status em tempo real

**Tipo de Gráfico:** Interactive Floor Map

```typescript
interface DeviceActivityMap {
  floors: Array<{
    floorNumber: number;
    rooms: Array<{
      roomId: string;
      roomNumber: string;
      devices: Array<{
        deviceId: string;
        deviceName: string;
        type: DeviceType;
        status: DeviceStatus;
        position: { x: number; y: number };
        currentPower: number;     // W
      }>;
    }>;
  }>;
}
```

**Configuração:**
- Ícones por tipo de dispositivo
- Cor baseada em status
- Click para detalhes
- Atualização em tempo real (WebSocket)

---

### 8.3 Mapa de Temperatura

**Fonte de Dados:** Sensores de temperatura

**Tipo de Gráfico:** Thermal Heatmap

```typescript
interface ThermalMap {
  timestamp: string;
  floors: Array<{
    floorNumber: number;
    temperatureGrid: Array<Array<{
      x: number;
      y: number;
      temperature: number;      // °C
      humidity: number;         // %
    }>>;
    avgTemperature: number;
    maxTemperature: number;
    minTemperature: number;
  }>;
  comfort: {
    optimalRange: { min: number; max: number };
    currentComfort: number;     // % de área em conforto
  };
}
```

**Configuração:**
- Gradiente de cores (azul → vermelho)
- Isolinhas de temperatura
- Marcação de zonas de conforto

---

## 📋 Biblioteca Recomendada

### Chart Library:

**Nivo**
   - Focado em D3.js
   - Gráficos complexos e bonitos
   - SVG e Canvas

---

## 📊 Priorização de Implementação

### Fase 1 - MVP (Essenciais):
1. ✅ Dashboard KPIs
2. ✅ Consumo em Tempo Real (Gauge)
3. ✅ Histórico 24h (Line Chart)
4. ✅ Consumo por Tipo (Doughnut)
5. ✅ Status de Dispositivos (Pie)

### Fase 2 - Core:
6. Consumo por Prédio (Bar)
7. Comparativo Mensal (Bar)
8. Dispositivos por Tipo (Bar)
9. Ocupação de Salas (Grid)
10. Execuções de Automação (Line+Bar)

### Fase 3 - Avançado:
11. Curva de Carga (Area)
12. Heatmap Semanal
13. Mapa de Calor por Andar
14. Tendências e Projeções
15. Comparativos Ano a Ano

### Fase 4 - Analytics:
16. Eficiência Energética (Scatter)
17. Comparativo de Prédios (Radar)
18. Mapa de Dispositivos Ativos
19. Timeline de Offline
20. Análises Preditivas

---

## 🔄 Atualização de Dados

### Tempo Real (WebSocket):
- Consumo atual de energia
- Status de dispositivos
- Alertas e notificações
- Mapa de dispositivos ativos

### Polling (a cada minuto):
- KPIs do dashboard
- Ocupação de salas
- Métricas de automação

### Refresh Manual/Navegação:
- Históricos longos
- Comparativos mensais/anuais
- Relatórios
- Estatísticas agregadas

---

**Fim do Documento**

Este documento serve como guia completo para implementação de todos os gráficos e visualizações da aplicação AutoUni. Cada seção pode ser implementada de forma independente, seguindo a priorização sugerida.
