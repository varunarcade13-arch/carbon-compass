import React, { useState } from 'react';
import { AssessmentInput, DEFAULT_INPUTS } from '../../../backend/src/services/calculatorService';
import { Home, Bike, ShoppingBag, CheckCircle2 } from 'lucide-react';

interface AssessmentWizardProps {
  onComplete: (input: AssessmentInput) => void;
}

interface WizardInputs {
  housing: {
    electricityKwh: number | null;
    gasTherms: number | null;
    wasteKg: number | null;
    recycleRate: number | null;
  };
  transport: {
    carKm: number | null;
    carType: 'ev' | 'hybrid' | 'sedan' | 'suv' | null;
    transitKm: number | null;
    flightsShort: number | null;
    flightsMedium: number | null;
    flightsLong: number | null;
  };
  consumption: {
    diet: 'vegan' | 'vegetarian' | 'pescatarian' | 'meat-heavy' | null;
    shoppingSpent: number | null;
  };
}

const PRESETS = {
  eco: {
    housing: {
      electricityKwh: 200,
      gasTherms: 10,
      wasteKg: 5,
      recycleRate: 90,
    },
    transport: {
      carKm: 20,
      carType: 'ev' as const,
      transitKm: 150,
      flightsShort: 0,
      flightsMedium: 0,
      flightsLong: 0,
    },
    consumption: {
      diet: 'vegan' as const,
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
      carType: 'hybrid' as const,
      transitKm: 40,
      flightsShort: 1,
      flightsMedium: 0,
      flightsLong: 0,
    },
    consumption: {
      diet: 'vegetarian' as const,
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
      carType: 'suv' as const,
      transitKm: 10,
      flightsShort: 4,
      flightsMedium: 2,
      flightsLong: 1,
    },
    consumption: {
      diet: 'meat-heavy' as const,
      shoppingSpent: 800,
    },
  },
};

export function AssessmentWizard({ onComplete }: AssessmentWizardProps) {
  const [inputs, setInputs] = useState<WizardInputs>({
    housing: {
      electricityKwh: DEFAULT_INPUTS.electricityKwh,
      gasTherms: DEFAULT_INPUTS.gasTherms,
      wasteKg: DEFAULT_INPUTS.wasteKg,
      recycleRate: DEFAULT_INPUTS.recycleRate,
    },
    transport: {
      carKm: DEFAULT_INPUTS.carKm,
      carType: DEFAULT_INPUTS.carType,
      transitKm: DEFAULT_INPUTS.transitKm,
      flightsShort: DEFAULT_INPUTS.flightsShort,
      flightsMedium: DEFAULT_INPUTS.flightsMedium,
      flightsLong: DEFAULT_INPUTS.flightsLong,
    },
    consumption: {
      diet: DEFAULT_INPUTS.diet,
      shoppingSpent: DEFAULT_INPUTS.shoppingSpent,
    },
  });

  const updateHousing = (key: string, val: any) => {
    setInputs((prev) => ({
      ...prev,
      housing: { ...prev.housing, [key]: val },
    }));
  };

  const updateTransport = (key: string, val: any) => {
    setInputs((prev) => ({
      ...prev,
      transport: { ...prev.transport, [key]: val },
    }));
  };

  const updateConsumption = (key: string, val: any) => {
    setInputs((prev) => ({
      ...prev,
      consumption: { ...prev.consumption, [key]: val },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(inputs);
  };

  const renderFlightClicker = (
    id: 'flightsShort' | 'flightsMedium' | 'flightsLong',
    label: string
  ) => {
    const val = inputs.transport[id] ?? 0;
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
            onClick={() => updateTransport(id, Math.max(0, val - 1))}
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
            onClick={() => updateTransport(id, val + 1)}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="card" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Quick Start Preset Panel */}
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
            onClick={() => setInputs(PRESETS.eco)}
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
            onClick={() => setInputs(PRESETS.balanced)}
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
            onClick={() => setInputs(PRESETS.heavy)}
          >
            <span style={{ fontSize: '26px', marginBottom: '6px' }}>🏎️</span>
            <strong style={{ fontSize: '15px', color: 'var(--high-impact)' }}>Carbon Heavy</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Meat-heavy, SUV commuter, frequent flights</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Section 1: Housing */}
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
                  value={inputs.housing.electricityKwh ?? ''}
                  onChange={(e) => updateHousing('electricityKwh', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="gas" className="form-label">Monthly Gas (Therms)</label>
                <input
                  id="gas"
                  type="number"
                  min="0"
                  className="form-input"
                  value={inputs.housing.gasTherms ?? ''}
                  onChange={(e) => updateHousing('gasTherms', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="waste" className="form-label">Weekly Waste (kg)</label>
                <input
                  id="waste"
                  type="number"
                  min="0"
                  className="form-input"
                  value={inputs.housing.wasteKg ?? ''}
                  onChange={(e) => updateHousing('wasteKg', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="recycleRate" className="form-label">Recycling Rate: {inputs.housing.recycleRate}%</label>
                <input
                  id="recycleRate"
                  type="range"
                  min="0"
                  max="100"
                  className="slider-input"
                  value={inputs.housing.recycleRate ?? 0}
                  onChange={(e) => updateHousing('recycleRate', Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Commute & Travel */}
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
                  value={inputs.transport.carKm ?? ''}
                  onChange={(e) => updateTransport('carKm', e.target.value === '' ? null : Number(e.target.value))}
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
                    { value: 'ev', label: 'EV ⚡' },
                    { value: 'hybrid', label: 'Hybrid 🔋' },
                    { value: 'sedan', label: 'Sedan 🚗' },
                    { value: 'suv', label: 'SUV 🚙' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={inputs.transport.carType === opt.value}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: `1px solid ${inputs.transport.carType === opt.value ? 'var(--primary)' : 'var(--border-glass)'}`,
                        background: inputs.transport.carType === opt.value ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        color: inputs.transport.carType === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'var(--transition-fast)',
                        textAlign: 'center',
                      }}
                      onClick={() => updateTransport('carType', opt.value)}
                    >
                      {opt.label}
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
                  value={inputs.transport.transitKm ?? ''}
                  onChange={(e) => updateTransport('transitKm', e.target.value === '' ? null : Number(e.target.value))}
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

          {/* Section 3: Consumption Habits */}
          <section role="group" aria-labelledby="consumption-title">
            <h2 id="consumption-title" style={{ fontFamily: 'var(--font-header)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <ShoppingBag style={{ color: 'var(--primary)' }} size={20} /> Consumption Habits
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <span id="dietary-lifestyle-label" className="form-label">Dietary Lifestyle</span>
                <div 
                  role="radiogroup" 
                  aria-labelledby="dietary-lifestyle-label"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}
                >
                  {[
                    { value: 'vegan', label: 'Vegan 🌱' },
                    { value: 'vegetarian', label: 'Vegetarian 🥚' },
                    { value: 'pescatarian', label: 'Pescatarian 🐟' },
                    { value: 'meat-heavy', label: 'Meat Heavy 🥩' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={inputs.consumption.diet === opt.value}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: `1px solid ${inputs.consumption.diet === opt.value ? 'var(--primary)' : 'var(--border-glass)'}`,
                        background: inputs.consumption.diet === opt.value ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        color: inputs.consumption.diet === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'var(--transition-fast)',
                        textAlign: 'center',
                      }}
                      onClick={() => updateConsumption('diet', opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="shopping" className="form-label">Monthly Shopping Spend (USD)</label>
                <input
                  id="shopping"
                  type="number"
                  min="0"
                  className="form-input"
                  value={inputs.consumption.shoppingSpent ?? ''}
                  onChange={(e) => updateConsumption('shoppingSpent', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Submit Action */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>
            Calculate Impact <CheckCircle2 size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

