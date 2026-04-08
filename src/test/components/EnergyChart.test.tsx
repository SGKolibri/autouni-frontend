import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnergyChart from '@components/charts/EnergyChart';

describe('EnergyChart', () => {
  it('shows empty state when data is undefined', () => {
    render(<EnergyChart data={undefined} />);
    expect(screen.getByText(/nenhum dado/i)).toBeInTheDocument();
  });

  it('shows empty state when data is an empty array', () => {
    render(<EnergyChart data={[]} />);
    expect(screen.getByText(/nenhum dado/i)).toBeInTheDocument();
  });

  it('renders stats view for object (non-array) data', () => {
    const stats = { totalKwh: 123.45, avgWh: 50, maxWh: 200, minWh: 10, count: 10 };
    render(<EnergyChart data={stats} />);
    expect(screen.getByText('123.45 kWh')).toBeInTheDocument();
    expect(screen.getByText('Consumo Total')).toBeInTheDocument();
  });

  it('renders chart when array data is provided', () => {
    const data = [
      { timestamp: '2025-01-01T10:00:00Z', power: 500, energy: 0.5 },
      { timestamp: '2025-01-01T11:00:00Z', power: 700, energy: 0.7 },
    ];
    const { container } = render(<EnergyChart data={data} />);
    // Recharts renders an SVG
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
