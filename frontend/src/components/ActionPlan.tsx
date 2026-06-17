import React from 'react';
import { CalculationResult } from '../../../backend/src/services/calculatorService';
import { HabitItem, ActionItem, Milestone } from '../../../backend/src/services/planService';
import { Award, Trophy, Sparkles, Check } from 'lucide-react';
import { BadgeIcon } from './BadgeSystem';
import { useActionPlan } from '../hooks/useActionPlan';

interface MemoizedHabitRowProps {
  habit: HabitItem;
  isChecked: boolean;
  onToggle: (habit: HabitItem) => void;
}

const MemoizedHabitRow = React.memo(function MemoizedHabitRow({ habit, isChecked, onToggle }: MemoizedHabitRowProps) {
  return (
    <div
      className={`habit-checkbox-group ${isChecked ? 'completed' : ''}`}
      onClick={() => onToggle(habit)}
      role="checkbox"
      aria-checked={isChecked}
      aria-labelledby={`habit-${habit.id}-title`}
      aria-describedby={`habit-${habit.id}-desc`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle(habit);
        }
      }}
    >
      <div className={`habit-checkbox ${isChecked ? 'checked' : ''}`}>
        {isChecked && <Check size={14} style={{ color: 'var(--bg-deep)' }} />}
      </div>
      <div style={{ flexGrow: 1 }}>
        <span id={`habit-${habit.id}-title`} style={{ fontWeight: 600, fontSize: '15px', color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
          {habit.title}
        </span>
        <p id={`habit-${habit.id}-desc`} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {habit.description} ({habit.frequency})
        </p>
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
        +{habit.points}pts
      </span>
    </div>
  );
});

interface ActionPlanProps {
  result: CalculationResult;
}

export function ActionPlan({ result }: ActionPlanProps) {
  const {
    plan,
    completedHabits,
    loading,
    points,
    badgeInfo,
    toggleHabit,
    getMilestoneStatus
  } = useActionPlan(result);

  return (
    <div className="dashboard-grid">
      {/* Left Column: Actions and Habits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Daily/Weekly Habits Card */}
        <section className="card" aria-labelledby="habits-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 id="habits-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600 }}>
              Habit Tracker
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Badge Icon Display */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BadgeIcon tier={badgeInfo.tier} size={20} showGlow={false} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: badgeInfo.color }}>{badgeInfo.title.split(' ')[0]}</span>
              </div>

              <div style={{ background: 'rgba(0, 255, 170, 0.1)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(0, 255, 170, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} style={{ color: 'var(--primary)' }} />
                <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-header)' }}>{points} Eco Points</strong>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Generating habit list...</p>
          ) : plan && plan.habits.length > 0 ? (
            <div className="plan-list">
              {plan.habits.map((habit: HabitItem) => (
                <MemoizedHabitRow
                  key={habit.id}
                  habit={habit}
                  isChecked={!!completedHabits[habit.id]}
                  onToggle={toggleHabit}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No habits available.</p>
          )}
        </section>

        {/* Action Roadmap Card */}
        <section className="card" aria-labelledby="roadmap-title">
          <h2 id="roadmap-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
            Action Roadmap
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Generating personalized roadmaps...</p>
          ) : plan && plan.actions.length > 0 ? (
            <div className="plan-list">
              {plan.actions.map((roadmapAction: ActionItem) => (
                <article key={roadmapAction.id} className="action-card">
                  <div style={{ flexGrow: 1, paddingRight: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {roadmapAction.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {roadmapAction.description}
                    </p>
                    <span className={`action-badge ${roadmapAction.difficulty}`}>
                      {roadmapAction.difficulty}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ESTIMATED IMPACT</span>
                    <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>-{roadmapAction.estimatedSavingsKg} kg CO₂e/yr</strong>
                  </div>
                </article>
              ))}

            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No actions required. Your footprint is optimal!</p>
          )}
        </section>
      </div>

      {/* Right Column: Achievements & Milestones */}
      <section className="card" aria-labelledby="milestones-title">
        <h2 id="milestones-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy style={{ color: 'var(--accent)' }} /> Milestones
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading milestone configurations...</p>
        ) : plan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {plan.milestones.map((milestone: Milestone) => {
              const isUnlocked = getMilestoneStatus(milestone);
              return (
                <div
                  key={milestone.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: isUnlocked ? 1 : 0.4,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isUnlocked ? 'var(--accent-glow)' : 'rgba(255, 255, 255, 0.02)',
                      border: `2px solid ${isUnlocked ? 'var(--accent)' : 'var(--border-glass)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trophy size={18} style={{ color: isUnlocked ? 'var(--accent)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {milestone.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {milestone.description} {milestone.targetPoints > 0 && `(${milestone.targetPoints} pts)`}
                    </span>
                  </div>
                </div>
              );
            })}


            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', gap: '12px' }}>
              <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Earn points by completing daily and weekly habits. Watch your achievements unlock automatically!
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
