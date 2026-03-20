import { isMock } from '@/lib/env';
import type { Plugin, PluginLog } from '@/lib/types/plugins';

export async function listPlugins(): Promise<Plugin[]> {
  try {
    if (isMock()) {
      const { mockListPlugins } = await import('@/lib/mocks/plugins.mock');
      return mockListPlugins();
    }
    try {
      const res = await fetch('/api/v1/plugins');
      return res.json();
    } catch {
      console.warn('[plugins.listPlugins] API not available, using mock fallback');
      const { mockListPlugins } = await import('@/lib/mocks/plugins.mock');
      return mockListPlugins();
    }
  } catch (error) {
    console.warn('[listPlugins] Fallback:', error);
    return [];
  }
}

export async function getPlugin(pluginId: string): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockGetPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockGetPlugin(pluginId);
    }
    try {
      const res = await fetch(`/api/v1/plugins/${pluginId}`);
      return res.json();
    } catch {
      console.warn('[plugins.getPlugin] API not available, using fallback');
      return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
    }
  } catch (error) {
    console.warn('[getPlugin] Fallback:', error);
    return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
  }
}

export async function installPlugin(pluginId: string): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockInstallPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockInstallPlugin(pluginId);
    }
    try {
      const res = await fetch(`/api/v1/plugins/${pluginId}/install`, { method: 'POST' });
      return res.json();
    } catch {
      console.warn('[plugins.installPlugin] API not available, using fallback');
      return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
    }
  } catch (error) {
    console.warn('[installPlugin] Fallback:', error);
    return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
  }
}

export async function uninstallPlugin(pluginId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUninstallPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockUninstallPlugin(pluginId);
    }
    try {
      await fetch(`/api/v1/plugins/${pluginId}/uninstall`, { method: 'POST' });
    } catch {
      console.warn('[plugins.uninstallPlugin] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[uninstallPlugin] Fallback:', error);
  }
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
    try {
      const res = await fetch(`/api/v1/plugins/${pluginId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return res.json();
    } catch {
      console.warn('[plugins.updatePluginConfig] API not available, using fallback');
      return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
    }
  } catch (error) {
    console.warn('[updatePluginConfig] Fallback:', error);
    return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
  }
}

export async function getPluginLogs(pluginId: string): Promise<PluginLog[]> {
  try {
    if (isMock()) {
      const { mockGetPluginLogs } = await import('@/lib/mocks/plugins.mock');
      return mockGetPluginLogs(pluginId);
    }
    try {
      const res = await fetch(`/api/v1/plugins/${pluginId}/logs`);
      return res.json();
    } catch {
      console.warn('[plugins.getPluginLogs] API not available, using mock fallback');
      const { mockGetPluginLogs } = await import('@/lib/mocks/plugins.mock');
      return mockGetPluginLogs(pluginId);
    }
  } catch (error) {
    console.warn('[getPluginLogs] Fallback:', error);
    return [];
  }
}
