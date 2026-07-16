import { useEffect, useState } from 'preact/hooks';
import type { EldenRingSettings, SoundType } from '../types/settings';

export interface PopupSettings {
  showOnPRMerged: boolean;
  showOnPRCreate: boolean;
  showOnPRApprove: boolean;
  showOnPRClose: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0..1
  soundType: SoundType;
  duration: number;
  captionMerged: string;
  captionCreated: string;
  captionApproved: string;
  captionClosed: string;
}

export const DEFAULT_SETTINGS: PopupSettings = {
  showOnPRMerged: true,
  showOnPRCreate: true,
  showOnPRApprove: true,
  showOnPRClose: true,
  soundEnabled: true,
  soundVolume: 1,
  soundType: 'you-die-sound',
  duration: 5000,
  captionMerged: '',
  captionCreated: '',
  captionApproved: '',
  captionClosed: '',
};

const STORAGE_KEYS = Object.keys(DEFAULT_SETTINGS) as Array<keyof PopupSettings>;

// Injected into the active tab so the content script picks up new settings
// without a page reload. Must be fully self-contained (only its own source is
// serialized by chrome.scripting.executeScript).
function updateExtensionSettings(settings: EldenRingSettings): void {
  if (window.eldenRingMergerSettings) {
    window.eldenRingMergerSettings = { ...window.eldenRingMergerSettings, ...settings };
  } else {
    window.eldenRingMergerSettings = settings;
  }
}

const pushToActiveTab = (settings: PopupSettings): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab?.id === undefined) return;
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: updateExtensionSettings,
      args: [settings as EldenRingSettings],
    });
  });
};

export const useSettings = () => {
  const [settings, setSettings] = useState<PopupSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    chrome.storage.sync.get<Partial<PopupSettings>>(STORAGE_KEYS, (result) => {
      setSettings({
        showOnPRMerged: result.showOnPRMerged !== false,
        showOnPRCreate: result.showOnPRCreate !== false,
        showOnPRApprove: result.showOnPRApprove !== false,
        showOnPRClose: result.showOnPRClose !== false,
        soundEnabled: result.soundEnabled !== false,
        soundVolume: typeof result.soundVolume === 'number' ? result.soundVolume : 1,
        soundType: (result.soundType as SoundType) || 'you-die-sound',
        duration: typeof result.duration === 'number' ? result.duration : 5000,
        captionMerged: result.captionMerged ?? '',
        captionCreated: result.captionCreated ?? '',
        captionApproved: result.captionApproved ?? '',
        captionClosed: result.captionClosed ?? '',
      });
    });
  }, []);

  const update = (patch: Partial<PopupSettings>): void => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      chrome.storage.sync.set(patch);
      pushToActiveTab(next);
      return next;
    });
  };

  return { settings, update };
};
