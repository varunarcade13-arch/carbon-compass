import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Startup Integration', () => {
  it('should render the baseline carbon onboarding wizard header', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /Baseline Your Carbon Footprint/i });
    expect(heading).toBeInTheDocument();
  });
});
