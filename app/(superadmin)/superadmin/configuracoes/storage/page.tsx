'use client';

import { useState, useEffect, useCallback, type CSSProperties, type FormEvent } from 'react';
import {
  HardDrive,
  PlayCircle,
  Video,
  FolderOpen,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Unplug,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/lib/hooks/useToast';
import {
  getStorageConfig,
  updateStorageConfig,
  testConnection,
  getStorageStats,
  configureYouTube,
  configureVimeo,
  configureGoogleDrive,
  configureS3,
  disconnectProvider,
} from '@/lib/api/video-storage.service';
import type {
  StorageConfig,
  StorageProvider,
  ConnectionTestResult,
  StorageStats,
} from '@/lib/api/video-storage.service';

// ── Constants ───────────────────────────────────────────────────────────

type LucideIcon = typeof HardDrive;

interface ProviderInfo {
  key: StorageProvider;
  name: string;
  icon: LucideIcon;
  description: string;
  pros: string[];
  cons: string[];
}

const PROVIDERS: ProviderInfo[] = [
  {
    key: 'supabase',
    name: 'Supabase Storage',
    icon: HardDrive,
    description: 'Videos ficam no servidor do BlackBelt',
    pros: ['Simples sem config extra', 'Controle total de acesso (RLS)'],
    cons: ['Custo ~R$0.02/GB/mes', 'Limite depende do plano'],
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: PlayCircle,
    description: 'Videos sobem pro seu canal do YouTube',
    pros: ['Storage ilimitado gratuito', 'Player profissional'],
    cons: ['Videos ficam publicos ou nao-listados', 'Precisa de conta Google + API key'],
  },
  {
    key: 'vimeo',
    name: 'Vimeo',
    icon: Video,
    description: 'Videos sobem pro seu Vimeo',
    pros: ['Sem anuncios sem recomendacoes', 'Player customizavel'],
    cons: ['Plano pago necessario', 'Precisa de Vimeo API token'],
  },
  {
    key: 'google_drive',
    name: 'Google Drive',
    icon: FolderOpen,
    description: 'Videos sobem pra sua pasta no Drive',
    pros: ['15GB gratis ou mais com Workspace'],
    cons: ['Sharing precisa ser configurado', 'Precisa de Google Drive API'],
  },
  {
    key: 's3',
    name: 'AWS S3 / Cloudflare R2',
    icon: Cloud,
    description: 'Para quem quer controle total',
    pros: ['Custo baixo em escala'],
    cons: ['Configuracao tecnica'],
  },
];

const PROVIDER_LABELS: Record<StorageProvider, string> = {
  supabase: 'Supabase Storage',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  google_drive: 'Google Drive',
  s3: 'AWS S3 / Cloudflare R2',
};

const inputStyle: CSSProperties = {
  background: 'var(--bb-depth-2)',
  color: 'var(--bb-ink-100)',
  border: '1px solid var(--bb-glass-border)',
};

// ── Helper: is provider configured ──────────────────────────────────

function isProviderConfigured(config: StorageConfig, provider: StorageProvider): boolean {
  if (provider === 'supabase') return true;
  if (provider === 'youtube') return config.youtube !== null;
  if (provider === 'vimeo') return config.vimeo !== null;
  if (provider === 'google_drive') return config.google_drive !== null;
  if (provider === 's3') return config.s3 !== null;
  return false;
}

// ── Page ────────────────────────────────────────────────────────────────

export default function StorageConfigPage() {
  const { toast } = useToast();

  // ── State ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<StorageProvider>('supabase');
  const [activeModal, setActiveModal] = useState<StorageProvider | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<StorageProvider | null>(null);

  // ── YouTube form state ────────────────────────────────────────────────
  const [ytChannelId, setYtChannelId] = useState('');
  const [ytChannelName, setYtChannelName] = useState('');
  const [ytVisibility, setYtVisibility] = useState<'unlisted' | 'private' | 'public'>('unlisted');
  const [ytPlaylistByAcademy, setYtPlaylistByAcademy] = useState(true);
  const [ytPlaylistByModality, setYtPlaylistByModality] = useState(false);
  const [ytGoogleConnected, setYtGoogleConnected] = useState(false);

  // ── Vimeo form state ──────────────────────────────────────────────────
  const [vimeoToken, setVimeoToken] = useState('');
  const [vimeoShowToken, setVimeoShowToken] = useState(false);
  const [vimeoFolderName, setVimeoFolderName] = useState('BlackBelt Videos');
  const [vimeoPrivacy, setVimeoPrivacy] = useState<'anybody' | 'nobody' | 'disable'>('disable');

  // ── Google Drive form state ───────────────────────────────────────────
  const [gdConnected, setGdConnected] = useState(false);
  const [gdFolderName, setGdFolderName] = useState('BlackBelt Aulas');
  const [gdSubfolderByAcademy, setGdSubfolderByAcademy] = useState(true);
  const [gdSubfolderByModality, setGdSubfolderByModality] = useState(true);
  const [gdShareWithLink, setGdShareWithLink] = useState(false);

  // ── S3 form state ────────────────────────────────────────────────────
  const [s3Endpoint, setS3Endpoint] = useState('');
  const [s3AccessKeyId, setS3AccessKeyId] = useState('');
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState('');
  const [s3ShowSecret, setS3ShowSecret] = useState(false);
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Region, setS3Region] = useState('');
  const [s3CustomDomain, setS3CustomDomain] = useState('');

  // ── Load data ─────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [configData, statsData] = await Promise.all([
        getStorageConfig(),
        getStorageStats(),
      ]);
      setConfig(configData);
      setStats(statsData);
      setSelectedProvider(configData.provider);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Helpers ───────────────────────────────────────────────────────────

  function populateYouTubeForm(cfg: StorageConfig) {
    if (cfg.youtube) {
      setYtChannelId(cfg.youtube.channel_id);
      setYtChannelName(cfg.youtube.channel_name);
      setYtVisibility(cfg.youtube.visibility);
      setYtPlaylistByAcademy(cfg.youtube.playlist_by_academy);
      setYtPlaylistByModality(cfg.youtube.playlist_by_modality);
      setYtGoogleConnected(true);
    } else {
      setYtChannelId('');
      setYtChannelName('');
      setYtVisibility('unlisted');
      setYtPlaylistByAcademy(true);
      setYtPlaylistByModality(false);
      setYtGoogleConnected(false);
    }
  }

  function populateVimeoForm(cfg: StorageConfig) {
    if (cfg.vimeo) {
      setVimeoToken(cfg.vimeo.api_token);
      setVimeoFolderName(cfg.vimeo.folder_name);
      setVimeoPrivacy(cfg.vimeo.privacy);
    } else {
      setVimeoToken('');
      setVimeoFolderName('BlackBelt Videos');
      setVimeoPrivacy('disable');
    }
    setVimeoShowToken(false);
  }

  function populateGoogleDriveForm(cfg: StorageConfig) {
    if (cfg.google_drive) {
      setGdConnected(true);
      setGdFolderName(cfg.google_drive.folder_name);
      setGdSubfolderByAcademy(cfg.google_drive.subfolder_by_academy);
      setGdSubfolderByModality(cfg.google_drive.subfolder_by_modality);
      setGdShareWithLink(cfg.google_drive.share_with_link);
    } else {
      setGdConnected(false);
      setGdFolderName('BlackBelt Aulas');
      setGdSubfolderByAcademy(true);
      setGdSubfolderByModality(true);
      setGdShareWithLink(false);
    }
  }

  function populateS3Form(cfg: StorageConfig) {
    if (cfg.s3) {
      setS3Endpoint(cfg.s3.endpoint);
      setS3AccessKeyId(cfg.s3.access_key_id);
      setS3SecretAccessKey(cfg.s3.secret_access_key);
      setS3Bucket(cfg.s3.bucket);
      setS3Region(cfg.s3.region);
      setS3CustomDomain(cfg.s3.custom_domain ?? '');
    } else {
      setS3Endpoint('');
      setS3AccessKeyId('');
      setS3SecretAccessKey('');
      setS3Bucket('');
      setS3Region('');
      setS3CustomDomain('');
    }
    setS3ShowSecret(false);
  }

  function openModal(provider: StorageProvider) {
    if (!config) return;
    setConnectionTest(null);

    if (provider === 'youtube') populateYouTubeForm(config);
    if (provider === 'vimeo') populateVimeoForm(config);
    if (provider === 'google_drive') populateGoogleDriveForm(config);
    if (provider === 's3') populateS3Form(config);

    setActiveModal(provider);
  }

  function closeModal() {
    setActiveModal(null);
    setConnectionTest(null);
  }

  // ── Actions ───────────────────────────────────────────────────────────

  async function handleSelectProvider(provider: StorageProvider) {
    if (!config) return;
    if (!isProviderConfigured(config, provider)) {
      openModal(provider);
      return;
    }

    setSelectedProvider(provider);
    setSubmitting(true);
    try {
      const updated = await updateStorageConfig({ provider });
      setConfig(updated);
      setSelectedProvider(updated.provider);
      toast(`Provider alterado para ${PROVIDER_LABELS[provider]}`, 'success');
      // Reload stats for new provider
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      toast('Erro ao alterar provider.', 'error');
      setSelectedProvider(config.provider);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTestConnection(provider: StorageProvider) {
    setTestingConnection(true);
    setConnectionTest(null);
    try {
      const result = await testConnection(provider);
      setConnectionTest(result);
    } catch {
      setConnectionTest({ connected: false, details: 'Erro ao testar conexao.', provider_info: null });
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleDisconnect(provider: StorageProvider) {
    setSubmitting(true);
    try {
      const updated = await disconnectProvider(provider);
      setConfig(updated);
      setSelectedProvider(updated.provider);
      setConfirmDisconnect(null);
      toast(`${PROVIDER_LABELS[provider]} desconectado.`, 'success');
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      toast('Erro ao desconectar provider.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Save YouTube ──────────────────────────────────────────────────────

  async function handleSaveYouTube(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await configureYouTube('mock-oauth-code');
      setConfig(updated);
      setSelectedProvider(updated.provider);
      closeModal();
      toast('YouTube configurado com sucesso!', 'success');
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      toast('Erro ao configurar YouTube.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Save Vimeo ────────────────────────────────────────────────────────

  async function handleSaveVimeo(e: FormEvent) {
    e.preventDefault();
    if (!vimeoToken.trim()) {
      toast('API Token e obrigatorio.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await configureVimeo(vimeoToken);
      setConfig(updated);
      setSelectedProvider(updated.provider);
      closeModal();
      toast('Vimeo configurado com sucesso!', 'success');
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      toast('Erro ao configurar Vimeo.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Save Google Drive ─────────────────────────────────────────────────

  async function handleSaveGoogleDrive(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await configureGoogleDrive('mock-oauth-code');
      setConfig(updated);
      setSelectedProvider(updated.provider);
      closeModal();
      toast('Google Drive configurado com sucesso!', 'success');
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      toast('Erro ao configurar Google Drive.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Save S3 ───────────────────────────────────────────────────────────

  async function handleSaveS3(e: FormEvent) {
    e.preventDefault();
    if (!s3Endpoint.trim() || !s3AccessKeyId.trim() || !s3SecretAccessKey.trim() || !s3Bucket.trim() || !s3Region.trim()) {
      toast('Preencha todos os campos obrigatorios.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await configureS3({
        endpoint: s3Endpoint,
        access_key_id: s3AccessKeyId,
        secret_access_key: s3SecretAccessKey,
        bucket: s3Bucket,
        region: s3Region,
        custom_domain: s3CustomDomain || undefined,
      });
      setConfig(updated);
      setSelectedProvider(updated.provider);
      closeModal();
      toast('S3/R2 configurado com sucesso!', 'success');
      const newStats = await getStorageStats();
      setStats(newStats);
    } catch {
      toast('Erro ao configurar S3/R2.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Provider status helper ────────────────────────────────────────────

  function getProviderStatus(provider: StorageProvider): 'active' | 'configured' | 'not_configured' {
    if (!config) return 'not_configured';
    const isConfigured = isProviderConfigured(config, provider);
    if (isConfigured && config.provider === provider) return 'active';
    if (isConfigured) return 'configured';
    return 'not_configured';
  }

  // ── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <PageHeader
        title="Configuracao de Armazenamento"
        subtitle="Escolha onde os videos de todas as academias ficam armazenados"
      />

      {/* Stats Card */}
      {stats && (
        <Card>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Provider ativo
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {PROVIDER_LABELS[stats.provider]}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Total de videos
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {stats.videos_count}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Tamanho total
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {stats.total_size_display}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Custo estimado
              </p>
              <p className="mt-1 text-sm font-bold" style={{ color: '#22c55e' }}>
                R$ {stats.cost_estimate_brl.toFixed(2)}/mes
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Provider Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS.map((provider) => {
          const status = getProviderStatus(provider.key);
          const isSelected = selectedProvider === provider.key;
          const Icon = provider.icon;

          return (
            <Card
              key={provider.key}
              interactive
              className="relative"
              style={{
                borderColor: isSelected ? 'var(--bb-brand)' : undefined,
                borderWidth: isSelected ? '2px' : undefined,
              }}
              onClick={() => handleSelectProvider(provider.key)}
            >
              {/* Radio + Icon + Name */}
              <div className="flex items-start gap-3">
                {/* Radio */}
                <div
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
                  }}
                >
                  {isSelected && (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: 'var(--bb-brand-gradient)' }}
                    />
                  )}
                </div>

                {/* Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--bb-depth-4)' }}
                >
                  <Icon size={20} style={{ color: 'var(--bb-ink-60)' }} />
                </div>

                {/* Name + Description */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {provider.name}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {provider.description}
                  </p>
                </div>
              </div>

              {/* Pros */}
              <div className="mt-3 space-y-1">
                {provider.pros.map((pro) => (
                  <div key={pro} className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                    <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{pro}</span>
                  </div>
                ))}
              </div>

              {/* Cons */}
              <div className="mt-2 space-y-1">
                {provider.cons.map((con) => (
                  <div key={con} className="flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0 text-yellow-500" />
                    <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{con}</span>
                  </div>
                ))}
              </div>

              {/* Status Badge + Actions */}
              <div className="mt-3 flex items-center justify-between">
                {status === 'active' && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                  >
                    <CheckCircle2 size={12} /> Ativo
                  </span>
                )}
                {status === 'configured' && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
                  >
                    Configurado
                  </span>
                )}
                {status === 'not_configured' && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-40)' }}
                  >
                    Nao configurado
                  </span>
                )}

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {status === 'not_configured' && provider.key !== 'supabase' && (
                    <button
                      onClick={() => openModal(provider.key)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)',
                      }}
                    >
                      Configurar
                    </button>
                  )}
                  {(status === 'configured' || status === 'active') && provider.key !== 'supabase' && (
                    <>
                      <button
                        onClick={() => openModal(provider.key)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: 'var(--bb-depth-4)',
                          color: 'var(--bb-ink-60)',
                          border: '1px solid var(--bb-glass-border)',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDisconnect(provider.key)}
                        className="rounded-lg p-1.5 transition-colors"
                        style={{ color: 'var(--bb-ink-40)' }}
                        title="Desconectar"
                      >
                        <Unplug size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ─── YouTube Modal ─────────────────────────────────────────────── */}
      {activeModal === 'youtube' && (
        <ModalOverlay onClose={closeModal} title="Configurar YouTube">
          <form onSubmit={handleSaveYouTube} className="space-y-4">
            {/* Step 1: Connect Google */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                1. Conectar conta Google
              </label>
              {ytGoogleConnected ? (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
                >
                  <CheckCircle2 size={16} />
                  Conta Google conectada
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setYtGoogleConnected(true)}
                >
                  Conectar Google
                </Button>
              )}
            </div>

            {/* Step 2: Channel */}
            {ytGoogleConnected && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    2. Canal do YouTube
                  </label>
                  <input
                    type="text"
                    value={ytChannelName}
                    onChange={(e) => setYtChannelName(e.target.value)}
                    placeholder="Nome do canal"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={ytChannelId}
                    onChange={(e) => setYtChannelId(e.target.value)}
                    placeholder="Channel ID (ex: UC...)"
                    className="mt-2 w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>

                {/* Step 3: Visibility */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    3. Visibilidade dos videos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['unlisted', 'private', 'public'] as const).map((v) => {
                      const labels: Record<string, string> = {
                        unlisted: 'Nao-listado',
                        private: 'Privado',
                        public: 'Publico',
                      };
                      return (
                        <label
                          key={v}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
                          style={{
                            background: ytVisibility === v ? 'rgba(245,158,11,0.12)' : 'var(--bb-depth-4)',
                            color: ytVisibility === v ? '#f59e0b' : 'var(--bb-ink-60)',
                            border: `1px solid ${ytVisibility === v ? '#f59e0b' : 'var(--bb-glass-border)'}`,
                          }}
                        >
                          <input
                            type="radio"
                            name="ytVisibility"
                            checked={ytVisibility === v}
                            onChange={() => setYtVisibility(v)}
                            className="hidden"
                          />
                          {labels[v]}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Auto-playlists */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    4. Auto-playlists
                  </label>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      <input
                        type="checkbox"
                        checked={ytPlaylistByAcademy}
                        onChange={(e) => setYtPlaylistByAcademy(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Playlist por academia
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      <input
                        type="checkbox"
                        checked={ytPlaylistByModality}
                        onChange={(e) => setYtPlaylistByModality(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Playlist por modalidade
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Connection Test */}
            <ConnectionTestSection
              provider="youtube"
              testResult={connectionTest}
              testing={testingConnection}
              onTest={() => handleTestConnection('youtube')}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={submitting}
                disabled={!ytGoogleConnected}
                style={{ background: '#f59e0b', color: '#fff' }}
              >
                Salvar
              </Button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ─── Vimeo Modal ───────────────────────────────────────────────── */}
      {activeModal === 'vimeo' && (
        <ModalOverlay onClose={closeModal} title="Configurar Vimeo">
          <form onSubmit={handleSaveVimeo} className="space-y-4">
            {/* API Token */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Vimeo API Token *
              </label>
              <div className="relative">
                <input
                  type={vimeoShowToken ? 'text' : 'password'}
                  value={vimeoToken}
                  onChange={(e) => setVimeoToken(e.target.value)}
                  placeholder="Cole seu Vimeo API token aqui"
                  className="w-full rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setVimeoShowToken(!vimeoShowToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  {vimeoShowToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Folder Name */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Nome da pasta
              </label>
              <input
                type="text"
                value={vimeoFolderName}
                onChange={(e) => setVimeoFolderName(e.target.value)}
                placeholder="BlackBelt Videos"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Privacidade
              </label>
              <select
                value={vimeoPrivacy}
                onChange={(e) => setVimeoPrivacy(e.target.value as 'anybody' | 'nobody' | 'disable')}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="disable">Desabilitado (so via embed)</option>
                <option value="anybody">Qualquer pessoa</option>
                <option value="nobody">Ninguem</option>
              </select>
            </div>

            {/* Connection Test */}
            <ConnectionTestSection
              provider="vimeo"
              testResult={connectionTest}
              testing={testingConnection}
              onTest={() => handleTestConnection('vimeo')}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={submitting}
                disabled={!vimeoToken.trim()}
                style={{ background: '#f59e0b', color: '#fff' }}
              >
                Salvar
              </Button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ─── Google Drive Modal ────────────────────────────────────────── */}
      {activeModal === 'google_drive' && (
        <ModalOverlay onClose={closeModal} title="Configurar Google Drive">
          <form onSubmit={handleSaveGoogleDrive} className="space-y-4">
            {/* Connect Google */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Conta Google
              </label>
              {gdConnected ? (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
                >
                  <CheckCircle2 size={16} />
                  Conta Google conectada
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setGdConnected(true)}
                >
                  Conectar Google
                </Button>
              )}
            </div>

            {gdConnected && (
              <>
                {/* Folder Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    Nome da pasta
                  </label>
                  <input
                    type="text"
                    value={gdFolderName}
                    onChange={(e) => setGdFolderName(e.target.value)}
                    placeholder="BlackBelt Aulas"
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>

                {/* Subfolder options */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    Subpastas
                  </label>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      <input
                        type="checkbox"
                        checked={gdSubfolderByAcademy}
                        onChange={(e) => setGdSubfolderByAcademy(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Subpasta por academia
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                      <input
                        type="checkbox"
                        checked={gdSubfolderByModality}
                        onChange={(e) => setGdSubfolderByModality(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Subpasta por modalidade
                    </label>
                  </div>
                </div>

                {/* Share with link */}
                <div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    <input
                      type="checkbox"
                      checked={gdShareWithLink}
                      onChange={(e) => setGdShareWithLink(e.target.checked)}
                      className="accent-amber-500"
                    />
                    Compartilhar com link (quem tiver o link pode ver)
                  </label>
                </div>
              </>
            )}

            {/* Connection Test */}
            <ConnectionTestSection
              provider="google_drive"
              testResult={connectionTest}
              testing={testingConnection}
              onTest={() => handleTestConnection('google_drive')}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={submitting}
                disabled={!gdConnected}
                style={{ background: '#f59e0b', color: '#fff' }}
              >
                Salvar
              </Button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ─── S3/R2 Modal ───────────────────────────────────────────────── */}
      {activeModal === 's3' && (
        <ModalOverlay onClose={closeModal} title="Configurar AWS S3 / Cloudflare R2">
          <form onSubmit={handleSaveS3} className="space-y-4">
            {/* Endpoint */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Endpoint *
              </label>
              <input
                type="text"
                value={s3Endpoint}
                onChange={(e) => setS3Endpoint(e.target.value)}
                placeholder="https://s3.amazonaws.com ou https://xxx.r2.cloudflarestorage.com"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Access Key ID */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Access Key ID *
              </label>
              <input
                type="text"
                value={s3AccessKeyId}
                onChange={(e) => setS3AccessKeyId(e.target.value)}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Secret Access Key */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Secret Access Key *
              </label>
              <div className="relative">
                <input
                  type={s3ShowSecret ? 'text' : 'password'}
                  value={s3SecretAccessKey}
                  onChange={(e) => setS3SecretAccessKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setS3ShowSecret(!s3ShowSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  {s3ShowSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bucket */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Bucket *
              </label>
              <input
                type="text"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                placeholder="blackbelt-videos"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Region */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Region *
              </label>
              <input
                type="text"
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                placeholder="sa-east-1"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Custom Domain */}
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                Custom domain (opcional)
              </label>
              <input
                type="text"
                value={s3CustomDomain}
                onChange={(e) => setS3CustomDomain(e.target.value)}
                placeholder="https://cdn.minhaacademia.com.br"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Connection Test */}
            <ConnectionTestSection
              provider="s3"
              testResult={connectionTest}
              testing={testingConnection}
              onTest={() => handleTestConnection('s3')}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={submitting}
                disabled={!s3Endpoint.trim() || !s3AccessKeyId.trim() || !s3SecretAccessKey.trim() || !s3Bucket.trim() || !s3Region.trim()}
                style={{ background: '#f59e0b', color: '#fff' }}
              >
                Salvar
              </Button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ─── Disconnect Confirmation ───────────────────────────────────── */}
      {confirmDisconnect && (
        <ModalOverlay
          onClose={() => setConfirmDisconnect(null)}
          title={`Desconectar ${PROVIDER_LABELS[confirmDisconnect]}?`}
          small
        >
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja desconectar{' '}
            <strong style={{ color: 'var(--bb-ink-100)' }}>
              {PROVIDER_LABELS[confirmDisconnect]}
            </strong>
            ? Se este for o provider ativo, o sistema voltara para Supabase Storage.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmDisconnect(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={submitting}
              onClick={() => handleDisconnect(confirmDisconnect)}
            >
              Desconectar
            </Button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Modal Overlay Component ─────────────────────────────────────────────

interface ModalOverlayProps {
  onClose: () => void;
  title: string;
  small?: boolean;
  children: React.ReactNode;
}

function ModalOverlay({ onClose, title, small, children }: ModalOverlayProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-50 w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6 ${
          small ? 'sm:max-w-md' : 'sm:max-w-lg'
        }`}
        style={{
          backgroundColor: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-xl)',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: 'var(--bb-shadow-xl)',
        }}
      >
        {/* Responsive: round all corners on sm+ */}
        <style>{`
          @media (min-width: 640px) {
            [role="dialog"] {
              border-bottom-left-radius: var(--bb-radius-xl) !important;
              border-bottom-right-radius: var(--bb-radius-xl) !important;
            }
          }
        `}</style>
        {/* Title bar */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Connection Test Section ─────────────────────────────────────────────

interface ConnectionTestSectionProps {
  provider: StorageProvider;
  testResult: ConnectionTestResult | null;
  testing: boolean;
  onTest: () => void;
}

function ConnectionTestSection({ testResult, testing, onTest }: ConnectionTestSectionProps) {
  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={testing}
        onClick={onTest}
      >
        Testar conexao
      </Button>
      {testResult && (
        <div
          className="mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
          style={{
            background: testResult.connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: testResult.connected ? '#22c55e' : '#ef4444',
          }}
        >
          {testResult.connected ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <span>{testResult.details}</span>
        </div>
      )}
    </div>
  );
}
