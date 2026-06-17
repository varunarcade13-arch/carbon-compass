import React from 'react';
import { CalculationResult } from '../../../backend/src/services/calculatorService';
import { Info, PieChart } from 'lucide-react';
import { BadgeIcon, BadgeGallery } from './BadgeSystem';
import { CategoryBreakdown } from './CategoryBreakdown';
import { BenchmarkingGraph } from './BenchmarkingGraph';

interface MemoizedDonutChartProps {
  housingPiePercentage: number;
  transportPiePercentage: number;
  consumptionPiePercentage: number;
}

const MemoizedDonutChart = React.memo(function MemoizedDonutChart({
  housingPiePercentage,
  transportPiePercentage,
  consumptionPiePercentage,
}: MemoizedDonutChartProps) {
  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} aria-labelledby="pie-title">
      <h2 id="pie-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '20px', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PieChart size={20} style={{ color: 'var(--primary)' }} /> Proportional Slice
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} role="img" aria-label="Donut chart breaking down emissions by Housing, Transport, and Consumption">
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
  );
});

import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

interface DashboardProps {
  result: CalculationResult;
  onRecalculate: () => void;
}

export function Dashboard({ result, onRecalculate }: DashboardProps) {
  const {
    tons,
    badgeInfo,
    rating,
    ratingLabel,
    ratingClass,
    percentageHousing,
    percentageTransport,
    percentageConsumption,
    housingPiePercentage,
    transportPiePercentage,
    consumptionPiePercentage,
    userTons,
    usAverageTons,
    globalAverageTons,
    targetGoalTons,
    maxBenchmark
  } = useDashboardMetrics(result);


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
        <MemoizedDonutChart 
          housingPiePercentage={housingPiePercentage}
          transportPiePercentage={transportPiePercentage}
          consumptionPiePercentage={consumptionPiePercentage}
        />
      </div>

      {/* Badge Achievement Gallery Grid */}
      <BadgeGallery currentTons={userTons} />      {/* Middle Grid: Detailed Category Breakdowns & National Benchmarking */}
      <div className="dashboard-grid">
        <CategoryBreakdown
          result={result}
          percentageHousing={percentageHousing}
          percentageTransport={percentageTransport}
          percentageConsumption={percentageConsumption}
        />

        <BenchmarkingGraph
          userTons={userTons}
          usAverageTons={usAverageTons}
          globalAverageTons={globalAverageTons}
          targetGoalTons={targetGoalTons}
          maxBenchmark={maxBenchmark}
        />
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
