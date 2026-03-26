'use client';

import { useState, useEffect } from 'react';
import {
  listProducts, createProduct, updateProduct, deleteProduct, toggleFeatured,
  type Product, type ProductCategory, type ProductStatus, type CreateProductData,
} from '@/lib/api/store.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';
import Link from 'next/link';
import { ArrowLeft, Star, StarOff, Package } from 'lucide-react';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  quimono: 'Quimono', faixa: 'Faixa', equipamento: 'Equipamento',
  acessorio: 'Acessorio', vestuario: 'Vestuario', suplemento: 'Suplemento',
};
const STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Ativo', draft: 'Rascunho', out_of_stock: 'Esgotado',
};
const STATUS_COLOR: Record<ProductStatus, string> = {
  active: '#22c55e', draft: '#6b7280', out_of_stock: '#ef4444',
};

const MODALITIES = [
  { value: '', label: 'Todas modalidades' },
  { value: 'bjj', label: 'BJJ' },
  { value: 'judo', label: 'Judo' },
  { value: 'karate', label: 'Karate' },
  { value: 'mma', label: 'MMA' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'geral', label: 'Geral' },
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const EMPTY_FORM: CreateProductData & { modality?: string; brand?: string; material?: string } = {
  name: '', description: '', images: [], category: 'quimono',
  price: 0, compare_at_price: undefined, variants: [], low_stock_alert: 5,
  status: 'draft', featured: false, modality: '', brand: '', material: '',
};

const inputStyle = {
  background: 'var(--bb-depth-2)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: 'var(--bb-radius-lg)',
  color: 'var(--bb-ink-100)',
} as const;

export default function AdminProdutosPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterModality, setFilterModality] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductData & { modality?: string; brand?: string; material?: string }>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setComingSoonTimeout(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    listProducts(getActiveAcademyId()).then(setProducts).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterModality && p.modality !== filterModality) return false;
    if (showLowStock && p.stock_total > p.low_stock_alert) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !(p.brand || '').toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock_total <= p.low_stock_alert).length;

  function openNewForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setForm({
      name: product.name,
      description: product.description,
      images: product.images,
      category: product.category,
      price: product.price,
      compare_at_price: product.compare_at_price,
      variants: product.variants.map((v) => ({ name: v.name, sku: v.sku, stock: v.stock, price: v.price })),
      low_stock_alert: product.low_stock_alert,
      status: product.status,
      featured: product.featured,
      modality: product.modality || '',
      brand: product.brand || '',
      material: product.material || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { modality, brand, material, ...baseData } = form;
      const extraFields = {
        ...(modality ? { modality } : {}),
        ...(brand ? { brand } : {}),
        ...(material ? { material } : {}),
      };

      if (editingId) {
        const updated = await updateProduct(editingId, { ...baseData, ...extraFields } as Partial<CreateProductData>);
        setProducts((prev) => prev.map((p) => p.id === editingId ? { ...updated, modality, brand, material } : p));
        toast('Produto atualizado', 'success');
      } else {
        const created = await createProduct({ ...baseData, ...extraFields } as unknown as CreateProductData);
        setProducts((prev) => [...prev, { ...created, modality, brand, material }]);
        toast('Produto criado', 'success');
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
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      toast('Produto removido', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleToggleFeatured(id: string) {
    try {
      const newVal = await toggleFeatured(id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, featured: newVal, is_featured: newVal } : p,
        ),
      );
      toast(newVal ? 'Produto destacado' : 'Destaque removido', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <PlanGate module="loja">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
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
              Produtos
            </h1>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Gerencie o catalogo da sua loja.
            </p>
          </div>
          <Button onClick={openNewForm}>Novo Produto</Button>
        </div>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <div
            className="flex items-center justify-between rounded-lg p-4"
            style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: '#f59e0b20' }}
              >
                <span className="text-sm" style={{ color: '#f59e0b' }}>!</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Alerta de Estoque Baixo
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  {lowStockCount} {lowStockCount === 1 ? 'produto' : 'produtos'} com estoque abaixo do minimo
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className="text-xs font-medium transition-colors"
              style={{ color: '#f59e0b' }}
            >
              {showLowStock ? 'Mostrar todos' : 'Ver apenas baixo estoque'}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Buscar produto ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            <option value="">Todas categorias</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            <option value="">Todos status</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            className="px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            {MODALITIES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <span className="ml-auto self-center text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            {filtered.length} produtos
          </span>
        </div>

        {/* Products table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Categoria
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>
                    Marca
                  </th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Preco
                  </th>
                  <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Variacoes
                  </th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Estoque
                  </th>
                  <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const isLowStock = product.stock_total <= product.low_stock_alert;
                  const isFeatured = product.featured || product.is_featured;
                  const variantCount = product.variants.length;
                  const statusColor = STATUS_COLOR[product.status];

                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bb-depth-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
                            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
                          >
                            {product.images[0] ? (
                              <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <Package className="h-5 w-5" style={{ color: 'var(--bb-ink-40)' }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {isFeatured && (
                                <span className="text-[10px] font-medium" style={{ color: '#f59e0b' }}>
                                  Destaque
                                </span>
                              )}
                              {product.modality && (
                                <span
                                  className="rounded px-1 py-0 text-[10px]"
                                  style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-40)' }}
                                >
                                  {MODALITIES.find((m) => m.value === product.modality)?.label || product.modality}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {CATEGORY_LABEL[product.category]}
                      </td>
                      <td className="hidden px-4 py-3 text-sm sm:table-cell" style={{ color: 'var(--bb-ink-60)' }}>
                        {product.brand || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                          {formatBRL(product.price)}
                        </span>
                        {product.compare_at_price != null && product.compare_at_price > 0 && (
                          <span className="ml-1 text-xs line-through" style={{ color: 'var(--bb-ink-40)' }}>
                            {formatBRL(product.compare_at_price)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)' }}
                        >
                          {variantCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: isLowStock ? '#f59e0b' : 'var(--bb-ink-100)' }}
                        >
                          {product.stock_total}
                        </span>
                        {isLowStock && (
                          <span className="ml-1 text-[10px]" style={{ color: '#f59e0b' }}>
                            Baixo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: `${statusColor}15`,
                            color: statusColor,
                          }}
                        >
                          {STATUS_LABEL[product.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleFeatured(product.id)}
                            className="rounded-lg p-1.5 transition-colors"
                            style={{ color: isFeatured ? '#f59e0b' : 'var(--bb-ink-40)' }}
                            title={isFeatured ? 'Remover destaque' : 'Destacar'}
                          >
                            {isFeatured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => openEditForm(product)}
                            className="rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                            style={{ color: 'var(--bb-brand)' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                            style={{ color: '#ef4444' }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon="📦"
                        title="Nenhum produto encontrado"
                        description={search || filterCategory || filterStatus || filterModality
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Adicione seu primeiro produto para comecar a vender.'}
                        variant={search || filterCategory || filterStatus || filterModality ? 'search' : 'first-time'}
                        actionLabel={!search && !filterCategory && !filterStatus && !filterModality ? 'Novo Produto' : undefined}
                        onAction={!search && !filterCategory && !filterStatus && !filterModality ? openNewForm : undefined}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Product form modal */}
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? 'Editar Produto' : 'Novo Produto'}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Nome do produto
              </label>
              <input
                placeholder="Ex: Kimono BJJ Competicao"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Descricao
              </label>
              <textarea
                placeholder="Descreva o produto..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Modalidade
                </label>
                <select
                  value={form.modality || ''}
                  onChange={(e) => setForm({ ...form, modality: e.target.value })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">Nenhuma</option>
                  <option value="bjj">BJJ</option>
                  <option value="judo">Judo</option>
                  <option value="karate">Karate</option>
                  <option value="mma">MMA</option>
                  <option value="muay_thai">Muay Thai</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Marca
                </label>
                <input
                  placeholder="Ex: Koral, Shoyoroll"
                  value={form.brand || ''}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Material
                </label>
                <input
                  placeholder="Ex: Algodao 550g"
                  value={form.material || ''}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Preco (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Preco comparacao
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.compare_at_price ?? ''}
                  onChange={(e) => setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Alerta estoque
                </label>
                <input
                  type="number"
                  value={form.low_stock_alert}
                  onChange={(e) => setForm({ ...form, low_stock_alert: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded"
              />
              Produto em destaque
            </label>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Variacoes
                </label>
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      variants: [...form.variants, { name: '', sku: '', stock: 0, price: undefined }],
                    })
                  }
                  className="text-xs font-medium"
                  style={{ color: 'var(--bb-brand)' }}
                >
                  + Adicionar
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {form.variants.map((variant, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      placeholder="Nome (ex: M)"
                      value={variant.name}
                      onChange={(e) => {
                        const v = [...form.variants];
                        v[idx] = { ...v[idx], name: e.target.value };
                        setForm({ ...form, variants: v });
                      }}
                      className="flex-1 px-2 py-1.5 text-xs outline-none"
                      style={inputStyle}
                    />
                    <input
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => {
                        const v = [...form.variants];
                        v[idx] = { ...v[idx], sku: e.target.value };
                        setForm({ ...form, variants: v });
                      }}
                      className="w-24 px-2 py-1.5 text-xs outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={variant.stock}
                      onChange={(e) => {
                        const v = [...form.variants];
                        v[idx] = { ...v[idx], stock: Number(e.target.value) };
                        setForm({ ...form, variants: v });
                      }}
                      className="w-16 px-2 py-1.5 text-xs outline-none"
                      style={inputStyle}
                    />
                    <button
                      onClick={() => {
                        const v = [...form.variants];
                        v.splice(idx, 1);
                        setForm({ ...form, variants: v });
                      }}
                      className="text-xs font-medium"
                      style={{ color: '#ef4444' }}
                    >
                      X
                    </button>
                  </div>
                ))}
                {form.variants.length === 0 && (
                  <p className="text-xs py-2" style={{ color: 'var(--bb-ink-40)' }}>
                    Nenhuma variacao adicionada.
                  </p>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving || !form.name || !form.price}
            >
              {saving ? <Spinner size="sm" /> : editingId ? 'Salvar Alteracoes' : 'Criar Produto'}
            </Button>
          </div>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          variant="confirm"
          title="Excluir Produto"
        >
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja excluir este produto? Esta acao nao pode ser desfeita.
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
