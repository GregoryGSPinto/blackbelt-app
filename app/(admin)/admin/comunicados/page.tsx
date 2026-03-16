'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// ── Types ───────────────────────────────────────────────────────────────

type ComunicadoStatus = 'rascunho' | 'publicado' | 'agendado';

interface ComunicadoDTO {
  id: string;
  title: string;
  body: string;
  author: string;
  status: ComunicadoStatus;
  created_at: string;
  published_at: string | null;
  scheduled_at: string | null;
  target_audience: string;
}

// ── Constants ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ComunicadoStatus, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  agendado: 'Agendado',
};

const STATUS_STYLES: Record<ComunicadoStatus, { bg: string; text: string }> = {
  rascunho: { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)' },
  publicado: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  agendado: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
};

const AUDIENCE_OPTIONS = [
  'Todos os alunos',
  'Turmas de Jiu-Jitsu',
  'Turmas de Muay Thai',
  'Apenas professores',
  'Responsaveis',
  'Competidores',
];

// ── Mock Data ───────────────────────────────────────────────────────────

const MOCK_COMUNICADOS: ComunicadoDTO[] = [
  {
    id: 'com-1',
    title: 'Seminario de Jiu-Jitsu com Professor Visitante',
    body: 'Informamos que no proximo sabado, dia 22/03, teremos um seminario especial de Jiu-Jitsu com o Professor Marcos Almeida, faixa preta 3o grau. Vagas limitadas a 40 participantes. Valor: R$ 80 para alunos da academia.',
    author: 'Roberto Silva',
    status: 'publicado',
    created_at: '2026-03-10T10:00:00Z',
    published_at: '2026-03-10T10:30:00Z',
    scheduled_at: null,
    target_audience: 'Todos os alunos',
  },
  {
    id: 'com-2',
    title: 'Alteracao de Horarios — Abril 2026',
    body: 'A partir de 01/04 teremos novos horarios para as turmas de Muay Thai e Jiu-Jitsu infantil. Confira a grade atualizada no mural da academia ou no app.',
    author: 'Roberto Silva',
    status: 'agendado',
    created_at: '2026-03-14T08:00:00Z',
    published_at: null,
    scheduled_at: '2026-03-25T09:00:00Z',
    target_audience: 'Todos os alunos',
  },
  {
    id: 'com-3',
    title: 'Campeonato Interno Guerreiros Open',
    body: 'Estao abertas as inscricoes para o Campeonato Interno Guerreiros Open 2026! O evento sera no dia 12/04, com categorias para todas as faixas. Inscricao gratuita para alunos ativos.',
    author: 'Carlos Mendes',
    status: 'publicado',
    created_at: '2026-03-08T14:00:00Z',
    published_at: '2026-03-08T14:15:00Z',
    scheduled_at: null,
    target_audience: 'Competidores',
  },
  {
    id: 'com-4',
    title: 'Manutencao do Tatame — Area 2',
    body: 'Informamos que a Area 2 do tatame estara em manutencao nos dias 18 e 19/03. As aulas serao redistribuidas para a Area 1 e Area 3. Pedimos desculpas pelo inconveniente.',
    author: 'Roberto Silva',
    status: 'rascunho',
    created_at: '2026-03-15T16:00:00Z',
    published_at: null,
    scheduled_at: null,
    target_audience: 'Todos os alunos',
  },
  {
    id: 'com-5',
    title: 'Reuniao de Pais — Turma Kids',
    body: 'Convidamos os responsaveis dos alunos da turma Kids para uma reuniao no dia 28/03 as 19h. Abordaremos o progresso dos alunos e planejamento do semestre.',
    author: 'Ana Oliveira',
    status: 'agendado',
    created_at: '2026-03-12T11:00:00Z',
    published_at: null,
    scheduled_at: '2026-03-20T08:00:00Z',
    target_audience: 'Responsaveis',
  },
];

// ── Page ────────────────────────────────────────────────────────────────

export default function ComunicadosPage() {
  const [comunicados] = useState<ComunicadoDTO[]>(MOCK_COMUNICADOS);
  const [activeFilter, setActiveFilter] = useState<ComunicadoStatus | 'todos'>('todos');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedComunicado, setSelectedComunicado] = useState<ComunicadoDTO | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formAudience, setFormAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [formSchedule, setFormSchedule] = useState('');

  const filters: Array<{ key: ComunicadoStatus | 'todos'; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'publicado', label: 'Publicados' },
    { key: 'agendado', label: 'Agendados' },
    { key: 'rascunho', label: 'Rascunhos' },
  ];

  const filtered =
    activeFilter === 'todos'
      ? comunicados
      : comunicados.filter((c) => c.status === activeFilter);

  const counts: Record<string, number> = {
    todos: comunicados.length,
    publicado: comunicados.filter((c) => c.status === 'publicado').length,
    agendado: comunicados.filter((c) => c.status === 'agendado').length,
    rascunho: comunicados.filter((c) => c.status === 'rascunho').length,
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function handleCloseCreate() {
    setShowCreate(false);
    setFormTitle('');
    setFormBody('');
    setFormAudience(AUDIENCE_OPTIONS[0]);
    setFormSchedule('');
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Comunicados
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Envie avisos e informacoes para alunos, professores e responsaveis.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Novo Comunicado</Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={{
                background: isActive ? 'var(--bb-brand-surface)' : 'var(--bb-depth-3)',
                color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                border: `1px solid ${isActive ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
              }}
            >
              {f.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-xs"
                style={{
                  background: isActive ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                  color: isActive ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Comunicado Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((comunicado) => {
          const statusStyle = STATUS_STYLES[comunicado.status];
          return (
            <Card
              key={comunicado.id}
              interactive
              className="cursor-pointer p-5"
              onClick={() => setSelectedComunicado(comunicado)}
            >
              <div className="flex items-start justify-between gap-3">
                <h3
                  className="font-semibold leading-snug"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  {comunicado.title}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {STATUS_LABEL[comunicado.status]}
                </span>
              </div>

              <p
                className="mt-2 line-clamp-2 text-sm leading-relaxed"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                {comunicado.body}
              </p>

              <div
                className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                <span>{comunicado.author}</span>
                <span>{formatDate(comunicado.created_at)}</span>
                <span
                  className="rounded px-1.5 py-0.5"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                  }}
                >
                  {comunicado.target_audience}
                </span>
                {comunicado.scheduled_at && (
                  <span style={{ color: '#3b82f6' }}>
                    Agendado: {formatDate(comunicado.scheduled_at)}
                  </span>
                )}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="col-span-full py-12 text-center text-sm"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            Nenhum comunicado encontrado para este filtro.
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={handleCloseCreate}
        title="Novo Comunicado"
      >
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Titulo
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Seminario de Jiu-Jitsu"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Mensagem
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Escreva o comunicado..."
              rows={4}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Publico-alvo
            </label>
            <select
              value={formAudience}
              onChange={(e) => setFormAudience(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Agendamento (opcional)
            </label>
            <input
              type="datetime-local"
              value={formSchedule}
              onChange={(e) => setFormSchedule(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={handleCloseCreate}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!formTitle.trim() || !formBody.trim()}
              onClick={handleCloseCreate}
            >
              Salvar Rascunho
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!selectedComunicado}
        onClose={() => setSelectedComunicado(null)}
        title={selectedComunicado?.title ?? ''}
      >
        {selectedComunicado && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: STATUS_STYLES[selectedComunicado.status].bg,
                  color: STATUS_STYLES[selectedComunicado.status].text,
                }}
              >
                {STATUS_LABEL[selectedComunicado.status]}
              </span>
              <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {selectedComunicado.target_audience}
              </span>
            </div>

            <p
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              {selectedComunicado.body}
            </p>

            <div
              className="space-y-1 text-xs"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              <p>Autor: {selectedComunicado.author}</p>
              <p>Criado em: {formatDate(selectedComunicado.created_at)}</p>
              {selectedComunicado.published_at && (
                <p>
                  Publicado em: {formatDate(selectedComunicado.published_at)}
                </p>
              )}
              {selectedComunicado.scheduled_at && (
                <p>
                  Agendado para: {formatDate(selectedComunicado.scheduled_at)}
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => setSelectedComunicado(null)}
            >
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
