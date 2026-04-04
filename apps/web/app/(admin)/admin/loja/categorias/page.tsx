'use client';

import { useState, useEffect } from 'react';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
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
import { ArrowLeft, ChevronUp, ChevronDown, Pencil, Trash2, Plus, Download } from 'lucide-react';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const EMPTY_FORM = { name: '', slug: '', icon: '', sort_order: 0 };

const inputStyle = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
  color: 'var(--bb-ink-100)',
} as const;

export default function AdminCategoriasPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const academyId = getActiveAcademyId();

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await listCategories(academyId);
      setCategories(data);
    } catch {
      toast('Erro ao carregar categorias', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openNewForm() {
    const maxOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.sort_order))
      : 0;
    setForm({ ...EMPTY_FORM, sort_order: maxOrder + 1 });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(cat: CategoryDTO) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '',
      sort_order: cat.sort_order,
    });
    setEditingId(cat.id);
    setShowForm(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slugify(name),
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast('Nome da categoria e obrigatorio', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateCategory(editingId, {
          name: form.name,
          slug: form.slug,
          icon: form.icon || undefined,
          sort_order: form.sort_order,
        });
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        toast('Categoria atualizada', 'success');
      } else {
        const created = await createCategory(academyId, {
          name: form.name,
          slug: form.slug || slugify(form.name),
          icon: form.icon || undefined,
          sort_order: form.sort_order,
        });
        setCategories((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
        toast('Categoria criada', 'success');
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
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      toast('Categoria removida', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      const seeded = await seedDefaultCategories(academyId);
      setCategories(seeded.sort((a, b) => a.sort_order - b.sort_order));
      toast('Categorias padrao carregadas', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSeeding(false);
    }
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const current = sorted[idx];
    const swap = sorted[swapIdx];
    const tempOrder = current.sort_order;

    try {
      const [updatedCurrent, updatedSwap] = await Promise.all([
        updateCategory(current.id, { sort_order: swap.sort_order }),
        updateCategory(swap.id, { sort_order: tempOrder }),
      ]);
      setCategories((prev) =>
        prev
          .map((c) => {
            if (c.id === current.id) return updatedCurrent;
            if (c.id === swap.id) return updatedSwap;
            return c;
          })
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) {
    return (
      <PlanGate module="loja">
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
          <Skeleton variant="text" className="h-8 w-48" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="table-row" className="h-16" />
            ))}
          </div>
        </div>
      </PlanGate>
    );
  }

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <PlanGate module="loja">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
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
              Categorias
            </h1>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Organize seus produtos em categorias.
            </p>
          </div>
          <Button onClick={openNewForm} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Seed defaults button */}
        {categories.length === 0 && (
          <div
            className="flex flex-col items-center gap-4 rounded-xl p-8"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <EmptyState
              icon="🏷️"
              title="Nenhuma categoria cadastrada"
              description="Crie categorias para organizar seus produtos ou carregue as categorias padrao."
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
                  Carregar categorias padrao
                </>
              )}
            </Button>
          </div>
        )}

        {/* Category list */}
        {sorted.length > 0 && (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-60)', width: 60 }}>
                      Ordem
                    </th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--bb-ink-60)', width: 60 }}>
                      Icone
                    </th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      Slug
                    </th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      Produtos
                    </th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((cat, idx) => (
                    <tr
                      key={cat.id}
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bb-depth-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorder(cat.id, 'up')}
                            disabled={idx === 0}
                            className="rounded p-0.5 transition-colors disabled:opacity-30"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReorder(cat.id, 'down')}
                            disabled={idx === sorted.length - 1}
                            className="rounded p-0.5 transition-colors disabled:opacity-30"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xl">
                        {cat.icon || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {cat.name}
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="rounded px-1.5 py-0.5 text-xs"
                          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
                        >
                          {cat.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--bb-ink-60)' }}>
                        {cat.product_count ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(cat)}
                            className="rounded-lg p-1.5 transition-colors"
                            style={{ color: 'var(--bb-ink-40)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bb-brand)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bb-ink-40)')}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(cat.id)}
                            className="rounded-lg p-1.5 transition-colors"
                            style={{ color: 'var(--bb-ink-40)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bb-ink-40)')}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create/edit modal */}
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? 'Editar Categoria' : 'Nova Categoria'}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Nome
              </label>
              <input
                placeholder="Ex: Kimonos"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Slug (URL)
              </label>
              <input
                placeholder="kimonos"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono outline-none transition-colors"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Icone (emoji)
                </label>
                <input
                  placeholder="🥋"
                  value={form.icon}
                  onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 text-center text-lg outline-none transition-colors"
                  style={inputStyle}
                  maxLength={4}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Ordem
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm outline-none transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Preview */}
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                Preview:
              </span>
              <span className="text-xl">{form.icon || '📦'}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {form.name || 'Nome da categoria'}
              </span>
              <code className="ml-auto rounded px-1.5 py-0.5 text-xs" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-40)' }}>
                /{form.slug || 'slug'}
              </code>
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
            >
              {saving ? <Spinner size="sm" /> : editingId ? 'Salvar Alteracoes' : 'Criar Categoria'}
            </Button>
          </div>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          variant="confirm"
          title="Excluir Categoria"
        >
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja excluir esta categoria? Produtos associados ficarao sem categoria.
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
