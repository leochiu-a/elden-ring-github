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
    chrome.storage.sync.get<Partial<SettingsState>>(
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

      // Storage values arrive as `unknown` (@types/chrome 0.2+); assign each
      // through a typed helper, coercing where a runtime check is warranted.
      const apply = <K extends keyof SettingsState>(
        key: K,
        coerce?: (value: unknown) => SettingsState[K],
      ): void => {
        const change = changes[key];
        if (!change) return;
        nextState[key] = coerce ? coerce(change.newValue) : (change.newValue as SettingsState[K]);
        updated = true;
      };

      apply('soundEnabled');
      apply('soundType');
      apply('soundVolume', (value) => (typeof value === 'number' ? value : 1));
      apply('showOnPRMerged');
      apply('showOnPRCreate');
      apply('showOnPRApprove');
      apply('showOnPRClose');
      apply('captionMerged');
      apply('captionCreated');
      apply('captionApproved');
      apply('captionClosed');

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
