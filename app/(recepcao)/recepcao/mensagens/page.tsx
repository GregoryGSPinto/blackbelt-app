'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { getTemplates, enviarMensagemTemplate, getHistoricoEnvios } from '@/lib/api/recepcao-mensagens.service';
import type { TemplateMensagem, EnvioMensagem } from '@/lib/api/recepcao-mensagens.service';
import { SendIcon, ClockIcon } from '@/components/shell/icons';

// ── Helpers ────────────────────────────────────────────────────────

function getCategoriaConfig(cat: TemplateMensagem['categoria']): { emoji: string; label: string; color: string } {
  const map: Record<string, { emoji: string; label: string; color: string }> = {
    cobranca: { emoji: '\uD83D\uDCB0', label: 'Cobranca', color: '#ef4444' },
    confirmacao: { emoji: '\u2705', label: 'Confirmacao', color: '#10b981' },
    lembrete: { emoji: '\uD83D\uDD14', label: 'Lembrete', color: '#3b82f6' },
    follow_up: { emoji: '\uD83D\uDCDE', label: 'Follow-up', color: '#eab308' },
    boas_vindas: { emoji: '\uD83D\uDC4B', label: 'Boas-vindas', color: '#8b5cf6' },
  };
  return map[cat] ?? { emoji: '\uD83D\uDCE8', label: cat, color: 'var(--bb-ink-60)' };
}

function getStatusBadge(status: EnvioMensagem['status']): { label: string; bg: string; color: string } {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    enviado: { label: 'Enviado', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    entregue: { label: 'Entregue', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    lido: { label: 'Lido', bg: 'rgba(16,185,129,0.15)', color: '#059669' },
    erro: { label: 'Erro', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  };
  return map[status] ?? { label: status, bg: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' };
}

// ── Component ──────────────────────────────────────────────────────

export default function RecepcaoMensagensPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateMensagem[]>([]);
  const [envios, setEnvios] = useState<EnvioMensagem[]>([]);

  // Send state
  const [alunoNome, setAlunoNome] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMensagem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [t, e] = await Promise.all([getTemplates(), getHistoricoEnvios()]);
        if (!cancelled) { setTemplates(t); setEnvios(e); }
      } catch {
        if (!cancelled) toast('Erro ao carregar mensagens', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function handleSend() {
    if (!selectedTemplate || !alunoNome) return;
    setSending(true);
    try {
      await enviarMensagemTemplate({ alunoNome, templateId: selectedTemplate.id, canal: 'whatsapp' });
      toast('Mensagem enviada!', 'success');
      setPreviewOpen(false);
      setSelectedTemplate(null);
      // Reload envios
      const e = await getHistoricoEnvios();
      setEnvios(e);
    } catch {
      toast('Erro ao enviar mensagem', 'error');
    } finally {
      setSending(false);
    }
  }

  // Group templates by category
  const categorias = Array.from(new Set(templates.map((t) => t.categoria)));

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-20">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-12" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 pb-20">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Mensagens Rapidas
      </h1>

      {/* ── ENVIO RAPIDO ──────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Envio Rapido</h2>

        <Input
          label="Buscar aluno..."
          value={alunoNome}
          onChange={(e) => setAlunoNome(e.target.value)}
          placeholder="Digite o nome do aluno"
        />

        {/* Templates by category */}
        <div className="mt-4 space-y-4">
          {categorias.map((cat) => {
            const cfg = getCategoriaConfig(cat);
            const catTemplates = templates.filter((t) => t.categoria === cat);
            return (
              <div key={cat}>
                <p className="mb-2 text-sm font-semibold" style={{ color: cfg.color }}>
                  {cfg.emoji} {cfg.label}
                </p>
                <div className="space-y-2">
                  {catTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => { setSelectedTemplate(tmpl); setPreviewOpen(true); }}
                      className="w-full rounded-lg p-3 text-left transition-all hover:scale-[1.01]"
                      style={{
                        background: 'var(--bb-depth-2)',
                        border: '1px solid var(--bb-glass-border)',
                        borderRadius: 'var(--bb-radius-lg)',
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{tmpl.nome}</p>
                      <p className="mt-0.5 text-xs line-clamp-2" style={{ color: 'var(--bb-ink-40)' }}>{tmpl.texto}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ENVIOS DE HOJE ────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Envios de Hoje</h2>
        <div className="space-y-1">
          {envios.map((envio) => {
            const badge = getStatusBadge(envio.status);
            return (
              <div
                key={envio.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <ClockIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--bb-ink-40)' }} />
                <span className="text-xs tabular-nums" style={{ color: 'var(--bb-ink-40)' }}>{envio.horario}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{envio.alunoNome}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{envio.templateNome} &middot; {envio.canal}</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
          {envios.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhum envio hoje</p>
          )}
        </div>
      </section>

      {/* ── PREVIEW MODAL ─────────────────────────────────── */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={selectedTemplate?.nome ?? 'Template'}>
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ background: 'var(--bb-depth-4)' }}>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--bb-ink-100)' }}>
                {selectedTemplate.texto}
              </p>
            </div>
            {selectedTemplate.variaveis.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-40)' }}>
                  Variaveis: {selectedTemplate.variaveis.map((v) => `{${v}}`).join(', ')}
                </p>
              </div>
            )}
            {!alunoNome && (
              <p className="text-xs" style={{ color: '#ef4444' }}>
                Preencha o nome do aluno antes de enviar
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPreviewOpen(false)}>Cancelar</Button>
              <Button
                style={{ background: '#10b981' }}
                onClick={handleSend}
                loading={sending}
                disabled={!alunoNome || sending}
              >
                <SendIcon className="mr-1 h-4 w-4" /> Enviar via WhatsApp &#x1F4F1;
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
