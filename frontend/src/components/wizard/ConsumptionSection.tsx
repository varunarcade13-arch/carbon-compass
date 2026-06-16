import { ShoppingBag } from 'lucide-react';
import { ConsumptionInputs } from './types';

interface ConsumptionSectionProps {
  values: ConsumptionInputs;
  onChange: <K extends keyof ConsumptionInputs>(key: K, value: ConsumptionInputs[K]) => void;
}

export function ConsumptionSection({ values, onChange }: ConsumptionSectionProps) {
  return (
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
              { value: 'vegan' as const, label: 'Vegan 🌱' },
              { value: 'vegetarian' as const, label: 'Vegetarian 🥚' },
              { value: 'pescatarian' as const, label: 'Pescatarian 🐟' },
              { value: 'meat-heavy' as const, label: 'Meat Heavy 🥩' },
            ].map((dietaryOption) => (
              <button
                key={dietaryOption.value}
                type="button"
                role="radio"
                aria-checked={values.diet === dietaryOption.value}
                style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${values.diet === dietaryOption.value ? 'var(--primary)' : 'var(--border-glass)'}`,
                  background: values.diet === dietaryOption.value ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: values.diet === dietaryOption.value ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'var(--transition-fast)',
                  textAlign: 'center',
                }}
                onClick={() => onChange('diet', dietaryOption.value)}
              >
                {dietaryOption.label}
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
            value={values.shoppingSpent ?? ''}
            onChange={(e) => onChange('shoppingSpent', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
      </div>
    </section>
  );
}
