import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('academy_id', academyId);

    if (error || !data) {
      console.warn('[listInventory] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      category: (row.category ?? 'material') as InventoryCategory,
      quantity: Number(row.quantity ?? 0),
      minStock: Number(row.min_stock ?? 0),
      price: Number(row.price ?? 0),
      size: row.size ? String(row.size) : undefined,
      color: row.color ? String(row.color) : undefined,
    }));
  } catch (error) {
    console.warn('[listInventory] Fallback:', error);
    return [];
  }
}

export async function createInventoryItem(academyId: string, item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  try {
    if (isMock()) {
      const { mockCreateItem } = await import('@/lib/mocks/inventory.mock');
      return mockCreateItem(academyId, item);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({ academy_id: academyId, name: item.name, category: item.category, quantity: item.quantity, min_stock: item.minStock, price: item.price, size: item.size, color: item.color })
      .select()
      .single();

    if (error || !data) {
      console.warn('[createInventoryItem] Supabase error:', error?.message);
      return { id: '', ...item };
    }

    return {
      id: String(data.id),
      name: String(data.name ?? ''),
      category: (data.category ?? 'material') as InventoryCategory,
      quantity: Number(data.quantity ?? 0),
      minStock: Number(data.min_stock ?? 0),
      price: Number(data.price ?? 0),
      size: data.size ? String(data.size) : undefined,
      color: data.color ? String(data.color) : undefined,
    };
  } catch (error) {
    console.warn('[createInventoryItem] Fallback:', error);
    return { id: '', ...item };
  }
}

export async function addStockMovement(itemId: string, movement: Omit<StockMovement, 'id' | 'itemId' | 'date'>): Promise<StockMovement> {
  try {
    if (isMock()) {
      const { mockAddMovement } = await import('@/lib/mocks/inventory.mock');
      return mockAddMovement(itemId, movement);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({ item_id: itemId, type: movement.type, quantity: movement.quantity, student_id: movement.studentId, note: movement.note })
      .select()
      .single();

    if (error || !data) {
      console.warn('[addStockMovement] Supabase error:', error?.message);
      return { id: '', itemId, date: new Date().toISOString(), ...movement };
    }

    return {
      id: String(data.id),
      itemId: String(data.item_id ?? itemId),
      type: (data.type ?? 'in') as StockMovement['type'],
      quantity: Number(data.quantity ?? 0),
      date: String(data.created_at ?? new Date().toISOString()),
      studentId: data.student_id ? String(data.student_id) : undefined,
      note: data.note ? String(data.note) : undefined,
    };
  } catch (error) {
    console.warn('[addStockMovement] Fallback:', error);
    return { id: '', itemId, date: new Date().toISOString(), ...movement };
  }
}
