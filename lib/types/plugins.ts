export type PluginStatus = 'active' | 'inactive' | 'error';
export type PluginCategory = 'analytics' | 'communication' | 'payment' | 'automation' | 'integration';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: PluginCategory;
  status: PluginStatus;
  installedAt: string | null;
  configSchema: PluginConfigField[];
  config: Record<string, string | boolean | number>;
  icon: string;
  requiredPermissions: string[];
}

export interface PluginConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  defaultValue?: string | boolean | number;
}

export interface PluginLog {
  id: string;
  pluginId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}
