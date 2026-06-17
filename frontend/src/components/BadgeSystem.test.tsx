import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BadgeGallery, BADGE_TIERS, BadgeIcon, getBadgeInfo, getTierWeight } from './BadgeSystem';

describe('BadgeSystem', () => {
  describe('getBadgeInfo', () => {
    it('returns diamond for < 2 tons', () => {
      expect(getBadgeInfo(1900)).toBe(BADGE_TIERS.diamond);
    });
    it('returns platinum for 2-4 tons', () => {
      expect(getBadgeInfo(2500)).toBe(BADGE_TIERS.platinum);
    });
    it('returns gold for 4-8 tons', () => {
      expect(getBadgeInfo(5000)).toBe(BADGE_TIERS.gold);
    });
    it('returns silver for 8-12 tons', () => {
      expect(getBadgeInfo(9000)).toBe(BADGE_TIERS.silver);
    });
    it('returns bronze for >= 12 tons', () => {
      expect(getBadgeInfo(12000)).toBe(BADGE_TIERS.bronze);
    });
  });

  describe('BadgeIcon', () => {
    it('renders diamond icon', () => {
      const { container } = render(<BadgeIcon tier="diamond" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    it('renders platinum icon', () => {
      const { container } = render(<BadgeIcon tier="platinum" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    it('renders gold icon', () => {
      const { container } = render(<BadgeIcon tier="gold" showGlow={false} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    it('renders silver icon', () => {
      const { container } = render(<BadgeIcon tier="silver" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    it('renders bronze icon', () => {
      const { container } = render(<BadgeIcon tier="bronze" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('getTierWeight', () => {
    it('returns 0 for unknown tier', () => {
      expect(getTierWeight('unknown' as any)).toBe(0);
    });
  });

  describe('BadgeGallery', () => {


    it('renders with bronze tier', () => {
      render(<BadgeGallery currentTons={13} />);
      expect(screen.getByText('Carbon Compass Ranks')).toBeInTheDocument();
      expect(screen.getByText(/You are currently ranked as a/i)).toBeInTheDocument();
      expect(screen.getByText(/1.0 tons\/yr/i)).toBeInTheDocument(); // next is silver (12 tons) -> 13 - 12 = 1.0
    });

    it('renders with silver tier', () => {
      render(<BadgeGallery currentTons={9} />);
      expect(screen.getByText(/1.0 tons\/yr/i)).toBeInTheDocument(); // next is gold (8 tons) -> 9 - 8 = 1.0
    });

    it('renders with gold tier', () => {
      render(<BadgeGallery currentTons={6} />);
      expect(screen.getByText(/2.0 tons\/yr/i)).toBeInTheDocument(); // next is platinum (4 tons) -> 6 - 4 = 2.0
    });

    it('renders with platinum tier', () => {
      render(<BadgeGallery currentTons={3} />);
      expect(screen.getByText(/1.0 tons\/yr/i)).toBeInTheDocument(); // next is diamond (2 tons) -> 3 - 2 = 1.0
    });

    it('renders with diamond tier', () => {
      render(<BadgeGallery currentTons={1.5} />);
      expect(screen.getByText(/Incredible!/i)).toBeInTheDocument(); // no next rank
    });
  });
});
