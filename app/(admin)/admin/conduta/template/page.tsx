'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getActiveTemplate,
  getTemplateHistory,
  createTemplate,
  publishTemplate,
  seedDefaultTemplate,
  ConductTemplate,
} from '@/lib/api/conduct-code.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

type ViewMode = 'view' | 'edit';

export default function ConductTemplateEditorPage() {
  const { toast } = useToast();

  const [active, setActive] = useState<ConductTemplate | null>(null);
  const [history, setHistory] = useState<ConductTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [mode, setMode] = useState<ViewMode>('view');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Which template is being previewed in the version history
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Confirmation dialog for publish
  const [confirmPublishId, setConfirmPublishId] = useState<string | null>(null);

  // Last created draft (so we can offer the publish button)
  const [lastDraft, setLastDraft] = useState<ConductTemplate | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const academyId = getActiveAcademyId();
      const [tpl, hist] = await Promise.all([
        getActiveTemplate(academyId),
        getTemplateHistory(academyId),
      ]);
      setActive(tpl);
      setHistory(hist);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleStartEdit() {
    const base = active ?? history[0] ?? null;
    setEditTitle(base?.title ?? 'Codigo de Conduta');
    setEditContent(base?.content ?? '');
    setLastDraft(null);
    setMode('edit');
  }

  function handleCancelEdit() {
    setMode('view');
    setEditTitle('');
    setEditContent('');
    setLastDraft(null);
  }

  async function handleSave() {
    if (!editTitle.trim() || !editContent.trim()) {
      toast('Preencha o titulo e o conteudo.', 'error');
      return;
    }
    try {
      setSaving(true);
      const academyId = getActiveAcademyId();
      const created = await createTemplate(academyId, editContent.trim(), editTitle.trim());
      if (!created) {
        toast('Erro ao salvar nova versao do template.', 'error');
        return;
      }
      toast('Nova versao salva com sucesso!', 'success');
      setLastDraft(created);
      // Reload history
      const hist = await getTemplateHistory(academyId);
      setHistory(hist);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(templateId: string) {
    try {
      setPublishing(true);
      const published = await publishTemplate(templateId);
      if (!published) {
        toast('Erro ao publicar template.', 'error');
        return;
      }
      toast('Template publicado com sucesso!', 'success');
      setActive(published);
      setConfirmPublishId(null);
      setLastDraft(null);
      setMode('view');
      // Reload full state
      const academyId = getActiveAcademyId();
      const hist = await getTemplateHistory(academyId);
      setHistory(hist);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setPublishing(false);
    }
  }

  async function handleSeed() {
    try {
      setSeeding(true);
      const academyId = getActiveAcademyId();
      const seeded = await seedDefaultTemplate(academyId);
      if (!seeded) {
        toast('Erro ao gerar template padrao.', 'error');
        return;
      }
      toast('Template padrao gerado com sucesso!', 'success');
      await loadData();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSeeding(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ─── Loading skeleton ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '16px', maxWidth: 960, margin: '0 auto' }}>
        <Skeleton variant="text" className="h-8 w-48" />
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    );
  }

  const hasTemplates = history.length > 0;

  // ─── Main render ──────────────────────────────────────────
  return (
    <div style={{ padding: '16px', maxWidth: 960, margin: '0 auto' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div>
          <Link
            href="/admin/conduta"
            style={{ fontSize: 13, color: 'var(--bb-ink-40)', textDecoration: 'none' }}
          >
            &larr; Voltar para Conduta
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--bb-ink-100)', marginTop: 4 }}>
            Editor de Template
          </h1>
          <p style={{ fontSize: 13, color: 'var(--bb-ink-60)', marginTop: 2 }}>
            Gerencie as versoes do codigo de conduta da academia.
          </p>
        </div>

        {hasTemplates && mode === 'view' && (
          <button
            onClick={handleStartEdit}
            style={{
              background: 'var(--bb-brand)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Nova Versao
          </button>
        )}
      </div>

      {/* ── Seed (no templates) ──────────────────────────────── */}
      {!hasTemplates && mode === 'view' && (
        <div
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 36, marginBottom: 12 }}>&#128220;</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--bb-ink-80)', marginBottom: 4 }}>
            Nenhum template encontrado
          </p>
          <p style={{ fontSize: 13, color: 'var(--bb-ink-40)', marginBottom: 20 }}>
            Gere o template padrao ou crie um do zero.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                background: 'var(--bb-brand)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 600,
                cursor: seeding ? 'not-allowed' : 'pointer',
                opacity: seeding ? 0.5 : 1,
              }}
            >
              {seeding ? 'Gerando...' : 'Gerar Template Padrao'}
            </button>
            <button
              onClick={handleStartEdit}
              style={{
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-60)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Criar do Zero
            </button>
          </div>
        </div>
      )}

      {/* ── Active template view ─────────────────────────────── */}
      {hasTemplates && mode === 'view' && active && (
        <div
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--bb-ink-100)' }}>
              {active.title}
            </h2>
            <span
              style={{
                background: 'rgba(34,197,94,0.15)',
                color: '#22c55e',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 9999,
              }}
            >
              Ativa &middot; v{active.version}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--bb-ink-40)', marginBottom: 16 }}>
            {active.published_at && (
              <span>Publicada em: {formatDate(active.published_at)}</span>
            )}
            <span>Criada em: {formatDate(active.created_at)}</span>
            {active.is_system && <span style={{ color: 'var(--bb-ink-60)', fontStyle: 'italic' }}>Template do sistema</span>}
          </div>

          <div
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 8,
              padding: 16,
              maxHeight: 420,
              overflowY: 'auto',
            }}
          >
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--bb-ink-80)',
                fontFamily: 'inherit',
                margin: 0,
              }}
            >
              {active.content}
            </pre>
          </div>
        </div>
      )}

      {/* ── Edit mode ────────────────────────────────────────── */}
      {mode === 'edit' && (
        <div
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--bb-ink-100)', marginBottom: 16 }}>
            {lastDraft ? 'Versao salva (rascunho)' : 'Editar Template'}
          </h2>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--bb-ink-80)', marginBottom: 4 }}
            >
              Titulo
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={!!lastDraft}
              placeholder="Ex: Codigo de Conduta da Academia"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                opacity: lastDraft ? 0.6 : 1,
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--bb-ink-80)', marginBottom: 4 }}
            >
              Conteudo
            </label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={!!lastDraft}
              rows={16}
              placeholder="Escreva o conteudo do codigo de conduta..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                lineHeight: 1.7,
                resize: 'vertical',
                fontFamily: 'inherit',
                opacity: lastDraft ? 0.6 : 1,
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {!lastDraft && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim() || !editContent.trim()}
                  style={{
                    background: 'var(--bb-brand)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving || !editTitle.trim() || !editContent.trim() ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Salvando...' : 'Salvar Nova Versao'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </>
            )}

            {lastDraft && (
              <>
                <button
                  onClick={() => setConfirmPublishId(lastDraft.id)}
                  disabled={publishing}
                  style={{
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: publishing ? 'not-allowed' : 'pointer',
                    opacity: publishing ? 0.5 : 1,
                  }}
                >
                  Publicar Agora
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-60)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Voltar
                </button>
              </>
            )}
          </div>

          {lastDraft && (
            <p style={{ fontSize: 12, color: 'var(--bb-ink-40)', marginTop: 10 }}>
              Versao {lastDraft.version} salva como rascunho. Publique para torna-la ativa.
            </p>
          )}
        </div>
      )}

      {/* ── Version history ──────────────────────────────────── */}
      {hasTemplates && (
        <div
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--bb-ink-100)', marginBottom: 16 }}>
            Historico de Versoes
          </h2>

          {history.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--bb-ink-40)', textAlign: 'center', padding: '24px 0' }}>
              Nenhuma versao encontrada.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  background: previewId === tpl.id ? 'var(--bb-depth-4)' : 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => setPreviewId(previewId === tpl.id ? null : tpl.id)}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--bb-ink-100)' }}>
                      v{tpl.version}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--bb-ink-80)' }}>
                      {tpl.title}
                    </span>
                    {tpl.is_active && (
                      <span
                        style={{
                          background: 'rgba(34,197,94,0.15)',
                          color: '#22c55e',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          textTransform: 'uppercase',
                        }}
                      >
                        Ativa
                      </span>
                    )}
                    {!tpl.is_active && !tpl.published_at && (
                      <span
                        style={{
                          background: 'rgba(156,163,175,0.15)',
                          color: 'var(--bb-ink-60)',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          textTransform: 'uppercase',
                        }}
                      >
                        Rascunho
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--bb-ink-40)' }}>
                      {tpl.published_at ? formatDate(tpl.published_at) : formatDate(tpl.created_at)}
                    </span>
                    {!tpl.is_active && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmPublishId(tpl.id);
                        }}
                        style={{
                          background: 'var(--bb-brand)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Publicar
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded preview */}
                {previewId === tpl.id && (
                  <div
                    style={{
                      marginTop: 12,
                      background: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: 8,
                      padding: 14,
                      maxHeight: 300,
                      overflowY: 'auto',
                    }}
                  >
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: 'var(--bb-ink-80)',
                        fontFamily: 'inherit',
                        margin: 0,
                      }}
                    >
                      {tpl.content}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Publish confirmation modal ───────────────────────── */}
      {confirmPublishId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 420,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--bb-ink-100)', marginBottom: 8 }}>
              Confirmar publicacao
            </h3>
            <p style={{ fontSize: 13, color: 'var(--bb-ink-60)', marginBottom: 20, lineHeight: 1.5 }}>
              Ao publicar esta versao, ela se tornara a versao ativa do codigo de conduta.
              Todas as outras versoes serao desativadas. Deseja continuar?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handlePublish(confirmPublishId)}
                disabled={publishing}
                style={{
                  flex: 1,
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: publishing ? 'not-allowed' : 'pointer',
                  opacity: publishing ? 0.5 : 1,
                }}
              >
                {publishing ? 'Publicando...' : 'Sim, Publicar'}
              </button>
              <button
                onClick={() => setConfirmPublishId(null)}
                disabled={publishing}
                style={{
                  flex: 1,
                  background: 'var(--bb-depth-4)',
                  color: 'var(--bb-ink-60)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
