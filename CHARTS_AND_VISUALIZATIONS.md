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

**Tipo de Gráfico:** Recharts - [Straight Angle Pie Chart](https://recharts.github.io/en-US/examples/StraightAnglePieChart/) (Gauge personalizado)

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

**Tipo de Gráfico:** Recharts - [AreaChart](https://recharts.github.io/en-US/examples/SimpleAreaChart/)

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

**Tipo de Gráfico:** Recharts - [PieChart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/) (Donut customizado)

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

**Tipo de Gráfico:** Recharts - [BarChart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/https://recharts.github.io/en-US/examples/TwoLevelPieChart/) (Barras Horizontais)

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

**Tipo de Gráfico:** Recharts - ComposedChart ([Barras](https://recharts.github.io/en-US/examples/TwoLevelPieChart/https://recharts.github.io/en-US/examples/TwoLevelPieChart/) + [Linha de tendência](https://recharts.github.io/en-US/examples/TwoLevelPieChart/https://recharts.github.io/en-US/examples/TwoLevelPieChart/))

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

**Tipo de Gráfico:** Recharts - [AreaChart](https://recharts.github.io/en-US/examples/TwoLevelPieChart/https://recharts.github.io/en-US/examples/TwoLevelPieChart/)

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

**Tipo de Gráfico:** Nivo - [HeatMap](https://nivo.rocks/heatmap/)

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

**Tipo de Gráfico:** Recharts - [AreaChart](https://recharts.github.io/en-US/examples/StackedAreaChart/) (Stacked)

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

**Tipo de Gráfico:** Recharts - [PieChart](https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/)

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

**Dados do Gráfico:**
- **Fatias:** Uma para cada status (ON, OFF, STANDBY, ERROR)
- **Valor de cada fatia:** Quantidade de dispositivos com aquele status
- **Percentuais:** Calculados automaticamente (quantidade / total) × 100
- **Cores por status:**
  - ON (Verde #10b981): Dispositivos ligados e funcionando
  - OFF (Cinza #6b7280): Dispositivos desligados
  - STANDBY (Amarelo #f59e0b): Dispositivos em espera
  - ERROR (Vermelho #ef4444): Dispositivos com erro
- **Total:** Exibido no centro do gráfico ou na legenda

**Exemplo de dados:**
```json
{
  "byStatus": {
    "ON": 145,
    "OFF": 78,
    "STANDBY": 23,
    "ERROR": 4
  },
  "total": 250,
  "percentages": {
    "ON": 58.0,
    "OFF": 31.2,
    "STANDBY": 9.2,
    "ERROR": 1.6
  }
}
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

**Dados do Gráfico:**
- **Eixo Y (categorias):** Tipos de dispositivos (LIGHT, AC, PROJECTOR, SPEAKER, LOCK, SENSOR, OTHER)
- **Eixo X (valores):** Quantidade de dispositivos
- **Barras empilhadas por status:**
  - Verde (#10b981): Dispositivos ON
  - Cinza (#6b7280): Dispositivos OFF
  - Amarelo (#f59e0b): Dispositivos STANDBY
  - Vermelho (#ef4444): Dispositivos ERROR
- **Total por tipo:** Soma de todas as barras empilhadas
- **Ordenação:** Por quantidade total (decrescente)

**Exemplo de dados:**
```json
{
  "byType": {
    "LIGHT": 85,
    "AC": 42,
    "PROJECTOR": 28,
    "SPEAKER": 35,
    "LOCK": 45,
    "SENSOR": 12,
    "OTHER": 3
  },
  "totalDevices": 250,
  "activeByType": {
    "LIGHT": 62,
    "AC": 38,
    "PROJECTOR": 15,
    "SPEAKER": 20,
    "LOCK": 8,
    "SENSOR": 2,
    "OTHER": 0
  }
}
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

**Dados do Gráfico:**
- **Hierarquia:** Andares → Salas → Dispositivos
- **Tamanho dos retângulos:** Proporcional ao `deviceCount` de cada sala
- **Cores:** Baseadas no tipo de sala (`roomType`) ou nível de atividade
- **Agrupamento:** Salas do mesmo andar ficam agrupadas visualmente
- **Labels:**
  - Andares: Mostrados em fonte maior nas áreas agrupadas
  - Salas: Nome da sala + quantidade de dispositivos
- **Tooltip:** Exibe nome, quantidade de dispositivos, ativos, e consumo energético

**Exemplo de dados:**
```json
{
  "floors": [
    {
      "floorName": "Térreo",
      "rooms": [
        {
          "roomName": "Sala 101",
          "roomType": "CLASSROOM",
          "deviceCount": 15,
          "activeDevices": 12,
          "energyKwh": 8.5
        },
        {
          "roomName": "Laboratório A",
          "roomType": "LAB",
          "deviceCount": 28,
          "activeDevices": 20,
          "energyKwh": 18.3
        }
      ]
    },
    {
      "floorName": "1º Andar",
      "rooms": [
        {
          "roomName": "Sala 201",
          "roomType": "CLASSROOM",
          "deviceCount": 12,
          "activeDevices": 10,
          "energyKwh": 6.8
        }
      ]
    }
  ]
}
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

**Dados do Gráfico:**
- **Eixo Y:** Lista de dispositivos (`deviceName`)
- **Eixo X:** Linha do tempo (horas/dias)
- **Barras horizontais:** Cada barra representa um evento offline
  - Início: `startTime`
  - Fim: `endTime` (ou momento atual se null)
  - Comprimento: Proporcional à `duration` em minutos
- **Cor:** Vermelho (#ef4444) para eventos offline
- **Tooltip:** Mostra dispositivo, período, duração, e motivo (se disponível)
- **Métricas:** Total de downtime e MTBF exibidos como resumo

**Exemplo de dados:**
```json
{
  "devices": [
    {
      "deviceId": "uuid-1",
      "deviceName": "AC Sala 101",
      "offlineEvents": [
        {
          "startTime": "2025-01-10T08:30:00Z",
          "endTime": "2025-01-10T09:15:00Z",
          "duration": 45,
          "reason": "Manutenção programada"
        },
        {
          "startTime": "2025-01-11T14:00:00Z",
          "endTime": null,
          "duration": 120,
          "reason": "Falha de conexão"
        }
      ]
    },
    {
      "deviceId": "uuid-2",
      "deviceName": "Projetor Lab A",
      "offlineEvents": [
        {
          "startTime": "2025-01-09T10:00:00Z",
          "endTime": "2025-01-09T11:30:00Z",
          "duration": 90
        }
      ]
    }
  ],
  "totalDowntime": 255,
  "mtbf": 1440
}
```

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

**Dados do Gráfico:**
- **Eixo X:** Horas do dia (0 a 23)
- **Eixo Y:** Quantidade de dispositivos ativos
- **Linhas múltiplas:** Uma linha para cada tipo de dispositivo
  - LIGHT (Amarelo #fbbf24): Iluminação
  - AC (Azul #3b82f6): Ar condicionado
  - PROJECTOR (Roxo #8b5cf6): Projetores
  - SPEAKER (Rosa #ec4899): Caixas de som
  - SENSOR (Verde #10b981): Sensores
- **Valores:** `activeCount` - média de dispositivos ativos naquela hora
- **Padrões:** Permite identificar horários de pico de uso por tipo

**Exemplo de dados:**
```json
{
  "deviceTypes": [
    {
      "type": "LIGHT",
      "hourlyAverage": [
        { "hour": 0, "activeCount": 5, "percentage": 5.9 },
        { "hour": 1, "activeCount": 3, "percentage": 3.5 },
        { "hour": 7, "activeCount": 45, "percentage": 52.9 },
        { "hour": 8, "activeCount": 78, "percentage": 91.8 },
        { "hour": 14, "activeCount": 82, "percentage": 96.5 },
        { "hour": 18, "activeCount": 65, "percentage": 76.5 },
        { "hour": 22, "activeCount": 12, "percentage": 14.1 }
      ]
    },
    {
      "type": "AC",
      "hourlyAverage": [
        { "hour": 0, "activeCount": 0, "percentage": 0 },
        { "hour": 8, "activeCount": 35, "percentage": 83.3 },
        { "hour": 14, "activeCount": 42, "percentage": 100 },
        { "hour": 18, "activeCount": 20, "percentage": 47.6 }
      ]
    }
  ]
}
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

**Dados do Gráfico:**
- **Grid visual:** Cada célula representa uma sala
- **Organização:** Agrupado por andar (`floorNumber`)
- **Cores das células:**
  - Verde: Sala vazia (occupied = false)
  - Amarelo: Sala parcialmente ocupada (0% < occupancyRate < 80%)
  - Vermelho: Sala cheia (occupancyRate ≥ 80%)
  - Cinza: Sala indisponível
- **Tamanho:** Proporcional à capacidade da sala
- **Labels:** Número da sala dentro de cada célula
- **Tooltip:** Tipo, capacidade, ocupação atual, taxa de ocupação, última atualização

**Exemplo de dados:**
```json
{
  "floors": [
    {
      "floorNumber": 0,
      "rooms": [
        {
          "roomId": "uuid-1",
          "roomNumber": "101",
          "roomType": "CLASSROOM",
          "capacity": 40,
          "currentOccupancy": 35,
          "occupied": true,
          "occupancyRate": 87.5,
          "lastUpdate": "2025-01-11T14:30:00Z"
        },
        {
          "roomId": "uuid-2",
          "roomNumber": "102",
          "roomType": "LAB",
          "capacity": 25,
          "currentOccupancy": 0,
          "occupied": false,
          "occupancyRate": 0,
          "lastUpdate": "2025-01-11T14:30:00Z"
        }
      ]
    }
  ]
}
```

---

### 4.2 Taxa de Utilização Semanal

**Fonte de Dados:** Histórico de ocupação

**Tipo de Gráfico:** Nivo - [HeatMap](https://nivo.rocks/heatmap/)

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

**Dados do Gráfico:**
- **Eixo X:** Dias da semana ('Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom')
- **Eixo Y:** Nome das salas
- **Células:** Cada célula mostra a taxa de utilização (`utilizationRate`) naquele dia
- **Intensidade de cor:** Gradiente baseado na taxa de utilização
  - Azul claro: 0-25% (pouco usada)
  - Azul médio: 25-50%
  - Azul escuro: 50-75%
  - Azul intenso: 75-100% (muito usada)
- **Tooltip:** Nome da sala, dia, horas usadas, total de horas, taxa de utilização
- **Agrupamento:** Salas podem ser agrupadas por tipo (CLASSROOM, LAB, etc.)

**Exemplo de dados:**
```json
{
  "rooms": [
    {
      "roomName": "Sala 101",
      "roomType": "CLASSROOM",
      "dailyUsage": [
        { "dayOfWeek": "Seg", "utilizationRate": 87.5, "hoursUsed": 7, "totalHours": 8 },
        { "dayOfWeek": "Ter", "utilizationRate": 75.0, "hoursUsed": 6, "totalHours": 8 },
        { "dayOfWeek": "Qua", "utilizationRate": 100.0, "hoursUsed": 8, "totalHours": 8 },
        { "dayOfWeek": "Qui", "utilizationRate": 62.5, "hoursUsed": 5, "totalHours": 8 },
        { "dayOfWeek": "Sex", "utilizationRate": 50.0, "hoursUsed": 4, "totalHours": 8 },
        { "dayOfWeek": "Sáb", "utilizationRate": 0, "hoursUsed": 0, "totalHours": 8 },
        { "dayOfWeek": "Dom", "utilizationRate": 0, "hoursUsed": 0, "totalHours": 8 }
      ]
    },
    {
      "roomName": "Lab A",
      "roomType": "LAB",
      "dailyUsage": [
        { "dayOfWeek": "Seg", "utilizationRate": 50.0, "hoursUsed": 4, "totalHours": 8 },
        { "dayOfWeek": "Ter", "utilizationRate": 62.5, "hoursUsed": 5, "totalHours": 8 }
      ]
    }
  ]
}
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

**Dados do Gráfico:**
- **Eixo X:** Horas do dia (0-23)
- **Eixo Y:** Taxa de ocupação (%)
- **Barras agrupadas:** Uma barra para cada tipo de sala no mesmo horário
  - CLASSROOM (Azul #3b82f6): Salas de aula
  - LAB (Verde #10b981): Laboratórios
  - OFFICE (Amarelo #f59e0b): Escritórios
  - AUDITORIUM (Roxo #8b5cf6): Auditórios
- **Valores:** `avgOccupancy` - ocupação média naquele horário
- **Padrões:** Permite comparar picos de uso entre diferentes tipos de sala
- **Tooltip:** Tipo de sala, hora, ocupação média, pico de ocupação

**Exemplo de dados:**
```json
{
  "roomTypes": [
    {
      "type": "CLASSROOM",
      "peakHours": [
        { "hour": 8, "avgOccupancy": 65.5, "peakOccupancy": 95.0 },
        { "hour": 9, "avgOccupancy": 85.2, "peakOccupancy": 100.0 },
        { "hour": 10, "avgOccupancy": 90.8, "peakOccupancy": 100.0 },
        { "hour": 14, "avgOccupancy": 78.3, "peakOccupancy": 95.0 },
        { "hour": 18, "avgOccupancy": 20.5, "peakOccupancy": 45.0 }
      ]
    },
    {
      "type": "LAB",
      "peakHours": [
        { "hour": 8, "avgOccupancy": 40.0, "peakOccupancy": 70.0 },
        { "hour": 14, "avgOccupancy": 88.5, "peakOccupancy": 100.0 },
        { "hour": 16, "avgOccupancy": 72.0, "peakOccupancy": 90.0 }
      ]
    }
  ]
}
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

**Dados do Gráfico:**
- **Eixo X:** Datas (`date`)
- **Eixo Y:** Quantidade de execuções
- **Barras empilhadas:**
  - Verde (#10b981): `successfulExecutions` - Execuções bem-sucedidas
  - Vermelho (#ef4444): `failedExecutions` - Execuções falhadas
  - Amarelo (#f59e0b): `pendingExecutions` - Execuções pendentes
- **Linha de tendência:** Roxo (#667eea) mostra `totalExecutions` (total)
- **Estatísticas adicionais:** Total de automações, habilitadas, desabilitadas, taxa de sucesso geral

**Exemplo de dados:**
```json
{
  "timeline": [
    {
      "date": "2025-01-01",
      "totalExecutions": 145,
      "successfulExecutions": 138,
      "failedExecutions": 5,
      "pendingExecutions": 2
    },
    {
      "date": "2025-01-02",
      "totalExecutions": 162,
      "successfulExecutions": 155,
      "failedExecutions": 3,
      "pendingExecutions": 4
    }
  ],
  "stats": {
    "total": 48,
    "enabled": 42,
    "disabled": 6,
    "successRate": 95.8
  }
}
```

---

### 5.2 Automações por Tipo

**Fonte de Dados:** `GET /automations/stats`

**Tipo de Gráfico:** Recharts - [PieChart](https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/) (Donut)

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

**Dados do Gráfico:**
- **Fatias:** Uma para cada tipo de automação
- **Tipos:**
  - SCHEDULE (Roxo #667eea): Automações programadas por horário
  - CONDITION (Verde #10b981): Automações baseadas em condições
  - MANUAL (Amarelo #f59e0b): Automações acionadas manualmente
- **Valor:** Quantidade de automações de cada tipo
- **Formato:** Gráfico de rosca (donut) com total no centro
- **Execuções recentes:** Mostrado como métrica adicional

**Exemplo de dados:**
```json
{
  "byType": {
    "SCHEDULE": 28,
    "CONDITION": 15,
    "MANUAL": 5
  },
  "total": 48,
  "recentExecutions": 342
}
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

**Dados do Gráfico:**
- **Eixo Y:** Nome das automações (`name`)
- **Eixo X:** Quantidade de execuções (`executionCount`)
- **Ordenação:** Decrescente por número de execuções (mais executadas primeiro)
- **Cores dinâmicas baseadas em `successRate`:**
  - Verde (#10b981): Taxa de sucesso > 90%
  - Amarelo (#f59e0b): Taxa de sucesso entre 70% e 90%
  - Vermelho (#ef4444): Taxa de sucesso < 70%
- **Tooltip:** Nome, execuções, taxa de sucesso, duração média, última execução
- **Limite:** Top 10 automações mais executadas

**Exemplo de dados:**
```json
{
  "automations": [
    {
      "id": "uuid-1",
      "name": "Desligar luzes após horário",
      "executionCount": 1450,
      "successRate": 98.5,
      "avgDuration": 245,
      "lastExecutedAt": "2025-01-11T18:00:00Z"
    },
    {
      "id": "uuid-2",
      "name": "Ajustar AC por temperatura",
      "executionCount": 980,
      "successRate": 92.3,
      "avgDuration": 580,
      "lastExecutedAt": "2025-01-11T14:30:00Z"
    },
    {
      "id": "uuid-3",
      "name": "Ligar projetores manhã",
      "executionCount": 420,
      "successRate": 65.8,
      "avgDuration": 320,
      "lastExecutedAt": "2025-01-11T08:00:00Z"
    }
  ]
}
```

---

### 5.4 Taxa de Sucesso de Automações

**Fonte de Dados:** `GET /automations/:id/history`

**Tipo de Gráfico:** Recharts - [BarChart](https://recharts.github.io/en-US/examples/SimpleBarChart/)

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

**Dados do Gráfico:**
- **Eixo Y:** Nome das automações (`name`)
- **Eixo X:** Percentual (0-100%)
- **Barras empilhadas horizontais com 100% de largura:**
  - Verde (#10b981): `successRate` - Taxa de sucesso
  - Vermelho (#ef4444): Taxa de falha (calculada)
  - Amarelo (#f59e0b): Taxa pendente (calculada)
- **Cálculo das taxas:**
  - successRate = (successCount / totalExecutions) × 100
  - failureRate = (failureCount / totalExecutions) × 100
  - pendingRate = (pendingCount / totalExecutions) × 100
- **Ordenação:** Por taxa de sucesso (decrescente)

**Exemplo de dados:**
```json
{
  "automations": [
    {
      "id": "uuid-1",
      "name": "Desligar luzes",
      "totalExecutions": 1450,
      "successCount": 1428,
      "failureCount": 18,
      "pendingCount": 4,
      "successRate": 98.5
    },
    {
      "id": "uuid-2",
      "name": "Ajustar AC",
      "totalExecutions": 980,
      "successCount": 905,
      "failureCount": 65,
      "pendingCount": 10,
      "successRate": 92.3
    },
    {
      "id": "uuid-3",
      "name": "Ligar projetores",
      "totalExecutions": 420,
      "successCount": 276,
      "failureCount": 140,
      "pendingCount": 4,
      "successRate": 65.7
    }
  ]
}
```

---

## 6. Relatórios Visuais

### 6.1 Status de Relatórios

**Fonte de Dados:** `GET /reports/me`

**Tipo de Gráfico:** Recharts - [PieChart](https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/) + [Material-UI Cards](https://mui.com/material-ui/react-card/)

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

**Dados do Gráfico:**
- **Cards de status:** Mostram quantidade por status
  - PENDING (Amarelo): Relatórios pendentes
  - PROCESSING (Azul): Em processamento
  - COMPLETED (Verde): Concluídos
  - FAILED (Vermelho): Falhados
- **Gráfico de pizza:** Distribuição por tipo de relatório
  - ENERGY_CONSUMPTION: Consumo de energia
  - DEVICE_STATUS: Status de dispositivos
  - ROOM_USAGE: Uso de salas
  - INCIDENTS: Incidentes
- **Lista de relatórios recentes:** Com barra de progresso para os que estão em processamento
- **Progress:** Percentual de conclusão (0-100)

**Exemplo de dados:**
```json
{
  "byStatus": {
    "PENDING": 3,
    "PROCESSING": 2,
    "COMPLETED": 45,
    "FAILED": 1
  },
  "byType": {
    "ENERGY_CONSUMPTION": 20,
    "DEVICE_STATUS": 15,
    "ROOM_USAGE": 10,
    "INCIDENTS": 6
  },
  "recentReports": [
    {
      "id": "uuid-1",
      "title": "Relatório de Consumo Mensal",
      "type": "ENERGY_CONSUMPTION",
      "status": "PROCESSING",
      "progress": 65,
      "createdAt": "2025-01-11T10:30:00Z"
    },
    {
      "id": "uuid-2",
      "title": "Status de Dispositivos",
      "type": "DEVICE_STATUS",
      "status": "COMPLETED",
      "progress": 100,
      "createdAt": "2025-01-11T09:00:00Z"
    }
  ]
}
```

---

### 6.2 Histórico de Geração de Relatórios

**Fonte de Dados:** `GET /reports/me`

**Tipo de Gráfico:** Recharts - [ScatterChart](https://recharts.github.io/en-US/examples/SimpleScatterChart/) (Timeline)

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

**Dados do Gráfico:**
- **Eixo X:** Data de criação (`createdAt`)
- **Eixo Y:** Duração da geração em segundos (`duration`)
- **Pontos:** Cada relatório é um ponto no gráfico
- **Cores por status:**
  - COMPLETED (Roxo #667eea): Relatório concluído
  - FAILED (Vermelho #ef4444): Falha na geração
  - PROCESSING (Azul #3b82f6): Em processamento
  - PENDING (Amarelo #f59e0b): Aguardando
- **Linha de referência:** `avgGenerationTime` mostra tempo médio de geração
- **Tooltip:** Título, tipo, formato, tempo de geração, status

**Exemplo de dados:**
```json
{
  "reports": [
    {
      "id": "uuid-1",
      "title": "Relatório Consumo Janeiro",
      "type": "ENERGY_CONSUMPTION",
      "format": "PDF",
      "createdAt": "2025-01-10T10:00:00Z",
      "completedAt": "2025-01-10T10:02:35Z",
      "duration": 155,
      "status": "COMPLETED"
    },
    {
      "id": "uuid-2",
      "title": "Status Dispositivos",
      "type": "DEVICE_STATUS",
      "format": "EXCEL",
      "createdAt": "2025-01-10T14:00:00Z",
      "completedAt": "2025-01-10T14:00:45Z",
      "duration": 45,
      "status": "COMPLETED"
    },
    {
      "id": "uuid-3",
      "title": "Uso de Salas Semanal",
      "type": "ROOM_USAGE",
      "format": "PDF",
      "createdAt": "2025-01-11T09:00:00Z",
      "completedAt": null,
      "duration": null,
      "status": "FAILED"
    }
  ],
  "avgGenerationTime": 85
}
```

---

## 7. Comparativos e Tendências

### 7.1 Comparativo de Prédios

**Fonte de Dados:** `GET /buildings` + stats de cada

**Tipo de Gráfico:** Recharts - [RadarChart](https://recharts.github.io/en-US/examples/SimpleRadarChart/)

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

**Dados do Gráfico:**
- **Formato:** Gráfico radar (spider/polar) com múltiplos polígonos sobrepostos
- **Eixos radiais:** Um para cada métrica
  - Eficiência Energética (0-100)
  - Uptime de Dispositivos (%)
  - Uso de Automação (%)
  - Taxa de Ocupação (%)
  - Score de Manutenção (0-100)
  - Custo por m² (normalizado 0-100)
- **Polígonos:** Um para cada prédio sendo comparado
- **Cores:** Diferente para cada prédio (ex: Roxo, Verde, Amarelo)
- **Área preenchida:** Opacidade 0.6 para visualizar sobreposições
- **Comparação:** Facilita identificar pontos fortes e fracos de cada prédio

**Exemplo de dados:**
```json
{
  "buildings": [
    {
      "id": "uuid-1",
      "name": "Prédio Central",
      "metrics": {
        "energyEfficiency": 85,
        "deviceUptime": 92,
        "automationUsage": 78,
        "occupancyRate": 88,
        "maintenanceScore": 75,
        "costPerM2": 45.50
      }
    },
    {
      "id": "uuid-2",
      "name": "Bloco A",
      "metrics": {
        "energyEfficiency": 72,
        "deviceUptime": 88,
        "automationUsage": 65,
        "occupancyRate": 95,
        "maintenanceScore": 82,
        "costPerM2": 38.20
      }
    }
  ]
}
```

---

### 7.2 Tendência de Consumo

**Fonte de Dados:** `GET /energy/buildings/:id/stats` (últimos 90 dias)

**Tipo de Gráfico:** Recharts - [Line](https://recharts.github.io/en-US/examples/SimpleLineChart/)

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

**Dados do Gráfico:**
- **Linha real:** Consumo diário real em kWh (`kwh`)
- **Linha de tendência:** Consumo previsto/esperado (`predictedKwh`)
- **Eixo X:** Datas dos últimos 90 dias
- **Eixo Y:** Consumo em kWh
- **Marcadores de anomalias:** Pontos onde `deviation` > 20% (positiva ou negativa)
- **Área de confiança:** Zona entre valores máximo e mínimo esperados
- **Indicadores:**
  - Tendência: 'increasing' (↑), 'decreasing' (↓), ou 'stable' (→)
  - Taxa de mudança: `changeRate` (% por mês)
  - Projeção: Consumo estimado para fim do mês

**Exemplo de dados:**
```json
{
  "daily": [
    { "date": "2024-10-13", "kwh": 320.5, "predictedKwh": 315.0 },
    { "date": "2024-10-14", "kwh": 298.2, "predictedKwh": 310.0 },
    { "date": "2024-10-15", "kwh": 450.8, "predictedKwh": 312.0 },
    { "date": "2025-01-11", "kwh": 335.5, "predictedKwh": 340.0 }
  ],
  "trend": "increasing",
  "changeRate": 3.5,
  "projectedMonthEnd": 9850,
  "anomalies": [
    { "date": "2024-10-15", "kwh": 450.8, "deviation": 44.4 },
    { "date": "2024-12-25", "kwh": 180.5, "deviation": -42.3 }
  ]
}
```

---

### 7.3 Comparativo Ano a Ano

**Fonte de Dados:** Histórico de múltiplos anos

**Tipo de Gráfico:** Recharts - [Line Chart](https://recharts.github.io/en-US/examples/SimpleLineChart/)

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

**Dados do Gráfico:**
- **Eixo X:** Meses (1 a 12 ou 'Jan' a 'Dez')
- **Eixo Y:** Consumo em kWh
- **Linhas múltiplas:** Uma linha para cada ano
  - Ano atual: Linha destacada (cor primária, mais grossa)
  - Anos anteriores: Linhas secundárias (cores suavizadas)
- **Comparação:** Permite visualizar padrões sazonais e mudanças ano a ano
- **Métricas por ano:** Total anual e média mensal
- **Correlação:** `avgTemp` pode ser usado para análise de influência da temperatura

**Exemplo de dados:**
```json
{
  "years": [
    {
      "year": 2025,
      "monthlyData": [
        { "month": 1, "kwh": 8500, "cost": 6800, "avgTemp": 28.5 },
        { "month": 2, "kwh": 7800, "cost": 6240, "avgTemp": 27.2 }
      ],
      "total": 16300,
      "average": 8150
    },
    {
      "year": 2024,
      "monthlyData": [
        { "month": 1, "kwh": 8200, "cost": 6560, "avgTemp": 29.1 },
        { "month": 2, "kwh": 7500, "cost": 6000, "avgTemp": 28.0 },
        { "month": 12, "kwh": 9100, "cost": 7280, "avgTemp": 30.5 }
      ],
      "total": 98500,
      "average": 8208
    },
    {
      "year": 2023,
      "monthlyData": [
        { "month": 1, "kwh": 7800, "cost": 6240, "avgTemp": 27.8 }
      ],
      "total": 95200,
      "average": 7933
    }
  ]
}
```

---

### 7.4 Eficiência Energética

**Fonte de Dados:** Cálculo baseado em consumo vs área útil

**Tipo de Gráfico:** Recharts - [Scatter Plot](https://recharts.github.io/en-US/examples/ScatterAndLineOfBestFit/) (Dispersão)

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

**Dados do Gráfico:**
- **Eixo X:** Área do prédio em m²
- **Eixo Y:** Consumo por m² (kWh/m²)
- **Pontos/Bolhas:** Cada prédio é representado por uma bolha
- **Tamanho da bolha:** Proporcional ao número de dispositivos (ou `deviceDensity`)
- **Cor da bolha:** Baseada no nível de eficiência
  - Verde (#10b981): `efficiency` > 80 (excelente)
  - Azul (#3b82f6): 60-80 (bom)
  - Amarelo (#f59e0b): 40-60 (médio)
  - Vermelho (#ef4444): < 40 (ruim)
- **Linhas de benchmark:** Horizontais marcando limites
  - Excelente: < 15 kWh/m²
  - Bom: 15-25 kWh/m²
  - Médio: 25-40 kWh/m²
  - Ruim: > 40 kWh/m²
- **Tooltip:** Nome, área, kWh/m², custo/m², densidade de dispositivos, score de eficiência

**Exemplo de dados:**
```json
{
  "buildings": [
    {
      "id": "uuid-1",
      "name": "Prédio Central",
      "area": 5000,
      "kwhPerM2": 18.5,
      "costPerM2": 14.80,
      "deviceDensity": 0.05,
      "efficiency": 85
    },
    {
      "id": "uuid-2",
      "name": "Bloco A",
      "area": 3200,
      "kwhPerM2": 32.8,
      "costPerM2": 26.24,
      "deviceDensity": 0.047,
      "efficiency": 52
    },
    {
      "id": "uuid-3",
      "name": "Laboratório",
      "area": 1800,
      "kwhPerM2": 45.2,
      "costPerM2": 36.16,
      "deviceDensity": 0.156,
      "efficiency": 38
    }
  ],
  "benchmarks": {
    "excellent": 15,
    "good": 25,
    "average": 40,
    "poor": 55
  }
}
```

---

## 8. Mapas de Calor

### 8.1 Mapa de Calor de Consumo por Andar

**Fonte de Dados:** `GET /energy/floors/:id/stats` para todos os andares

**Tipo de Gráfico:** Nivo - [HeatMap](https://nivo.rocks/heatmap/)

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

**Dados do Gráfico:**
- **Visualização:** Planta baixa do andar com salas representadas em grid
- **Posicionamento:** Coordenadas `x` e `y` definem localização de cada sala no grid
- **Intensidade de cor:** Baseada no consumo energético
  - Azul claro (#e0f2fe): Consumo muito baixo (0-25% do máximo)
  - Verde (#10b981): Consumo baixo (25-50%)
  - Amarelo (#f59e0b): Consumo médio (50-75%)
  - Laranja (#fb923c): Consumo alto (75-90%)
  - Vermelho (#ef4444): Consumo muito alto (>90%)
- **Seletor de andar:** Dropdown para escolher qual andar visualizar
- **Tooltip:** Número da sala, consumo em kWh, intensidade, temperatura (se disponível)
- **Totais:** Consumo total do andar e valor máximo exibidos

**Exemplo de dados:**
```json
{
  "building": {
    "id": "uuid-building",
    "name": "Prédio Central"
  },
  "floors": [
    {
      "floorNumber": 0,
      "rooms": [
        {
          "roomId": "uuid-1",
          "roomNumber": "101",
          "position": { "x": 0, "y": 0 },
          "energyKwh": 25.5,
          "intensity": 85,
          "temperature": 23.5
        },
        {
          "roomId": "uuid-2",
          "roomNumber": "102",
          "position": { "x": 1, "y": 0 },
          "energyKwh": 8.2,
          "intensity": 28,
          "temperature": 22.1
        }
      ],
      "totalKwh": 320.5,
      "maxKwh": 35.8
    }
  ]
}
```

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

**Dados do Gráfico:**
- **Visualização:** Mapa interativo da planta do andar
- **Ícones:** Cada dispositivo representado por ícone específico do tipo
  - 💡 LIGHT (Lâmpada)
  - ❄️ AC (Ar condicionado)
  - 📽️ PROJECTOR (Projetor)
  - 🔊 SPEAKER (Alto-falante)
  - 🔒 LOCK (Fechadura)
  - 📡 SENSOR (Sensor)
- **Cores por status:**
  - Verde (#10b981): ON - Dispositivo ativo
  - Cinza (#6b7280): OFF - Dispositivo desligado
  - Amarelo (#f59e0b): STANDBY - Em espera
  - Vermelho (#ef4444): ERROR - Com erro
- **Posicionamento:** Coordenadas `x` e `y` definem localização exata
- **Interatividade:**
  - Click: Abre detalhes do dispositivo
  - Hover: Tooltip com nome, tipo, status, potência atual
- **Atualização:** Tempo real via WebSocket

**Exemplo de dados:**
```json
{
  "floors": [
    {
      "floorNumber": 0,
      "rooms": [
        {
          "roomId": "uuid-room-1",
          "roomNumber": "101",
          "devices": [
            {
              "deviceId": "uuid-dev-1",
              "deviceName": "Luz Principal",
              "type": "LIGHT",
              "status": "ON",
              "position": { "x": 2.5, "y": 3.0 },
              "currentPower": 45
            },
            {
              "deviceId": "uuid-dev-2",
              "deviceName": "AC Sala 101",
              "type": "AC",
              "status": "ON",
              "position": { "x": 1.0, "y": 5.0 },
              "currentPower": 1200
            },
            {
              "deviceId": "uuid-dev-3",
              "deviceName": "Projetor",
              "type": "PROJECTOR",
              "status": "STANDBY",
              "position": { "x": 4.5, "y": 2.5 },
              "currentPower": 8
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 8.3 Mapa de Temperatura

**Fonte de Dados:** Sensores de temperatura

**Tipo de Gráfico:** Nivo - [HeatMap](https://nivo.rocks/heatmap/)

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

**Dados do Gráfico:**
- **Grid de temperatura:** Matriz bidimensional representando pontos de medição
- **Coordenadas:** `x` e `y` definem posição no grid do andar
- **Valores por ponto:**
  - Temperatura em °C
  - Umidade em %
- **Gradiente de cores:**
  - Azul escuro (#1e40af): Muito frio (< 18°C)
  - Azul claro (#60a5fa): Frio (18-20°C)
  - Verde (#10b981): Confortável (20-24°C)
  - Amarelo (#f59e0b): Morno (24-26°C)
  - Laranja (#fb923c): Quente (26-28°C)
  - Vermelho (#ef4444): Muito quente (> 28°C)
- **Isolinhas:** Linhas conectando pontos de mesma temperatura
- **Zonas de conforto:** Área destacada dentro da faixa ótima (20-24°C)
- **Métricas:**
  - Temperatura média, máxima e mínima do andar
  - Percentual de área em zona de conforto

**Exemplo de dados:**
```json
{
  "timestamp": "2025-01-11T14:30:00Z",
  "floors": [
    {
      "floorNumber": 0,
      "temperatureGrid": [
        [
          { "x": 0, "y": 0, "temperature": 22.5, "humidity": 55 },
          { "x": 0, "y": 1, "temperature": 23.0, "humidity": 52 },
          { "x": 0, "y": 2, "temperature": 24.5, "humidity": 58 }
        ],
        [
          { "x": 1, "y": 0, "temperature": 21.8, "humidity": 60 },
          { "x": 1, "y": 1, "temperature": 26.2, "humidity": 48 },
          { "x": 1, "y": 2, "temperature": 25.0, "humidity": 50 }
        ]
      ],
      "avgTemperature": 23.8,
      "maxTemperature": 26.2,
      "minTemperature": 21.8
    }
  ],
  "comfort": {
    "optimalRange": { "min": 20, "max": 24 },
    "currentComfort": 68.5
  }
}
```

---

## 📋 Bibliotecas Utilizadas

### Chart Libraries:

#### **Recharts** (Principal) ⭐

#### **Nivo** (Gráficos Avançados) ⭐

---

### 🎨 Paleta de Cores Padrão (exemplo):

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
