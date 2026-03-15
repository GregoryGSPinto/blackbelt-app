import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { Plugin, PluginLog } from '@/lib/types/plugins';

export async function listPlugins(): Promise<Plugin[]> {
  try {
    if (isMock()) {
      const { mockListPlugins } = await import('@/lib/mocks/plugins.mock');
      return mockListPlugins();
    }
    const res = await fetch('/api/v1/plugins');
    return res.json();
  } catch (error) { handleServiceError(error, 'plugins.list'); }
}

export async function getPlugin(pluginId: string): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockGetPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockGetPlugin(pluginId);
    }
    const res = await fetch(`/api/v1/plugins/${pluginId}`);
    return res.json();
  } catch (error) { handleServiceError(error, 'plugins.get'); }
}

export async function installPlugin(pluginId: string): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockInstallPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockInstallPlugin(pluginId);
    }
    const res = await fetch(`/api/v1/plugins/${pluginId}/install`, { method: 'POST' });
    return res.json();
  } catch (error) { handleServiceError(error, 'plugins.install'); }
}

export async function uninstallPlugin(pluginId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUninstallPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockUninstallPlugin(pluginId);
    }
    await fetch(`/api/v1/plugins/${pluginId}/uninstall`, { method: 'POST' });
  } catch (error) { handleServiceError(error, 'plugins.uninstall'); }
}

export async function updatePluginConfig(
  pluginId: string,
  config: Record<string, string | boolean | number>
): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockUpdatePluginConfig } = await import('@/lib/mocks/plugins.mock');
      return mockUpdatePluginConfig(pluginId, config);
    }
    const res = await fetch(`/api/v1/plugins/${pluginId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  } catch (error) { handleServiceError(error, 'plugins.updateConfig'); }
}

export async function getPluginLogs(pluginId: string): Promise<PluginLog[]> {
  try {
    if (isMock()) {
      const { mockGetPluginLogs } = await import('@/lib/mocks/plugins.mock');
      return mockGetPluginLogs(pluginId);
    }
    const res = await fetch(`/api/v1/plugins/${pluginId}/logs`);
    return res.json();
  } catch (error) { handleServiceError(error, 'plugins.logs'); }
}
