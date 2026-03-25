'use client';

import { useState, useEffect } from 'react';
import {
  listProducts, createProduct, updateProduct, deleteProduct,
  type Product, type ProductCategory, type ProductStatus, type CreateProductData,
} from '@/lib/api/store.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  quimono: 'Quimono', faixa: 'Faixa', equipamento: 'Equipamento',
  acessorio: 'Acessório', vestuario: 'Vestuário', suplemento: 'Suplemento',
};
const STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Ativo', draft: 'Rascunho', out_of_stock: 'Esgotado',
};
const STATUS_COLOR: Record<ProductStatus, string> = {
  active: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600',
  out_of_stock: 'bg-red-100 text-red-700',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const EMPTY_FORM: CreateProductData = {
  name: '', description: '', images: [], category: 'quimono',
  price: 0, compare_at_price: undefined, variants: [], low_stock_alert: 5,
  status: 'draft', featured: false,
};

export default function AdminProdutosPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    listProducts(getActiveAcademyId()).then(setProducts).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (showLowStock && p.stock_total > p.low_stock_alert) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
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
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateProduct(editingId, form);
        setProducts((prev) => prev.map((p) => p.id === editingId ? updated : p));
        toast('Produto atualizado', 'success');
      } else {
        const created = await createProduct(form);
        setProducts((prev) => [...prev, created]);
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
      toast('Produto removido', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <PlanGate module="loja">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Produtos</h1>
        <Button onClick={openNewForm}>Novo Produto</Button>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Alerta de Estoque Baixo</p>
              <p className="text-xs text-yellow-700">{lowStockCount} {lowStockCount === 1 ? 'produto' : 'produtos'} com estoque abaixo do mínimo</p>
            </div>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className="text-xs font-medium text-yellow-700 hover:underline"
            >
              {showLowStock ? 'Mostrar todos' : 'Ver apenas baixo estoque'}
            </button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todas categorias</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="ml-auto self-center text-sm text-bb-gray-500">{filtered.length} produtos</span>
      </div>

      {/* Products table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Produto</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Categoria</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Preço</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Estoque</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b border-bb-gray-100 ${product.stock_total <= product.low_stock_alert ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-bb-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-bb-black">{product.name}</p>
                        {product.featured && <span className="text-xs text-bb-primary">Destaque</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-bb-gray-500">{CATEGORY_LABEL[product.category]}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-bb-black">{formatBRL(product.price)}</span>
                    {product.compare_at_price && (
                      <span className="ml-1 text-xs text-bb-gray-400 line-through">{formatBRL(product.compare_at_price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${product.stock_total <= product.low_stock_alert ? 'text-orange-600' : 'text-bb-black'}`}>
                      {product.stock_total}
                    </span>
                    {product.stock_total <= product.low_stock_alert && (
                      <span className="ml-1 text-xs text-orange-500">Baixo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[product.status]}`}>
                      {STATUS_LABEL[product.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditForm(product)} className="text-xs text-bb-primary hover:underline">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-xs text-red-500 hover:underline">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-bb-gray-500">Nenhum produto encontrado.</td></tr>
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
          <input
            placeholder="Nome do produto"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Descrição"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
              className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
              className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs text-bb-gray-500">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-bb-gray-500">Preço comparação</label>
              <input
                type="number"
                step="0.01"
                value={form.compare_at_price ?? ''}
                onChange={(e) => setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-bb-gray-500">Alerta estoque</label>
              <input
                type="number"
                value={form.low_stock_alert}
                onChange={(e) => setForm({ ...form, low_stock_alert: Number(e.target.value) })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded"
            />
            <span className="text-bb-gray-700">Produto em destaque</span>
          </label>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-bb-black">Variações</label>
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    variants: [...form.variants, { name: '', sku: '', stock: 0, price: undefined }],
                  })
                }
                className="text-xs text-bb-primary hover:underline"
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
                    className="flex-1 rounded-lg border border-bb-gray-300 px-2 py-1.5 text-xs"
                  />
                  <input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => {
                      const v = [...form.variants];
                      v[idx] = { ...v[idx], sku: e.target.value };
                      setForm({ ...form, variants: v });
                    }}
                    className="w-24 rounded-lg border border-bb-gray-300 px-2 py-1.5 text-xs"
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
                    className="w-16 rounded-lg border border-bb-gray-300 px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      const v = [...form.variants];
                      v.splice(idx, 1);
                      setForm({ ...form, variants: v });
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleSave} disabled={saving || !form.name || !form.price}>
            {saving ? <Spinner size="sm" /> : editingId ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}
