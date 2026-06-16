import { WizardInputs } from './types';

export const PRESETS: Record<'eco' | 'balanced' | 'heavy', WizardInputs> = {
  eco: {
    housing: {
      electricityKwh: 200,
      gasTherms: 10,
      wasteKg: 5,
      recycleRate: 90,
    },
    transport: {
      carKm: 20,
      carType: 'ev',
      transitKm: 150,
      flightsShort: 0,
      flightsMedium: 0,
      flightsLong: 0,
    },
    consumption: {
      diet: 'vegan',
      shoppingSpent: 100,
    },
  },
  balanced: {
    housing: {
      electricityKwh: 500,
      gasTherms: 30,
      wasteKg: 15,
      recycleRate: 40,
    },
    transport: {
      carKm: 120,
      carType: 'hybrid',
      transitKm: 40,
      flightsShort: 1,
      flightsMedium: 0,
      flightsLong: 0,
    },
    consumption: {
      diet: 'vegetarian',
      shoppingSpent: 250,
    },
  },
  heavy: {
    housing: {
      electricityKwh: 1200,
      gasTherms: 80,
      wasteKg: 35,
      recycleRate: 10,
    },
    transport: {
      carKm: 400,
      carType: 'suv',
      transitKm: 10,
      flightsShort: 4,
      flightsMedium: 2,
      flightsLong: 1,
    },
    consumption: {
      diet: 'meat-heavy',
      shoppingSpent: 800,
    },
  },
};

interface PresetSelectorProps {
  onSelect: (preset: WizardInputs) => void;
}

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div style={{ marginBottom: '36px', paddingBottom: '24px', borderBottom: '1px solid var(--border-glass)' }}>
      <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '16px', fontWeight: 600, textAlign: 'center', marginBottom: '14px', color: 'var(--text-secondary)' }}>
        ⚡ Quick Start Presets (1-Click Fill)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255, 255, 255, 0.01)',
            textAlign: 'center',
            height: 'auto',
          }}
          onClick={() => onSelect(PRESETS.eco)}
        >
          <span style={{ fontSize: '26px', marginBottom: '6px' }}>🌿</span>
          <strong style={{ fontSize: '15px', color: 'var(--low-impact)' }}>Eco Champion</strong>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Vegan, EV driver, minimal power usage</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255, 255, 255, 0.01)',
            textAlign: 'center',
            height: 'auto',
          }}
          onClick={() => onSelect(PRESETS.balanced)}
        >
          <span style={{ fontSize: '26px', marginBottom: '6px' }}>🏡</span>
          <strong style={{ fontSize: '15px', color: 'var(--med-impact)' }}>Balanced Citizen</strong>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Vegetarian, hybrid car, average home energy</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255, 255, 255, 0.01)',
            textAlign: 'center',
            height: 'auto',
          }}
          onClick={() => onSelect(PRESETS.heavy)}
        >
          <span style={{ fontSize: '26px', marginBottom: '6px' }}>🏎️</span>
          <strong style={{ fontSize: '15px', color: 'var(--high-impact)' }}>Carbon Heavy</strong>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Meat-heavy, SUV commuter, frequent flights</span>
        </button>
      </div>
    </div>
  );
}
