'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  exampleRequest?: string;
  exampleResponse: string;
}

interface EndpointGroup {
  name: string;
  basePath: string;
  endpoints: EndpointDef[];
}

const API_GROUPS: EndpointGroup[] = [
  {
    name: 'Students',
    basePath: '/api/v1/students',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/students',
        description: 'Lista todos os alunos com paginacao cursor-based.',
        params: [
          { name: 'status', type: 'string', required: false, description: 'Filtrar por status (active, inactive)' },
          { name: 'limit', type: 'number', required: false, description: 'Limite de resultados (max 100)' },
          { name: 'cursor', type: 'string', required: false, description: 'Cursor para proxima pagina' },
        ],
        exampleResponse: '{\n  "data": [\n    { "id": "stu_1", "name": "Carlos Silva", "email": "carlos@email.com", "belt": "blue", "status": "active" }\n  ],\n  "meta": { "total": 150, "limit": 20, "nextCursor": "eyJpZCI6InN0dV8yMCJ9" },\n  "links": { "self": "/api/v1/students?limit=20", "next": "/api/v1/students?limit=20&cursor=eyJpZCI6InN0dV8yMCJ9" }\n}',
      },
      {
        method: 'POST',
        path: '/api/v1/students',
        description: 'Cria um novo aluno.',
        params: [
          { name: 'name', type: 'string', required: true, description: 'Nome completo do aluno' },
          { name: 'email', type: 'string', required: true, description: 'Email do aluno' },
          { name: 'belt', type: 'string', required: false, description: 'Faixa atual (default: white)' },
        ],
        exampleRequest: '{\n  "name": "Ana Santos",\n  "email": "ana@email.com",\n  "belt": "white"\n}',
        exampleResponse: '{\n  "data": { "id": "stu_151", "name": "Ana Santos", "email": "ana@email.com", "belt": "white", "status": "active" }\n}',
      },
      {
        method: 'GET',
        path: '/api/v1/students/:id',
        description: 'Retorna detalhes de um aluno especifico.',
        params: [
          { name: 'id', type: 'string', required: true, description: 'ID do aluno' },
        ],
        exampleResponse: '{\n  "data": { "id": "stu_1", "name": "Carlos Silva", "email": "carlos@email.com", "belt": "blue", "status": "active" }\n}',
      },
    ],
  },
  {
    name: 'Classes',
    basePath: '/api/v1/classes',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/classes',
        description: 'Lista todas as turmas da academia.',
        params: [
          { name: 'limit', type: 'number', required: false, description: 'Limite de resultados' },
          { name: 'cursor', type: 'string', required: false, description: 'Cursor para proxima pagina' },
        ],
        exampleResponse: '{\n  "data": [\n    { "id": "cls_1", "name": "BJJ Adulto", "modality": "jiu-jitsu", "schedule": "Seg/Qua/Sex 19:00", "capacity": 30, "enrolled": 24 }\n  ],\n  "meta": { "total": 12, "limit": 20, "nextCursor": null },\n  "links": { "self": "/api/v1/classes", "next": null }\n}',
      },
    ],
  },
  {
    name: 'Attendance',
    basePath: '/api/v1/attendance',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/attendance',
        description: 'Lista registros de presenca.',
        params: [
          { name: 'studentId', type: 'string', required: false, description: 'Filtrar por aluno' },
          { name: 'classId', type: 'string', required: false, description: 'Filtrar por turma' },
          { name: 'limit', type: 'number', required: false, description: 'Limite de resultados' },
          { name: 'cursor', type: 'string', required: false, description: 'Cursor para proxima pagina' },
        ],
        exampleResponse: '{\n  "data": [\n    { "id": "att_1", "studentId": "stu_1", "classId": "cls_1", "date": "2025-12-01T19:00:00Z" }\n  ],\n  "meta": { "total": 1200, "limit": 20, "nextCursor": "eyJpZCI6ImF0dF8yMCJ9" },\n  "links": { "self": "/api/v1/attendance", "next": "/api/v1/attendance?cursor=eyJpZCI6ImF0dF8yMCJ9" }\n}',
      },
      {
        method: 'POST',
        path: '/api/v1/attendance',
        description: 'Registra presenca de um aluno em uma turma.',
        params: [
          { name: 'studentId', type: 'string', required: true, description: 'ID do aluno' },
          { name: 'classId', type: 'string', required: true, description: 'ID da turma' },
        ],
        exampleRequest: '{\n  "studentId": "stu_1",\n  "classId": "cls_1"\n}',
        exampleResponse: '{\n  "data": { "id": "att_1201", "studentId": "stu_1", "classId": "cls_1", "date": "2025-12-02T19:00:00Z" }\n}',
      },
    ],
  },
  {
    name: 'Invoices',
    basePath: '/api/v1/invoices',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/invoices',
        description: 'Lista faturas da academia.',
        params: [
          { name: 'status', type: 'string', required: false, description: 'Filtrar por status (pending, paid, overdue)' },
          { name: 'limit', type: 'number', required: false, description: 'Limite de resultados' },
          { name: 'cursor', type: 'string', required: false, description: 'Cursor para proxima pagina' },
        ],
        exampleResponse: '{\n  "data": [\n    { "id": "inv_1", "studentId": "stu_1", "amount": 199.90, "currency": "BRL", "status": "paid", "dueDate": "2025-12-05", "paidAt": "2025-12-03T14:22:00Z" }\n  ],\n  "meta": { "total": 450, "limit": 20, "nextCursor": "eyJpZCI6Imludl8yMCJ9" },\n  "links": { "self": "/api/v1/invoices", "next": "/api/v1/invoices?cursor=eyJpZCI6Imludl8yMCJ9" }\n}',
      },
    ],
  },
  {
    name: 'Plans',
    basePath: '/api/v1/plans',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/plans',
        description: 'Lista planos disponiveis da academia.',
        exampleResponse: '{\n  "data": [\n    { "id": "plan_1", "name": "Mensal", "price": 199.90, "interval": "monthly" },\n    { "id": "plan_2", "name": "Trimestral", "price": 539.70, "interval": "quarterly" }\n  ],\n  "meta": { "total": 4, "limit": 20, "nextCursor": null },\n  "links": { "self": "/api/v1/plans", "next": null }\n}',
      },
    ],
  },
  {
    name: 'Events',
    basePath: '/api/v1/events',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/events',
        description: 'Lista eventos da academia.',
        exampleResponse: '{\n  "data": [\n    { "id": "evt_1", "name": "Seminario de Guarda", "date": "2025-12-15T10:00:00Z", "type": "seminario" }\n  ],\n  "meta": { "total": 8, "limit": 20, "nextCursor": null },\n  "links": { "self": "/api/v1/events", "next": null }\n}',
      },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function ApiReferencePage() {
  const [activeGroup, setActiveGroup] = useState(API_GROUPS[0].name);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const currentGroup = API_GROUPS.find((g) => g.name === activeGroup) ?? API_GROUPS[0];

  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Header */}
      <div className="border-b border-bb-gray-200 bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-2 text-sm text-bb-gray-500">
            <Link href="/developers" className="hover:text-bb-red">Developers</Link>
            <span className="mx-2">/</span>
            <span className="text-bb-gray-900">API Reference</span>
          </nav>
          <h1 className="text-2xl font-bold text-bb-gray-900">API Reference</h1>
          <p className="mt-1 text-sm text-bb-gray-500">
            Base URL: <code className="rounded bg-bb-gray-100 px-1.5 py-0.5">https://blackbeltv2.vercel.app/api/v1</code>
            &nbsp;&middot;&nbsp;Autenticacao: Header <code className="rounded bg-bb-gray-100 px-1.5 py-0.5">X-API-Key</code>
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-bb-gray-200 bg-white p-4 lg:block">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-bb-gray-400">
            Endpoints
          </h3>
          <nav className="space-y-1">
            {API_GROUPS.map((group) => (
              <button
                key={group.name}
                onClick={() => setActiveGroup(group.name)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeGroup === group.name
                    ? 'bg-bb-red/10 text-bb-red'
                    : 'text-bb-gray-600 hover:bg-bb-gray-100'
                }`}
              >
                {group.name}
                <span className="ml-1 text-xs text-bb-gray-400">({group.endpoints.length})</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile group selector */}
        <div className="w-full lg:hidden">
          <div className="flex overflow-x-auto border-b border-bb-gray-200 bg-white px-4">
            {API_GROUPS.map((group) => (
              <button
                key={group.name}
                onClick={() => setActiveGroup(group.name)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${
                  activeGroup === group.name
                    ? 'border-bb-red text-bb-red'
                    : 'border-transparent text-bb-gray-500'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 p-6">
          <h2 className="mb-2 text-xl font-bold text-bb-gray-900">{currentGroup.name}</h2>
          <p className="mb-6 text-sm text-bb-gray-500">
            Base: <code className="rounded bg-bb-gray-100 px-1">{currentGroup.basePath}</code>
          </p>

          <div className="space-y-4">
            {currentGroup.endpoints.map((ep) => {
              const key = `${ep.method}-${ep.path}`;
              const isExpanded = expandedEndpoint === key;
              return (
                <div key={key} className="rounded-xl border border-bb-gray-200 bg-white">
                  <button
                    onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${METHOD_COLORS[ep.method]}`}>
                      {ep.method}
                    </span>
                    <code className="flex-1 text-sm text-bb-gray-800">{ep.path}</code>
                    <span className="hidden text-sm text-bb-gray-500 sm:inline">{ep.description}</span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-bb-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-bb-gray-100 px-5 py-4">
                      <p className="mb-4 text-sm text-bb-gray-600">{ep.description}</p>

                      {ep.params && ep.params.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-semibold text-bb-gray-900">Parametros</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-bb-gray-100 text-left text-xs text-bb-gray-500">
                                  <th className="pb-2 pr-4">Nome</th>
                                  <th className="pb-2 pr-4">Tipo</th>
                                  <th className="pb-2 pr-4">Obrigatorio</th>
                                  <th className="pb-2">Descricao</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ep.params.map((param) => (
                                  <tr key={param.name} className="border-b border-bb-gray-50">
                                    <td className="py-2 pr-4">
                                      <code className="text-bb-red">{param.name}</code>
                                    </td>
                                    <td className="py-2 pr-4 text-bb-gray-500">{param.type}</td>
                                    <td className="py-2 pr-4">
                                      {param.required ? (
                                        <span className="text-xs font-medium text-bb-red">sim</span>
                                      ) : (
                                        <span className="text-xs text-bb-gray-400">nao</span>
                                      )}
                                    </td>
                                    <td className="py-2 text-bb-gray-600">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {ep.exampleRequest && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-semibold text-bb-gray-900">Exemplo Request</h4>
                          <pre className="overflow-x-auto rounded-lg bg-bb-gray-900 p-4 text-xs text-green-400">
                            <code>{ep.exampleRequest}</code>
                          </pre>
                        </div>
                      )}

                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-bb-gray-900">Exemplo Response</h4>
                        <pre className="overflow-x-auto rounded-lg bg-bb-gray-900 p-4 text-xs text-green-400">
                          <code>{ep.exampleResponse}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
