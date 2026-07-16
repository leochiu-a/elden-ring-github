import type { SoundType } from './sounds';
import type { CaptionSettings } from './captions';

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
