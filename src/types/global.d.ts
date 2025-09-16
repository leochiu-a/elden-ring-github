import type { EldenRingSettings } from './settings';

declare global {
  interface Window {
    eldenRingMergerSettings?: EldenRingSettings;
  }
}

export {};