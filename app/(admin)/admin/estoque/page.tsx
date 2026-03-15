'use client';

import { useEffect, useState } from 'react';
import { listInventory, createInventoryItem, addStockMovement, type InventoryItem } from '@/lib/api/inventory.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const CATEGORY_LABEL: Record<string, string> = { quimono: 'Quimono', faixa: 'Faixa', equipamento: 'Equipamento', material: 'Material' };

export default function EstoquePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'quimono' as InventoryItem['category'], quantity: 0, minStock: 3, price: 0 });

  useEffect(() => {
    listInventory('academy-1').then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const item = await createInventoryItem('academy-1', form);
      setItems((prev) => [...prev, item]);
      setShowAdd(false);
      toast('Item adicionado', 'success');
    } catch {
      toast('Erro ao adicionar', 'error');
    }
  }

  async function handleMovement(itemId: string, type: 'in' | 'out', quantity: number) {
    try {
      await addStockMovement(itemId, { type, quantity });
      setItems((prev) =>
        prev.map((i) => i.id === itemId ? { ...i, quantity: type === 'in' ? i.quantity + quantity : i.quantity - quantity } : i)
      );
      toast(type === 'in' ? 'Entrada registrada' : 'Saída registrada', 'success');
    } catch {
      toast('Erro na movimentação', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const lowStock = items.filter((i) => i.quantity <= i.minStock);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Estoque</h1>
        <Button onClick={() => setShowAdd(true)}>Novo Item</Button>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">Estoque Baixo</p>
          <ul className="mt-1 space-y-1">
            {lowStock.map((i) => (
              <li key={i.id} className="text-xs text-yellow-700">{i.name}: {i.quantity} restantes (mínimo: {i.minStock})</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Item</th>
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Categoria</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Qtd</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Preço</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
            </tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`border-b border-bb-gray-100 ${item.quantity <= item.minStock ? 'bg-yellow-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-bb-black">{item.name}</td>
                  <td className="px-4 py-3 text-bb-gray-500">{CATEGORY_LABEL[item.category]}</td>
                  <td className="px-4 py-3 text-right font-mono text-bb-black">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {item.price}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleMovement(item.id, 'in', 1)} className="text-xs text-green-600 hover:underline">+1</button>
                      <button onClick={() => handleMovement(item.id, 'out', 1)} className="text-xs text-red-600 hover:underline" disabled={item.quantity <= 0}>-1</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Novo Item">
        <div className="space-y-4">
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as InventoryItem['category'] })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="Qtd" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="Mín" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input type="number" placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={!form.name}>Adicionar</Button>
        </div>
      </Modal>
    </div>
  );
}
