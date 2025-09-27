import { describe, it, expect } from 'vitest';
import type { EldenRingSettings } from './settings';

describe('EldenRingSettings type', () => {
  it('should accept valid settings object', () => {
    const validSettings: EldenRingSettings = {
      soundEnabled: true,
      showOnPRMerged: true,
      showOnPRCreate: false,
      duration: 5000,
    };

    expect(validSettings).toEqual({
      soundEnabled: true,
      showOnPRMerged: true,
      showOnPRCreate: false,
      duration: 5000,
    });
  });

  it('should handle optional properties', () => {
    const partialSettings: Partial<EldenRingSettings> = {
      soundEnabled: false,
      duration: 3000,
    };

    expect(partialSettings.soundEnabled).toBe(false);
    expect(partialSettings.duration).toBe(3000);
    expect(partialSettings.showOnPRMerged).toBeUndefined();
    expect(partialSettings.showOnPRCreate).toBeUndefined();
  });

  it('should validate boolean properties', () => {
    const settings: EldenRingSettings = {
      soundEnabled: true,
      showOnPRMerged: false,
      showOnPRCreate: true,
      duration: 10000,
    };

    expect(typeof settings.soundEnabled).toBe('boolean');
    expect(typeof settings.showOnPRMerged).toBe('boolean');
    expect(typeof settings.showOnPRCreate).toBe('boolean');
    expect(typeof settings.duration).toBe('number');
  });

  it('should validate duration as number', () => {
    const durations = [1000, 3000, 5000, 10000];

    durations.forEach((duration) => {
      const settings: EldenRingSettings = {
        soundEnabled: true,
        showOnPRMerged: true,
        showOnPRCreate: true,
        duration,
      };

      expect(settings.duration).toBe(duration);
      expect(typeof settings.duration).toBe('number');
    });
  });
});
