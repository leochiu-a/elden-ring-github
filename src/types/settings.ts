import type { SoundType } from './sounds';

export interface EldenRingSettings {
  showOnPRMerged?: boolean;
  soundEnabled?: boolean;
  duration?: number;
  showOnPRCreate?: boolean;
  showOnPRApprove?: boolean;
  showOnPRClose?: boolean;
  soundType?: SoundType;
}

export type { SoundType };
