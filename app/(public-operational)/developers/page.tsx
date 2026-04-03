'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const STATS = [
  { label: 'Academias', value: '1.000+' },
  { label: 'Plugins', value: '50+' },
  { label: 'Desenvolvedores', value: '200+' },
  { label: 'Requisicoes/dia', value: '500K+' },
];

const CARDS = [
  {
    title: 'API Reference',
    description: 'Documentacao completa de todos os endpoints da API REST do BlackBelt.',
    href: '/developers/api-reference',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'SDK Local',
    description: 'Kit de desenvolvimento com tipos TypeScript, cliente HTTP e validacao de webhooks.',
    href: '/developers/sandbox',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  {
    title: 'App Store',
    description: 'Publique seus plugins na App Store do BlackBelt e alcance milhares de academias.',
    href: '/app-store',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
];

const CODE_SNIPPET = `import { BlackBeltSDK } from '@/lib/sdk/blackbelt-sdk';

const sdk = new BlackBeltSDK({
  baseUrl: 'https://blackbelts.com.br',
  apiKey: 'bb_live_xxxxx',
});

// Listar alunos ativos
const students = await sdk.students.list({
  status: 'active',
  limit: 20,
});

// Registrar presenca
await sdk.attendance.create({
  studentId: 'stu_123',
  classId: 'cls_456',
});`;

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-bb-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-bb-gray-900 to-bb-gray-800 px-6 py-20 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Build on BlackBelt</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-bb-gray-300">
          Crie integracoes, plugins e automacoes para a maior plataforma de gestao de artes marciais.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/developers/api-reference">
            <Button variant="primary">Ver API Docs</Button>
          </Link>
          <Link href="/developers/sandbox">
            <Button variant="secondary">Testar Sandbox</Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-8 max-w-4xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-bb-gray-200 bg-white p-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-bb-red">{stat.value}</p>
              <p className="mt-1 text-sm text-bb-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-bb-gray-900">Comece Agora</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-xl border border-bb-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bb-red/10 text-bb-red">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-bb-gray-900 group-hover:text-bb-red">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-bb-gray-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-bb-gray-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">Quick Start</h2>
          <div className="overflow-hidden rounded-xl border border-bb-gray-700">
            <div className="flex items-center gap-2 bg-bb-gray-800 px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-bb-gray-400">quickstart.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-green-400">
              <code>{CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-bb-gray-900">Pronto para comecar?</h2>
        <p className="mx-auto mt-3 max-w-lg text-bb-gray-600">
          Crie sua conta de desenvolvedor e publique seu primeiro plugin na App Store do BlackBelt.
        </p>
        <div className="mt-6">
          <Link href="/app-store">
            <Button variant="primary">Explorar App Store</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
