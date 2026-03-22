'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useToast } from '@/lib/hooks/useToast';

// ── Types ──────────────────────────────────────────────────────────────

interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  criterio: string;
  xp: number;
  ativo: boolean;
}

interface RankingAluno {
  id: string;
  nome: string;
  avatar: string;
  faixa: string;
  xp: number;
  badges: number;
  posicao: number;
}

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_BADGES: Badge[] = [
  { id: 'b1', nome: 'Primeira Aula', descricao: 'Completou sua primeira aula', icone: '🥋', criterio: 'Registrar primeira presença', xp: 10, ativo: true },
  { id: 'b2', nome: 'Semana Completa', descricao: 'Treinou todos os dias da semana', icone: '🔥', criterio: '5+ presenças em 7 dias', xp: 50, ativo: true },
  { id: 'b3', nome: 'Mês de Ferro', descricao: 'Não faltou nenhum treino no mês', icone: '💪', criterio: '20+ presenças no mês', xp: 100, ativo: true },
  { id: 'b4', nome: 'Centurião', descricao: 'Completou 100 treinos', icone: '⚡', criterio: '100 presenças totais', xp: 200, ativo: true },
  { id: 'b5', nome: 'Embaixador', descricao: 'Indicou 3 amigos que matricularam', icone: '🌟', criterio: '3 indicações convertidas', xp: 150, ativo: true },
  { id: 'b6', nome: 'Madrugador', descricao: 'Treinou 10 vezes no horário da manhã', icone: '🌅', criterio: '10 presenças antes das 8h', xp: 75, ativo: true },
  { id: 'b7', nome: 'Faixa Nova', descricao: 'Recebeu uma nova faixa', icone: '🎖️', criterio: 'Graduação registrada', xp: 300, ativo: true },
  { id: 'b8', nome: 'Social', descricao: 'Participou de 3 eventos da academia', icone: '🎉', criterio: '3 participações em eventos', xp: 60, ativo: false },
];

const MOCK_RANKING: RankingAluno[] = [
  { id: 'r1', nome: 'Lucas Ferreira', avatar: '', faixa: 'azul', xp: 1850, badges: 6, posicao: 1 },
  { id: 'r2', nome: 'Maria Santos', avatar: '', faixa: 'roxa', xp: 1720, badges: 5, posicao: 2 },
  { id: 'r3', nome: 'Roberto Almeida', avatar: '', faixa: 'marrom', xp: 1650, badges: 7, posicao: 3 },
  { id: 'r4', nome: 'Fernanda Lima', avatar: '', faixa: 'azul', xp: 1400, badges: 4, posicao: 4 },
  { id: 'r5', nome: 'Carlos Oliveira', avatar: '', faixa: 'branca', xp: 1200, badges: 3, posicao: 5 },
  { id: 'r6', nome: 'Amanda Torres', avatar: '', faixa: 'branca', xp: 980, badges: 3, posicao: 6 },
  { id: 'r7', nome: 'Thiago Oliveira', avatar: '', faixa: 'azul', xp: 850, badges: 2, posicao: 7 },
  { id: 'r8', nome: 'Juliana Almeida', avatar: '', faixa: 'branca', xp: 620, badges: 2, posicao: 8 },
];

const FAIXA_COLORS: Record<string, string> = {
  branca: '#f5f5f5', azul: '#2563eb', roxa: '#7c3aed', marrom: '#92400e', preta: '#1e1e1e',
};

export default function AdminGamificacaoPage() {
  useTheme();
  const { toast } = useToast();

  const [tab, setTab] = useState<'badges' | 'ranking'>('badges');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [ranking, setRanking] = useState<RankingAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovoBadge, setShowNovoBadge] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoDescricao, setNovoDescricao] = useState('');
  const [novoIcone, setNovoIcone] = useState('🏆');
  const [novoCriterio, setNovoCriterio] = useState('');
  const [novoXP, setNovoXP] = useState('50');

  const load = useCallback(() => {
    setBadges(MOCK_BADGES);
    setRanking(MOCK_RANKING);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleCriarBadge() {
    if (!novoNome.trim()) return;
    const novoBadge: Badge = {
      id: `b${Date.now()}`,
      nome: novoNome,
      descricao: novoDescricao,
      icone: novoIcone,
      criterio: novoCriterio,
      xp: parseInt(novoXP) || 50,
      ativo: true,
    };
    setBadges([...badges, novoBadge]);
    toast('Conquista criada!', 'success');
    setShowNovoBadge(false);
    setNovoNome('');
    setNovoDescricao('');
    setNovoCriterio('');
  }

  function toggleBadge(id: string) {
    setBadges(badges.map((b) => b.id === id ? { ...b, ativo: !b.ativo } : b));
    toast('Status atualizado', 'info');
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Gamificação</h1>
        {tab === 'badges' && (
          <button onClick={() => setShowNovoBadge(true)} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--bb-brand)' }}>
            + Nova Conquista
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bb-depth-3)' }}>
        {(['badges', 'ranking'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: tab === t ? 'var(--bb-brand)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {t === 'badges' ? 'Conquistas' : 'Ranking XP'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--bb-depth-3)' }} />)}
        </div>
      ) : tab === 'badges' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-xl p-4 transition-opacity"
              style={{ background: 'var(--bb-depth-3)', opacity: badge.ativo ? 1 : 0.5 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{badge.icone}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--bb-ink-100)' }}>{badge.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{badge.descricao}</p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                  {badge.xp} XP
                </span>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>Critério: {badge.criterio}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => toggleBadge(badge.id)}
                  className="rounded px-2 py-1 text-[11px] font-medium"
                  style={{ background: badge.ativo ? '#ef444420' : '#22c55e20', color: badge.ativo ? '#ef4444' : '#22c55e' }}
                >
                  {badge.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((aluno) => (
            <div key={aluno.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--bb-depth-3)' }}>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: aluno.posicao <= 3 ? '#f59e0b20' : 'var(--bb-depth-4)',
                  color: aluno.posicao <= 3 ? '#f59e0b' : 'var(--bb-ink-60)',
                }}
              >
                {aluno.posicao <= 3 ? ['🥇', '🥈', '🥉'][aluno.posicao - 1] : `#${aluno.posicao}`}
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: FAIXA_COLORS[aluno.faixa] || '#6b7280' }}>
                {aluno.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>{aluno.nome}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Faixa {aluno.faixa} · {aluno.badges} badges</p>
              </div>
              <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>{aluno.xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      )}

      {/* Novo Badge modal */}
      {showNovoBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowNovoBadge(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Nova Conquista</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome *</label>
                <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Descrição</label>
                <input type="text" value={novoDescricao} onChange={(e) => setNovoDescricao(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Ícone</label>
                  <input type="text" value={novoIcone} onChange={(e) => setNovoIcone(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>XP</label>
                  <input type="number" value={novoXP} onChange={(e) => setNovoXP(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Critério de desbloqueio</label>
                <input type="text" value={novoCriterio} onChange={(e) => setNovoCriterio(e.target.value)} placeholder="Ex: 10 presenças seguidas" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowNovoBadge(false)} className="flex-1 rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>Cancelar</button>
              <button onClick={handleCriarBadge} disabled={!novoNome.trim()} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: 'var(--bb-brand)' }}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
