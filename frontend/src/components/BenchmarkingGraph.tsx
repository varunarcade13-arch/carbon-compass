import { Landmark } from 'lucide-react';
import { memo } from 'react';

interface BenchmarkingGraphProps {
  tons: string;
  userTons: number;
  usAverageTons: number;
  globalAverageTons: number;
  targetGoalTons: number;
  maxBenchmark: number;
}

export const BenchmarkingGraph = memo(function BenchmarkingGraph({
  tons,
  userTons,
  usAverageTons,
  globalAverageTons,
  targetGoalTons,
  maxBenchmark,
}: BenchmarkingGraphProps) {
  return (
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
  );
});
