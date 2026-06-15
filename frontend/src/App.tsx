import { useState } from 'react';
import { AssessmentWizard } from './components/AssessmentWizard';
import { Dashboard } from './components/Dashboard';
import { Simulator } from './components/Simulator';
import { ActionPlan } from './components/ActionPlan';
import { ApiClient } from './services/api';
import { AssessmentInput, CalculationResult } from '../../backend/src/services/calculatorService';
import { Award, BarChart3, ToggleLeft, Calculator } from 'lucide-react';
import './styles/app.css';

type TabType = 'calculator' | 'dashboard' | 'simulator' | 'plans';

export default function App() {
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [baseInput, setBaseInput] = useState<AssessmentInput | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssessmentComplete = async (input: AssessmentInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.calculate(input);
      setCalcResult(result);
      setBaseInput(input);
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to compute footprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = () => {
    setActiveTab('calculator');
  };

  return (
    <>
      {/* Keyboard-Only Skip Navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="app-container">
        {/* Main Branding Header */}
        <header>
          <div className="logo-group">
            <div className="logo" aria-label="CarbonCompass Carbon Footprint Tracker">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <circle cx="12" cy="12" r="9" stroke="var(--primary)" />
                {/* Latitudes & Longitudes */}
                <path d="M3.6 9h16.8M3.6 15h16.8" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" />
                <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" />
                {/* Earth Continents outlines, filled faintly */}
                <path d="M5.5 10c0.5-0.5,1.5-0.2,1.8,0.5s0.2,1.5-0.5,1.8s-1.5,0.2-1.8-0.5S4.8,10.3,5.5,10z M9.5,7.5c0.5-0.3,1.2,0.2,1.5,0.8s-0.2,1.5-1,1.5s-1.2-0.5-1.5-1.2S8.8,7.8,9.5,7.5z M14.5,15.5c0.5,0.5,0.2,1.5-0.5,1.8s-1.5-0.2-1.8-0.5s0.2-1.5,0.5-1.8S13.8,15,14.5,15.5z" fill="rgba(0, 255, 170, 0.2)" stroke="none" />
                <path d="M17.5,11.5c0.5-0.5,1.5-0.2,1.8,0.5s-0.2,1.5-1,1.5s-1.5-0.5-1.8-1.2S16.8,11.8,17.5,11.5z M16.5,8c0.5-0.5,1.2-0.2,1.5,0.5s-0.2,1-1,1.2s-1.2-0.5-1.5-1.2S15.8,8.2,16.5,8z" fill="rgba(0, 255, 170, 0.2)" stroke="none" />
                {/* Compass Needle pointing Northeast */}
                <polygon points="12,12 15,9 14,14" fill="var(--secondary)" stroke="var(--secondary)" />
                <polygon points="12,12 9,15 10,10" fill="var(--accent)" stroke="var(--accent)" />
              </svg>
              <span>CarbonCompass</span>
            </div>
            <span className="tagline">Measure. Simulate. Reduce. Make every choice count.</span>
          </div>

          {/* Navigation tabs, only rendered post-onboarding */}
          {calcResult && (
            <nav className="nav-tabs" aria-label="Main Navigation">
              <button
                className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              >
                <BarChart3 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Dashboard
              </button>
              <button
                className={`nav-button ${activeTab === 'calculator' ? 'active' : ''}`}
                onClick={() => setActiveTab('calculator')}
                aria-current={activeTab === 'calculator' ? 'page' : undefined}
              >
                <Calculator size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Calculator
              </button>
              <button
                className={`nav-button ${activeTab === 'simulator' ? 'active' : ''}`}
                onClick={() => setActiveTab('simulator')}
                aria-current={activeTab === 'simulator' ? 'page' : undefined}
              >
                <ToggleLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Simulator
              </button>
              <button
                className={`nav-button ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
                aria-current={activeTab === 'plans' ? 'page' : undefined}
              >
                <Award size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Action Plan
              </button>
            </nav>
          )}
        </header>

        {/* Primary Screen Area */}
        <main id="main-content">
          {error && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--high-impact)', 
                padding: '16px', 
                borderRadius: '16px', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                marginBottom: '24px' 
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '64px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Analyzing footprint dimensions...</p>
            </div>
          ) : !calcResult ? (
            <section aria-labelledby="assessment-heading">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 id="assessment-heading" style={{ fontFamily: 'var(--font-header)', fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                  Baseline Your Carbon Footprint
                </h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
                  CarbonCompass helps you analyze your daily routines and map out carbon-reduction strategies. Start with a quick assessment.
                </p>
              </div>
              <AssessmentWizard onComplete={handleAssessmentComplete} />
            </section>
          ) : (
            <>
              {activeTab === 'calculator' && (
                <section aria-labelledby="assessment-heading">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 id="assessment-heading" style={{ fontFamily: 'var(--font-header)', fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                      Adjust Your Carbon Baseline
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
                      Update your baseline metrics below. Your changes will immediately propagate across the Dashboard and Simulator tabs.
                    </p>
                  </div>
                  <AssessmentWizard onComplete={handleAssessmentComplete} />
                </section>
              )}
              {activeTab === 'dashboard' && <Dashboard result={calcResult} onRecalculate={handleRecalculate} />}
              {activeTab === 'simulator' && baseInput && <Simulator baseInput={baseInput} />}
              {activeTab === 'plans' && <ActionPlan result={calcResult} />}
            </>
          )}
        </main>

        <footer>
          <p>© 2026 CarbonCompass Sustainable Systems. Designed for carbon tracking and lifestyle simulations.</p>
        </footer>
      </div>
    </>
  );
}
