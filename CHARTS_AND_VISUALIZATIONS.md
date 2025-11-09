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

**Tipo de Gráfico:** Recharts - [RadialBarChart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/) (Gauge personalizado)

```typescript
interface RealTimePowerGauge {
  currentPower: number;      // Watts atuais
  peakDemand: number;        // Pico de demanda (máximo)
  averagePower: number;      // Potência média
  unit: 'W' | 'kW';
  status: 'normal' | 'warning' | 'critical';
  percentage: number;        // % do pico (0-100)
}
```

**Dados do Gráfico:**
- **Valor atual:** `currentPower` (ex: 1250 W ou 1.25 kW)
- **Valor máximo:** `peakDemand` (ex: 2000 W)
- **Percentual:** `percentage` = (currentPower / peakDemand) × 100
- **Status:** Calculado com base no percentual
  - `normal`: 0-60% (cor verde)
  - `warning`: 60-85% (cor amarela)
  - `critical`: 85-100% (cor vermelha)
- **Média:** `averagePower` (exibido como referência)

**Exemplo de dados:**
```json
{
  "currentPower": 1250,
  "peakDemand": 2000,
  "averagePower": 950,
  "unit": "W",
  "status": "warning",
  "percentage": 62.5
}
```

---

### 1.3 Histórico de Consumo (24h)

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats?from=hoje-24h&to=agora`

**Tipo de Gráfico:** Recharts - AreaChart

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

**Dados do Gráfico:**
- **Eixo X:** Array de `timestamp` (ex: "2025-01-11T00:00:00Z", "2025-01-11T01:00:00Z", ...)
- **Eixo Y:** Array de `value` em kWh (ex: 12.5, 15.3, 18.7, ...)
- **Linha/Área:** Conecta todos os pontos de consumo
- **Total:** `totalKwh` exibido como legenda
- **Média:** `avgKwh` pode ser mostrada como linha de referência
- **Pico:** Marcador no ponto `peakHour` com `peakValue`

**Exemplo de dados:**
```json
{
  "history": [
    { "timestamp": "2025-01-11T00:00:00Z", "value": 12.5 },
    { "timestamp": "2025-01-11T01:00:00Z", "value": 10.2 },
    { "timestamp": "2025-01-11T02:00:00Z", "value": 8.7 },
    ...
    { "timestamp": "2025-01-11T23:00:00Z", "value": 15.4 }
  ],
  "totalKwh": 320.5,
  "avgKwh": 13.4,
  "peakHour": "14:00",
  "peakValue": 25.8
}
```

---

## 2. Gráficos de Energia

### 2.1 Consumo por Tipo de Dispositivo

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats`

**Tipo de Gráfico:** Recharts - PieChart (Donut customizado)

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

**Dados do Gráfico:**
- **Fatias:** Uma para cada tipo de dispositivo
- **Valor de cada fatia:** `byDeviceType[tipo]` em kWh
- **Percentual:** `percentages[tipo]` calculado como (valor / total) × 100
- **Total:** Exibido no centro do donut
- **Cores:** Uma cor específica por tipo (ver paleta de cores)

**Exemplo de dados:**
```json
{
  "byDeviceType": {
    "LIGHT": 145.5,
    "AC": 320.8,
    "PROJECTOR": 78.3,
    "SPEAKER": 12.5,
    "LOCK": 5.2,
    "SENSOR": 8.7,
    "OTHER": 25.0
  },
  "total": 596.0,
  "percentages": {
    "LIGHT": 24.4,
    "AC": 53.8,
    "PROJECTOR": 13.1,
    "SPEAKER": 2.1,
    "LOCK": 0.9,
    "SENSOR": 1.5,
    "OTHER": 4.2
  }
}
```

---

### 2.2 Consumo por Prédio

**Fonte de Dados:** `GET /buildings` + `GET /energy/buildings/:id/stats` para cada prédio

**Tipo de Gráfico:** Recharts - BarChart (Barras Horizontais)

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

**Dados do Gráfico:**
- **Eixo Y (categorias):** Array de `name` dos prédios
- **Eixo X (valores):** Array de `totalKwh` correspondente
- **Ordenação:** Decrescente por consumo (maior primeiro)
- **Cor das barras:** Gradiente baseado no valor (verde → amarelo → vermelho)
- **Linha de referência:** Média de consumo entre todos os prédios
- **Tooltip:** Mostra nome, kWh, custo R$, tendência %, dispositivos

**Exemplo de dados:**
```json
{
  "buildings": [
    {
      "id": "uuid-1",
      "name": "Prédio Central",
      "totalKwh": 850.5,
      "totalCost": 680.40,
      "trend": 12.5,
      "activeDevices": 145,
      "totalDevices": 200
    },
    {
      "id": "uuid-2",
      "name": "Bloco A",
      "totalKwh": 620.3,
      "totalCost": 496.24,
      "trend": -5.2,
      "activeDevices": 98,
      "totalDevices": 150
    }
  ],
  "totalKwh": 1470.8,
  "totalCost": 1176.64
}
```

---

### 2.3 Comparativo Mensal

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats` (últimos 12 meses)

**Tipo de Gráfico:** Recharts - ComposedChart (Barras + Linha de tendência)

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

**Dados do Gráfico:**
- **Eixo X:** `month` - Array com nomes dos meses ('Jan', 'Fev', 'Mar', ...)
- **Eixo Y:** `totalKwh` - Consumo total de cada mês
- **Barras:** Representam o consumo mensal em kWh
- **Linha de tendência:** Mostra a variação percentual mês a mês
- **Destaque:** Mês atual com cor diferenciada
- **Tooltip:** Exibe mês, consumo, custo, média diária, pico

**Exemplo de dados:**
```json
{
  "months": [
    { "month": "Jan", "year": 2025, "totalKwh": 8500, "totalCost": 6800, "avgDailyKwh": 274, "peakDay": "15", "peakValue": 350 },
    { "month": "Fev", "year": 2025, "totalKwh": 7800, "totalCost": 6240, "avgDailyKwh": 279, "peakDay": "20", "peakValue": 340 },
    { "month": "Mar", "year": 2025, "totalKwh": 9200, "totalCost": 7360, "avgDailyKwh": 297, "peakDay": "10", "peakValue": 380 }
  ],
  "currentMonth": 2,
  "trend": 17.9,
  "yearTotal": 25500
}
```

---

### 2.4 Curva de Carga Diária

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats?from=hoje-00:00&to=hoje-23:59`

**Tipo de Gráfico:** Recharts - AreaChart

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

**Dados do Gráfico:**
- **Eixo X:** `hour` - Horas do dia (0 a 23)
- **Eixo Y:** `avgPower` - Potência média em Watts (ou kW)
- **Área preenchida:** Representa a potência ao longo do dia com gradiente
- **Linha de pico:** Marca o `peakHour` com valor `peakPower`
- **Carga base:** `baseLoad` mostrado como linha de referência
- **Marcações:** Horários de pico destacados

**Exemplo de dados:**
```json
{
  "intervals": [
    { "hour": 0, "avgPower": 500, "peakPower": 650, "totalKwh": 0.5 },
    { "hour": 1, "avgPower": 450, "peakPower": 600, "totalKwh": 0.45 },
    ...
    { "hour": 14, "avgPower": 1800, "peakPower": 2200, "totalKwh": 1.8 },
    ...
    { "hour": 23, "avgPower": 600, "peakPower": 750, "totalKwh": 0.6 }
  ],
  "peakHour": 14,
  "offPeakHour": 3,
  "baseLoad": 400
}
```

---

### 2.5 Heatmap de Consumo Semanal

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats` (últimos 7 dias, por hora)

**Tipo de Gráfico:** Nivo - HeatMap

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

**Dados do Gráfico:**
- **Eixo X:** `hour` - Horas do dia (0-23)
- **Eixo Y:** `day` - Dias da semana ('Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom')
- **Células:** Cada célula representa o consumo `kwh` naquela hora/dia
- **Intensidade de cor:** Baseada no valor (min → max)
  - Verde/Azul: Consumo baixo
  - Amarelo: Consumo médio
  - Vermelho: Consumo alto
- **Escala:** De `minKwh` até `maxKwh`

**Exemplo de dados:**
```json
{
  "data": [
    [
      { "day": "Seg", "hour": 0, "kwh": 5.2, "intensity": 15 },
      { "day": "Seg", "hour": 1, "kwh": 4.8, "intensity": 12 },
      ...
      { "day": "Seg", "hour": 14, "kwh": 25.3, "intensity": 95 },
      ...
    ],
    [
      { "day": "Ter", "hour": 0, "kwh": 5.5, "intensity": 16 },
      ...
    ]
  ],
  "maxKwh": 28.5,
  "minKwh": 3.2,
  "avgKwh": 12.7
}
```

---

### 2.6 Custo de Energia

**Fonte de Dados:** `GET /energy/buildings/:buildingId/stats`

**Tipo de Gráfico:** Recharts - AreaChart (Stacked)

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

**Dados do Gráfico:**
- **Eixo X:** `date` - Datas do período
- **Eixo Y:** Custo em Reais (R$)
- **Áreas empilhadas:**
  - Camada 1 (verde): `energyCost` - Custo da energia consumida
  - Camada 2 (azul): `demandCost` - Custo de demanda
  - Camada 3 (amarelo): `taxes` - Impostos e taxas
- **Total:** Soma das três camadas = `total`
- **Linha de orçamento:** `budgetLimit` mostrada como referência
- **Projeção:** `projectedMonthEnd` indicada no gráfico

**Exemplo de dados:**
```json
{
  "timeline": [
    { "date": "2025-01-01", "energyCost": 450.20, "demandCost": 120.50, "taxes": 95.30, "total": 666.00 },
    { "date": "2025-01-02", "energyCost": 480.15, "demandCost": 125.00, "taxes": 101.05, "total": 706.20 },
    ...
  ],
  "monthTotal": 18500.00,
  "projectedMonthEnd": 21000.00,
  "budgetLimit": 20000.00,
  "budgetUsed": 92.5
}
```

---

## 3. Gráficos de Dispositivos

### 3.1 Status dos Dispositivos

**Fonte de Dados:** `GET /devices/stats`

**Tipo de Gráfico:** Recharts - PieChart

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

**Configuração (Recharts):**
```tsx
<PieChart>
  <Pie
    data={statusData}
    dataKey="value"
    nameKey="status"
    cx="50%"
    cy="50%"
    label
  >
    <Cell fill="#10b981" /> {/* ON */}
    <Cell fill="#6b7280" /> {/* OFF */}
    <Cell fill="#f59e0b" /> {/* STANDBY */}
    <Cell fill="#ef4444" /> {/* ERROR */}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

---

### 3.2 Dispositivos por Tipo

**Fonte de Dados:** `GET /devices/stats`

**Tipo de Gráfico:** Recharts - BarChart (Stacked Horizontal)

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

**Configuração (Recharts):**
```tsx
<BarChart data={devicesByType} layout="vertical">
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis type="category" dataKey="type" width={120} />
  <Tooltip />
  <Legend />
  <Bar dataKey="on" stackId="a" fill="#10b981" />
  <Bar dataKey="off" stackId="a" fill="#6b7280" />
  <Bar dataKey="standby" stackId="a" fill="#f59e0b" />
  <Bar dataKey="error" stackId="a" fill="#ef4444" />
</BarChart>
```

---

### 3.3 Distribuição por Sala

**Fonte de Dados:** `GET /buildings/:id/details` (com rooms e devices)

**Tipo de Gráfico:** Nivo - TreeMap

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

**Configuração (Nivo):**
```tsx
import { ResponsiveTreeMap } from '@nivo/treemap'

<ResponsiveTreeMap
  data={hierarchyData}
  identity="name"
  value="deviceCount"
  valueFormat=".02s"
  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
  labelSkipSize={12}
  labelTextColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
  parentLabelPosition="left"
  parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
  colors={{ scheme: 'nivo' }}
  borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
  tooltip={({ node }) => (
    <div>
      <strong>{node.data.roomName}</strong>
      <br />Dispositivos: {node.data.deviceCount}
      <br />Energia: {node.data.energyKwh} kWh
    </div>
  )}
/>
```

---

### 3.4 Timeline de Dispositivos Offline

**Fonte de Dados:** `GET /devices` + histórico de status

**Tipo de Gráfico:** Recharts - ScatterChart (Timeline customizado)

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

**Configuração (Recharts - Timeline customizado):**
```tsx
<BarChart data={offlineEvents} layout="horizontal">
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" domain={['dataMin', 'dataMax']} />
  <YAxis type="category" dataKey="deviceName" width={150} />
  <Tooltip content={<CustomTimelineTooltip />} />
  <Bar dataKey="duration" fill="#ef4444">
    {offlineEvents.map((entry, index) => (
      <Cell key={`cell-${index}`} />
    ))}
  </Bar>
</BarChart>
```

**Nota:** Para timeline mais complexo, considere biblioteca complementar ou componente customizado.

---

### 3.5 Uso de Dispositivos por Horário

**Fonte de Dados:** WebSocket events + histórico

**Tipo de Gráfico:** Recharts - LineChart (Multi-line)

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

**Configuração (Recharts):**
```tsx
<LineChart data={hourlyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="hour" label="Hora do dia" />
  <YAxis label="Dispositivos ativos" />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="LIGHT" stroke="#fbbf24" strokeWidth={2} />
  <Line type="monotone" dataKey="AC" stroke="#3b82f6" strokeWidth={2} />
  <Line type="monotone" dataKey="PROJECTOR" stroke="#8b5cf6" strokeWidth={2} />
  <Line type="monotone" dataKey="SPEAKER" stroke="#ec4899" strokeWidth={2} />
  <Line type="monotone" dataKey="SENSOR" stroke="#10b981" strokeWidth={2} />
</LineChart>
```

---

## 4. Gráficos de Ocupação e Uso

### 4.1 Ocupação de Salas

**Fonte de Dados:** `GET /rooms` + detecção por sensores

**Tipo de Gráfico:** Nivo - WaffleChart ou Custom Grid

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

**Configuração (Nivo WaffleChart):**
```tsx
import { ResponsiveWaffle } from '@nivo/waffle'

<ResponsiveWaffle
  data={roomOccupancyData}
  total={totalRooms}
  rows={rows}
  columns={columns}
  padding={1}
  colors={{ scheme: 'category10' }}
  borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
  animate={true}
  legends={[{
    anchor: 'top-right',
    direction: 'column',
    itemWidth: 100,
    itemHeight: 20
  }]}
/>
```

**Alternativa:** Grid customizado com Material-UI Grid e Cards coloridos.

---

### 4.2 Taxa de Utilização Semanal

**Fonte de Dados:** Histórico de ocupação

**Tipo de Gráfico:** Nivo - HeatMap

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

**Configuração (Nivo):**
```tsx
import { ResponsiveHeatMap } from '@nivo/heatmap'

<ResponsiveHeatMap
  data={utilizationData}
  margin={{ top: 60, right: 60, bottom: 60, left: 120 }}
  valueFormat=">-.0%"
  axisTop={{
    legend: 'Dia da semana',
  }}
  axisLeft={{
    legend: 'Salas',
    legendOffset: -100
  }}
  colors={{
    type: 'sequential',
    scheme: 'blues',
  }}
  emptyColor="#eeeeee"
/>
```

---

### 4.3 Pico de Uso por Tipo de Sala

**Fonte de Dados:** Histórico de ocupação + tipo de sala

**Tipo de Gráfico:** Recharts - BarChart (Grouped)

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

**Configuração (Recharts):**
```tsx
<BarChart data={peakUsageData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="hour" label="Hora do dia" />
  <YAxis label="Taxa de ocupação (%)" />
  <Tooltip />
  <Legend />
  <Bar dataKey="CLASSROOM" fill="#3b82f6" />
  <Bar dataKey="LAB" fill="#10b981" />
  <Bar dataKey="OFFICE" fill="#f59e0b" />
  <Bar dataKey="AUDITORIUM" fill="#8b5cf6" />
</BarChart>
```

---

## 5. Gráficos de Automação

### 5.1 Execuções de Automação

**Fonte de Dados:** `GET /automations/stats`, `GET /automations/:id/history`

**Tipo de Gráfico:** Recharts - ComposedChart (Line + Stacked Bar)

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

**Configuração (Recharts):**
```tsx
<ComposedChart data={timeline}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="successfulExecutions" stackId="a" fill="#10b981" />
  <Bar dataKey="failedExecutions" stackId="a" fill="#ef4444" />
  <Bar dataKey="pendingExecutions" stackId="a" fill="#f59e0b" />
  <Line type="monotone" dataKey="totalExecutions" stroke="#667eea" strokeWidth={2} />
</ComposedChart>
```

---

### 5.2 Automações por Tipo

**Fonte de Dados:** `GET /automations/stats`

**Tipo de Gráfico:** Recharts - PieChart (Donut)

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

**Configuração (Recharts):**
```tsx
<PieChart>
  <Pie
    data={automationTypeData}
    dataKey="value"
    nameKey="type"
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    label
  >
    <Cell fill="#667eea" /> {/* SCHEDULE */}
    <Cell fill="#10b981" /> {/* CONDITION */}
    <Cell fill="#f59e0b" /> {/* MANUAL */}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

---

### 5.3 Top Automações Mais Executadas

**Fonte de Dados:** `GET /automations` + histórico

**Tipo de Gráfico:** Recharts - BarChart (Horizontal)

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

**Configuração (Recharts):**
```tsx
<BarChart data={topAutomations} layout="vertical">
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis type="category" dataKey="name" width={200} />
  <Tooltip />
  <Bar dataKey="executionCount" fill="#667eea">
    {topAutomations.map((entry, index) => (
      <Cell 
        key={`cell-${index}`} 
        fill={entry.successRate > 90 ? '#10b981' : entry.successRate > 70 ? '#f59e0b' : '#ef4444'}
      />
    ))}
  </Bar>
</BarChart>
```

---

### 5.4 Taxa de Sucesso de Automações

**Fonte de Dados:** `GET /automations/:id/history`

**Tipo de Gráfico:** Recharts - BarChart (100% Stacked)

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

**Configuração (Recharts):**
```tsx
<BarChart data={automationSuccessData} layout="vertical">
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" domain={[0, 100]} />
  <YAxis type="category" dataKey="name" width={150} />
  <Tooltip formatter={(value) => `${value}%`} />
  <Legend />
  <Bar dataKey="successRate" stackId="a" fill="#10b981" />
  <Bar dataKey="failureRate" stackId="a" fill="#ef4444" />
  <Bar dataKey="pendingRate" stackId="a" fill="#f59e0b" />
</BarChart>
```

**Nota:** Calcular percentagens no frontend antes de passar para o gráfico.

---

## 6. Relatórios Visuais

### 6.1 Status de Relatórios

**Fonte de Dados:** `GET /reports/me`

**Tipo de Gráfico:** Recharts - PieChart + Material-UI Cards

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
- Material-UI Cards para contadores
- Material-UI LinearProgress para progresso
- Recharts PieChart para distribuição por tipo

```tsx
// Cards com KPIs
<Grid container spacing={2}>
  {statusCounts.map(status => (
    <Grid item xs={3}>
      <Card>
        <CardContent>
          <Typography variant="h4">{status.count}</Typography>
          <Typography color="textSecondary">{status.label}</Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

// Lista com progresso
{processingReports.map(report => (
  <Box>
    <Typography>{report.title}</Typography>
    <LinearProgress variant="determinate" value={report.progress} />
  </Box>
))}
```

---

### 6.2 Histórico de Geração de Relatórios

**Fonte de Dados:** `GET /reports/me`

**Tipo de Gráfico:** Recharts - ScatterChart (Timeline)

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

**Configuração (Recharts):**
```tsx
<ScatterChart>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="createdAt" type="category" />
  <YAxis dataKey="duration" label="Duração (s)" />
  <Tooltip content={<CustomReportTooltip />} />
  <Scatter data={reports} fill="#667eea">
    {reports.map((entry, index) => (
      <Cell 
        key={`cell-${index}`}
        fill={getStatusColor(entry.status)}
      />
    ))}
  </Scatter>
</ScatterChart>
```

---

## 7. Comparativos e Tendências

### 7.1 Comparativo de Prédios

**Fonte de Dados:** `GET /buildings` + stats de cada

**Tipo de Gráfico:** Recharts - RadarChart

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

**Configuração (Recharts):**
```tsx
<RadarChart data={metricsData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="metric" />
  <PolarRadiusAxis angle={90} domain={[0, 100]} />
  <Radar 
    name="Prédio A" 
    dataKey="buildingA" 
    stroke="#667eea" 
    fill="#667eea" 
    fillOpacity={0.6} 
  />
  <Radar 
    name="Prédio B" 
    dataKey="buildingB" 
    stroke="#10b981" 
    fill="#10b981" 
    fillOpacity={0.6} 
  />
  <Radar 
    name="Prédio C" 
    dataKey="buildingC" 
    stroke="#f59e0b" 
    fill="#f59e0b" 
    fillOpacity={0.6} 
  />
  <Legend />
  <Tooltip />
</RadarChart>
```

---

### 7.2 Tendência de Consumo

**Fonte de Dados:** `GET /energy/buildings/:id/stats` (últimos 90 dias)

**Tipo de Gráfico:** Recharts - ComposedChart (Line + Area de confiança)

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

## 📋 Bibliotecas Utilizadas

### Chart Libraries:

#### 1. **Recharts** (Principal) ⭐
```bash
npm install recharts
```
**Uso:**
- ✅ Line Charts (históricos, tendências)
- ✅ Area Charts (curva de carga, consumo acumulado)
- ✅ Bar Charts (comparativos, rankings)
- ✅ Pie/Donut Charts (distribuições, status)
- ✅ Composed Charts (múltiplas visualizações)
- ✅ Scatter Charts (correlações)
- ✅ Radar Charts (comparativos multidimensionais)

**Responsável por:** ~85% dos gráficos da aplicação

---

#### 2. **Nivo** (Gráficos Avançados) ⭐
```bash
npm install @nivo/core @nivo/heatmap @nivo/calendar @nivo/treemap @nivo/waffle
```
**Uso:**
- ✅ HeatMaps (consumo semanal, temperatura)
- ✅ Calendar HeatMaps (padrões anuais)
- ✅ TreeMaps (hierarquia de dispositivos/salas)
- ✅ Waffle Charts (ocupação visual)
- ✅ Bump Charts (rankings ao longo do tempo)

**Responsável por:** ~15% dos gráficos (visualizações complexas)

---

### 📦 Instalação Completa:

```bash
# Recharts (principal)
npm install recharts

# Nivo (gráficos avançados)
npm install @nivo/core @nivo/heatmap @nivo/calendar @nivo/treemap @nivo/waffle

# TypeScript types
npm install --save-dev @types/recharts
```

---

### 🎨 Paleta de Cores Padrão:

```typescript
export const chartColors = {
  // Cores primárias
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Gradientes para energia
  energyGradient: ['#10b981', '#f59e0b', '#ef4444'], // Verde → Amarelo → Vermelho
  
  // Cores por tipo de dispositivo
  deviceTypes: {
    LIGHT: '#fbbf24',      // Amarelo
    AC: '#3b82f6',         // Azul
    PROJECTOR: '#8b5cf6',  // Roxo
    SPEAKER: '#ec4899',    // Rosa
    LOCK: '#6b7280',       // Cinza
    SENSOR: '#10b981',     // Verde
    OTHER: '#64748b'       // Cinza escuro
  },
  
  // Cores por status
  deviceStatus: {
    ON: '#10b981',      // Verde
    OFF: '#6b7280',     // Cinza
    STANDBY: '#f59e0b', // Amarelo
    ERROR: '#ef4444'    // Vermelho
  },
  
  // Cores para heatmaps (Nivo)
  heatmapSchemes: {
    energy: 'greens',      // Consumo de energia
    temperature: 'RdYlBu', // Temperatura (invertido)
    usage: 'blues'         // Taxa de uso
  }
};
```

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
