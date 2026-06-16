import { BarChart3 } from 'lucide-react';
import { CalculationResult } from '../../../backend/src/services/calculatorService';
import { memo } from 'react';

interface CategoryBreakdownProps {
  result: CalculationResult;
  percentageHousing: number;
  percentageTransport: number;
  percentageConsumption: number;
}

export const CategoryBreakdown = memo(function CategoryBreakdown({
  result,
  percentageHousing,
  percentageTransport,
  percentageConsumption,
}: CategoryBreakdownProps) {
  return (
    <section className="card" aria-labelledby="breakdown-title">
      <h2 id="breakdown-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart3 size={20} style={{ color: 'var(--secondary)' }} /> Category Sub-Totals
      </h2>

      <div className="breakdown-bars">
        {/* Housing */}
        <div className="bar-group">
          <div className="bar-label">
            <span>Housing</span>
            <strong>{(result.housing.total / 1000).toFixed(1)} tons</strong>
          </div>
          <div className="bar-outer">
            <div className="bar-inner housing" style={{ width: `${percentageHousing}%` }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Grid: {Math.round(result.housing.electricity)}kg</span>
            <span>Gas: {Math.round(result.housing.gas)}kg</span>
            <span>Waste: {Math.round(result.housing.waste)}kg</span>
          </div>
        </div>

        {/* Transport */}
        <div className="bar-group" style={{ marginTop: '16px' }}>
          <div className="bar-label">
            <span>Transport</span>
            <strong>{(result.transport.total / 1000).toFixed(1)} tons</strong>
          </div>
          <div className="bar-outer">
            <div className="bar-inner transport" style={{ width: `${percentageTransport}%` }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Car: {Math.round(result.transport.car)}kg</span>
            <span>Transit: {Math.round(result.transport.transit)}kg</span>
            <span>Flights: {Math.round(result.transport.flights)}kg</span>
          </div>
        </div>

        {/* Consumption */}
        <div className="bar-group" style={{ marginTop: '16px' }}>
          <div className="bar-label">
            <span>Consumption</span>
            <strong>{(result.consumption.total / 1000).toFixed(1)} tons</strong>
          </div>
          <div className="bar-outer">
            <div className="bar-inner consumption" style={{ width: `${percentageConsumption}%` }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Diet: {Math.round(result.consumption.diet)}kg</span>
            <span>Shopping: {Math.round(result.consumption.shopping)}kg</span>
          </div>
        </div>
      </div>
    </section>
  );
});
