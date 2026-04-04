'use client';

import { useState, useEffect } from 'react';
import {
  listSizeGuides,
  createSizeGuide,
  updateSizeGuide,
  deleteSizeGuide,
  getDefaultSizeGuides,
  listCategories,
  type SizeGuideDTO,
  type SizeEntry,
  type CategoryDTO,
} from '@/lib/api/store.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Download, Eye, X } from 'lucide-react';

const EMPTY_SIZE: SizeEntry = { label: '', chest_cm: undefined, height_cm: undefined, weight_kg: undefined, length_cm: undefined };

interface SizeGuideForm {
  name: string;
  category_id: string;
  tips: string;
  sizes: SizeEntry[];
}

const EMPTY_FORM: SizeGuideForm = { name: '', category_id: '', tips: '', sizes: [{ ...EMPTY_SIZE }] };

const inputStyle = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
  color: 'var(--bb-ink-100)',
} as const;

const cellInputStyle = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '6px',
  color: 'var(--bb-ink-100)',
} as const;

export default function AdminTamanhosPage() {
  const { toast } = useToast();
  const [guides, setGuides] = useState<SizeGuideDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SizeGuideForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewGuide, setPreviewGuide] = useState<SizeGuideDTO | null>(null);

  const academyId = getActiveAcademyId();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [guidesData, catsData] = await Promise.all([
        listSizeGuides(academyId),
        listCategories(academyId),
      ]);
      setGuides(guidesData);
      setCategories(catsData);
    } catch {
      toast('Erro ao carregar guias de tamanho', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openNewForm() {
    setForm({ ...EMPTY_FORM, sizes: [{ ...EMPTY_SIZE }] });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(guide: SizeGuideDTO) {
    setForm({
      name: guide.name,
      category_id: guide.category_id || '',
      tips: guide.tips || '',
      sizes: guide.sizes.length > 0 ? guide.sizes.map((s) => ({ ...s })) : [{ ...EMPTY_SIZE }],
    });
    setEditingId(guide.id);
    setShowForm(true);
  }

  function addSizeRow() {
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { ...EMPTY_SIZE }],
    }));
  }

  function removeSizeRow(idx: number) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== idx),
    }));
  }

  function updateSizeRow(idx: number, field: keyof SizeEntry, value: string | number | undefined) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast('Nome do guia e obrigatorio', 'error');
      return;
    }
    const validSizes = form.sizes.filter((s) => s.label.trim());
    if (validSizes.length === 0) {
      toast('Adicione pelo menos um tamanho', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category_id: form.category_id || undefined,
        tips: form.tips || undefined,
        sizes: validSizes,
      };

      if (editingId) {
        const updated = await updateSizeGuide(editingId, payload);
        setGuides((prev) => prev.map((g) => (g.id === editingId ? updated : g)));
        toast('Guia atualizado', 'success');
      } else {
        const created = await createSizeGuide(academyId, payload);
        setGuides((prev) => [...prev, created]);
        toast('Guia criado', 'success');
      }
      setShowForm(false);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSizeGuide(id);
      setGuides((prev) => prev.filter((g) => g.id !== id));
      setDeleteConfirm(null);
      toast('Guia removido', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      const defaults = getDefaultSizeGuides();
      const created: SizeGuideDTO[] = [];
      for (const d of defaults) {
        const guide = await createSizeGuide(academyId, {
          name: d.name,
          category_id: d.category_id,
          sizes: d.sizes,
          tips: d.tips,
        });
        created.push(guide);
      }
      setGuides((prev) => [...prev, ...created]);
      toast(`${created.length} guias padrao carregados`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSeeding(false);
    }
  }

  function getCategoryName(id?: string) {
    if (!id) return '—';
    return categories.find((c) => c.id === id)?.name || '—';
  }

  // Determine which measurement columns are relevant in a given sizes array
  function getActiveColumns(sizes: SizeEntry[]): (keyof SizeEntry)[] {
    const cols: (keyof SizeEntry)[] = [];
    if (sizes.some((s) => s.height_cm !== undefined && s.height_cm !== null)) cols.push('height_cm');
    if (sizes.some((s) => s.weight_kg !== undefined && s.weight_kg !== null)) cols.push('weight_kg');
    if (sizes.some((s) => s.chest_cm !== undefined && s.chest_cm !== null)) cols.push('chest_cm');
    if (sizes.some((s) => s.length_cm !== undefined && s.length_cm !== null)) cols.push('length_cm');
    return cols;
  }

  const COL_LABELS: Record<string, string> = {
    height_cm: 'Altura (cm)',
    weight_kg: 'Peso (kg)',
    chest_cm: 'Peito (cm)',
    length_cm: 'Comprimento (cm)',
  };

  if (loading) {
    return (
      <PlanGate module="loja">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <Skeleton variant="text" className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-36" />
            ))}
          </div>
        </div>
      </PlanGate>
    );
  }

  return (
    <PlanGate module="loja">
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/loja"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: 'var(--bb-ink-60)' }} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              Guias de Tamanho
            </h1>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Ajude seus alunos a escolherem o tamanho correto.
            </p>
          </div>
          <Button onClick={openNewForm} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Guia
          </Button>
        </div>

        {/* Empty state */}
        {guides.length === 0 && (
          <div
            className="flex flex-col items-center gap-4 rounded-xl p-8"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <EmptyState
              icon="📏"
              title="Nenhum guia de tamanho"
              description="Crie guias de tamanho para ajudar seus alunos ou carregue os guias padrao para BJJ."
              variant="first-time"
            />
            <Button
              onClick={handleSeedDefaults}
              disabled={seeding}
              variant="secondary"
              size="sm"
            >
              {seeding ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Download className="mr-1.5 h-4 w-4" />
                  Carregar guias padrao
                </>
              )}
            </Button>
          </div>
        )}

        {/* Guides grid */}
        {guides.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => {
              const activeCols = getActiveColumns(guide.sizes);
              return (
                <Card key={guide.id} className="flex flex-col p-0">
                  {/* Card header */}
                  <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                        {guide.name}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--bb-ink-40)' }}>
                        {getCategoryName(guide.category_id)}
                      </p>
                    </div>
                    <span
                      className="ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
                    >
                      {guide.sizes.length} tamanhos
                    </span>
                  </div>

                  {/* Mini preview of sizes */}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                    {guide.sizes.slice(0, 6).map((s, i) => (
                      <span
                        key={i}
                        className="rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
                      >
                        {s.label}
                      </span>
                    ))}
                    {guide.sizes.length > 6 && (
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        +{guide.sizes.length - 6}
                      </span>
                    )}
                  </div>

                  {/* Measurement columns shown */}
                  {activeCols.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {activeCols.map((col) => (
                        <span
                          key={col}
                          className="text-[10px]"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          {COL_LABELS[col]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    className="mt-auto flex items-center gap-1 border-t px-4 py-2.5"
                    style={{ borderColor: 'var(--bb-glass-border)' }}
                  >
                    <button
                      onClick={() => setPreviewGuide(guide)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                      style={{ color: 'var(--bb-ink-60)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bb-depth-2)';
                        e.currentTarget.style.color = 'var(--bb-ink-100)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = 'var(--bb-ink-60)';
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={() => openEditForm(guide)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                      style={{ color: 'var(--bb-ink-60)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bb-depth-2)';
                        e.currentTarget.style.color = 'var(--bb-brand)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = 'var(--bb-ink-60)';
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(guide.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                      style={{ color: 'var(--bb-ink-60)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bb-depth-2)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = 'var(--bb-ink-60)';
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/edit modal */}
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? 'Editar Guia de Tamanho' : 'Novo Guia de Tamanho'}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Nome do Guia
              </label>
              <input
                placeholder="Ex: Kimonos BJJ"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Categoria (opcional)
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Nenhuma</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Dicas
                </label>
                <input
                  placeholder="Dica para escolher tamanho..."
                  value={form.tips}
                  onChange={(e) => setForm((prev) => ({ ...prev, tips: e.target.value }))}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Sizes table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Tamanhos
                </label>
                <button
                  onClick={addSizeRow}
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar tamanho
                </button>
              </div>

              <div
                className="overflow-x-auto rounded-lg"
                style={{ border: '1px solid var(--bb-glass-border)' }}
              >
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <th className="px-2 py-2 text-left font-medium" style={{ color: 'var(--bb-ink-60)', minWidth: 80 }}>
                        Tamanho
                      </th>
                      <th className="px-2 py-2 text-center font-medium" style={{ color: 'var(--bb-ink-60)', minWidth: 80 }}>
                        Altura (cm)
                      </th>
                      <th className="px-2 py-2 text-center font-medium" style={{ color: 'var(--bb-ink-60)', minWidth: 80 }}>
                        Peso (kg)
                      </th>
                      <th className="px-2 py-2 text-center font-medium" style={{ color: 'var(--bb-ink-60)', minWidth: 80 }}>
                        Peito (cm)
                      </th>
                      <th className="px-2 py-2 text-center font-medium" style={{ color: 'var(--bb-ink-60)', minWidth: 90 }}>
                        Comprimento (cm)
                      </th>
                      <th className="px-2 py-2" style={{ width: 36 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {form.sizes.map((size, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <td className="px-2 py-1.5">
                          <input
                            placeholder="A1, M..."
                            value={size.label}
                            onChange={(e) => updateSizeRow(idx, 'label', e.target.value)}
                            className="w-full px-2 py-1 text-xs outline-none"
                            style={cellInputStyle}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            placeholder="—"
                            value={size.height_cm ?? ''}
                            onChange={(e) =>
                              updateSizeRow(idx, 'height_cm', e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-full px-2 py-1 text-center text-xs outline-none"
                            style={cellInputStyle}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            placeholder="—"
                            value={size.weight_kg ?? ''}
                            onChange={(e) =>
                              updateSizeRow(idx, 'weight_kg', e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-full px-2 py-1 text-center text-xs outline-none"
                            style={cellInputStyle}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            placeholder="—"
                            value={size.chest_cm ?? ''}
                            onChange={(e) =>
                              updateSizeRow(idx, 'chest_cm', e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-full px-2 py-1 text-center text-xs outline-none"
                            style={cellInputStyle}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            placeholder="—"
                            value={size.length_cm ?? ''}
                            onChange={(e) =>
                              updateSizeRow(idx, 'length_cm', e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="w-full px-2 py-1 text-center text-xs outline-none"
                            style={cellInputStyle}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {form.sizes.length > 1 && (
                            <button
                              onClick={() => removeSizeRow(idx)}
                              className="rounded p-0.5 transition-colors"
                              style={{ color: 'var(--bb-ink-40)' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bb-ink-40)')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.sizes.some((s) => s.label.trim())}
            >
              {saving ? <Spinner size="sm" /> : editingId ? 'Salvar Alteracoes' : 'Criar Guia'}
            </Button>
          </div>
        </Modal>

        {/* Preview modal */}
        <Modal
          open={!!previewGuide}
          onClose={() => setPreviewGuide(null)}
          title={previewGuide ? `Preview: ${previewGuide.name}` : ''}
        >
          {previewGuide && (
            <div className="space-y-4">
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Assim que o aluno vera na loja:
              </p>

              {/* Preview card */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
              >
                <h3 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {previewGuide.name}
                </h3>

                {previewGuide.tips && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {previewGuide.tips}
                  </p>
                )}

                <div
                  className="mt-3 overflow-x-auto rounded-lg"
                  style={{ border: '1px solid var(--bb-glass-border)' }}
                >
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'var(--bb-depth-3)', borderBottom: '1px solid var(--bb-glass-border)' }}>
                        <th className="px-3 py-2 text-left font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                          Tamanho
                        </th>
                        {getActiveColumns(previewGuide.sizes).map((col) => (
                          <th key={col} className="px-3 py-2 text-center font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                            {COL_LABELS[col]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewGuide.sizes.map((s, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: i < previewGuide.sizes.length - 1 ? '1px solid var(--bb-glass-border)' : undefined,
                            background: i % 2 === 1 ? 'var(--bb-depth-2)' : undefined,
                          }}
                        >
                          <td className="px-3 py-2 font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                            {s.label}
                          </td>
                          {getActiveColumns(previewGuide.sizes).map((col) => (
                            <td key={col} className="px-3 py-2 text-center" style={{ color: 'var(--bb-ink-60)' }}>
                              {s[col] !== undefined && s[col] !== null ? s[col] : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          variant="confirm"
          title="Excluir Guia de Tamanho"
        >
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja excluir este guia? Produtos associados perderao a referencia de tamanho.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Excluir
            </Button>
          </div>
        </Modal>
      </div>
    </PlanGate>
  );
}
