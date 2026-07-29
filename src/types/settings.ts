import type { SoundType } from './sounds';
import type { CaptionSettings } from './captions';

/** Default playback volume (0..1) when the user hasn't set one. */
export const DEFAULT_SOUND_VOLUME = 0.3;

export interface EldenRingSettings extends CaptionSettings {
  showOnPRMerged?: boolean;
  soundEnabled?: boolean;
  duration?: number;
  showOnPRCreate?: boolean;
  showOnPRApprove?: boolean;
  showOnPRClose?: boolean;
  soundType?: SoundType;
  soundVolume?: number;
}

export type { SoundType };
export type { CaptionSettings };
