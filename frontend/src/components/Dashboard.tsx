import { useMemo } from 'react';
import { CalculationResult } from '../../../backend/src/services/calculatorService';
import { Info, BarChart3, PieChart, Landmark } from 'lucide-react';
import { getBadgeInfo, BadgeIcon, BadgeGallery } from './BadgeSystem';

interface DashboardProps {
  result: CalculationResult;
  onRecalculate: () => void;
}

export function Dashboard({ result, onRecalculate }: DashboardProps) {
  const tons = useMemo(() => (result.grandTotal / 1000).toFixed(1), [result.grandTotal]);
  const totalVal = result.grandTotal;

  // Determine Badge Information
  const badgeInfo = useMemo(() => getBadgeInfo(totalVal), [totalVal]);

  // Determine Impact Rating
  const ratingDetails = useMemo(() => {
    let rating: 'low' | 'med' | 'high' = 'med';
    let ratingLabel = 'Average Impact';
    let ratingClass = 'med';
    if (totalVal < 4000) {
      rating = 'low';
      ratingLabel = 'Low Impact (Eco Friendly)';
      ratingClass = 'low';
    } else if (totalVal > 12000) {
      rating = 'high';
      ratingLabel = 'High Impact (Action Needed)';
      ratingClass = 'high';
    }
    return { rating, ratingLabel, ratingClass };
  }, [totalVal]);

  const { rating, ratingLabel, ratingClass } = ratingDetails;

  // Percentages for breakdown bars (relative to max category)
  const breakdownPercentages = useMemo(() => {
    const maxCategory = Math.max(result.housing.total, result.transport.total, result.consumption.total, 1);
    return {
      percentageHousing: (result.housing.total / maxCategory) * 100,
      percentageTransport: (result.transport.total / maxCategory) * 100,
      percentageConsumption: (result.consumption.total / maxCategory) * 100,
    };
  }, [result.housing.total, result.transport.total, result.consumption.total]);

  const { percentageHousing, percentageTransport, percentageConsumption } = breakdownPercentages;

  // Donut Piechart calculations (absolute percentages out of total)
  const donutPercentages = useMemo(() => {
    const totalEmissions = Math.max(result.grandTotal, 1);
    const housingPiePercentage = Math.round((result.housing.total / totalEmissions) * 100);
    const transportPiePercentage = Math.round((result.transport.total / totalEmissions) * 100);
    const consumptionPiePercentage = 100 - housingPiePercentage - transportPiePercentage; // ensure total is exactly 100%
    return { housingPiePercentage, transportPiePercentage, consumptionPiePercentage };
  }, [result.grandTotal, result.housing.total, result.transport.total]);

  const { housingPiePercentage, transportPiePercentage, consumptionPiePercentage } = donutPercentages;

  // Benchmarking scores (in Tons)
  const benchmarkDetails = useMemo(() => {
    const userTons = Number(tons);
    const usAverageTons = 16.0;
    const globalAverageTons = 4.5;
    const targetGoalTons = 2.0;
    const maxBenchmark = Math.max(userTons, usAverageTons, globalAverageTons, targetGoalTons, 1);
    return { userTons, usAverageTons, globalAverageTons, targetGoalTons, maxBenchmark };
  }, [tons]);

  const { userTons, usAverageTons, globalAverageTons, targetGoalTons, maxBenchmark } = benchmarkDetails;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Grid: General Score, Pie Chart, and Categorical Bars */}
      <div className="dashboard-grid">
        
        {/* Card 1: Main Visual Score Card */}
        <section className="card total-score-card" aria-labelledby="score-title">
          <h2 id="score-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600 }}>
            Your Carbon Footprint
          </h2>
          
          <div 
            className={`score-circle ${ratingClass}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="score-value">{tons}</span>
            <span className="score-label">Tons CO₂e/yr</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0 20px 0', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-glass)', width: '80%', maxWidth: '280px', justifyContent: 'center' }}>
            <BadgeIcon tier={badgeInfo.tier} size={40} />
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Rank Achievement</span>
              <strong style={{ fontSize: '14px', color: badgeInfo.color, fontWeight: 700 }}>{badgeInfo.title.split(' ')[0]}</strong>
            </div>
          </div>

          <p style={{ fontWeight: 600, fontSize: '18px', color: `var(--${ratingClass}-impact)`, marginBottom: '8px' }}>
            {ratingLabel}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '320px', margin: '0 auto 24px auto' }}>
            {rating === 'low' && 'Excellent! Your emissions are within a sustainable range. Keep practicing clean habits.'}
            {rating === 'med' && 'Your footprint matches typical averages. Toggling lifestyle changes could push you to low-impact.'}
            {rating === 'high' && 'Your footprint is high. Explore the Simulator and Action Plan tabs to find easy reduction targets.'}
          </p>

          <button className="btn btn-secondary" onClick={onRecalculate}>
            Adjust Assessment
          </button>
        </section>

        {/* Card 2: Interactive SVG Donut Pie Chart */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} aria-labelledby="pie-title">

          <h2 id="pie-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '20px', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} style={{ color: 'var(--primary)' }} /> Proportional Slice
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Sector 1: Housing (Teal) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="3.8"
                  strokeDasharray={`${housingPiePercentage} ${100 - housingPiePercentage}`}
                  strokeDashoffset="0"
                />
                {/* Sector 2: Transport (Violet) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3.8"
                  strokeDasharray={`${transportPiePercentage} ${100 - transportPiePercentage}`}
                  strokeDashoffset={`-${housingPiePercentage}`}
                />
                {/* Sector 3: Consumption (Mint Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3.8"
                  strokeDasharray={`${consumptionPiePercentage} ${100 - consumptionPiePercentage}`}
                  strokeDashoffset={`-${housingPiePercentage + transportPiePercentage}`}
                />

              </svg>
              {/* Inner Donut Display */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-header)', pointerEvents: 'none' }}>
                <span style={{ fontSize: '24px', fontWeight: 700 }}>100%</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Breakdown</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '120px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--secondary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Housing: {housingPiePercentage}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Transport: {transportPiePercentage}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Consumption: {consumptionPiePercentage}%</span>
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* Badge Achievement Gallery Grid */}
      <BadgeGallery currentTons={userTons} />

      {/* Middle Grid: Detailed Category Breakdowns & National Benchmarking */}
      <div className="dashboard-grid">
        
        {/* Card 3: Categorical Breakdown Progress Bars */}
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

        {/* Card 4: National & Target Benchmarking Graph */}
        <section className="card" aria-labelledby="benchmark-title">
          <h2 id="benchmark-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={20} style={{ color: 'var(--accent)' }} /> Benchmarking (Tons/yr)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '12px' }}>
            {/* You */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Your Footprint</span>
                <strong>{tons} Tons</strong>
              </div>
              <div className="bar-outer" style={{ height: '8px' }}>
                <div className="bar-inner" style={{ width: `${(userTons / maxBenchmark) * 100}%`, background: 'var(--primary)' }} />
              </div>
            </div>

            {/* US Average */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                <span>US Average</span>
                <span>16.0 Tons</span>
              </div>
              <div className="bar-outer" style={{ height: '8px' }}>
                <div className="bar-inner" style={{ width: `${(usAverageTons / maxBenchmark) * 100}%`, background: 'var(--high-impact)' }} />
              </div>
            </div>

            {/* Global Average */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                <span>Global Average</span>
                <span>4.5 Tons</span>
              </div>
              <div className="bar-outer" style={{ height: '8px' }}>
                <div className="bar-inner" style={{ width: `${(globalAverageTons / maxBenchmark) * 100}%`, background: 'var(--med-impact)' }} />
              </div>
            </div>

            {/* Net-Zero Target */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                <span>Net-Zero Paris Goal</span>
                <span>2.0 Tons</span>
              </div>
              <div className="bar-outer" style={{ height: '8px' }}>
                <div className="bar-inner" style={{ width: `${(targetGoalTons / maxBenchmark) * 100}%`, background: 'var(--low-impact)' }} />
              </div>
            </div>
          </div>
        </section>


      </div>

      {/* Informative Tip at the bottom */}
      <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
        <Info size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong>How to read:</strong> Lowering your total emissions to <strong>2.0 tons</strong> aligns you with the IPCC goals for keeping global warming under 1.5°C. Check the <strong>Simulator</strong> tab to toggle actions like EV driving or Solar Panels to see your bars shift towards target levels!
        </p>
      </div>

    </div>
  );
}
