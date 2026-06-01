export type SettingGroupId = 'account' | 'security' | 'preferences' | 'support';
export type SettingAction  = 'navigate' | 'logout-all' | 'toggle-dark-mode' | 'rate-app';

export interface SettingItem {
  id: string;
  label: string;
  description: string;
  iconClass: string;
  iconBgColor: string;
  route?: string;
  action: SettingAction;
}

export interface SettingGroup {
  id: SettingGroupId;
  title: string;
  items: SettingItem[];
}
