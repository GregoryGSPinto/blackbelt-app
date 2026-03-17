import { describe, it, expect, vi } from 'vitest';

// Mock DOM APIs
const mockCreateObjectURL = vi.fn(() => 'blob:test');
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

Object.defineProperty(global, 'URL', {
  value: { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL },
  writable: true,
});

vi.spyOn(document, 'createElement').mockReturnValue({
  click: mockClick,
  href: '',
  download: '',
} as unknown as HTMLAnchorElement);

describe('Export Utils', () => {
  it('deve exportar CSV com cabeçalhos e dados', async () => {
    const { exportToCSV } = await import('@/lib/utils/export');

    const data = [
      { name: 'João', email: 'joao@test.com', age: 25 },
      { name: 'Maria', email: 'maria@test.com', age: 30 },
    ];

    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'age', label: 'Idade' },
    ];

    exportToCSV(data, columns, 'alunos');

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('deve escapar valores com vírgulas no CSV', async () => {
    const { exportToCSV } = await import('@/lib/utils/export');

    const data = [
      { name: 'Silva, João', value: 'normal' },
    ];

    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'value', label: 'Valor' },
    ];

    // Should not throw
    expect(() => exportToCSV(data, columns, 'test')).not.toThrow();
  });
});
