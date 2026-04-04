'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface SandboxEndpoint {
  method: 'GET' | 'POST';
  path: string;
  label: string;
  defaultBody?: string;
  mockResponse: string;
}

const ENDPOINTS: SandboxEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/students',
    label: 'Listar Alunos',
    mockResponse: JSON.stringify({
      data: [
        { id: 'stu_1', name: 'Carlos Silva', email: 'carlos@email.com', belt: 'blue', status: 'active' },
        { id: 'stu_2', name: 'Ana Santos', email: 'ana@email.com', belt: 'purple', status: 'active' },
      ],
      meta: { total: 150, limit: 20, nextCursor: 'eyJpZCI6InN0dV8yMCJ9' },
      links: { self: '/api/v1/students?limit=20', next: '/api/v1/students?limit=20&cursor=eyJpZCI6InN0dV8yMCJ9' },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/students',
    label: 'Criar Aluno',
    defaultBody: JSON.stringify({ name: 'Novo Aluno', email: 'novo@email.com', belt: 'white' }, null, 2),
    mockResponse: JSON.stringify({
      data: { id: 'stu_151', name: 'Novo Aluno', email: 'novo@email.com', belt: 'white', status: 'active' },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/classes',
    label: 'Listar Turmas',
    mockResponse: JSON.stringify({
      data: [
        { id: 'cls_1', name: 'BJJ Adulto', modality: 'jiu-jitsu', schedule: 'Seg/Qua/Sex 19:00', capacity: 30, enrolled: 24 },
        { id: 'cls_2', name: 'Muay Thai', modality: 'muay-thai', schedule: 'Ter/Qui 20:00', capacity: 25, enrolled: 18 },
      ],
      meta: { total: 12, limit: 20, nextCursor: null },
      links: { self: '/api/v1/classes', next: null },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/attendance',
    label: 'Listar Presencas',
    mockResponse: JSON.stringify({
      data: [
        { id: 'att_1', studentId: 'stu_1', classId: 'cls_1', date: '2025-12-01T19:00:00Z' },
        { id: 'att_2', studentId: 'stu_2', classId: 'cls_1', date: '2025-12-01T19:00:00Z' },
      ],
      meta: { total: 1200, limit: 20, nextCursor: 'eyJpZCI6ImF0dF8yMCJ9' },
      links: { self: '/api/v1/attendance', next: '/api/v1/attendance?cursor=eyJpZCI6ImF0dF8yMCJ9' },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/attendance',
    label: 'Registrar Presenca',
    defaultBody: JSON.stringify({ studentId: 'stu_1', classId: 'cls_1' }, null, 2),
    mockResponse: JSON.stringify({
      data: { id: 'att_1201', studentId: 'stu_1', classId: 'cls_1', date: '2025-12-02T19:00:00Z' },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/invoices',
    label: 'Listar Faturas',
    mockResponse: JSON.stringify({
      data: [
        { id: 'inv_1', studentId: 'stu_1', amount: 199.90, currency: 'BRL', status: 'paid', dueDate: '2025-12-05', paidAt: '2025-12-03T14:22:00Z' },
      ],
      meta: { total: 450, limit: 20, nextCursor: 'eyJpZCI6Imludl8yMCJ9' },
      links: { self: '/api/v1/invoices', next: '/api/v1/invoices?cursor=eyJpZCI6Imludl8yMCJ9' },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/plans',
    label: 'Listar Planos',
    mockResponse: JSON.stringify({
      data: [
        { id: 'plan_1', name: 'Mensal', price: 199.90, interval: 'monthly' },
        { id: 'plan_2', name: 'Trimestral', price: 539.70, interval: 'quarterly' },
        { id: 'plan_3', name: 'Anual', price: 1919.00, interval: 'yearly' },
      ],
      meta: { total: 3, limit: 20, nextCursor: null },
      links: { self: '/api/v1/plans', next: null },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/events',
    label: 'Listar Eventos',
    mockResponse: JSON.stringify({
      data: [
        { id: 'evt_1', name: 'Seminario de Guarda', date: '2025-12-15T10:00:00Z', type: 'seminario' },
        { id: 'evt_2', name: 'Graduacao Dezembro', date: '2025-12-20T16:00:00Z', type: 'graduacao' },
      ],
      meta: { total: 8, limit: 20, nextCursor: null },
      links: { self: '/api/v1/events', next: null },
    }, null, 2),
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
};

export default function SandboxPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [requestBody, setRequestBody] = useState(ENDPOINTS[0].defaultBody ?? '');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const selected = ENDPOINTS[selectedIdx];

  const handleEndpointChange = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setRequestBody(ENDPOINTS[idx].defaultBody ?? '');
    setResponse('');
    setResponseTime(null);
  }, []);

  const handleSend = useCallback(() => {
    setLoading(true);
    setResponse('');
    const start = performance.now();
    // Simulate network delay
    setTimeout(() => {
      try {
        const elapsed = Math.round(performance.now() - start);
        setResponse(selected.mockResponse);
        setResponseTime(elapsed);
      } catch (err) {
        console.error('[SandboxPage]', err);
      } finally {
        setLoading(false);
      }
    }, 300 + Math.random() * 400);
  }, [selected]);

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="border-b border-bb-gray-200 bg-white px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-2 text-sm text-bb-gray-500">
            <Link href="/developers" className="hover:text-bb-red">Developers</Link>
            <span className="mx-2">/</span>
            <span className="text-bb-gray-900">API Sandbox</span>
          </nav>
          <h1 className="text-2xl font-bold text-bb-gray-900">API Sandbox</h1>
          <p className="mt-1 text-sm text-bb-gray-500">
            Teste endpoints da API com respostas simuladas. Nenhuma chave necessaria.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Request Panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-bb-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-bb-gray-900">Request</h2>

              {/* Endpoint Selector */}
              <label className="mb-1 block text-sm font-medium text-bb-gray-700">Endpoint</label>
              <select
                value={selectedIdx}
                onChange={(e) => handleEndpointChange(Number(e.target.value))}
                className="mb-4 w-full rounded-lg border border-bb-gray-200 px-3 py-2 text-sm"
              >
                {ENDPOINTS.map((ep, idx) => (
                  <option key={`${ep.method}-${ep.path}`} value={idx}>
                    {ep.method} {ep.path} — {ep.label}
                  </option>
                ))}
              </select>

              {/* Method + Path Display */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-bb-gray-200 bg-bb-gray-50 px-3 py-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${METHOD_COLORS[selected.method]}`}>
                  {selected.method}
                </span>
                <code className="text-sm text-bb-gray-700">{selected.path}</code>
              </div>

              {/* Request Body */}
              {selected.method === 'POST' && (
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-bb-gray-700">Body (JSON)</label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-bb-gray-200 bg-bb-gray-50 px-3 py-2 font-mono text-sm"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Headers display */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-bb-gray-700">Headers</label>
                <div className="space-y-1 rounded-lg border border-bb-gray-200 bg-bb-gray-50 p-3 text-xs font-mono text-bb-gray-600">
                  <div>Content-Type: application/json</div>
                  <div>X-API-Key: bb_test_xxxxxxxxxxxx</div>
                </div>
              </div>

              <Button variant="primary" onClick={handleSend}>
                {loading ? 'Enviando...' : 'Enviar Request'}
              </Button>
            </div>
          </div>

          {/* Response Panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-bb-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-bb-gray-900">Response</h2>
                {responseTime !== null && (
                  <div className="flex items-center gap-3 text-xs text-bb-gray-500">
                    <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700">200 OK</span>
                    <span>{responseTime}ms</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center text-bb-gray-400">
                  <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : response ? (
                <pre className="max-h-96 overflow-auto rounded-lg bg-bb-gray-900 p-4 text-xs leading-relaxed text-green-400">
                  <code>{response}</code>
                </pre>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-bb-gray-200 text-sm text-bb-gray-400">
                  Selecione um endpoint e clique em &quot;Enviar Request&quot;
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-blue-800">Dica</h3>
              <p className="text-xs text-blue-700">
                Este sandbox retorna respostas simuladas. Para testar com dados reais, gere uma chave de API em{' '}
                <Link href="/admin/integracoes/api" className="underline">
                  Admin &gt; Integracoes &gt; API
                </Link>{' '}
                e use o SDK local.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
