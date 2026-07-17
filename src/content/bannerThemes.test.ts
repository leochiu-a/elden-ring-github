import { describe, it, expect } from 'vitest';
import { resolveBannerTheme } from './bannerThemes';
import type { BannerType } from './banner';

describe('resolveBannerTheme', () => {
  it('gives the positive events the shared gold face', () => {
    const gold = 'rgb(220, 175, 45)';
    (['merged', 'created', 'approved'] as BannerType[]).forEach((type) => {
      expect(resolveBannerTheme(type).faceColor).toBe(gold);
    });
  });

  it('gives a closed PR the blood-red death-screen face', () => {
    const theme = resolveBannerTheme('closed');
    expect(theme.faceColor).toBe('rgb(130, 16, 29)');
    expect(theme.sheenColor).toBe('rgb(190, 40, 45)');
    expect(theme.sheenOpacity).toBeGreaterThan(0);
    expect(theme.sheenOpacity).toBeLessThanOrEqual(1);
  });

  it('returns a fully-populated theme for every banner type', () => {
    (['merged', 'created', 'approved', 'closed'] as BannerType[]).forEach((type) => {
      const theme = resolveBannerTheme(type);
      expect(theme.faceColor).toBeTruthy();
      expect(theme.sheenColor).toBeTruthy();
      expect(typeof theme.sheenOpacity).toBe('number');
    });
  });
});
