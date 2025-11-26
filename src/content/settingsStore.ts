export interface SettingsState {
  soundEnabled: boolean;
  soundType: 'you-die-sound' | 'lost-grace-discovered';
  showOnPRMerged: boolean;
  showOnPRCreate: boolean;
  showOnPRApprove: boolean;
  showOnPRClose: boolean;
}

const defaultState: SettingsState = {
  soundEnabled: true,
  soundType: 'you-die-sound',
  showOnPRMerged: true,
  showOnPRCreate: true,
  showOnPRApprove: true,
  showOnPRClose: true,
};

export class SettingsStore {
  private state: SettingsState = defaultState;
  private subscribers: Array<(state: SettingsState) => void> = [];

  init(): void {
    chrome.storage.sync.get(
      [
        'soundEnabled',
        'soundType',
        'showOnPRMerged',
        'showOnPRCreate',
        'showOnPRApprove',
        'showOnPRClose',
      ],
      (result) => {
        this.state = {
          soundEnabled: result.soundEnabled !== false,
          soundType: result.soundType || 'you-die-sound',
          showOnPRMerged: result.showOnPRMerged !== false,
          showOnPRCreate: result.showOnPRCreate !== false,
          showOnPRApprove: result.showOnPRApprove !== false,
          showOnPRClose: result.showOnPRClose !== false,
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
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== listener);
    };
  }

  private notify(): void {
    this.subscribers.forEach((listener) => listener(this.state));
  }
}
