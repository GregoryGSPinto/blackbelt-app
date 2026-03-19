'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getModulos,
  getProgressoGeral,
  getCertificados,
  type ModuloTeorico,
  type ProgressoGeral,
  type CertificadoTeorico,
} from '@/lib/api/academia-teorica.service';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { PlanGate } from '@/components/plans/PlanGate';

/* ── Belt color map ─────────────────────────────────────────────── */

const BELT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  branca:  { bg: 'var(--bb-belt-white)',  border: 'var(--bb-belt-white)',  text: 'var(--bb-ink-80)' },
  amarela: { bg: 'var(--bb-belt-yellow)', border: 'var(--bb-belt-yellow)', text: '#000' },
  laranja: { bg: 'var(--bb-belt-orange)', border: 'var(--bb-belt-orange)', text: '#fff' },
  verde:   { bg: 'var(--bb-belt-green)',  border: 'var(--bb-belt-green)',  text: '#fff' },
  azul:    { bg: 'var(--bb-belt-blue)',   border: 'var(--bb-belt-blue)',   text: '#fff' },
  roxa:    { bg: 'var(--bb-belt-purple)', border: 'var(--bb-belt-purple)', text: '#fff' },
  marrom:  { bg: 'var(--bb-belt-brown)',  border: 'var(--bb-belt-brown)',  text: '#fff' },
  preta:   { bg: 'var(--bb-belt-black)',  border: 'var(--bb-belt-black)',  text: '#fff' },
};

function beltStyle(faixa: string) {
  return BELT_COLORS[faixa] ?? BELT_COLORS.branca;
}

/* ── Skeleton ────────────────────────────────────────────────────── */

function Skeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="h-6 w-48 animate-pulse rounded" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      <div className="h-4 w-64 animate-pulse rounded" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      <div className="h-28 w-full animate-pulse rounded-2xl" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 w-full animate-pulse rounded-2xl" style={{ backgroundColor: 'var(--bb-depth-4)' }} />
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */

export default function AcademiaPage() {
  const [modulos, setModulos] = useState<ModuloTeorico[]>([]);
  const [progresso, setProgresso] = useState<ProgressoGeral | null>(null);
  const [certificados, setCertificados] = useState<CertificadoTeorico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getModulos(), getProgressoGeral(), getCertificados()])
      .then(([m, p, c]) => {
        setModulos(m);
        setProgresso(p);
        setCertificados(c);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  return (
    <PlanGate module="academia_teorica">
      <div className="space-y-6 p-4 md:p-6 pb-24">
        <PageHeader title="Academia Teorica" subtitle="Conhecimento que complementa o tatame" />

        {/* ── Progress card ─────────────────────────────────────────── */}
        {progresso && (
          <Card variant="glow" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Progresso geral</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  {progresso.percentual}%
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--bb-brand)' }}>
                    {progresso.completados}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Completos</p>
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--bb-info)' }}>
                    {progresso.emProgresso}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Em andamento</p>
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: 'var(--bb-success)' }}>
                    {progresso.certificados}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>Certificados</p>
                </div>
              </div>
            </div>

            <div
              className="mt-3 h-2.5 w-full overflow-hidden"
              style={{ borderRadius: 'var(--bb-radius-full)', backgroundColor: 'var(--bb-depth-4)' }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progresso.percentual}%`,
                  borderRadius: 'var(--bb-radius-full)',
                  background: 'var(--bb-brand-gradient)',
                }}
              />
            </div>
          </Card>
        )}

        {/* ── Glossary link ─────────────────────────────────────────── */}
        <Link href="/academia/glossario">
          <Card interactive className="flex items-center gap-3 p-4">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--bb-info-surface)' }}
            >
              <svg className="h-5 w-5" style={{ color: 'var(--bb-info)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Dicionario de Termos
              </p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                Glossario completo de artes marciais
              </p>
            </div>
            <svg className="h-5 w-5" style={{ color: 'var(--bb-ink-40)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Card>
        </Link>

        {/* ── Module trail ──────────────────────────────────────────── */}
        <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
          Trilha de Modulos
        </h2>

        <div className="relative space-y-3">
          {/* Vertical line connecting modules */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: 'var(--bb-depth-5)' }}
          />

          {modulos.map((modulo, idx) => {
            const belt = beltStyle(modulo.faixa);
            const isComplete = modulo.licoesCompletadas === modulo.totalLicoes && modulo.totalLicoes > 0;
            const hasProgress = modulo.licoesCompletadas > 0 && !isComplete;
            const progressPct = modulo.totalLicoes > 0
              ? Math.round((modulo.licoesCompletadas / modulo.totalLicoes) * 100)
              : 0;

            return (
              <div key={modulo.id} className="relative pl-12">
                {/* Trail dot */}
                <div
                  className="absolute left-3 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: isComplete ? 'var(--bb-success)' : modulo.bloqueado ? 'var(--bb-depth-4)' : 'var(--bb-depth-3)',
                    borderColor: isComplete ? 'var(--bb-success)' : modulo.bloqueado ? 'var(--bb-ink-20)' : 'var(--bb-brand)',
                    zIndex: 1,
                  }}
                >
                  {isComplete && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {modulo.bloqueado && (
                    <svg className="h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>

                {modulo.bloqueado ? (
                  <Card
                    className="p-4"
                    style={{ opacity: 0.5 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{modulo.icone}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                          {modulo.titulo}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                          Requer: completar {idx > 0 ? modulos[idx - 1].titulo : 'modulo anterior'}
                        </p>
                      </div>
                      <svg className="h-5 w-5" style={{ color: 'var(--bb-ink-20)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </Card>
                ) : (
                  <Link href={`/academia/${modulo.id}`}>
                    <Card
                      interactive
                      className="p-4"
                      style={{
                        borderLeft: `3px solid ${isComplete ? 'var(--bb-success)' : belt.border}`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{modulo.icone}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                              {modulo.titulo}
                            </p>
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: belt.bg, color: belt.text }}
                            >
                              {modulo.faixa}
                            </span>
                          </div>

                          <p className="mt-0.5 text-xs line-clamp-1" style={{ color: 'var(--bb-ink-60)' }}>
                            {modulo.descricao}
                          </p>

                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className="h-1.5 flex-1 overflow-hidden"
                              style={{ borderRadius: 'var(--bb-radius-full)', backgroundColor: 'var(--bb-depth-4)' }}
                            >
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${progressPct}%`,
                                  borderRadius: 'var(--bb-radius-full)',
                                  backgroundColor: isComplete ? 'var(--bb-success)' : 'var(--bb-brand)',
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--bb-ink-40)' }}>
                              {modulo.licoesCompletadas}/{modulo.totalLicoes}
                            </span>
                          </div>

                          {/* Status badges */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {modulo.quizScore != null && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: modulo.quizScore >= 70 ? 'var(--bb-success-surface)' : 'var(--bb-warning-surface)',
                                  color: modulo.quizScore >= 70 ? 'var(--bb-success)' : 'var(--bb-warning)',
                                }}
                              >
                                Quiz: {modulo.quizScore}%
                              </span>
                            )}
                            {modulo.certificadoEmitido && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Certificado
                              </span>
                            )}
                            {hasProgress && (
                              <span
                                className="text-[10px] font-medium"
                                style={{ color: 'var(--bb-brand)' }}
                              >
                                Continuar
                              </span>
                            )}
                          </div>
                        </div>

                        <svg className="mt-1 h-4 w-4 flex-shrink-0" style={{ color: 'var(--bb-ink-40)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Card>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Certificates section ──────────────────────────────────── */}
        {certificados.length > 0 && (
          <>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>
              Meus Certificados
            </h2>

            <div className="space-y-3">
              {certificados.map((cert) => (
                <Card key={cert.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'var(--bb-success-surface)' }}
                    >
                      <svg className="h-5 w-5" style={{ color: 'var(--bb-success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {cert.moduloTitulo}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        {cert.modalidade} &middot; Nota: {cert.nota}% &middot; {new Date(cert.emitidoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: beltStyle(cert.faixa).bg,
                        color: beltStyle(cert.faixa).text,
                      }}
                    >
                      {cert.faixa}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PlanGate>
  );
}
