import type { SoundType } from '../types/sounds';
import type { CaptionSettings } from '../types/captions';

export interface SettingsState extends CaptionSettings {
  soundEnabled: boolean;
  soundType: SoundType;
  soundVolume: number;
  showOnPRMerged: boolean;
  showOnPRCreate: boolean;
  showOnPRApprove: boolean;
  showOnPRClose: boolean;
}

export type ShowSettingKey = 'merged' | 'created' | 'approved' | 'closed';

type ShowSettingsFlags = Pick<
  SettingsState,
  'showOnPRMerged' | 'showOnPRCreate' | 'showOnPRApprove' | 'showOnPRClose'
>;

const STATE_KEY_MAP: Record<ShowSettingKey, keyof ShowSettingsFlags> = {
  merged: 'showOnPRMerged',
  created: 'showOnPRCreate',
  approved: 'showOnPRApprove',
  closed: 'showOnPRClose',
};

const defaultState: SettingsState = {
  soundEnabled: true,
  soundType: 'you-die-sound',
  soundVolume: 1,
  showOnPRMerged: true,
  showOnPRCreate: true,
  showOnPRApprove: true,
  showOnPRClose: true,
};

export class ShowSettings {
  private state: SettingsState;
  private subscribers: Array<(state: SettingsState) => void> = [];
  private autoInit: boolean;

  constructor(initialState?: Partial<SettingsState>, options?: { autoInit?: boolean }) {
    this.state = { ...defaultState, ...initialState };
    this.autoInit = options?.autoInit ?? true;

    if (this.autoInit) {
      this.initStorageSync();
    }
  }

  private initStorageSync(): void {
    chrome.storage.sync.get(
      [
        'soundEnabled',
        'soundType',
        'soundVolume',
        'showOnPRMerged',
        'showOnPRCreate',
        'showOnPRApprove',
        'showOnPRClose',
        'captionMerged',
        'captionCreated',
        'captionApproved',
        'captionClosed',
      ],
      (result) => {
        this.state = {
          soundEnabled: result.soundEnabled !== false,
          soundType: result.soundType || 'you-die-sound',
          soundVolume: typeof result.soundVolume === 'number' ? result.soundVolume : 1,
          showOnPRMerged: result.showOnPRMerged !== false,
          showOnPRCreate: result.showOnPRCreate !== false,
          showOnPRApprove: result.showOnPRApprove !== false,
          showOnPRClose: result.showOnPRClose !== false,
          captionMerged: result.captionMerged,
          captionCreated: result.captionCreated,
          captionApproved: result.captionApproved,
          captionClosed: result.captionClosed,
        };
        this.notify();
      },
    );

    chrome.storage.onChanged.addListener((changes) => {
      let updated = false;
      const nextState = { ...this.state };

      if (changes.soundEnabled) {
        nextState.soundEnabled = changes.soundEnabled.newValue;
        updated = true;
      }
      if (changes.soundType) {
        nextState.soundType = changes.soundType.newValue;
        updated = true;
      }
      if (changes.soundVolume) {
        nextState.soundVolume =
          typeof changes.soundVolume.newValue === 'number' ? changes.soundVolume.newValue : 1;
        updated = true;
      }
      if (changes.showOnPRMerged) {
        nextState.showOnPRMerged = changes.showOnPRMerged.newValue;
        updated = true;
      }
      if (changes.showOnPRCreate) {
        nextState.showOnPRCreate = changes.showOnPRCreate.newValue;
        updated = true;
      }
      if (changes.showOnPRApprove) {
        nextState.showOnPRApprove = changes.showOnPRApprove.newValue;
        updated = true;
      }
      if (changes.showOnPRClose) {
        nextState.showOnPRClose = changes.showOnPRClose.newValue;
        updated = true;
      }
      if (changes.captionMerged) {
        nextState.captionMerged = changes.captionMerged.newValue;
        updated = true;
      }
      if (changes.captionCreated) {
        nextState.captionCreated = changes.captionCreated.newValue;
        updated = true;
      }
      if (changes.captionApproved) {
        nextState.captionApproved = changes.captionApproved.newValue;
        updated = true;
      }
      if (changes.captionClosed) {
        nextState.captionClosed = changes.captionClosed.newValue;
        updated = true;
      }

      if (updated) {
        this.state = nextState;
        this.notify();
      }
    });
  }

  getState(): SettingsState {
    return this.state;
  }

  subscribe(listener: (state: SettingsState) => void): () => void {
    this.subscribers.push(listener);
    listener(this.state);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== listener);
    };
  }

  private notify(): void {
    this.subscribers.forEach((listener) => listener(this.state));
  }

  isEnabled(setting: ShowSettingKey): boolean {
    const key = STATE_KEY_MAP[setting];
    const flags = this.state as ShowSettingsFlags;
    return flags[key];
  }
}
