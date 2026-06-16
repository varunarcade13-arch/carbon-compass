import { Bike } from 'lucide-react';
import { TransportInputs } from './types';

interface TransportSectionProps {
  values: TransportInputs;
  onChange: <K extends keyof TransportInputs>(key: K, value: TransportInputs[K]) => void;
}

export function TransportSection({ values, onChange }: TransportSectionProps) {
  const renderFlightClicker = (
    id: 'flightsShort' | 'flightsMedium' | 'flightsLong',
    label: string
  ) => {
    const val = values[id] ?? 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor={id} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid var(--border-glass)', padding: '4px', justifyContent: 'space-between' }}>
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: 'var(--text-primary)',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
            onClick={() => onChange(id, Math.max(0, val - 1))}
          >
            -
          </button>
          <input
            id={id}
            type="text"
            readOnly
            value={val}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 700,
              width: '30px',
              textAlign: 'center',
              outline: 'none',
              pointerEvents: 'none',
            }}
          />
          <button
            type="button"
            aria-label={`Increase ${label}`}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: 'var(--text-primary)',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
            onClick={() => onChange(id, val + 1)}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <section role="group" aria-labelledby="transport-title">
      <h2 id="transport-title" style={{ fontFamily: 'var(--font-header)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
        <Bike style={{ color: 'var(--accent)' }} size={20} /> Commute & Travel
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="carKm" className="form-label">Weekly Car Travel (km)</label>
          <input
            id="carKm"
            type="number"
            min="0"
            className="form-input"
            value={values.carKm ?? ''}
            onChange={(e) => onChange('carKm', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <span id="car-engine-label" className="form-label">Car Engine Type</span>
          <div 
            role="radiogroup" 
            aria-labelledby="car-engine-label"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}
          >
            {[
              { value: 'ev' as const, label: 'EV ⚡' },
              { value: 'hybrid' as const, label: 'Hybrid 🔋' },
              { value: 'sedan' as const, label: 'Sedan 🚗' },
              { value: 'suv' as const, label: 'SUV 🚙' },
            ].map((engineOption) => (
              <button
                key={engineOption.value}
                type="button"
                role="radio"
                aria-checked={values.carType === engineOption.value}
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${values.carType === engineOption.value ? 'var(--primary)' : 'var(--border-glass)'}`,
                  background: values.carType === engineOption.value ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: values.carType === engineOption.value ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'var(--transition-fast)',
                  textAlign: 'center',
                }}
                onClick={() => onChange('carType', engineOption.value)}
              >
                {engineOption.label}
              </button>
            ))}

          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="transitKm" className="form-label">Weekly Transit Travel (km)</label>
          <input
            id="transitKm"
            type="number"
            min="0"
            className="form-input"
            value={values.transitKm ?? ''}
            onChange={(e) => onChange('transitKm', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <span className="form-label">Annual Flights</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {renderFlightClicker('flightsShort', 'Short (<3h)')}
            {renderFlightClicker('flightsMedium', 'Med (3-6h)')}
            {renderFlightClicker('flightsLong', 'Long (>6h)')}
          </div>
        </div>
      </div>
    </section>
  );
}
