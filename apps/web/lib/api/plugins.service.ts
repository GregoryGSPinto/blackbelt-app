import { isMock } from '@/lib/env';
import type { Plugin, PluginLog } from '@/lib/types/plugins';
import { logServiceError } from '@/lib/api/errors';

export async function listPlugins(): Promise<Plugin[]> {
  try {
    if (isMock()) {
      const { mockListPlugins } = await import('@/lib/mocks/plugins.mock');
      return mockListPlugins();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get the user's academy to check installed plugins
    const { data: { user } } = await supabase.auth.getUser();
    let installed: string[] = [];

    if (user) {
      const { data: membership } = await supabase
        .from('memberships')
        .select('academy_id')
        .eq('profile_id', user.id)
        .limit(1)
        .single();

      if (membership) {
        const { data: settingsRow } = await supabase
          .from('academy_settings')
          .select('settings')
          .eq('academy_id', membership.academy_id)
          .single();

        const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
        installed = (settings.installed_plugins ?? []) as string[];
      }
    }

    // Return catalog — for now an empty list; installed status from DB
    // The catalog can be expanded later
    return installed.map((id) => ({
      id,
      name: id,
      description: '',
      version: '1.0.0',
      author: '',
      enabled: true,
      installed: true,
      config: {},
    })) as unknown as Plugin[];
  } catch (error) {
    logServiceError(error, 'plugins');
    return [];
  }
}

export async function getPlugin(pluginId: string): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockGetPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockGetPlugin(pluginId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: pluginId, name: pluginId, description: '', version: '', author: '', enabled: false, installed: false, config: {} } as unknown as Plugin;

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single();

    if (!membership) return { id: pluginId, name: pluginId, description: '', version: '', author: '', enabled: false, installed: false, config: {} } as unknown as Plugin;

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const installed = (settings.installed_plugins ?? []) as string[];
    const configs = (settings.plugin_configs ?? {}) as Record<string, Record<string, unknown>>;

    return {
      id: pluginId,
      name: pluginId,
      description: '',
      version: '1.0.0',
      author: '',
      enabled: installed.includes(pluginId),
      installed: installed.includes(pluginId),
      config: configs[pluginId] ?? {},
    } as unknown as Plugin;
  } catch (error) {
    logServiceError(error, 'plugins');
    return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
  }
}

export async function installPlugin(pluginId: string): Promise<Plugin> {
  try {
    if (isMock()) {
      const { mockInstallPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockInstallPlugin(pluginId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: pluginId, name: pluginId, description: '', version: '', author: '', enabled: false, installed: false, config: {} } as unknown as Plugin;

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single();

    if (!membership) return { id: pluginId, name: pluginId, description: '', version: '', author: '', enabled: false, installed: false, config: {} } as unknown as Plugin;

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const installed = (settings.installed_plugins ?? []) as string[];

    if (!installed.includes(pluginId)) {
      installed.push(pluginId);
    }

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: membership.academy_id, settings: { ...settings, installed_plugins: installed }, updated_at: new Date().toISOString() },
      { onConflict: 'academy_id' },
    );

    if (error) {
      logServiceError(error, 'plugins');
    }

    return { id: pluginId, name: pluginId, description: '', version: '1.0.0', author: '', enabled: true, installed: true, config: {} } as unknown as Plugin;
  } catch (error) {
    logServiceError(error, 'plugins');
    return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
  }
}

export async function uninstallPlugin(pluginId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUninstallPlugin } = await import('@/lib/mocks/plugins.mock');
      return mockUninstallPlugin(pluginId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single();

    if (!membership) return;

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const installed = ((settings.installed_plugins ?? []) as string[]).filter((id) => id !== pluginId);

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: membership.academy_id, settings: { ...settings, installed_plugins: installed }, updated_at: new Date().toISOString() },
      { onConflict: 'academy_id' },
    );

    if (error) {
      logServiceError(error, 'plugins');
    }
  } catch (error) {
    logServiceError(error, 'plugins');
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: pluginId, name: pluginId, description: '', version: '', author: '', enabled: false, installed: false, config } as unknown as Plugin;

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single();

    if (!membership) return { id: pluginId, name: pluginId, description: '', version: '', author: '', enabled: false, installed: false, config } as unknown as Plugin;

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const configs = (settings.plugin_configs ?? {}) as Record<string, Record<string, unknown>>;
    configs[pluginId] = config;

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: membership.academy_id, settings: { ...settings, plugin_configs: configs }, updated_at: new Date().toISOString() },
      { onConflict: 'academy_id' },
    );

    if (error) {
      logServiceError(error, 'plugins');
    }

    return { id: pluginId, name: pluginId, description: '', version: '1.0.0', author: '', enabled: true, installed: true, config } as unknown as Plugin;
  } catch (error) {
    logServiceError(error, 'plugins');
    return { id: "", name: "", description: "", version: "", author: "", enabled: false, installed: false, config: {} } as unknown as Plugin;
  }
}

export async function getPluginLogs(pluginId: string): Promise<PluginLog[]> {
  try {
    if (isMock()) {
      const { mockGetPluginLogs } = await import('@/lib/mocks/plugins.mock');
      return mockGetPluginLogs(pluginId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single();

    if (!membership) return [];

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const allLogs = (settings.plugin_logs ?? {}) as Record<string, PluginLog[]>;
    return allLogs[pluginId] ?? [];
  } catch (error) {
    logServiceError(error, 'plugins');
    return [];
  }
}
