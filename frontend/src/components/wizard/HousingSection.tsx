import { Home } from 'lucide-react';
import { HousingInputs } from './types';

interface HousingSectionProps {
  values: HousingInputs;
  onChange: <K extends keyof HousingInputs>(key: K, value: HousingInputs[K]) => void;
}

export function HousingSection({ values, onChange }: HousingSectionProps) {
  return (
    <section role="group" aria-labelledby="housing-title">
      <h2 id="housing-title" style={{ fontFamily: 'var(--font-header)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
        <Home style={{ color: 'var(--secondary)' }} size={20} /> Housing Efficiency
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="electricity" className="form-label">Monthly Electricity (kWh)</label>
          <input
            id="electricity"
            type="number"
            min="0"
            className="form-input"
            value={values.electricityKwh ?? ''}
            onChange={(e) => onChange('electricityKwh', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="gas" className="form-label">Monthly Gas (Therms)</label>
          <input
            id="gas"
            type="number"
            min="0"
            className="form-input"
            value={values.gasTherms ?? ''}
            onChange={(e) => onChange('gasTherms', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="waste" className="form-label">Weekly Waste (kg)</label>
          <input
            id="waste"
            type="number"
            min="0"
            className="form-input"
            value={values.wasteKg ?? ''}
            onChange={(e) => onChange('wasteKg', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="recycleRate" className="form-label">Recycling Rate: {values.recycleRate}%</label>
          <input
            id="recycleRate"
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={values.recycleRate ?? 0}
            onChange={(e) => onChange('recycleRate', Number(e.target.value))}
          />
        </div>
      </div>
    </section>
  );
}
