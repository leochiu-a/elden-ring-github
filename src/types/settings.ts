import type { SoundType } from './sounds';

export interface EldenRingSettings {
  showOnPRMerged?: boolean;
  soundEnabled?: boolean;
  duration?: number;
  showOnPRCreate?: boolean;
  showOnPRApprove?: boolean;
  showOnPRClose?: boolean;
  soundType?: SoundType;
  soundVolume?: number;
  customBannerText?: string;
}

export type { SoundType };
