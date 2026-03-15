import type { InventoryItem, StockMovement } from '@/lib/api/inventory.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const ITEMS: InventoryItem[] = [
  { id: 'inv-1', name: 'Quimono A1', category: 'quimono', quantity: 5, minStock: 3, price: 280, size: 'A1', color: 'branco' },
  { id: 'inv-2', name: 'Quimono A2', category: 'quimono', quantity: 8, minStock: 3, price: 300, size: 'A2', color: 'branco' },
  { id: 'inv-3', name: 'Quimono A3', category: 'quimono', quantity: 2, minStock: 3, price: 320, size: 'A3', color: 'branco' },
  { id: 'inv-4', name: 'Faixa Branca', category: 'faixa', quantity: 20, minStock: 5, price: 30, color: 'branca' },
  { id: 'inv-5', name: 'Faixa Azul', category: 'faixa', quantity: 10, minStock: 3, price: 35, color: 'azul' },
  { id: 'inv-6', name: 'Luva de Boxe 12oz', category: 'equipamento', quantity: 6, minStock: 2, price: 180 },
  { id: 'inv-7', name: 'Caneleira Muay Thai', category: 'equipamento', quantity: 4, minStock: 2, price: 120 },
  { id: 'inv-8', name: 'Tatame 1x1m', category: 'material', quantity: 50, minStock: 10, price: 90 },
];

export async function mockListInventory(_academyId: string): Promise<InventoryItem[]> {
  await delay();
  return ITEMS.map((i) => ({ ...i }));
}

export async function mockCreateItem(_academyId: string, item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  await delay();
  const newItem = { ...item, id: `inv-${Date.now()}` };
  ITEMS.push(newItem);
  return newItem;
}

export async function mockAddMovement(itemId: string, movement: Omit<StockMovement, 'id' | 'itemId' | 'date'>): Promise<StockMovement> {
  await delay();
  const item = ITEMS.find((i) => i.id === itemId);
  if (item) {
    if (movement.type === 'in') item.quantity += movement.quantity;
    else item.quantity -= movement.quantity;
  }
  return { ...movement, id: `mov-${Date.now()}`, itemId, date: new Date().toISOString() };
}
