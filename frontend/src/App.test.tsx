import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { ApiClient } from './services/api';

vi.mock('./services/api', () => ({
  ApiClient: {
    calculate: vi.fn(),
  },
}));

vi.mock('./components/AssessmentWizard', () => ({
  AssessmentWizard: ({ onComplete }: any) => (
    <button onClick={() => onComplete({ housing: { electricityKwh: 100 } })}>
      Complete Assessment Mock
    </button>
  ),
}));

vi.mock('./components/Dashboard', () => ({
  Dashboard: ({ onRecalculate }: any) => (
    <div>
      <p>Dashboard Mock</p>
      <button onClick={onRecalculate}>Recalculate Mock</button>
    </div>
  ),
}));

vi.mock('./components/Simulator', () => ({
  Simulator: () => <div>Simulator Mock</div>,
}));

vi.mock('./components/ActionPlan', () => ({
  ActionPlan: () => <div>Action Plan Mock</div>,
}));

describe('App Startup Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the baseline carbon onboarding wizard header', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /Baseline Your Carbon Footprint/i });
    expect(heading).toBeInTheDocument();
  });

  it('should handle assessment completion and switch to dashboard', async () => {
    (ApiClient.calculate as any).mockResolvedValue({ grandTotal: 1000 });
    
    render(<App />);
    
    const completeBtn = screen.getByText('Complete Assessment Mock');
    await act(async () => {
      fireEvent.click(completeBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard Mock')).toBeInTheDocument();
    });
  });

  it('should handle api calculation errors and display alert', async () => {
    (ApiClient.calculate as any).mockRejectedValue(new Error('API failed mock error'));
    
    render(<App />);
    
    const completeBtn = screen.getByText('Complete Assessment Mock');
    await act(async () => {
      fireEvent.click(completeBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('API failed mock error');
    });
  });

  it('should handle non-Error api calculation rejections', async () => {
    (ApiClient.calculate as any).mockRejectedValue('Some string error');
    
    render(<App />);
    
    const completeBtn = screen.getByText('Complete Assessment Mock');
    await act(async () => {
      fireEvent.click(completeBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to compute footprint. Please try again.');
    });
  });


  it('should handle tab navigation and recalculate', async () => {
    (ApiClient.calculate as any).mockResolvedValue({ grandTotal: 1000 });
    
    render(<App />);
    const completeBtn = screen.getByText('Complete Assessment Mock');
    
    await act(async () => {
      fireEvent.click(completeBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard Mock')).toBeInTheDocument();
    });

    // Test tabs
    fireEvent.click(screen.getByRole('button', { name: /Simulator/i }));
    expect(screen.getByText('Simulator Mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Action Plan/i }));
    expect(screen.getByText('Action Plan Mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Calculator/i }));
    expect(screen.getByText('Complete Assessment Mock')).toBeInTheDocument();

    // Go back to dashboard and click recalculate
    fireEvent.click(screen.getByRole('button', { name: /Dashboard/i }));
    const recalcBtn = screen.getByText('Recalculate Mock');
    fireEvent.click(recalcBtn);
    expect(screen.getByText('Complete Assessment Mock')).toBeInTheDocument();
  });
});


