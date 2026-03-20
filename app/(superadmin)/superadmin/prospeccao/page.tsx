'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Search, X, ChevronDown, ChevronRight, ExternalLink,
  Phone, Globe, Instagram, Mail, Copy, Check, Star,
  MapPin, Clock, MessageCircle, ArrowRight, Download,
  Target, TrendingUp, Users, DollarSign, Timer,
  Shield, AlertTriangle, Lightbulb, Eye,
  Bot, RefreshCw, Loader2, Wand2, Navigation,
} from 'lucide-react';
import {
  getProspects,
  getProspeccaoDashboard,
  updateStatus,
  exportarCSV,
  buscarAcademias,
  regenerarMensagem,
  type AcademiaProspectada,
  type ProspeccaoDashboard,
  type ResultadoBusca,
} from '@/lib/api/prospeccao.service';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

/* ---------- Recharts dynamic imports ---------- */
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

/* ---------- Types ---------- */
type MainTab = 'buscar' | 'pipeline' | 'mapa' | 'analytics';
type DetailTab = 'perfil' | 'analise' | 'reviews' | 'abordagem' | 'crm';
type SortKey = 'score' | 'rating' | 'name';

/* ---------- Constants ---------- */
const MAIN_TABS: { key: MainTab; label: string; icon: typeof Search }[] = [
  { key: 'buscar', label: 'Buscar', icon: Search },
  { key: 'pipeline', label: 'Pipeline', icon: Target },
  { key: 'mapa', label: 'Mapa', icon: MapPin },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp },
];

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'perfil', label: 'Perfil' },
  { key: 'analise', label: 'Analise' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'abordagem', label: 'Abordagem' },
  { key: 'crm', label: 'CRM' },
];

const PIPELINE_COLUMNS = [
  { key: 'novo', label: 'Novo', color: '#3b82f6' },
  { key: 'contactado', label: 'Contactado', color: '#8b5cf6' },
  { key: 'interessado', label: 'Interessado', color: '#f59e0b' },
  { key: 'demoAgendada', label: 'Demo', color: '#f97316' },
  { key: 'negociando', label: 'Negociando', color: '#ec4899' },
  { key: 'fechado', label: 'Fechado', color: '#10b981' },
  { key: 'perdido', label: 'Perdido', color: '#6b7280' },
] as const;

const NEXT_STATUS: Record<string, string> = {
  novo: 'contactado',
  contactado: 'interessado',
  interessado: 'demoAgendada',
  demoAgendada: 'negociando',
  negociando: 'fechado',
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  quente: '#ef4444',
  morno: '#f59e0b',
  frio: '#3b82f6',
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  quente: 'Quente',
  morno: 'Morno',
  frio: 'Frio',
};

const MODALIDADES = [
  'Jiu-Jitsu',
  'Muay Thai',
  'Boxe',
  'Karate',
  'Taekwondo',
  'Judo',
  'MMA',
  'Capoeira',
  'Kung Fu',
  'Krav Maga',
];

const CHART_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const cardStyle: React.CSSProperties = {
  background: 'var(--bb-depth-3)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono, monospace)',
  textTransform: 'uppercase' as const,
  fontSize: '11px',
  letterSpacing: '0.08em',
  color: 'var(--bb-ink-40)',
};

const tooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

/* ---------- Helpers ---------- */
function scoreColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#3b82f6';
}

function scoreBg(score: number): string {
  if (score >= 70) return 'rgba(16,185,129,0.15)';
  if (score >= 50) return 'rgba(245,158,11,0.15)';
  return 'rgba(59,130,246,0.15)';
}

function classificationBg(c: string): string {
  const color = CLASSIFICATION_COLORS[c] ?? '#6b7280';
  return color.replace('#', 'rgba(') === color
    ? 'rgba(107,114,128,0.15)'
    : `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},0.15)`;
}

function renderStars(rating: number, size = 14): React.ReactNode {
  const stars: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        size={size}
        fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'}
        stroke={i <= Math.round(rating) ? '#f59e0b' : 'var(--bb-ink-40)'}
      />,
    );
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, '');
  const num = clean.startsWith('55') ? clean : `55${clean}`;
  const base = `https://wa.me/${num}`;
  if (message) return `${base}?text=${encodeURIComponent(message)}`;
  return base;
}

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* =================================================================
   MAIN PAGE COMPONENT
   ================================================================= */
export default function ProspeccaoPage() {
  const { toast } = useToast();

  /* ---- State ---- */
  const [activeTab, setActiveTab] = useState<MainTab>('buscar');
  const [loading, setLoading] = useState(true);
  const [allProspects, setAllProspects] = useState<AcademiaProspectada[]>([]);
  const [dashboard, setDashboard] = useState<ProspeccaoDashboard | null>(null);

  // Buscar tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalidade, setFilterModalidade] = useState('');
  const [filterClassificacao, setFilterClassificacao] = useState('');

  // Enhanced search
  const [searchCidade, setSearchCidade] = useState('');
  const [searchBairro, setSearchBairro] = useState('');
  const [searchRaio, setSearchRaio] = useState(10);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPhase, setSearchPhase] = useState('');
  const [searchResults, setSearchResults] = useState<ResultadoBusca | null>(null);
  const [searchFromCache, setSearchFromCache] = useState(false);
  const [searchCacheAge, setSearchCacheAge] = useState('');

  // Regenerate modal
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenProspectId, setRegenProspectId] = useState('');
  const [regenCanal, setRegenCanal] = useState('whatsapp');
  const [regenContexto, setRegenContexto] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenResult, setRegenResult] = useState('');
  const [filterNotaMin, setFilterNotaMin] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('score');

  // Detail modal
  const [selectedAcademia, setSelectedAcademia] = useState<AcademiaProspectada | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('perfil');
  const [copiedField, setCopiedField] = useState('');

  // Pipeline
  const [pipelineProspects, setPipelineProspects] = useState<AcademiaProspectada[]>([]);

  // Mapa
  const [expandedBairro, setExpandedBairro] = useState<string | null>(null);

  /* ---- Load data ---- */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prospectsData, dashboardData] = await Promise.all([
        getProspects(),
        getProspeccaoDashboard(),
      ]);
      setAllProspects(prospectsData);
      setPipelineProspects(prospectsData);
      setDashboard(dashboardData);
    } catch (err) {
      console.error('Error loading prospeccao data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---- Filtered/sorted results for Buscar tab ---- */
  const filteredResults = useMemo(() => {
    let results = [...allProspects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (a) =>
          a.nome.toLowerCase().includes(q) ||
          a.endereco.toLowerCase().includes(q) ||
          a.bairro.toLowerCase().includes(q) ||
          a.modalidades.some((m) => m.toLowerCase().includes(q)),
      );
    }

    if (filterModalidade) {
      results = results.filter((a) =>
        a.modalidades.some((m) => m.toLowerCase().includes(filterModalidade.toLowerCase())),
      );
    }

    if (filterClassificacao) {
      results = results.filter((a) => a.classificacao === filterClassificacao);
    }

    if (filterNotaMin) {
      const min = parseFloat(filterNotaMin);
      if (!isNaN(min)) {
        results = results.filter((a) => a.notaGoogle >= min);
      }
    }

    results.sort((a, b) => {
      if (sortBy === 'score') return b.score.geral - a.score.geral;
      if (sortBy === 'rating') return b.notaGoogle - a.notaGoogle;
      return a.nome.localeCompare(b.nome);
    });

    return results;
  }, [allProspects, searchQuery, filterModalidade, filterClassificacao, filterNotaMin, sortBy]);

  /* ---- Pipeline grouped ---- */
  const pipelineByStatus = useMemo(() => {
    const map: Record<string, AcademiaProspectada[]> = {};
    for (const col of PIPELINE_COLUMNS) {
      map[col.key] = [];
    }
    for (const p of pipelineProspects) {
      const status = p.crm.status || 'novo';
      if (map[status]) {
        map[status].push(p);
      } else {
        map.novo.push(p);
      }
    }
    return map;
  }, [pipelineProspects]);

  /* ---- Mapa grouped by bairro ---- */
  const bairroGroups = useMemo(() => {
    const map: Record<string, AcademiaProspectada[]> = {};
    for (const p of allProspects) {
      const key = p.bairro || 'Sem bairro';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return Object.entries(map)
      .map(([bairro, academias]) => ({
        bairro,
        academias,
        total: academias.length,
        quentes: academias.filter((a) => a.classificacao === 'quente').length,
        mornos: academias.filter((a) => a.classificacao === 'morno').length,
        frios: academias.filter((a) => a.classificacao === 'frio').length,
      }))
      .sort((a, b) => b.total - a.total);
  }, [allProspects]);

  /* ---- Actions ---- */
  async function handleMoveStatus(prospect: AcademiaProspectada, newStatus: string) {
    try {
      await updateStatus(prospect.id, newStatus);
      setPipelineProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id ? { ...p, crm: { ...p.crm, status: newStatus } } : p,
        ),
      );
      setAllProspects((prev) =>
        prev.map((p) =>
          p.id === prospect.id ? { ...p, crm: { ...p.crm, status: newStatus } } : p,
        ),
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  async function handleExportCSV() {
    try {
      const csv = await exportarCSV({
        classificacao: filterClassificacao as 'quente' | 'morno' | 'frio' | undefined || undefined,
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prospeccao_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  }

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  }

  /* ---- Enhanced Search ---- */
  async function handleEnhancedSearch(useGeo = false) {
    setSearchLoading(true);
    setSearchResults(null);
    setSearchFromCache(false);
    setSearchCacheAge('');

    try {
      if (useGeo && navigator.geolocation) {
        setSearchPhase('Obtendo localizacao...');
        // Geolocation is only used for UX feedback — the search API
        // doesn't currently accept lat/lng, so we pass cidade as empty
      }

      setSearchPhase('Buscando academias no Google...');
      await new Promise((r) => setTimeout(r, 800));

      setSearchPhase('Analisando com IA...');
      const result = await buscarAcademias({
        query: searchQuery || 'academias de artes marciais',
        cidade: searchCidade || undefined,
        bairro: searchBairro || undefined,
        raioKm: searchRaio,
      });

      setSearchPhase(`Pronto! ${result.total} academias encontradas`);
      setSearchResults(result);

      // Merge new results into allProspects (avoid duplicates)
      setAllProspects((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = result.academias.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newOnes];
      });

      toast(`${result.total} academias encontradas`, 'success');
    } catch (err) {
      console.error('Search error:', err);
      setSearchPhase('');
      toast(translateError(err), 'error');
    } finally {
      setSearchLoading(false);
      setTimeout(() => setSearchPhase(''), 3000);
    }
  }

  function handleWhatsAppClick(academia: AcademiaProspectada) {
    const telefoneClean = academia.telefone.replace(/\D/g, '');
    const mensagem = academia.abordagem.mensagemSugerida;
    const mensagemEncoded = encodeURIComponent(mensagem);
    const whatsappUrl = `https://wa.me/55${telefoneClean}?text=${mensagemEncoded}`;
    window.open(whatsappUrl, '_blank');
  }

  function handleInstagramClick(academia: AcademiaProspectada) {
    const handle = academia.instagram?.replace('@', '') || '';
    if (handle) {
      const mensagem = academia.abordagem.mensagemSugerida;
      navigator.clipboard.writeText(mensagem);
      window.open(`https://instagram.com/${handle}`, '_blank');
      toast('Mensagem copiada! Cole na DM.', 'success');
    }
  }

  function handleEmailCopy(academia: AcademiaProspectada) {
    const mensagem = academia.abordagem.mensagemSugerida;
    navigator.clipboard.writeText(mensagem);
    toast('Email copiado para a area de transferencia', 'success');
  }

  function openRegenModal(prospectId: string) {
    setRegenProspectId(prospectId);
    setRegenCanal('whatsapp');
    setRegenContexto('');
    setRegenResult('');
    setRegenModalOpen(true);
  }

  async function handleRegenerar() {
    setRegenLoading(true);
    try {
      const result = await regenerarMensagem(regenProspectId, regenCanal, regenContexto || undefined);
      setRegenResult(result);
      toast('Mensagem gerada com sucesso', 'success');
    } catch (err) {
      console.error('Regen error:', err);
      toast(translateError(err), 'error');
    } finally {
      setRegenLoading(false);
    }
  }

  function openDetail(academia: AcademiaProspectada) {
    setSelectedAcademia(academia);
    setDetailTab('perfil');
  }

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  /* =================================================================
     RENDER
     ================================================================= */
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Prospecção
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--bb-ink-60)' }}>
            Busque, analise e gerencie academias prospectadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-60)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bb-depth-3)'; }}
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--bb-brand, #f59e0b)',
              color: '#000',
            }}
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 overflow-x-auto pb-1 -mb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {MAIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                color: active ? '#f59e0b' : 'var(--bb-ink-60)',
                borderBottom: active ? '2px solid #f59e0b' : '2px solid transparent',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'buscar' && (
        <TabBuscar
          results={filteredResults}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterModalidade={filterModalidade}
          setFilterModalidade={setFilterModalidade}
          filterClassificacao={filterClassificacao}
          setFilterClassificacao={setFilterClassificacao}
          filterNotaMin={filterNotaMin}
          setFilterNotaMin={setFilterNotaMin}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenDetail={openDetail}
          onCopy={handleCopy}
          copiedField={copiedField}
          searchCidade={searchCidade}
          setSearchCidade={setSearchCidade}
          searchBairro={searchBairro}
          setSearchBairro={setSearchBairro}
          searchRaio={searchRaio}
          setSearchRaio={setSearchRaio}
          searchLoading={searchLoading}
          searchPhase={searchPhase}
          searchResults={searchResults}
          searchFromCache={searchFromCache}
          searchCacheAge={searchCacheAge}
          onEnhancedSearch={handleEnhancedSearch}
          onWhatsAppClick={handleWhatsAppClick}
          onInstagramClick={handleInstagramClick}
          onEmailCopy={handleEmailCopy}
          onOpenRegenModal={openRegenModal}
        />
      )}

      {activeTab === 'pipeline' && (
        <TabPipeline
          pipelineByStatus={pipelineByStatus}
          dashboard={dashboard}
          onOpenDetail={openDetail}
          onMoveStatus={handleMoveStatus}
        />
      )}

      {activeTab === 'mapa' && (
        <TabMapa
          bairroGroups={bairroGroups}
          expandedBairro={expandedBairro}
          setExpandedBairro={setExpandedBairro}
          allProspects={allProspects}
          onOpenDetail={openDetail}
        />
      )}

      {activeTab === 'analytics' && dashboard && (
        <TabAnalytics dashboard={dashboard} />
      )}

      {/* Detail Modal */}
      {selectedAcademia && (
        <DetailModal
          academia={selectedAcademia}
          detailTab={detailTab}
          setDetailTab={setDetailTab}
          onClose={() => setSelectedAcademia(null)}
          onCopy={handleCopy}
          copiedField={copiedField}
          onMoveStatus={handleMoveStatus}
        />
      )}

      {/* Regenerate Messages Modal */}
      {regenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Regenerar Mensagem</h3>
              <button onClick={() => setRegenModalOpen(false)} style={{ color: 'var(--bb-ink-40)' }}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>Canal</label>
                <select
                  value={regenCanal}
                  onChange={(e) => setRegenCanal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-transparent"
                  style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>Como quer a nova mensagem?</label>
                <input
                  type="text"
                  value={regenContexto}
                  onChange={(e) => setRegenContexto(e.target.value)}
                  placeholder="Ex: mais curta, mencione X..."
                  className="w-full px-3 py-2 rounded-lg text-sm bg-transparent"
                  style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
                />
              </div>
              <button
                onClick={handleRegenerar}
                disabled={regenLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'var(--bb-brand, #f59e0b)' }}
              >
                {regenLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {regenLoading ? 'Gerando...' : 'Gerar nova mensagem'}
              </button>
              {regenResult && (
                <div className="space-y-2">
                  <textarea
                    readOnly
                    value={regenResult}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
                  />
                  <button
                    onClick={() => handleCopy(regenResult, 'regen')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-80)' }}
                  >
                    {copiedField === 'regen' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'regen' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =================================================================
   TAB: BUSCAR
   ================================================================= */
interface TabBuscarProps {
  results: AcademiaProspectada[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterModalidade: string;
  setFilterModalidade: (v: string) => void;
  filterClassificacao: string;
  setFilterClassificacao: (v: string) => void;
  filterNotaMin: string;
  setFilterNotaMin: (v: string) => void;
  sortBy: SortKey;
  setSortBy: (v: SortKey) => void;
  onOpenDetail: (a: AcademiaProspectada) => void;
  onCopy: (text: string, field: string) => void;
  copiedField: string;
  searchCidade: string;
  setSearchCidade: (v: string) => void;
  searchBairro: string;
  setSearchBairro: (v: string) => void;
  searchRaio: number;
  setSearchRaio: (v: number) => void;
  searchLoading: boolean;
  searchPhase: string;
  searchResults: ResultadoBusca | null;
  searchFromCache: boolean;
  searchCacheAge: string;
  onEnhancedSearch: (useGeo?: boolean) => void;
  onWhatsAppClick: (a: AcademiaProspectada) => void;
  onInstagramClick: (a: AcademiaProspectada) => void;
  onEmailCopy: (a: AcademiaProspectada) => void;
  onOpenRegenModal: (prospectId: string) => void;
}

function TabBuscar({
  results,
  searchQuery,
  setSearchQuery,
  filterModalidade,
  setFilterModalidade,
  filterClassificacao,
  setFilterClassificacao,
  filterNotaMin,
  setFilterNotaMin,
  sortBy,
  setSortBy,
  onOpenDetail,
  onCopy,
  copiedField,
  searchCidade,
  setSearchCidade,
  searchBairro,
  setSearchBairro,
  searchRaio,
  setSearchRaio,
  searchLoading,
  searchPhase,
  searchResults,
  searchFromCache,
  searchCacheAge,
  onEnhancedSearch,
  onWhatsAppClick,
  onInstagramClick,
  onEmailCopy,
  onOpenRegenModal,
}: TabBuscarProps) {
  return (
    <div className="space-y-4">
      {/* Enhanced Search Panel */}
      <div className="p-4 space-y-4" style={cardStyle}>
        {/* Main search input */}
        <div className="flex items-center px-4 py-3 rounded-lg" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <Search size={20} style={{ color: 'var(--bb-ink-40)' }} className="shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar academias de artes marciais..."
            className="flex-1 bg-transparent border-none outline-none px-3 text-base"
            style={{ color: 'var(--bb-ink-100)' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !searchLoading) onEnhancedSearch(); }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--bb-ink-40)' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Secondary inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={searchCidade}
            onChange={(e) => setSearchCidade(e.target.value)}
            placeholder="Cidade"
            className="px-3 py-2.5 rounded-lg text-sm bg-transparent"
            style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
          />
          <input
            type="text"
            value={searchBairro}
            onChange={(e) => setSearchBairro(e.target.value)}
            placeholder="Bairro"
            className="px-3 py-2.5 rounded-lg text-sm bg-transparent"
            style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
          />
          <div className="relative">
            <select
              value={searchRaio}
              onChange={(e) => setSearchRaio(Number(e.target.value))}
              className="w-full appearance-none px-3 py-2.5 rounded-lg text-sm bg-transparent cursor-pointer"
              style={{ border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', background: 'var(--bb-depth-2)' }}
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--bb-ink-40)' }}
            />
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onEnhancedSearch(false)}
            disabled={searchLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
            style={{ background: 'var(--bb-brand, #f59e0b)', color: '#000' }}
          >
            {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            Buscar com IA
          </button>
          <button
            onClick={() => onEnhancedSearch(true)}
            disabled={searchLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-80)' }}
          >
            <Navigation size={16} />
            Perto de mim
          </button>

          {/* Loading phase indicator */}
          {searchPhase && (
            <div className="flex items-center gap-2 ml-2">
              {searchLoading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--bb-brand, #f59e0b)' }} />}
              <span className="text-xs font-medium" style={{ color: searchLoading ? 'var(--bb-brand, #f59e0b)' : '#10b981' }}>
                {searchPhase}
              </span>
            </div>
          )}
        </div>

        {/* Info text */}
        <div className="flex flex-col gap-1">
          <p className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
            Busca usa Google Places + IA Claude para analise
          </p>
          <p className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
            Resultados sao salvos automaticamente no CRM
          </p>
        </div>

        {/* Cache indicator */}
        {searchFromCache && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <RefreshCw size={14} style={{ color: '#3b82f6' }} />
            <span className="text-xs" style={{ color: '#3b82f6' }}>
              Resultados do cache{searchCacheAge ? ` (buscados ha ${searchCacheAge})` : ''}
            </span>
            <button
              onClick={() => onEnhancedSearch(false)}
              className="ml-2 text-xs font-medium underline"
              style={{ color: '#3b82f6' }}
            >
              Buscar novamente
            </button>
          </div>
        )}

        {/* Search results summary */}
        {searchResults && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Check size={14} style={{ color: '#10b981' }} />
            <span className="text-xs font-medium" style={{ color: '#10b981' }}>
              {searchResults.total} academias encontradas em {searchResults.tempo}ms
            </span>
            {searchResults.filtrosAplicados.length > 0 && (
              <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                Filtros: {searchResults.filtrosAplicados.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Modalidade */}
        <div className="relative">
          <select
            value={filterModalidade}
            onChange={(e) => setFilterModalidade(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-transparent cursor-pointer"
            style={{
              border: '1px solid var(--bb-glass-border)',
              color: filterModalidade ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)',
              background: 'var(--bb-depth-3)',
            }}
          >
            <option value="">Modalidade</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--bb-ink-40)' }}
          />
        </div>

        {/* Classificacao */}
        <div className="relative">
          <select
            value={filterClassificacao}
            onChange={(e) => setFilterClassificacao(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-transparent cursor-pointer"
            style={{
              border: '1px solid var(--bb-glass-border)',
              color: filterClassificacao ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)',
              background: 'var(--bb-depth-3)',
            }}
          >
            <option value="">Classificacao</option>
            <option value="quente">Quente</option>
            <option value="morno">Morno</option>
            <option value="frio">Frio</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--bb-ink-40)' }}
          />
        </div>

        {/* Nota Min */}
        <input
          type="number"
          value={filterNotaMin}
          onChange={(e) => setFilterNotaMin(e.target.value)}
          placeholder="Nota min"
          min={0}
          max={5}
          step={0.5}
          className="w-24 px-3 py-2 rounded-lg text-sm bg-transparent"
          style={{
            border: '1px solid var(--bb-glass-border)',
            color: 'var(--bb-ink-100)',
            background: 'var(--bb-depth-3)',
          }}
        />

        {/* Sort */}
        <div className="ml-auto relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm bg-transparent cursor-pointer"
            style={{
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
              background: 'var(--bb-depth-3)',
            }}
          >
            <option value="score">Ordenar: Score</option>
            <option value="rating">Ordenar: Rating</option>
            <option value="name">Ordenar: Nome</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--bb-ink-40)' }}
          />
        </div>

        {/* Result count */}
        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
          {results.length} resultado{results.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={cardStyle}
        >
          <Search size={48} style={{ color: 'var(--bb-ink-40)' }} />
          <p className="mt-4 text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhuma academia encontrada
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-40)' }}>
            Tente ajustar os filtros de busca
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((academia) => (
            <ProspectCard
              key={academia.id}
              academia={academia}
              onOpenDetail={onOpenDetail}
              onCopy={onCopy}
              copiedField={copiedField}
              onWhatsAppClick={onWhatsAppClick}
              onInstagramClick={onInstagramClick}
              onEmailCopy={onEmailCopy}
              onOpenRegenModal={onOpenRegenModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Prospect Card ---------- */
interface ProspectCardProps {
  academia: AcademiaProspectada;
  onOpenDetail: (a: AcademiaProspectada) => void;
  onCopy: (text: string, field: string) => void;
  copiedField: string;
  onWhatsAppClick?: (a: AcademiaProspectada) => void;
  onInstagramClick?: (a: AcademiaProspectada) => void;
  onEmailCopy?: (a: AcademiaProspectada) => void;
  onOpenRegenModal?: (prospectId: string) => void;
}

function ProspectCard({
  academia,
  onOpenDetail,
  onCopy,
  copiedField: _copiedField,
  onWhatsAppClick,
  onInstagramClick,
  onEmailCopy,
  onOpenRegenModal,
}: ProspectCardProps) {
  const sc = academia.score.geral;
  const classColor = CLASSIFICATION_COLORS[academia.classificacao] ?? '#6b7280';
  const hasIAAnalysis = sc > 0 && academia.analise.pontosFortes.length > 0;

  return (
    <div className="flex flex-col p-4 space-y-3 relative" style={cardStyle}>
      {/* IA Analysis Badge (top right) */}
      {hasIAAnalysis && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
          >
            <Bot size={10} />
            Analisado por IA
          </span>
        </div>
      )}

      {/* Header: Name + Score Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold truncate cursor-pointer hover:underline"
            style={{ color: 'var(--bb-ink-100)' }}
            onClick={() => onOpenDetail(academia)}
          >
            {academia.nome}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            {renderStars(academia.notaGoogle, 12)}
            <span className="text-xs ml-1" style={{ color: 'var(--bb-ink-40)' }}>
              ({academia.totalAvaliacoes})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-5">
          {/* Classification Badge */}
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            style={{
              background: classificationBg(academia.classificacao),
              color: classColor,
            }}
          >
            {CLASSIFICATION_LABELS[academia.classificacao] ?? academia.classificacao}
          </span>
          {/* Score Badge - prominent */}
          <span
            className="flex items-center justify-center h-9 min-w-[36px] px-1 rounded-lg text-xs font-bold"
            style={{
              background: scoreBg(sc),
              color: scoreColor(sc),
              border: `1px solid ${scoreColor(sc)}30`,
            }}
          >
            {sc}
          </span>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2">
        <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--bb-ink-40)' }} />
        <span className="text-xs leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
          {academia.endereco}, {academia.bairro}
        </span>
      </div>

      {/* Phone */}
      {academia.telefone && (
        <div className="flex items-center gap-2">
          <Phone size={14} style={{ color: 'var(--bb-ink-40)' }} />
          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            {academia.telefone}
          </span>
        </div>
      )}

      {/* Instagram */}
      {academia.instagram && (
        <div className="flex items-center gap-2">
          <Instagram size={14} style={{ color: 'var(--bb-ink-40)' }} />
          <a
            href={`https://instagram.com/${academia.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: '#3b82f6' }}
          >
            {academia.instagram}
          </a>
        </div>
      )}

      {/* Modalidades */}
      <div className="flex flex-wrap gap-1">
        {academia.modalidades.map((m) => (
          <span
            key={m}
            className="px-2 py-0.5 rounded-md text-[10px] font-medium"
            style={{
              background: 'var(--bb-depth-4, var(--bb-depth-2))',
              color: 'var(--bb-ink-60)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Estimativas */}
      <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
        <span>~{academia.estimativas.alunosEstimados} alunos</span>
        <span>{formatCurrency(academia.estimativas.faturamentoEstimado)}/mes</span>
      </div>

      {/* IA Analysis Section (expanded when available) */}
      {hasIAAnalysis && (
        <div
          className="space-y-2 p-3 rounded-lg"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
            Analise IA
          </p>

          {/* Sinais de Dor (red dots) */}
          {academia.analise.pontosFracos.length > 0 && (
            <div className="space-y-1">
              {academia.analise.pontosFracos.slice(0, 2).map((pf, i) => (
                <div key={`dor-${i}`} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#ef4444' }} />
                  <span className="text-[11px]" style={{ color: 'var(--bb-ink-60)' }}>{pf}</span>
                </div>
              ))}
            </div>
          )}

          {/* Oportunidades (green dots) */}
          {academia.analise.oportunidades.length > 0 && (
            <div className="space-y-1">
              {academia.analise.oportunidades.slice(0, 2).map((op, i) => (
                <div key={`op-${i}`} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#10b981' }} />
                  <span className="text-[11px]" style={{ color: 'var(--bb-ink-60)' }}>{op}</span>
                </div>
              ))}
            </div>
          )}

          {/* Gancho quote */}
          {academia.abordagem.argumentos.length > 0 && (
            <div
              className="mt-1 px-2.5 py-1.5 rounded text-[11px] italic"
              style={{
                background: 'rgba(245,158,11,0.06)',
                borderLeft: '2px solid var(--bb-brand, #f59e0b)',
                color: 'var(--bb-ink-60)',
              }}
            >
              &ldquo;{academia.abordagem.argumentos[0]}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="flex flex-wrap items-center gap-2 pt-2"
        style={{ borderTop: '1px solid var(--bb-glass-border)' }}
      >
        <button
          onClick={() => onWhatsAppClick ? onWhatsAppClick(academia) : window.open(whatsappLink(academia.telefone, academia.abordagem.mensagemSugerida), '_blank')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{ background: 'rgba(37,211,102,0.15)', color: '#25d366' }}
        >
          <MessageCircle size={14} />
          WhatsApp
        </button>

        {academia.instagram && (
          <button
            onClick={() => onInstagramClick ? onInstagramClick(academia) : undefined}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ background: 'rgba(131,58,180,0.15)', color: '#c13584' }}
          >
            <Instagram size={14} />
          </button>
        )}

        {academia.email && (
          <button
            onClick={() => onEmailCopy ? onEmailCopy(academia) : onCopy(academia.email!, `email-${academia.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
          >
            <Mail size={14} />
            Email
          </button>
        )}

        {onOpenRegenModal && (
          <button
            onClick={() => onOpenRegenModal(academia.id)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}
            title="Regenerar mensagens"
          >
            <Wand2 size={14} />
          </button>
        )}

        <button
          onClick={() => onOpenDetail(academia)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
        >
          <Eye size={14} />
          Detalhes
        </button>
      </div>
    </div>
  );
}

/* =================================================================
   TAB: PIPELINE
   ================================================================= */
interface TabPipelineProps {
  pipelineByStatus: Record<string, AcademiaProspectada[]>;
  dashboard: ProspeccaoDashboard | null;
  onOpenDetail: (a: AcademiaProspectada) => void;
  onMoveStatus: (a: AcademiaProspectada, newStatus: string) => void;
}

function TabPipeline({ pipelineByStatus, dashboard, onOpenDetail, onMoveStatus }: TabPipelineProps) {
  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {PIPELINE_COLUMNS.map((col) => {
          const items = pipelineByStatus[col.key] ?? [];
          return (
            <div
              key={col.key}
              className="flex-shrink-0 w-64 flex flex-col rounded-xl"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderTop: `3px solid ${col.color}`,
                minHeight: '300px',
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                  {col.label}
                </span>
                <span
                  className="flex items-center justify-center h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold"
                  style={{ background: col.color, color: '#fff' }}
                >
                  {items.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto" style={{ maxHeight: '500px' }}>
                {items.map((prospect) => {
                  const sc = prospect.score.geral;
                  const classColor = CLASSIFICATION_COLORS[prospect.classificacao] ?? '#6b7280';
                  const nextStatus = NEXT_STATUS[col.key];

                  return (
                    <div
                      key={prospect.id}
                      className="p-3 rounded-lg cursor-pointer transition-colors space-y-2"
                      style={{
                        background: 'var(--bb-depth-3)',
                        border: '1px solid var(--bb-glass-border)',
                        borderRadius: 'var(--bb-radius-md)',
                      }}
                      onClick={() => onOpenDetail(prospect)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-semibold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                          {prospect.nome}
                        </span>
                        <span
                          className="flex items-center justify-center h-6 w-6 rounded text-[10px] font-bold shrink-0"
                          style={{ background: scoreBg(sc), color: scoreColor(sc) }}
                        >
                          {sc}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStars(prospect.notaGoogle, 10)}
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                          style={{
                            background: classificationBg(prospect.classificacao),
                            color: classColor,
                          }}
                        >
                          {CLASSIFICATION_LABELS[prospect.classificacao]}
                        </span>
                      </div>

                      {nextStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveStatus(prospect, nextStatus);
                          }}
                          className="flex items-center gap-1 w-full px-2 py-1 rounded text-[10px] font-medium transition-colors"
                          style={{
                            background: 'rgba(245,158,11,0.08)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245,158,11,0.2)',
                          }}
                        >
                          <ArrowRight size={10} />
                          Mover para {PIPELINE_COLUMNS.find((c) => c.key === nextStatus)?.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Visualization */}
      {dashboard && dashboard.funnelData.length > 0 && (
        <div className="p-4" style={cardStyle}>
          <p className="mb-3" style={sectionLabel}>Funil de Conversao</p>
          <div className="space-y-2">
            {dashboard.funnelData.map((stage, i) => {
              const maxCount = Math.max(...dashboard.funnelData.map((s) => s.count), 1);
              const widthPct = Math.max((stage.count / maxCount) * 100, 4);
              const color = PIPELINE_COLUMNS[i]?.color ?? '#6b7280';

              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-medium text-right shrink-0" style={{ color: 'var(--bb-ink-60)' }}>
                    {stage.stage}
                  </span>
                  <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: 'var(--bb-depth-2)' }}>
                    <div
                      className="h-full rounded-md flex items-center px-2 transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        background: color,
                      }}
                    >
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">
                        {stage.count} ({stage.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =================================================================
   TAB: MAPA
   ================================================================= */
interface TabMapaProps {
  bairroGroups: {
    bairro: string;
    academias: AcademiaProspectada[];
    total: number;
    quentes: number;
    mornos: number;
    frios: number;
  }[];
  expandedBairro: string | null;
  setExpandedBairro: (v: string | null) => void;
  allProspects: AcademiaProspectada[];
  onOpenDetail: (a: AcademiaProspectada) => void;
}

function TabMapa({ bairroGroups, expandedBairro, setExpandedBairro, allProspects, onOpenDetail }: TabMapaProps) {
  const totalBairros = bairroGroups.length;
  const totalAcademias = allProspects.length;
  const penetrationRate = totalBairros > 0
    ? Math.round((bairroGroups.filter((b) => b.quentes > 0).length / totalBairros) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl" style={cardStyle}>
          <p className="text-xs" style={sectionLabel}>Total Bairros</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--bb-ink-100)' }}>{totalBairros}</p>
        </div>
        <div className="p-4 rounded-xl" style={cardStyle}>
          <p className="text-xs" style={sectionLabel}>Total Academias</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--bb-ink-100)' }}>{totalAcademias}</p>
        </div>
        <div className="p-4 rounded-xl" style={cardStyle}>
          <p className="text-xs" style={sectionLabel}>Taxa Penetracao</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>{penetrationRate}%</p>
        </div>
      </div>

      {/* Bairro List */}
      <div className="space-y-2">
        {bairroGroups.map((group) => {
          const isExpanded = expandedBairro === group.bairro;
          return (
            <div key={group.bairro} className="rounded-xl overflow-hidden" style={cardStyle}>
              {/* Bairro Header */}
              <button
                onClick={() => setExpandedBairro(isExpanded ? null : group.bairro)}
                className="flex items-center justify-between w-full px-4 py-3 transition-colors"
                style={{ background: isExpanded ? 'var(--bb-depth-4, var(--bb-depth-2))' : 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} style={{ color: 'var(--bb-ink-40)' }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: 'var(--bb-ink-40)' }} />
                  )}
                  <MapPin size={16} style={{ color: 'var(--bb-ink-60)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    {group.bairro}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
                  >
                    {group.total} academia{group.total !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {group.quentes > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                    >
                      {group.quentes} quente{group.quentes !== 1 ? 's' : ''}
                    </span>
                  )}
                  {group.mornos > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                    >
                      {group.mornos} morno{group.mornos !== 1 ? 's' : ''}
                    </span>
                  )}
                  {group.frios > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
                    >
                      {group.frios} frio{group.frios !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded: Academias list */}
              {isExpanded && (
                <div className="px-4 pb-3 space-y-2" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                  {group.academias.map((academia) => {
                    const sc = academia.score.geral;
                    const classColor = CLASSIFICATION_COLORS[academia.classificacao] ?? '#6b7280';
                    return (
                      <div
                        key={academia.id}
                        className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
                        style={{
                          background: 'var(--bb-depth-2)',
                          border: '1px solid var(--bb-glass-border)',
                        }}
                        onClick={() => onOpenDetail(academia)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4, var(--bb-depth-3))'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bb-depth-2)'; }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="flex items-center justify-center h-7 w-7 rounded text-[10px] font-bold shrink-0"
                            style={{ background: scoreBg(sc), color: scoreColor(sc) }}
                          >
                            {sc}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                              {academia.nome}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {renderStars(academia.notaGoogle, 10)}
                              <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                                ({academia.totalAvaliacoes})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{ background: classificationBg(academia.classificacao), color: classColor }}
                          >
                            {CLASSIFICATION_LABELS[academia.classificacao]}
                          </span>
                          <ChevronRight size={14} style={{ color: 'var(--bb-ink-40)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =================================================================
   TAB: ANALYTICS
   ================================================================= */
interface TabAnalyticsProps {
  dashboard: ProspeccaoDashboard;
}

function TabAnalytics({ dashboard }: TabAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Prospects" value={String(dashboard.totalProspects)} icon={Users} color="#3b82f6" />
        <SummaryCard
          label="Pipeline Ativo"
          value={String(
            dashboard.porStatus.novo +
            dashboard.porStatus.contactado +
            dashboard.porStatus.interessado +
            dashboard.porStatus.demoAgendada +
            dashboard.porStatus.negociando,
          )}
          icon={Target}
          color="#8b5cf6"
        />
        <SummaryCard label="Taxa Conversao" value={`${dashboard.taxaConversao}%`} icon={TrendingUp} color="#10b981" />
        <SummaryCard label="MRR Clientes" value={formatCurrency(dashboard.mrrClientes)} icon={DollarSign} color="#f59e0b" />
        <SummaryCard label="Tempo Medio" value={`${dashboard.tempoMedioFechamento}d`} icon={Timer} color="#ef4444" />
      </div>

      {/* Charts Row 1: Funnel + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel BarChart (horizontal) */}
        {dashboard.funnelData.length > 0 && (
          <div className="p-4" style={cardStyle}>
            <p className="mb-4" style={sectionLabel}>Funil por Estagio</p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                  <XAxis type="number" tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    tick={{ fill: 'var(--bb-ink-60)', fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {dashboard.funnelData.map((_, i) => (
                      <Cell key={i} fill={PIPELINE_COLUMNS[i]?.color ?? '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weekly Activity BarChart */}
        {dashboard.weeklyData.length > 0 && (
          <div className="p-4" style={cardStyle}>
            <p className="mb-4" style={sectionLabel}>Atividade Semanal</p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                  <XAxis dataKey="semana" tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="novos" name="Novos" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="contatos" name="Contatos" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="demos" name="Demos" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="fechados" name="Fechados" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 2: Score Distribution PieChart + Channel Efficacy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution Pie */}
        {dashboard.scoreDistribution.length > 0 && (
          <div className="p-4" style={cardStyle}>
            <p className="mb-4" style={sectionLabel}>Distribuicao de Score</p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboard.scoreDistribution}
                    dataKey="count"
                    nameKey="classificacao"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={false}
                  >
                    {dashboard.scoreDistribution.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CLASSIFICATION_COLORS[entry.classificacao] ?? CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Channel Efficacy */}
        {dashboard.canaisEficacia.length > 0 && (
          <div className="p-4 space-y-3" style={cardStyle}>
            <p style={sectionLabel}>Eficacia por Canal</p>
            {dashboard.canaisEficacia.map((canal) => {
              const icons: Record<string, typeof MessageCircle> = {
                WhatsApp: MessageCircle,
                Instagram: Instagram,
                Email: Mail,
                Presencial: Users,
              };
              const colors: Record<string, string> = {
                WhatsApp: '#25d366',
                Instagram: '#c13584',
                Email: '#3b82f6',
                Presencial: '#10b981',
              };
              const Icon = icons[canal.canal] ?? MessageCircle;
              const color = colors[canal.canal] ?? '#6b7280';

              return (
                <div
                  key={canal.canal}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                >
                  <div
                    className="flex items-center justify-center h-9 w-9 rounded-lg shrink-0"
                    style={{ background: `${color}20`, color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {canal.canal}
                      </span>
                      <span className="text-xs font-bold" style={{ color }}>
                        {canal.taxaResposta}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full mt-1.5" style={{ background: 'var(--bb-depth-1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${canal.taxaResposta}%`, background: color }}
                      />
                    </div>
                    <span className="text-[10px] mt-1 block" style={{ color: 'var(--bb-ink-40)' }}>
                      {canal.contatos} contatos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Objections */}
      {dashboard.topObjecoes.length > 0 && (
        <div className="p-4" style={cardStyle}>
          <p className="mb-4" style={sectionLabel}>Principais Objecoes</p>
          <div className="space-y-3">
            {dashboard.topObjecoes.map((obj, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 text-right text-xs font-bold" style={{ color: 'var(--bb-ink-40)' }}>
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{obj.motivo}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--bb-ink-60)' }}>
                      {obj.percentage}% ({obj.count})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'var(--bb-depth-2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${obj.percentage}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projection */}
      <div className="p-4 rounded-xl" style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
          Projecao
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--bb-ink-60)' }}>
          Com a taxa de conversao atual de {dashboard.taxaConversao}% e {dashboard.porStatus.negociando} prospects
          em negociacao, estima-se {Math.round((dashboard.porStatus.negociando * dashboard.taxaConversao) / 100)} novos
          fechamentos nos proximos 30 dias, adicionando aproximadamente{' '}
          {formatCurrency(Math.round((dashboard.porStatus.negociando * dashboard.taxaConversao * 297) / 100))} ao MRR.
        </p>
      </div>
    </div>
  );
}

/* ---------- Summary Card ---------- */
interface SummaryCardProps {
  label: string;
  value: string;
  icon: typeof Users;
  color: string;
}

function SummaryCard({ label, value, icon: Icon, color }: SummaryCardProps) {
  return (
    <div className="p-4 rounded-xl" style={cardStyle}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px]" style={sectionLabel}>{label}</p>
        <div
          className="flex items-center justify-center h-7 w-7 rounded-lg"
          style={{ background: `${color}20`, color }}
        >
          <Icon size={14} />
        </div>
      </div>
      <p className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
    </div>
  );
}

/* =================================================================
   DETAIL MODAL
   ================================================================= */
interface DetailModalProps {
  academia: AcademiaProspectada;
  detailTab: DetailTab;
  setDetailTab: (t: DetailTab) => void;
  onClose: () => void;
  onCopy: (text: string, field: string) => void;
  copiedField: string;
  onMoveStatus: (a: AcademiaProspectada, newStatus: string) => void;
}

function DetailModal({ academia, detailTab, setDetailTab, onClose, onCopy, copiedField, onMoveStatus }: DetailModalProps) {
  const sc = academia.score.geral;

  // Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative z-50 w-full max-w-3xl my-4 mx-4 flex flex-col"
        style={{
          background: 'var(--bb-depth-3)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
          boxShadow: 'var(--bb-shadow-xl)',
          maxHeight: 'calc(100vh - 2rem)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex items-center justify-center h-10 w-10 rounded-lg text-sm font-bold shrink-0"
              style={{ background: scoreBg(sc), color: scoreColor(sc) }}
            >
              {sc}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                {academia.nome}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {renderStars(academia.notaGoogle, 12)}
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  ({academia.totalAvaliacoes} avaliacoes)
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{
                    background: classificationBg(academia.classificacao),
                    color: CLASSIFICATION_COLORS[academia.classificacao] ?? '#6b7280',
                  }}
                >
                  {CLASSIFICATION_LABELS[academia.classificacao]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors shrink-0"
            style={{ color: 'var(--bb-ink-40)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4, var(--bb-depth-2))'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-tab bar */}
        <div
          className="flex items-center gap-1 px-5 overflow-x-auto shrink-0"
          style={{ borderBottom: '1px solid var(--bb-glass-border)', scrollbarWidth: 'none' }}
        >
          {DETAIL_TABS.map((tab) => {
            const active = detailTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setDetailTab(tab.key)}
                className="px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: active ? '#f59e0b' : 'var(--bb-ink-60)',
                  borderBottom: active ? '2px solid #f59e0b' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {detailTab === 'perfil' && (
            <DetailPerfil academia={academia} onCopy={onCopy} copiedField={copiedField} />
          )}
          {detailTab === 'analise' && (
            <DetailAnalise academia={academia} />
          )}
          {detailTab === 'reviews' && (
            <DetailReviews academia={academia} />
          )}
          {detailTab === 'abordagem' && (
            <DetailAbordagem academia={academia} onCopy={onCopy} copiedField={copiedField} />
          )}
          {detailTab === 'crm' && (
            <DetailCRM academia={academia} onMoveStatus={onMoveStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Detail Sub-tab: Perfil ---------- */
function DetailPerfil({
  academia,
  onCopy,
  copiedField,
}: {
  academia: AcademiaProspectada;
  onCopy: (text: string, field: string) => void;
  copiedField: string;
}) {
  return (
    <div className="space-y-4">
      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Address */}
        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
          <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--bb-ink-40)' }} />
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bb-ink-40)' }}>
              Endereco
            </p>
            <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
              {academia.endereco}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              {academia.bairro} - {academia.cidade}/{academia.estado}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
          <Phone size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--bb-ink-40)' }} />
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bb-ink-40)' }}>
              Telefone
            </p>
            <a
              href={`tel:${academia.telefone}`}
              className="text-sm hover:underline"
              style={{ color: '#3b82f6' }}
            >
              {academia.telefone}
            </a>
          </div>
        </div>

        {/* Website */}
        {academia.website && (
          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
            <Globe size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--bb-ink-40)' }} />
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bb-ink-40)' }}>
                Website
              </p>
              <a
                href={academia.website.startsWith('http') ? academia.website : `https://${academia.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline flex items-center gap-1"
                style={{ color: '#3b82f6' }}
              >
                {academia.website}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* Instagram */}
        {academia.instagram && (
          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
            <Instagram size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--bb-ink-40)' }} />
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bb-ink-40)' }}>
                Instagram
              </p>
              <a
                href={`https://instagram.com/${academia.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline flex items-center gap-1"
                style={{ color: '#c13584' }}
              >
                {academia.instagram}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modalidades */}
      <div>
        <p className="mb-2" style={sectionLabel}>Modalidades</p>
        <div className="flex flex-wrap gap-2">
          {academia.modalidades.map((m) => (
            <span
              key={m}
              className="px-3 py-1 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(245,158,11,0.1)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Schedule */}
      {academia.horarioFuncionamento && (
        <div>
          <p className="mb-2" style={sectionLabel}>Horario de Funcionamento</p>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
            <Clock size={14} style={{ color: 'var(--bb-ink-40)' }} />
            <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
              {academia.horarioFuncionamento}
            </span>
          </div>
        </div>
      )}

      {/* Rating Details */}
      <div>
        <p className="mb-2" style={sectionLabel}>Avaliacao Google</p>
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
          <span className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {academia.notaGoogle.toFixed(1)}
          </span>
          <div>
            {renderStars(academia.notaGoogle, 16)}
            <p className="text-xs mt-0.5" style={{ color: 'var(--bb-ink-40)' }}>
              {academia.totalAvaliacoes} avaliacoes
            </p>
          </div>
        </div>
      </div>

      {/* Email */}
      {academia.email && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
          <Mail size={16} style={{ color: 'var(--bb-ink-40)' }} />
          <span className="text-sm flex-1" style={{ color: 'var(--bb-ink-100)' }}>
            {academia.email}
          </span>
          <button
            onClick={() => onCopy(academia.email!, 'detail-email')}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            {copiedField === 'detail-email' ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Detail Sub-tab: Analise ---------- */
function DetailAnalise({ academia }: { academia: AcademiaProspectada }) {
  const scoreItems = [
    { label: 'Infraestrutura', value: academia.score.infraestrutura },
    { label: 'Presenca Digital', value: academia.score.presencaDigital },
    { label: 'Reputacao', value: academia.score.reputacao },
    { label: 'Potencial Conversao', value: academia.score.potencialConversao },
  ];

  return (
    <div className="space-y-5">
      {/* Score Breakdown */}
      <div>
        <p className="mb-3" style={sectionLabel}>Score Breakdown</p>
        <div className="space-y-3">
          {scoreItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: scoreColor(item.value) }}>
                  {item.value}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'var(--bb-depth-2)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.value}%`,
                    background: scoreColor(item.value),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SWOT */}
      <div>
        <p className="mb-3" style={sectionLabel}>Analise SWOT</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pontos Fortes */}
          <SwotCard
            title="Pontos Fortes"
            items={academia.analise.pontosFortes}
            color="#10b981"
            icon={Shield}
          />
          {/* Pontos Fracos */}
          <SwotCard
            title="Pontos Fracos"
            items={academia.analise.pontosFracos}
            color="#ef4444"
            icon={AlertTriangle}
          />
          {/* Oportunidades */}
          <SwotCard
            title="Oportunidades"
            items={academia.analise.oportunidades}
            color="#3b82f6"
            icon={Lightbulb}
          />
          {/* Ameacas */}
          <SwotCard
            title="Ameacas"
            items={academia.analise.ameacas}
            color="#f59e0b"
            icon={AlertTriangle}
          />
        </div>
      </div>

      {/* Estimativas */}
      <div>
        <p className="mb-3" style={sectionLabel}>Estimativas</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bb-depth-2)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              ~{academia.estimativas.alunosEstimados}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Alunos
            </p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bb-depth-2)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {formatCurrency(academia.estimativas.faturamentoEstimado)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Faturamento
            </p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bb-depth-2)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {formatCurrency(academia.estimativas.ticketMedio)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Ticket Medio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SWOT Card ---------- */
function SwotCard({
  title,
  items,
  color,
  icon: Icon,
}: {
  title: string;
  items: string[];
  color: string;
  icon: typeof Shield;
}) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        background: 'var(--bb-depth-2)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-semibold" style={{ color }}>{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--bb-ink-60)' }}>
            <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ background: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Detail Sub-tab: Reviews ---------- */
function DetailReviews({ academia }: { academia: AcademiaProspectada }) {
  if (academia.reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Star size={40} style={{ color: 'var(--bb-ink-40)' }} />
        <p className="text-sm mt-3" style={{ color: 'var(--bb-ink-60)' }}>
          Nenhuma review encontrada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {academia.reviews.map((review, i) => (
        <div
          key={i}
          className="p-4 rounded-lg"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
              >
                {review.autor.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {review.autor}
                </p>
                <div className="flex items-center gap-2">
                  {renderStars(review.nota, 10)}
                  <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                    {formatDate(review.data)}
                  </span>
                </div>
              </div>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-60)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {review.plataforma}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
            {review.texto}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Detail Sub-tab: Abordagem ---------- */
function DetailAbordagem({
  academia,
  onCopy,
  copiedField,
}: {
  academia: AcademiaProspectada;
  onCopy: (text: string, field: string) => void;
  copiedField: string;
}) {
  const abordagem = academia.abordagem;

  return (
    <div className="space-y-4">
      {/* WhatsApp Card */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid rgba(37,211,102,0.3)',
          borderLeft: '4px solid #25d366',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={16} style={{ color: '#25d366' }} />
          <span className="text-sm font-semibold" style={{ color: '#25d366' }}>
            Mensagem WhatsApp
          </span>
        </div>
        <div
          className="p-3 rounded-lg mb-3 text-sm leading-relaxed"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)' }}
        >
          {abordagem.mensagemSugerida}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(academia.telefone, abordagem.mensagemSugerida)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#25d366', color: '#fff' }}
          >
            <MessageCircle size={16} />
            Abrir WhatsApp
          </a>
          <button
            onClick={() => onCopy(abordagem.mensagemSugerida, 'whatsapp-msg')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-60)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            {copiedField === 'whatsapp-msg' ? <Check size={14} /> : <Copy size={14} />}
            {copiedField === 'whatsapp-msg' ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Best Time */}
      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
        <Clock size={16} style={{ color: 'var(--bb-ink-40)' }} />
        <div>
          <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
            Melhor Horario para Contato
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
            {abordagem.melhorHorario}
          </p>
        </div>
      </div>

      {/* Selling Arguments */}
      <div>
        <p className="mb-2" style={sectionLabel}>Argumentos de Venda</p>
        <div className="space-y-2">
          {abordagem.argumentos.map((arg, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-lg"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <span
                className="flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
              >
                {i + 1}
              </span>
              <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{arg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Objections */}
      <div>
        <p className="mb-2" style={sectionLabel}>Objecoes Previstas</p>
        <div className="space-y-2">
          {abordagem.objecoesPrevistas.map((obj, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-lg"
              style={{ background: 'var(--bb-depth-2)' }}
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{obj}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Detail Sub-tab: CRM ---------- */
function DetailCRM({
  academia,
  onMoveStatus,
}: {
  academia: AcademiaProspectada;
  onMoveStatus: (a: AcademiaProspectada, newStatus: string) => void;
}) {
  const crm = academia.crm;
  const [localStatus, setLocalStatus] = useState(crm.status);

  async function handleStatusChange(newStatus: string) {
    setLocalStatus(newStatus);
    onMoveStatus(academia, newStatus);
  }

  return (
    <div className="space-y-4">
      {/* Status Select */}
      <div>
        <p className="mb-2" style={sectionLabel}>Status</p>
        <div className="relative">
          <select
            value={localStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 rounded-lg text-sm bg-transparent cursor-pointer"
            style={{
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-100)',
              background: 'var(--bb-depth-2)',
            }}
          >
            {PIPELINE_COLUMNS.map((col) => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--bb-ink-40)' }}
          />
        </div>
      </div>

      {/* Responsavel */}
      {crm.responsavel && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
          <Users size={16} style={{ color: 'var(--bb-ink-40)' }} />
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              Responsavel
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{crm.responsavel}</p>
          </div>
        </div>
      )}

      {/* Observacoes */}
      <div>
        <p className="mb-2" style={sectionLabel}>Observacoes</p>
        {crm.observacoes.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma observacao registrada</p>
        ) : (
          <div className="space-y-2">
            {crm.observacoes.map((obs, i) => (
              <div
                key={i}
                className="p-3 rounded-lg text-sm"
                style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
              >
                {obs}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contato History Timeline */}
      <div>
        <p className="mb-3" style={sectionLabel}>Historico de Contatos</p>
        {crm.historicoContatos.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Nenhum contato registrado</p>
        ) : (
          <div className="relative pl-6 space-y-4">
            {/* Timeline line */}
            <div
              className="absolute left-2 top-2 bottom-2 w-px"
              style={{ background: 'var(--bb-glass-border)' }}
            />
            {crm.historicoContatos.map((contato, i) => {
              const canalColors: Record<string, string> = {
                whatsapp: '#25d366',
                telefone: '#3b82f6',
                email: '#f59e0b',
                presencial: '#10b981',
                instagram: '#c13584',
              };
              const color = canalColors[contato.canal.toLowerCase()] ?? '#6b7280';

              return (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div
                    className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2"
                    style={{ background: color, borderColor: 'var(--bb-depth-3)' }}
                  />
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ background: `${color}20`, color }}
                        >
                          {contato.canal}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
                        >
                          {contato.resultado}
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                        {formatDateTime(contato.data)}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>
                      {contato.resumo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ultimo/Proximo Contato */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {crm.ultimoContato && (
          <div className="p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
            <p className="text-[10px] uppercase font-semibold tracking-wider mb-1" style={{ color: 'var(--bb-ink-40)' }}>
              Ultimo Contato
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              {formatDateTime(crm.ultimoContato)}
            </p>
          </div>
        )}
        {crm.proximoContato && (
          <div className="p-3 rounded-lg" style={{ background: 'var(--bb-depth-2)' }}>
            <p className="text-[10px] uppercase font-semibold tracking-wider mb-1" style={{ color: 'var(--bb-ink-40)' }}>
              Proximo Contato
            </p>
            <p className="text-sm font-medium" style={{ color: '#f59e0b' }}>
              {formatDateTime(crm.proximoContato)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

