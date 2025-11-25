import type { SettingsState } from './settingsStore';

export type ShowSettingKey = 'merged' | 'created' | 'approved' | 'closed';

const STATE_KEY_MAP: Record<ShowSettingKey, keyof SettingsState> = {
  merged: 'showOnPRMerged',
  created: 'showOnPRCreate',
  approved: 'showOnPRApprove',
  closed: 'showOnPRClose',
};

export class ShowSettings {
  constructor(private stateProvider: () => SettingsState) {}

  isEnabled(setting: ShowSettingKey): boolean {
    const key = STATE_KEY_MAP[setting];
    return this.stateProvider()[key];
  }
}
