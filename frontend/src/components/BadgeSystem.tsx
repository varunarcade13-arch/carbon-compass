import { useMemo, memo } from 'react';
import { Shield, Sparkles, Award } from 'lucide-react';

export type BadgeTier = 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';

export interface BadgeInfo {
  tier: BadgeTier;
  title: string;
  description: string;
  threshold: string;
  color: string;
  glowColor: string;
}

export const BADGE_TIERS: Record<BadgeTier, BadgeInfo> = {
  diamond: {
    tier: 'diamond',
    title: 'Diamond Earth Safeguard',
    description: 'IPCC Paris Target Alignment (< 2.0 Tons)',
    threshold: '< 2.0 Tons',
    color: '#00ffaa', // Mint green/cyan
    glowColor: 'rgba(0, 255, 170, 0.4)',
  },
  platinum: {
    tier: 'platinum',
    title: 'Platinum Eco Warrior',
    description: 'Elite Carbon Reduction Partner (2.0 - 4.0 Tons)',
    threshold: '2.0 - 4.0 Tons',
    color: '#38bdf8', // Sky Blue
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  gold: {
    tier: 'gold',
    title: 'Gold Carbon Cutter',
    description: 'Active Lifestyle Adaptation Leader (4.0 - 8.0 Tons)',
    threshold: '4.0 - 8.0 Tons',
    color: '#fbbf24', // Golden Amber
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  silver: {
    tier: 'silver',
    title: 'Silver Climate Scout',
    description: 'Progressive Emission Control Agent (8.0 - 12.0 Tons)',
    threshold: '8.0 - 12.0 Tons',
    color: '#cbd5e1', // Sleek Silver
    glowColor: 'rgba(203, 213, 225, 0.3)',
  },
  bronze: {
    tier: 'bronze',
    title: 'Bronze Eco Rookie',
    description: 'Beginning of the Sustainable Path (≥ 12.0 Tons)',
    threshold: '≥ 12.0 Tons',
    color: '#f97316', // Bronze/Orange
    glowColor: 'rgba(249, 115, 22, 0.3)',
  },
};

export function getBadgeInfo(grandTotalKg: number): BadgeInfo {
  const tons = grandTotalKg / 1000;
  if (tons < 2.0) return BADGE_TIERS.diamond;
  if (tons < 4.0) return BADGE_TIERS.platinum;
  if (tons < 8.0) return BADGE_TIERS.gold;
  if (tons < 12.0) return BADGE_TIERS.silver;
  return BADGE_TIERS.bronze;
}

const STATIC_DEFS = (
  <defs>
    <linearGradient id="grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#00352c" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="grad-platinum" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#78350f" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="grad-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#334155" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="grad-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.9" />
    </linearGradient>
  </defs>
);

interface BadgeIconProps {
  tier: BadgeTier;
  size?: number;
  showGlow?: boolean;
}

export const BadgeIcon = memo(function BadgeIcon({ tier, size = 64, showGlow = true }: BadgeIconProps) {
  const tierInfo = BADGE_TIERS[tier];
  
  // Custom SVG designs per tier
  const renderSVGPath = () => {
    switch (tier) {
      case 'diamond':
        // A diamond shape with an inner globe representation
        return (
          <g>
            <polygon points="24,4 42,20 24,44 6,20" fill="url(#grad-diamond)" stroke={tierInfo.color} strokeWidth="1.5" />
            <line x1="24" y1="4" x2="24" y2="44" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="6" y1="20" x2="42" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="24" cy="20" r="6" fill="none" stroke="white" strokeWidth="1.2" opacity="0.9" />
          </g>
        );
      case 'platinum':
        // A double shield emblem
        return (
          <g>
            <path d="M12,6 L36,6 L40,22 C40,32 30,42 24,45 C18,42 8,32 8,22 Z" fill="url(#grad-platinum)" stroke={tierInfo.color} strokeWidth="1.5" />
            <path d="M16,10 L32,10 L35,22 C35,29 28,37 24,39 C20,37 13,29 13,22 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="24" cy="20" r="4" fill="white" opacity="0.8" />
          </g>
        );
      case 'gold':
        // A classic hex-shaped crest
        return (
          <g>
            <polygon points="24,3 41,12 41,33 24,44 7,33 7,12" fill="url(#grad-gold)" stroke={tierInfo.color} strokeWidth="1.5" />
            <polygon points="24,7 37,14 37,30 24,39 11,30 11,14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M20,18 L24,14 L28,18 L24,30 Z" fill="white" opacity="0.8" />
          </g>
        );
      case 'silver':
        // A circular medal medallion
        return (
          <g>
            <circle cx="24" cy="24" r="19" fill="url(#grad-silver)" stroke={tierInfo.color} strokeWidth="1.5" />
            <circle cx="24" cy="24" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            {/* Star outline inside */}
            <polygon points="24,13 27,20 35,20 28,24 31,31 24,27 17,31 20,24 13,20 21,20" fill="white" opacity="0.85" />
          </g>
        );
      case 'bronze':
      default:
        // A round crest with a leaf representation
        return (
          <g>
            <circle cx="24" cy="24" r="18" fill="url(#grad-bronze)" stroke={tierInfo.color} strokeWidth="1.5" />
            {/* Leaf shape inside */}
            <path d="M24,12 C29,18 29,26 24,32 C19,26 19,18 24,12 Z" fill="white" opacity="0.8" />
            <line x1="24" y1="12" x2="24" y2="32" stroke={tierInfo.color} strokeWidth="1" />
          </g>
        );
    }
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative', width: size, height: size }}>
      {showGlow && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            boxShadow: `0 0 ${size * 0.25}px ${tierInfo.glowColor}`,
            pointerEvents: 'none',
          }}
        />
      )}
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          filter: showGlow ? `drop-shadow(0 0 4px ${tierInfo.color}80)` : 'none',
        }}
      >
        {STATIC_DEFS}
        {renderSVGPath()}
      </svg>
    </div>
  );
});



interface BadgeGalleryProps {
  currentTons: number;
}

export const BadgeGallery = memo(function BadgeGallery({ currentTons }: BadgeGalleryProps) {
  const currentBadge = useMemo(() => getBadgeInfo(currentTons * 1000), [currentTons]);
  
  // Calculate thresholds to next rank
  const rankUpgrade = useMemo(() => {
    let nextBadge: BadgeInfo | null = null;
    let gapTons = 0;
    
    if (currentTons >= 12.0) {
      nextBadge = BADGE_TIERS.silver;
      gapTons = currentTons - 12.0;
    } else if (currentTons >= 8.0) {
      nextBadge = BADGE_TIERS.gold;
      gapTons = currentTons - 8.0;
    } else if (currentTons >= 4.0) {
      nextBadge = BADGE_TIERS.platinum;
      gapTons = currentTons - 4.0;
    } else if (currentTons >= 2.0) {
      nextBadge = BADGE_TIERS.diamond;
      gapTons = currentTons - 2.0;
    }
    return { nextBadge, gapTons };
  }, [currentTons]);

  const { nextBadge, gapTons } = rankUpgrade;


  return (
    <section className="card" aria-labelledby="badge-gallery-title">
      <h2 id="badge-gallery-title" style={{ fontFamily: 'var(--font-header)', fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={20} style={{ color: 'var(--primary)' }} /> Carbon Compass Ranks
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', padding: '12px 4px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
          {(Object.keys(BADGE_TIERS) as BadgeTier[]).map((tierKey) => {
            const badge = BADGE_TIERS[tierKey];
            const isUnlocked = getTierWeight(currentBadge.tier) >= getTierWeight(tierKey);
            return (
              <div key={tierKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isUnlocked ? 1 : 0.25, textAlign: 'center' }}>
                <BadgeIcon tier={tierKey} size={42} showGlow={isUnlocked} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: badge.color, marginTop: '8px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', padding: '0 2px' }}>
                  {badge.title.split(' ')[0]}
                </span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{badge.threshold}</span>
              </div>
            );
          })}
        </div>


        {/* Dynamic Rank Up Message */}
        {nextBadge ? (
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <Sparkles size={20} style={{ color: nextBadge.color, flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              You are currently ranked as a <strong>{currentBadge.title}</strong>. 
              Reduce your emissions by <strong>{gapTons.toFixed(1)} tons/yr</strong> to level up to <strong>{nextBadge.title}</strong>!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(0, 255, 170, 0.05)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(0, 255, 170, 0.1)' }}>
            <Award size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              🎉 Incredible! You hold the absolute highest rank of <strong>{currentBadge.title}</strong>. You are a true steward of the planet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});


function getTierWeight(tier: BadgeTier): number {
  switch (tier) {
    case 'diamond': return 5;
    case 'platinum': return 4;
    case 'gold': return 3;
    case 'silver': return 2;
    case 'bronze': return 1;
    default: return 0;
  }
}
