import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GaugeChart from '@components/charts/GaugeChart';

describe('GaugeChart', () => {
  it('renders current value and unit', () => {
    render(<GaugeChart value={1500} max={5000} unit="W" label="Potência Atual" />);
    expect(screen.getByText('1.500')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Potência Atual')).toBeInTheDocument();
  });

  it('shows correct percentage', () => {
    render(<GaugeChart value={2500} max={5000} unit="W" label="Teste" />);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('clamps value at 100% when value exceeds max', () => {
    render(<GaugeChart value={6000} max={5000} unit="W" label="Teste" />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('renders SVG radial chart', () => {
    const { container } = render(<GaugeChart value={500} max={1000} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
