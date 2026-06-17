import React from 'react';
import { AssessmentInput } from '../../../backend/src/services/calculatorService';
import { SimulationToggles, SimulationProjectionYear } from '../../../backend/src/services/simulatorService';
import { Sparkles, Sun, Car, Apple, Plane, Train } from 'lucide-react';
import { BadgeIcon } from './BadgeSystem';
import { useSimulator } from '../hooks/useSimulator';

interface ToggleControlProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  toggleKey: keyof SimulationToggles;
  checked: boolean;
  onChange: (key: keyof SimulationToggles, value: boolean) => void;
}

const ToggleControl = React.memo(function ToggleControl({ id, icon, title, description, toggleKey, checked, onChange }: ToggleControlProps) {
  return (
    <div className="toggle-group">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon}
        <div>
          <label htmlFor={id} style={{ fontWeight: 600, fontSize: '15px', display: 'block' }}>{title}</label>
          <span id={`${id}-desc`} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</span>
        </div>
      </div>
      <label className="switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(toggleKey, e.target.checked)}
          aria-describedby={`${id}-desc`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onChange(toggleKey, !checked);
            }
          }}
        />
        <span className="slider-toggle" />
      </label>
    </div>
  );
});

interface SliderControlProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  valueDisplay: React.ReactNode;
  sliderKey: keyof SimulationToggles;
  value: number;
  min: number;
  max: number;
  onChange: (key: keyof SimulationToggles, value: number) => void;
  ariaValueText?: string;
}

const SliderControl = React.memo(function SliderControl({ id, icon, title, valueDisplay, sliderKey, value, min, max, onChange, ariaValueText }: SliderControlProps) {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon}
          <label htmlFor={id} style={{ fontWeight: 600, fontSize: '15px' }}>{title}</label>
        </div>
        <span style={{ fontWeight: 700, color: 'var(--primary)' }} aria-hidden="true">{valueDisplay}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        className="slider-input"
        value={value}
        onChange={(e) => onChange(sliderKey, Number(e.target.value))}
        aria-valuetext={ariaValueText ?? `${value}`}
      />
    </div>
  );
});

interface SimulatorProps {
  baseInput: AssessmentInput;
}

export function Simulator({ baseInput }: SimulatorProps) {
  const {
    toggles,
    simResult,
    currentBadge,
    projectedBadge,
    updateToggle
  } = useSimulator(baseInput);


  return (
    <div className="dashboard-grid">
      {/* 1. Control Sliders Card */}
      <section className="card" aria-labelledby="sim-controls-title">
        <h2 id="sim-controls-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
          Lifestyle Adjustments
        </h2>

        <ToggleControl
          id="toggle-solar"
          icon={<Sun size={20} style={{ color: 'var(--secondary)' }} />}
          title="Install Solar Panels"
          description="Cuts home electricity grid reliance by 80%."
          toggleKey="solarPanels"
          checked={toggles.solarPanels ?? false}
          onChange={updateToggle}
        />

        <ToggleControl
          id="toggle-ev"
          icon={<Car size={20} style={{ color: 'var(--accent)' }} />}
          title="Switch to Electric Vehicle"
          description="Transitions commute to clean energy."
          toggleKey="switchEv"
          checked={toggles.switchEv ?? false}
          onChange={updateToggle}
        />

        <SliderControl
          id="slider-meatless"
          icon={<Apple size={20} style={{ color: 'var(--primary)' }} />}
          title="Meatless Days / Week"
          valueDisplay={`${toggles.meatlessDays} days`}
          sliderKey="meatlessDays"
          value={toggles.meatlessDays ?? 0}
          min={0}
          max={7}
          onChange={updateToggle}
        />

        <SliderControl
          id="slider-transit"
          icon={<Train size={20} style={{ color: 'var(--secondary)' }} />}
          title="Shift Commute to Transit"
          valueDisplay={<span style={{ color: 'var(--secondary)' }}>{toggles.publicTransitPct}%</span>}
          sliderKey="publicTransitPct"
          value={toggles.publicTransitPct ?? 0}
          min={0}
          max={100}
          onChange={updateToggle}
        />

        <SliderControl
          id="slider-flights"
          icon={<Plane size={20} style={{ color: 'var(--accent)' }} />}
          title="Reduce Flights By"
          valueDisplay={<span style={{ color: 'var(--accent)' }}>{toggles.reduceFlightsPct}%</span>}
          sliderKey="reduceFlightsPct"
          value={toggles.reduceFlightsPct ?? 0}
          min={0}
          max={100}
          onChange={updateToggle}
        />
      </section>

      {/* 2. Simulation Output Projections Card */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} aria-labelledby="projection-title">
        <h2 id="projection-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600 }}>
          Savings Projections
        </h2>

        {simResult && currentBadge && projectedBadge ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Annual Carbon Saved</span>
                <strong style={{ fontSize: '28px', color: 'var(--primary)', fontFamily: 'var(--font-header)' }}>
                  {(simResult.savingsAnnual / 1000).toFixed(1)} Tons
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Footprint Reduction</span>
                <strong style={{ fontSize: '28px', color: 'var(--secondary)', fontFamily: 'var(--font-header)' }}>
                  {simResult.savingsPct}%
                </strong>
              </div>
            </div>

            {/* Projected Badge Rank Promotion Panel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-glass)', justifyContent: 'center' }}>
              <BadgeIcon tier={projectedBadge.tier} size={40} showGlow={true} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Projected Badge Rank</span>
                <strong style={{ fontSize: '14px', color: projectedBadge.color, fontWeight: 700 }}>
                  {projectedBadge.title}
                </strong>
                {projectedBadge.tier !== currentBadge.tier && (
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                    🏆 Projected Rank Up!
                  </span>
                )}
              </div>
            </div>

            {/* 5-Year Cumulative Savings Visual Bar Table */}
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                5-Year Cumulative Carbon Savings (Tons)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {simResult.projections.map((proj: SimulationProjectionYear) => {
                  const maxSavings = simResult.projections[4].savingsCumulative;
                  const barWidth = maxSavings > 0 ? (proj.savingsCumulative / maxSavings) * 100 : 0;
                  return (
                    <div key={proj.year} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ width: '48px', fontSize: '14px', color: 'var(--text-secondary)' }}>Year {proj.year}</span>
                      <div style={{ flexGrow: 1, height: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '7px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${barWidth}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)',
                            borderRadius: '7px',
                            transition: 'width 0.5s ease-out'
                          }} 
                        />
                      </div>
                      <span style={{ width: '56px', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>
                        {(proj.savingsCumulative / 1000).toFixed(1)} t
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '13px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <p>
                By enacting these lifestyle selections, you would offset approximately <strong>{(simResult.projections[4].savingsCumulative / 1000).toFixed(1)} tons</strong> of CO2e over the next 5 years!
              </p>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Loading simulation parameters...</p>
        )}
      </section>
    </div>
  );
}
