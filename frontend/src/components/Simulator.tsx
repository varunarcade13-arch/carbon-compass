import { useState, useEffect, useMemo, useCallback } from 'react';
import { AssessmentInput } from '../../../backend/src/services/calculatorService';
import { SimulationToggles, SimulationResult } from '../../../backend/src/services/simulatorService';
import { ApiClient } from '../services/api';
import { Sparkles, Sun, Car, Apple, Plane, Train } from 'lucide-react';
import { getBadgeInfo, BadgeIcon } from './BadgeSystem';

interface SimulatorProps {
  baseInput: AssessmentInput;
}

export function Simulator({ baseInput }: SimulatorProps) {
  const [toggles, setToggles] = useState<SimulationToggles>({
    switchEv: false,
    solarPanels: false,
    meatlessDays: 0,
    reduceFlightsPct: 0,
    publicTransitPct: 0,
  });

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    let active = true;
    const runSimulation = async (): Promise<void> => {
      try {
        const simulationResponse = await ApiClient.simulate(baseInput, toggles);
        if (active) {
          setSimResult(simulationResponse);
        }
      } catch (error) {
        console.error(error);
      }
    };

    runSimulation();

    return () => {
      active = false;
    };
  }, [baseInput, toggles]);


  const currentBadge = useMemo(() => {
    if (!simResult) return null;
    return getBadgeInfo(simResult.baseline.grandTotal);
  }, [simResult]);

  const projectedBadge = useMemo(() => {
    if (!simResult) return null;
    return getBadgeInfo(simResult.simulated.grandTotal);
  }, [simResult]);

  const updateToggle = useCallback(<K extends keyof SimulationToggles>(key: K, value: SimulationToggles[K]): void => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  }, []);


  return (
    <div className="dashboard-grid">
      {/* 1. Control Sliders Card */}
      <section className="card" aria-labelledby="sim-controls-title">
        <h2 id="sim-controls-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
          Lifestyle Adjustments
        </h2>

        {/* Solar Panels Toggle */}
        <div className="toggle-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sun size={20} style={{ color: 'var(--secondary)' }} />
            <div>
              <label htmlFor="toggle-solar" style={{ fontWeight: 600, fontSize: '15px', display: 'block' }}>Install Solar Panels</label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cuts home electricity grid reliance by 80%.</span>
            </div>
          </div>
          <label className="switch">
            <input
              id="toggle-solar"
              type="checkbox"
              checked={toggles.solarPanels ?? false}
              onChange={(e) => updateToggle('solarPanels', e.target.checked)}
            />
            <span className="slider-toggle" />
          </label>
        </div>

        {/* EV Switch Toggle */}
        <div className="toggle-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Car size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <label htmlFor="toggle-ev" style={{ fontWeight: 600, fontSize: '15px', display: 'block' }}>Switch to Electric Vehicle</label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Transitions commute to clean energy.</span>
            </div>
          </div>
          <label className="switch">
            <input
              id="toggle-ev"
              type="checkbox"
              checked={toggles.switchEv ?? false}
              onChange={(e) => updateToggle('switchEv', e.target.checked)}
            />
            <span className="slider-toggle" />
          </label>
        </div>

        {/* Meatless Days Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Apple size={20} style={{ color: 'var(--primary)' }} />
              <label htmlFor="slider-meatless" style={{ fontWeight: 600, fontSize: '15px' }}>Meatless Days / Week</label>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{toggles.meatlessDays} days</span>
          </div>
          <input
            id="slider-meatless"
            type="range"
            min="0"
            max="7"
            className="slider-input"
            value={toggles.meatlessDays ?? 0}
            onChange={(e) => updateToggle('meatlessDays', Number(e.target.value))}
          />
        </div>

        {/* Shift Commute to Public Transit Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Train size={20} style={{ color: 'var(--secondary)' }} />
              <label htmlFor="slider-transit" style={{ fontWeight: 600, fontSize: '15px' }}>Shift Commute to Transit</label>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{toggles.publicTransitPct}%</span>
          </div>
          <input
            id="slider-transit"
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={toggles.publicTransitPct ?? 0}
            onChange={(e) => updateToggle('publicTransitPct', Number(e.target.value))}
          />
        </div>

        {/* Reduce Flights Slider */}
        <div className="slider-group">
          <div className="slider-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Plane size={20} style={{ color: 'var(--accent)' }} />
              <label htmlFor="slider-flights" style={{ fontWeight: 600, fontSize: '15px' }}>Reduce Flights By</label>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{toggles.reduceFlightsPct}%</span>
          </div>
          <input
            id="slider-flights"
            type="range"
            min="0"
            max="100"
            className="slider-input"
            value={toggles.reduceFlightsPct ?? 0}
            onChange={(e) => updateToggle('reduceFlightsPct', Number(e.target.value))}
          />
        </div>
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
                {simResult.projections.map((proj) => {
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
