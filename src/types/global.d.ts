import type { EldenRingSettings } from './settings';

declare global {
  interface Window {
    eldenRingMergerSettings?: EldenRingSettings;
    __eldenRingLoaded?: boolean;
  }
}

export {};
