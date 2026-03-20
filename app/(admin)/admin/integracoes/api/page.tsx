'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { ApiKey, ApiKeyCreateResult } from '@/lib/api/api-keys.service';
import { listApiKeys, generateApiKey, revokeApiKey } from '@/lib/api/api-keys.service';
import { EmptyState } from '@/components/ui/EmptyState';

const ENDPOINTS = [
  { method: 'GET', path: '/api/v1/students', desc: 'Listar alunos' },
  { method: 'POST', path: '/api/v1/students', desc: 'Criar aluno' },
  { method: 'GET', path: '/api/v1/classes', desc: 'Listar turmas' },
  { method: 'GET', path: '/api/v1/attendance', desc: 'Listar presenças' },
  { method: 'POST', path: '/api/v1/attendance', desc: 'Registrar presença' },
  { method: 'GET', path: '/api/v1/invoices', desc: 'Listar faturas' },
  { method: 'GET', path: '/api/v1/plans', desc: 'Listar planos' },
  { method: 'GET', path: '/api/v1/events', desc: 'Listar eventos' },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<ApiKeyCreateResult | null>(null);
  const [name, setName] = useState('');
  const [tab, setTab] = useState<'keys' | 'docs'>('keys');

  useEffect(() => {
    listApiKeys('academy-1').then((k) => { setKeys(k); setLoading(false); });
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    const result = await generateApiKey('academy-1', name);
    setNewKeyResult(result);
    setKeys((prev) => [result.apiKey, ...prev]);
    setShowCreate(false);
    setName('');
  }

  async function handleRevoke(keyId: string) {
    await revokeApiKey(keyId);
    setKeys((prev) => prev.map((k) => k.id === keyId ? { ...k, revokedAt: new Date().toISOString() } : k));
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="API Pública" subtitle="Gerencie chaves de API para integrações externas" />

      <div className="flex gap-2 border-b border-bb-gray-200">
        {(['keys', 'docs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-bb-red text-bb-red' : 'text-bb-gray-500'}`}>
            {t === 'keys' ? 'Chaves de API' : 'Documentação'}
          </button>
        ))}
      </div>

      {tab === 'keys' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowCreate(true)}>Nova Chave</Button>
          </div>

          {newKeyResult && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="mb-2 font-semibold text-green-800">Chave criada! Copie agora — ela não será mostrada novamente.</p>
              <div className="space-y-2">
                <div><span className="text-sm text-bb-gray-500">Key:</span> <code className="rounded bg-white px-2 py-1 text-sm">{newKeyResult.key}</code></div>
                <div><span className="text-sm text-bb-gray-500">Secret:</span> <code className="rounded bg-white px-2 py-1 text-sm">{newKeyResult.secret}</code></div>
              </div>
              <button onClick={() => setNewKeyResult(null)} className="mt-2 text-sm text-green-700 underline">Fechar</button>
            </div>
          )}

          {showCreate && (
            <div className="rounded-xl border border-bb-gray-200 p-4">
              <h3 className="mb-3 font-medium">Nova Chave de API</h3>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da integração" className="mb-3 w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCreate}>Gerar</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {keys.length === 0 && (
              <EmptyState
                icon="🔑"
                title="Nenhuma chave de API"
                description="Crie chaves de API para integrar sistemas externos com a plataforma BlackBelt."
                actionLabel="Nova Chave"
                onAction={() => setShowCreate(true)}
                variant="first-time"
              />
            )}
            {keys.map((k) => (
              <div key={k.id} className={`flex items-center justify-between rounded-xl border p-4 ${k.revokedAt ? 'border-red-200 bg-red-50 opacity-60' : 'border-bb-gray-200'}`}>
                <div>
                  <p className="font-medium text-bb-gray-900">{k.name}</p>
                  <p className="text-sm text-bb-gray-500"><code>{k.keyPrefix}...</code></p>
                  <p className="text-xs text-bb-gray-400">
                    Criada em {new Date(k.createdAt).toLocaleDateString('pt-BR')}
                    {k.lastUsedAt && ` · Último uso: ${new Date(k.lastUsedAt).toLocaleDateString('pt-BR')}`}
                    {k.revokedAt && ' · Revogada'}
                  </p>
                </div>
                {!k.revokedAt && (
                  <Button variant="danger" onClick={() => handleRevoke(k.id)}>Revogar</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'docs' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <h3 className="mb-2 font-medium">Autenticação</h3>
            <p className="text-sm text-bb-gray-600">Envie o header <code className="rounded bg-bb-gray-100 px-1">X-API-Key</code> em todas as requisições.</p>
            <p className="mt-1 text-sm text-bb-gray-500">Rate limit: 100 req/min por chave. Paginação: cursor-based com <code className="rounded bg-bb-gray-100 px-1">next_cursor</code>.</p>
          </div>
          <div className="space-y-2">
            {ENDPOINTS.map((ep) => (
              <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-3 rounded-lg border border-bb-gray-200 p-3">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{ep.method}</span>
                <code className="text-sm text-bb-gray-700">{ep.path}</code>
                <span className="text-sm text-bb-gray-500">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
