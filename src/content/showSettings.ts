import type { SettingsState } from './settingsStore';

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

export class ShowSettings {
  constructor(private stateProvider: () => ShowSettingsFlags) {}

  isEnabled(setting: ShowSettingKey): boolean {
    const key = STATE_KEY_MAP[setting];
    return this.stateProvider()[key];
  }
}
