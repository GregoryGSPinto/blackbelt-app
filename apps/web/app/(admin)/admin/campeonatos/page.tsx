'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { BracketView } from '@/components/compete/BracketView';
import { LiveScoreboard } from '@/components/compete/LiveScoreboard';
import {
  TrophyIcon,
  PlusIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  BarChartIcon,
  SwordsIcon,
  RadioIcon,
  MegaphoneIcon,
  AwardIcon,
  ScaleIcon,
  XIcon,
} from '@/components/shell/icons';
import type {
  Tournament,
  TournamentCategory,
  TournamentRegistration,
  TournamentMatch,
  TournamentBracket,
  TournamentFeedItem,
  MedalTable,
  TournamentStats,
  AcademyTournamentStats,
  MatchResult,
} from '@/lib/api/compete.service';
import {
  getTournaments,
  getCategories,
  getRegistrations,
  checkInAthlete,
  weighInAthlete,
  getAllBrackets,
  generateBracket,
  getBracket,
  getLiveMatches,
  getNextMatches,
  callMatch,
  startMatch,
  recordResult,
  getFeed,
  postAnnouncement,
  getMedalTable,
  getTournamentStats,
  createTournament,
  publishTournament,
  openRegistration,
  closeRegistration,
  startTournament as startTournamentApi,
  completeTournament,
  generateStandardCategories,
} from '@/lib/api/compete.service';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ─────────────────────────────────────────────────────────

type TabId = 'campeonatos' | 'inscritos' | 'chaveamento' | 'aovivo' | 'resultados';

const TABS: { id: TabId; label: string; icon: typeof TrophyIcon }[] = [
  { id: 'campeonatos', label: 'Meus Campeonatos', icon: TrophyIcon },
  { id: 'inscritos', label: 'Inscritos', icon: UsersIcon },
  { id: 'chaveamento', label: 'Chaveamento', icon: SwordsIcon },
  { id: 'aovivo', label: 'Ao Vivo', icon: RadioIcon },
  { id: 'resultados', label: 'Resultados', icon: AwardIcon },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  aguardando_aprovacao: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Aguardando Aprovacao' },
  draft: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280', label: 'Rascunho' },
  published: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Publicado' },
  registration_open: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Inscricoes Abertas' },
  registration_closed: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Inscricoes Encerradas' },
  weigh_in: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: 'Pesagem' },
  live: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: 'Em Andamento' },
  completed: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Finalizado' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Cancelado' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Page Component ────────────────────────────────────────────────────

export default function CampeonatosAdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('campeonatos');
  const [loading, setLoading] = useState(true);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<TournamentCategory[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [brackets, setBrackets] = useState<TournamentBracket[]>([]);
  const [bracketMatches, setBracketMatches] = useState<Record<string, TournamentMatch[]>>({});
  const [liveMatches, setLiveMatches] = useState<TournamentMatch[]>([]);
  const [nextMatchesList, setNextMatchesList] = useState<TournamentMatch[]>([]);
  const [feed, setFeed] = useState<TournamentFeedItem[]>([]);
  const [medalTableData, setMedalTableData] = useState<MedalTable[]>([]);
  const [academyResults] = useState<AcademyTournamentStats[]>([]);
  const [stats, setStats] = useState<TournamentStats | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [weightInput, setWeightInput] = useState<Record<string, string>>({});
  const [announcementText, setAnnouncementText] = useState('');
  const [regFilter, setRegFilter] = useState('');
  const [selectedBracketCat, setSelectedBracketCat] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState(1);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCity, setNewCity] = useState('');

  // ── Load ────────────────────────────────────────────────────────────

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTournaments();
      setTournaments(data);
      if (data.length > 0 && !selectedTournament) setSelectedTournament(data[0]);
    } catch (err) { toast(translateError(err), 'error'); }
    finally { setLoading(false); }
  }, [toast, selectedTournament]);

  useEffect(() => { loadTournaments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTabData = useCallback(async () => {
    if (!selectedTournament) return;
    const tid = selectedTournament.id;
    try {
      if (activeTab === 'inscritos') {
        const [cats, regs] = await Promise.all([getCategories(tid), getRegistrations(tid)]);
        setCategories(cats); setRegistrations(regs);
      } else if (activeTab === 'chaveamento') {
        const [cats, b] = await Promise.all([getCategories(tid), getAllBrackets(tid)]);
        setCategories(cats); setBrackets(b);
        if (cats.length > 0 && !selectedBracketCat) setSelectedBracketCat(cats[0].id);
      } else if (activeTab === 'aovivo') {
        const [live, next, f, s] = await Promise.all([getLiveMatches(tid), getNextMatches(tid), getFeed(tid), getTournamentStats(tid)]);
        setLiveMatches(live); setNextMatchesList(next); setFeed(f); setStats(s);
      } else if (activeTab === 'resultados') {
        const [m, r] = await Promise.all([getMedalTable(tid), getTournamentStats(tid)]);
        setMedalTableData(m); setStats(r);
      }
    } catch (err) { toast(translateError(err), 'error'); }
  }, [selectedTournament, activeTab, toast, selectedBracketCat]);

  useEffect(() => { loadTabData(); }, [selectedTournament?.id, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!newName || !newDate || !newLocation) { toast('Preencha os campos obrigatorios', 'error'); return; }
    try {
      const t = await createTournament({
        academy_id: '',
        circuit_id: null,
        name: newName,
        slug: slugify(newName),
        description: '',
        banner_url: null,
        location: newLocation,
        address: '',
        city: newCity,
        state: '',
        start_date: newDate,
        end_date: newDate,
        registration_deadline: newDate,
        modalities: [],
        rules_url: null,
        max_athletes: null,
        registration_fee: 0,
        areas_count: 1,
        organizer_id: '',
        organizer_name: '',
        sponsors: [],
      });
      setTournaments((prev) => [t, ...prev]); setShowCreateModal(false);
      setNewName(''); setNewDate(''); setNewLocation(''); setNewCity('');
      toast('Campeonato criado', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleStatusChange(id: string, action: (id: string) => Promise<void>, msg: string) {
    try {
      await action(id);
      await loadTournaments();
      toast(msg, 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleCheckIn(regId: string) {
    try {
      await checkInAthlete(regId);
      // Reload registrations to get updated state
      if (selectedTournament) {
        const regs = await getRegistrations(selectedTournament.id);
        setRegistrations(regs);
      }
      toast('Check-in realizado', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleWeighIn(regId: string) {
    const w = parseFloat(weightInput[regId] ?? '');
    if (isNaN(w) || w <= 0) { toast('Peso invalido', 'error'); return; }
    try {
      const result = await weighInAthlete(regId, w);
      if (!result.passed) {
        toast(`Peso fora da categoria: ${result.category.name}`, 'error');
      } else {
        toast('Pesagem registrada', 'success');
      }
      // Reload registrations to get updated state
      if (selectedTournament) {
        const regs = await getRegistrations(selectedTournament.id);
        setRegistrations(regs);
      }
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleGenBracket(catId: string) {
    try {
      const b = await generateBracket(catId);
      setBrackets((prev) => [...prev.filter((x) => x.category_id !== catId), b]);
      toast('Chaveamento gerado', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleGenCategories() {
    if (!selectedTournament) return;
    try {
      const cats = await generateStandardCategories(
        selectedTournament.id,
        selectedTournament.modalities[0] ?? 'jiu-jitsu',
        { gender: ['male', 'female'], includeAbsolute: true },
      );
      setCategories(cats); toast('Categorias geradas', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleCallMatch(mId: string) {
    try { await callMatch(mId, selectedArea); toast('Atletas chamados', 'success'); loadTabData(); } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleStartMatch(mId: string) {
    try { await startMatch(mId); toast('Luta iniciada', 'success'); loadTabData(); } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleResult(match: TournamentMatch) {
    if (!match.athlete1_id) return;
    const p: MatchResult = {
      winner_id: match.athlete1_id,
      method: 'pontos',
      score_athlete1: match.score_athlete1 ?? 0,
      score_athlete2: match.score_athlete2 ?? 0,
      penalties_athlete1: match.penalties_athlete1,
      penalties_athlete2: match.penalties_athlete2,
      advantages_athlete1: match.advantages_athlete1,
      advantages_athlete2: match.advantages_athlete2,
      duration_seconds: match.duration_seconds ?? 0,
    };
    try { await recordResult(match.id, p); toast('Resultado registrado', 'success'); loadTabData(); } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleAnnouncement() {
    if (!selectedTournament || !announcementText.trim()) return;
    try {
      const item = await postAnnouncement(selectedTournament.id, announcementText);
      setFeed((prev) => [item, ...prev]); setAnnouncementText('');
      toast('Comunicado publicado', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function loadBracketMatches(catId: string) {
    try {
      const { matches } = await getBracket(catId);
      setBracketMatches((prev) => ({ ...prev, [catId]: matches }));
    } catch { /* bracket not yet generated */ }
  }

  const filteredRegs = regFilter
    ? registrations.filter((r) => r.athlete_name.toLowerCase().includes(regFilter.toLowerCase()) || (r.academy_name ?? '').toLowerCase().includes(regFilter.toLowerCase()) || r.category_id === regFilter)
    : registrations;

  // ── Skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}</div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <PlanGate module="compete">
      <div className="min-h-screen p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl" style={{ color: 'var(--bb-ink-100)' }}>Campeonatos</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>Gerencie seus campeonatos e competicoes</p>
          </div>
          {activeTab === 'campeonatos' && (
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 self-start rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--bb-brand)' }}>
              <PlusIcon className="h-4 w-4" /> Criar campeonato
            </button>
          )}
        </div>

        {/* Tournament selector */}
        {activeTab !== 'campeonatos' && tournaments.length > 0 && (
          <div className="mb-4">
            <select value={selectedTournament?.id ?? ''} onChange={(e) => { const t = tournaments.find((x) => x.id === e.target.value); if (t) setSelectedTournament(t); }} className="w-full rounded-lg px-3 py-2 text-sm sm:w-auto" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)', borderRadius: 'var(--bb-radius-sm)' }}>
              {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'var(--bb-depth-2)' }}>
          {TABS.map((tab) => { const Icon = tab.icon; const active = activeTab === tab.id; return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:text-sm" style={{ background: active ? 'var(--bb-brand-surface)' : 'transparent', color: active ? 'var(--bb-brand)' : 'var(--bb-ink-60)' }}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ); })}
        </div>

        {/* Tab Content */}
        {activeTab === 'campeonatos' && <TabCampeonatos tournaments={tournaments} selected={selectedTournament} onSelect={setSelectedTournament} onPublish={(id) => handleStatusChange(id, publishTournament, 'Publicado')} onOpenReg={(id) => handleStatusChange(id, openRegistration, 'Inscricoes abertas')} onCloseReg={(id) => handleStatusChange(id, closeRegistration, 'Inscricoes encerradas')} onStart={(id) => handleStatusChange(id, startTournamentApi, 'Iniciado')} onComplete={(id) => handleStatusChange(id, completeTournament, 'Finalizado')} onCreateClick={() => setShowCreateModal(true)} />}
        {activeTab === 'inscritos' && <TabInscritos regs={filteredRegs} categories={categories} regFilter={regFilter} setRegFilter={setRegFilter} weightInput={weightInput} setWeightInput={setWeightInput} onCheckIn={handleCheckIn} onWeighIn={handleWeighIn} selected={selectedTournament} />}
        {activeTab === 'chaveamento' && <TabChaveamento categories={categories} brackets={brackets} bracketMatches={bracketMatches} selectedCat={selectedBracketCat} onSelectCat={(id) => { setSelectedBracketCat(id); loadBracketMatches(id); }} onGenBracket={handleGenBracket} onGenCategories={handleGenCategories} selected={selectedTournament} />}
        {activeTab === 'aovivo' && <TabAoVivo stats={stats} liveMatches={liveMatches} nextMatches={nextMatchesList} feed={feed} selectedArea={selectedArea} setSelectedArea={setSelectedArea} announcementText={announcementText} setAnnouncementText={setAnnouncementText} onCallMatch={handleCallMatch} onStartMatch={handleStartMatch} onResult={handleResult} onAnnounce={handleAnnouncement} selected={selectedTournament} />}
        {activeTab === 'resultados' && <TabResultados medalTable={medalTableData} academyResults={academyResults} selected={selectedTournament} />}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
            <div className="relative z-10 w-full max-w-md space-y-4 p-6" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', border: '1px solid var(--bb-glass-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Criar Campeonato</h2>
                <button onClick={() => setShowCreateModal(false)} aria-label="Fechar"><XIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-40)' }} /></button>
              </div>
              <div className="space-y-3">
                <ModalInput placeholder="Nome do campeonato" value={newName} onChange={setNewName} />
                <ModalInput type="date" value={newDate} onChange={setNewDate} />
                <ModalInput placeholder="Local" value={newLocation} onChange={setNewLocation} />
                <ModalInput placeholder="Cidade" value={newCity} onChange={setNewCity} />
              </div>
              <button onClick={handleCreate} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--bb-brand)' }}>Criar Campeonato</button>
            </div>
          </div>
        )}
      </div>
    </PlanGate>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function ModalInput({ placeholder, value, onChange, type = 'text' }: { placeholder?: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }} />;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof TrophyIcon; text: string }) {
  return <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--bb-ink-40)' }}><Icon className="mb-3 h-10 w-10" /><p className="text-sm">{text}</p></div>;
}

function Btn({ onClick, bg, color, label }: { onClick: (e: React.MouseEvent) => void; bg: string; color: string; label: string }) {
  return <button onClick={onClick} className="rounded-md px-2.5 py-1.5 text-xs font-medium" style={{ background: bg, color }}>{label}</button>;
}

// ── Tab: Campeonatos ──────────────────────────────────────────────────

function TabCampeonatos({ tournaments, selected, onSelect, onPublish, onOpenReg, onCloseReg, onStart, onComplete, onCreateClick: _onCreateClick }: { tournaments: Tournament[]; selected: Tournament | null; onSelect: (t: Tournament) => void; onPublish: (id: string) => void; onOpenReg: (id: string) => void; onCloseReg: (id: string) => void; onStart: (id: string) => void; onComplete: (id: string) => void; onCreateClick: () => void }) {
  if (tournaments.length === 0) return <EmptyState icon={TrophyIcon} text="Nenhum campeonato cadastrado" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((t) => { const s = STATUS_STYLES[t.status] ?? STATUS_STYLES.draft; return (
        <div key={t.id} className="cursor-pointer overflow-hidden transition-all hover:shadow-lg" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', border: `1px solid ${selected?.id === t.id ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}` }} onClick={() => onSelect(t)}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{t.name}</h3>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.text }}>{s.label}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{formatDate(t.start_date)}</span>
              <span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" />{t.max_athletes ?? 0} vagas</span>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{t.location} - {t.city}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.status === 'draft' && <Btn onClick={(e) => { e.stopPropagation(); onPublish(t.id); }} bg="var(--bb-brand-surface)" color="var(--bb-brand)" label="Publicar" />}
              {t.status === 'published' && <Btn onClick={(e) => { e.stopPropagation(); onOpenReg(t.id); }} bg="rgba(34,197,94,0.15)" color="#22c55e" label="Abrir Inscricoes" />}
              {t.status === 'registration_open' && <Btn onClick={(e) => { e.stopPropagation(); onCloseReg(t.id); }} bg="rgba(234,179,8,0.15)" color="#eab308" label="Encerrar Inscricoes" />}
              {t.status === 'registration_closed' && <Btn onClick={(e) => { e.stopPropagation(); onStart(t.id); }} bg="rgba(59,130,246,0.15)" color="#3b82f6" label="Iniciar" />}
              {t.status === 'live' && <Btn onClick={(e) => { e.stopPropagation(); onComplete(t.id); }} bg="rgba(168,85,247,0.15)" color="#a855f7" label="Finalizar" />}
            </div>
          </div>
        </div>
      ); })}
    </div>
  );
}

// ── Tab: Inscritos ────────────────────────────────────────────────────

function TabInscritos({ regs, categories, regFilter, setRegFilter, weightInput, setWeightInput, onCheckIn, onWeighIn, selected }: { regs: TournamentRegistration[]; categories: TournamentCategory[]; regFilter: string; setRegFilter: (v: string) => void; weightInput: Record<string, string>; setWeightInput: React.Dispatch<React.SetStateAction<Record<string, string>>>; onCheckIn: (id: string) => void; onWeighIn: (id: string) => void; selected: Tournament | null }) {
  if (!selected) return <EmptyState icon={UsersIcon} text="Selecione um campeonato" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={regs.length} />
        <StatCard label="Check-ins" value={regs.filter((r) => r.checked_in_at).length} />
        <StatCard label="Categorias" value={categories.length} />
        <StatCard label="Academias" value={new Set(regs.map((r) => r.academy_name).filter(Boolean)).size} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="text" placeholder="Buscar atleta ou academia..." value={regFilter} onChange={(e) => setRegFilter(e.target.value)} className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }} />
      </div>
      <div className="overflow-x-auto" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', border: '1px solid var(--bb-glass-border)' }}>
        <table className="w-full text-sm">
          <thead><tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>{['Atleta', 'Academia', 'Peso', 'Acoes'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>{h}</th>)}</tr></thead>
          <tbody>
            {regs.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>{r.athlete_name}</td>
                <td className="px-4 py-3" style={{ color: 'var(--bb-ink-60)' }}>{r.academy_name ?? '—'}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1"><input type="number" step="0.1" placeholder={r.weigh_in_weight ? String(r.weigh_in_weight) : 'kg'} value={weightInput[r.id] ?? ''} onChange={(e) => setWeightInput((prev) => ({ ...prev, [r.id]: e.target.value }))} className="w-16 rounded px-2 py-1 text-xs" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }} /><button onClick={() => onWeighIn(r.id)} className="rounded p-1" style={{ color: 'var(--bb-brand)' }}><ScaleIcon className="h-4 w-4" /></button></div></td>
                <td className="px-4 py-3"><button onClick={() => onCheckIn(r.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium" style={{ background: r.checked_in_at ? 'rgba(34,197,94,0.15)' : 'var(--bb-depth-3)', color: r.checked_in_at ? '#22c55e' : 'var(--bb-ink-60)' }}><CheckCircleIcon className="h-3.5 w-3.5" />{r.checked_in_at ? 'OK' : 'Check-in'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {regs.length === 0 && <div className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma inscricao encontrada</div>}
      </div>
    </div>
  );
}

// ── Tab: Chaveamento ──────────────────────────────────────────────────

function TabChaveamento({ categories, brackets, bracketMatches, selectedCat, onSelectCat, onGenBracket, onGenCategories, selected }: { categories: TournamentCategory[]; brackets: TournamentBracket[]; bracketMatches: Record<string, TournamentMatch[]>; selectedCat: string | null; onSelectCat: (id: string) => void; onGenBracket: (id: string) => void; onGenCategories: () => void; selected: Tournament | null }) {
  if (!selected) return <EmptyState icon={SwordsIcon} text="Selecione um campeonato" />;
  const bracket = selectedCat ? brackets.find((b) => b.category_id === selectedCat) : undefined;
  const matches = selectedCat ? bracketMatches[selectedCat] ?? [] : [];
  const catName = selectedCat ? categories.find((c) => c.id === selectedCat)?.name ?? '' : '';
  return (
    <div className="space-y-4">
      <button onClick={onGenCategories} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm" style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}>Gerar Categorias Padrao</button>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">{categories.map((c) => (
          <button key={c.id} onClick={() => onSelectCat(c.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: selectedCat === c.id ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)', color: selectedCat === c.id ? 'var(--bb-brand)' : 'var(--bb-ink-60)', border: `1px solid ${selectedCat === c.id ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}` }}>{c.name} <span className="opacity-60">({c.registered_count})</span></button>
        ))}</div>
      )}
      {selectedCat && (
        <div className="p-4" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', border: '1px solid var(--bb-glass-border)' }}>
          {bracket && matches.length > 0
            ? <BracketView matches={matches} categoryLabel={catName} />
            : <div className="flex flex-col items-center py-8"><p className="mb-3 text-sm" style={{ color: 'var(--bb-ink-40)' }}>Chaveamento nao gerado</p><button onClick={() => onGenBracket(selectedCat)} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>Gerar Chaveamento</button></div>
          }
        </div>
      )}
      {categories.length === 0 && <EmptyState icon={SwordsIcon} text="Nenhuma categoria cadastrada" />}
    </div>
  );
}

// ── Tab: Ao Vivo ──────────────────────────────────────────────────────

function TabAoVivo({ stats, liveMatches, nextMatches, feed, selectedArea, setSelectedArea, announcementText, setAnnouncementText, onCallMatch, onStartMatch, onResult, onAnnounce, selected }: { stats: TournamentStats | null; liveMatches: TournamentMatch[]; nextMatches: TournamentMatch[]; feed: TournamentFeedItem[]; selectedArea: number; setSelectedArea: (a: number) => void; announcementText: string; setAnnouncementText: (v: string) => void; onCallMatch: (id: string) => void; onStartMatch: (id: string) => void; onResult: (m: TournamentMatch) => void; onAnnounce: () => void; selected: Tournament | null }) {
  if (!selected) return <EmptyState icon={RadioIcon} text="Selecione um campeonato" />;
  return (
    <div className="space-y-6">
      {stats && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <StatCard label="Inscricoes" value={stats.total_registrations} />
        <StatCard label="Academias" value={stats.academies_count} />
        <StatCard label="Categorias" value={stats.categories_count} />
        <StatCard label="Lutas" value={`${stats.matches_completed}/${stats.matches_total}`} />
        <StatCard label="Em andamento" value={stats.matches_in_progress} />
      </div>}
      <div className="flex gap-2">{Array.from({ length: selected.areas_count }, (_, i) => i + 1).map((a) => (
        <button key={a} onClick={() => setSelectedArea(a)} className="rounded-lg px-3 py-1.5 text-sm font-medium" style={{ background: selectedArea === a ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)', color: selectedArea === a ? 'var(--bb-brand)' : 'var(--bb-ink-60)', border: `1px solid ${selectedArea === a ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}` }}>Area {a}</button>
      ))}</div>
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Lutas ao Vivo</h3>
        {liveMatches.filter((m) => m.status === 'in_progress').length > 0
          ? <div className="grid gap-4 lg:grid-cols-2">{liveMatches.filter((m) => m.status === 'in_progress').map((m) => <LiveScoreboard key={m.id} match={m} area={m.area ?? 1} />)}</div>
          : <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma luta em andamento</p>}
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Proximas Lutas</h3>
        <div className="space-y-2">{nextMatches.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{m.athlete1_name || 'TBD'} vs {m.athlete2_name || 'TBD'}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Area {m.area ?? '—'}</p>
            </div>
            <div className="flex gap-2">
              <Btn onClick={() => onCallMatch(m.id)} bg="rgba(234,179,8,0.15)" color="#eab308" label="Chamar" />
              <Btn onClick={() => onStartMatch(m.id)} bg="rgba(34,197,94,0.15)" color="#22c55e" label="Iniciar" />
              <Btn onClick={() => onResult(m)} bg="rgba(59,130,246,0.15)" color="#3b82f6" label="Resultado" />
            </div>
          </div>
        ))}{nextMatches.length === 0 && <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma luta na fila</p>}</div>
      </div>
      <div className="p-4" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}><MegaphoneIcon className="h-4 w-4" /> Comunicado</h3>
        <div className="flex gap-2"><input type="text" placeholder="Mensagem..." value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }} onKeyDown={(e) => e.key === 'Enter' && onAnnounce()} /><button onClick={onAnnounce} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--bb-brand)' }}>Enviar</button></div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Feed</h3>
        <div className="space-y-2">{feed.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: item.type === 'announcement' ? 'var(--bb-brand)' : item.type === 'result' ? '#22c55e' : 'var(--bb-ink-40)' }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{item.title}</p>
              {item.content && <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>{item.content}</p>}
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}

// ── Tab: Resultados ───────────────────────────────────────────────────

function TabResultados({ medalTable, academyResults, selected }: { medalTable: MedalTable[]; academyResults: AcademyTournamentStats[]; selected: Tournament | null }) {
  if (!selected) return <EmptyState icon={AwardIcon} text="Selecione um campeonato" />;
  return (
    <div className="space-y-6">
      {/* Analytics Button */}
      <a
        href={`/admin/campeonatos/${selected.id}/analytics`}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
        style={{ background: 'var(--bb-brand)', color: '#fff', borderRadius: 'var(--bb-radius-lg)' }}
      >
        <BarChartIcon className="h-4 w-4" />
        Ver Analytics Completo
      </a>
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}><AwardIcon className="h-4 w-4" /> Quadro de Medalhas</h3>
        <div className="overflow-x-auto" style={{ background: 'var(--bb-depth-2)', borderRadius: 'var(--bb-radius-lg)', border: '1px solid var(--bb-glass-border)' }}>
          <table className="w-full text-sm"><thead><tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}><th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-40)' }}>#</th><th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--bb-ink-40)' }}>Academia</th><th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#eab308' }}>Ouro</th><th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#9ca3af' }}>Prata</th><th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: '#cd7f32' }}>Bronze</th><th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--bb-ink-40)' }}>Total</th></tr></thead>
          <tbody>{medalTable.map((e) => (
            <tr key={e.academy_id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
              <td className="px-4 py-3 font-bold" style={{ color: 'var(--bb-ink-60)' }}>{e.ranking_position}</td>
              <td className="px-4 py-3"><p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{e.academy_name}</p></td>
              <td className="px-4 py-3 text-center font-bold" style={{ color: '#eab308' }}>{e.gold}</td>
              <td className="px-4 py-3 text-center font-bold" style={{ color: '#9ca3af' }}>{e.silver}</td>
              <td className="px-4 py-3 text-center font-bold" style={{ color: '#cd7f32' }}>{e.bronze}</td>
              <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--bb-ink-100)' }}>{e.total}</td>
            </tr>
          ))}</tbody></table>
        </div>
      </div>
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}><BarChartIcon className="h-4 w-4" /> Desempenho por Academia</h3>
        <div className="space-y-2">{academyResults.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div><p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{a.academy_name}</p><p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{a.total_athletes} atletas | {a.total_points} pontos</p></div>
            <div className="flex items-center gap-2 text-xs font-bold"><span style={{ color: '#eab308' }}>{a.medals_gold}G</span><span style={{ color: '#9ca3af' }}>{a.medals_silver}P</span><span style={{ color: '#cd7f32' }}>{a.medals_bronze}B</span></div>
          </div>
        ))}{academyResults.length === 0 && <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhum resultado</p>}</div>
      </div>
    </div>
  );
}
