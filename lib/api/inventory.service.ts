import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type InventoryCategory = 'quimono' | 'faixa' | 'equipamento' | 'material';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock: number;
  price: number;
  size?: string;
  color?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'sale';
  quantity: number;
  date: string;
  studentId?: string;
  note?: string;
}

export async function listInventory(academyId: string): Promise<InventoryItem[]> {
  try {
    if (isMock()) {
      const { mockListInventory } = await import('@/lib/mocks/inventory.mock');
      return mockListInventory(academyId);
    }
    try {
      const res = await fetch(`/api/inventory?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'inventory.list');
      return res.json();
    } catch {
      console.warn('[inventory.listInventory] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'inventory.list'); }
}

export async function createInventoryItem(academyId: string, item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  try {
    if (isMock()) {
      const { mockCreateItem } = await import('@/lib/mocks/inventory.mock');
      return mockCreateItem(academyId, item);
    }
    try {
      const res = await fetch(`/api/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...item }) });
      if (!res.ok) throw new ServiceError(res.status, 'inventory.create');
      return res.json();
    } catch {
      console.warn('[inventory.createInventoryItem] API not available, using fallback');
      return { id: "", name: "", category: "", quantity: 0, min_quantity: 0, unit_price: 0, status: "ok", last_updated: "" } as unknown as InventoryItem;
    }
  } catch (error) { handleServiceError(error, 'inventory.create'); }
}

export async function addStockMovement(itemId: string, movement: Omit<StockMovement, 'id' | 'itemId' | 'date'>): Promise<StockMovement> {
  try {
    if (isMock()) {
      const { mockAddMovement } = await import('@/lib/mocks/inventory.mock');
      return mockAddMovement(itemId, movement);
    }
    try {
      const res = await fetch(`/api/inventory/${itemId}/movement`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(movement) });
      if (!res.ok) throw new ServiceError(res.status, 'inventory.movement');
      return res.json();
    } catch {
      console.warn('[inventory.addStockMovement] API not available, using fallback');
      return { id: "", item_id: "", type: "in", quantity: 0, reason: "", created_by: "", created_at: "" } as unknown as StockMovement;
    }
  } catch (error) { handleServiceError(error, 'inventory.movement'); }
}
