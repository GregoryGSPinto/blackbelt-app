'use client';

import { useState, useEffect } from 'react';
import { getPersonalizacao, setMascoteKids, setCorKids, setTituloKids } from '@/lib/api/kids-personalizacao.service';
import type { PersonalizacaoKids, MascoteOption, TituloOption, CorOption } from '@/lib/api/kids-personalizacao.service';
import { getKidsProfile } from '@/lib/api/kids-estrelas.service';
import type { KidsProfile } from '@/lib/api/kids-estrelas.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { translateError } from '@/lib/utils/error-translator';

type ModalType = 'mascote' | 'titulo' | 'cor' | null;

export default function KidsPerfilPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const [personalizacao, setPersonalizacao] = useState<PersonalizacaoKids | null>(null);
  const [profile, setProfile] = useState<KidsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const [pers, prof] = await Promise.all([
          getPersonalizacao(studentId!),
          getKidsProfile(studentId!),
        ]);
        setPersonalizacao(pers);
        setProfile(prof);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSelectMascote(mascote: MascoteOption) {
    if (!mascote.desbloqueado) {
      toast(`${mascote.requisito || 'Bloqueado'} para desbloquear! \u{1F4AA}`, 'info');
      return;
    }
    try {
      await setMascoteKids(studentId!, mascote.id);
      setPersonalizacao((prev) =>
        prev ? { ...prev, mascoteAtual: mascote.id } : prev,
      );
      setActiveModal(null);
      toast(`Seu mascote agora \u00e9 ${mascote.nome}! ${mascote.emoji}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSelectTitulo(titulo: TituloOption) {
    if (!titulo.desbloqueado) {
      toast(`${titulo.requisito || 'Bloqueado'} para usar! \u{1F3C5}`, 'info');
      return;
    }
    try {
      await setTituloKids(studentId!, titulo.titulo);
      setPersonalizacao((prev) =>
        prev ? { ...prev, tituloAtual: titulo.titulo } : prev,
      );
      setProfile((prev) =>
        prev ? { ...prev, tituloAtual: titulo.titulo } : prev,
      );
      setActiveModal(null);
      toast(`Seu t\u00edtulo agora \u00e9 ${titulo.titulo}! \u{1F3C5}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSelectCor(cor: CorOption) {
    if (!cor.desbloqueada) {
      toast(`${cor.requisito || 'Bloqueada'} para desbloquear! \u{1F3A8}`, 'info');
      return;
    }
    try {
      await setCorKids(studentId!, cor.id);
      setPersonalizacao((prev) =>
        prev ? { ...prev, corAtual: cor.id } : prev,
      );
      setActiveModal(null);
      toast(`Sua cor agora \u00e9 ${cor.nome}! \u{1F3A8}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function getCurrentMascoteEmoji(): string {
    if (!personalizacao) return '\u{1F981}';
    const found = personalizacao.mascotesDisponiveis.find((m) => m.id === personalizacao.mascoteAtual);
    return found?.emoji || '\u{1F981}';
  }

  function getCurrentCorHex(): string {
    if (!personalizacao) return '#facc15';
    const found = personalizacao.cores.find((c) => c.id === personalizacao.corAtual);
    return found?.hex || '#facc15';
  }

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading || studentLoading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Skeleton variant="circle" className="mx-auto h-24 w-24" />
          <Skeleton variant="text" className="mx-auto h-8 w-48" />
          <Skeleton variant="text" className="mx-auto h-5 w-32" />
          <Skeleton variant="card" className="h-24 rounded-3xl" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" className="h-16 flex-1 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !personalizacao) return null;

  const mascoteEmoji = getCurrentMascoteEmoji();
  const corHex = getCurrentCorHex();

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* ── Profile Card ─── */}
        <section
          className="rounded-3xl p-6 text-center shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]"
          style={{ background: 'var(--bb-depth-3)' }}
        >
          {/* Mascot */}
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${corHex}40, ${corHex}20)`,
              border: `3px solid ${corHex}`,
            }}
          >
            <span
              className="text-[5rem] leading-none"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            >
              {mascoteEmoji}
            </span>
          </div>

          {/* Name */}
          <h1 className="mt-4 text-3xl font-extrabold text-[var(--bb-ink-100)]">
            {profile.nome}
          </h1>

          {/* Title badge */}
          <div
            className="mt-2 inline-flex items-center gap-1 rounded-full px-4 py-1 text-sm font-bold"
            style={{
              background: `${corHex}20`,
              color: corHex,
              border: `1.5px solid ${corHex}40`,
            }}
          >
            {'\u{1F3C5}'} {profile.tituloAtual}
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[var(--bb-depth-1)] p-3">
              <span className="text-2xl">{'\u2B50'}</span>
              <p className="mt-1 text-lg font-extrabold text-amber-600">
                {profile.estrelasTotal}
              </p>
              <p className="text-[10px] font-bold text-[var(--bb-ink-40)]">
                Estrelas
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--bb-depth-1)] p-3">
              <span className="text-2xl">{'\u{1F3AF}'}</span>
              <p className="mt-1 text-lg font-extrabold text-purple-600">
                {profile.nivel}
              </p>
              <p className="text-[10px] font-bold text-[var(--bb-ink-40)]">
                N\u00edvel
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--bb-depth-1)] p-3">
              <span className="text-2xl">{'\u{1F4D2}'}</span>
              <p className="mt-1 text-lg font-extrabold text-pink-600">
                {profile.figurinhasColetadas}
              </p>
              <p className="text-[10px] font-bold text-[var(--bb-ink-40)]">
                Figurinhas
              </p>
            </div>
          </div>

          {/* More stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--bb-depth-1)] p-3">
              <span className="text-xl">{'\u{1F94B}'}</span>
              <div className="text-left">
                <p className="text-sm font-extrabold text-[var(--bb-ink-100)]">
                  {profile.faixaAtual}
                </p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">Faixa</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--bb-depth-1)] p-3">
              <span className="text-xl">{'\u{1F525}'}</span>
              <div className="text-left">
                <p className="text-sm font-extrabold text-[var(--bb-ink-100)]">
                  {profile.diasSeguidos} dias
                </p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">Seguidos</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Level Progress ─── */}
        <section className="rounded-3xl bg-[var(--bb-depth-3)] p-5 shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)]">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--bb-ink-100)]">
              <span className="text-xl">{'\u{1F4C8}'}</span> N\u00edvel {profile.nivel} — {profile.nomeNivel}
            </h2>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-600">
              {profile.estrelasAtualNoNivel}/{profile.estrelasAtualNoNivel + profile.estrelasParaProximoNivel}
            </span>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
              style={{
                width: `${
                  (profile.estrelasAtualNoNivel /
                    (profile.estrelasAtualNoNivel + profile.estrelasParaProximoNivel)) *
                  100
                }%`,
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-[var(--bb-ink-40)]">
            Faltam {profile.estrelasParaProximoNivel} {'\u2B50'} para o pr\u00f3ximo n\u00edvel!
          </p>
        </section>

        {/* ── Customization Buttons ─── */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[var(--bb-ink-100)]">
            <span className="text-2xl">{'\u2728'}</span> Personalizar
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setActiveModal('mascote')}
              className="min-h-[5rem] rounded-3xl bg-[var(--bb-depth-3)] p-4 text-center shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)] transition-all active:scale-95"
            >
              <span className="text-3xl">{mascoteEmoji}</span>
              <p className="mt-1 text-xs font-bold text-[var(--bb-ink-60)]">
                Mascote
              </p>
            </button>
            <button
              onClick={() => setActiveModal('titulo')}
              className="min-h-[5rem] rounded-3xl bg-[var(--bb-depth-3)] p-4 text-center shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)] transition-all active:scale-95"
            >
              <span className="text-3xl">{'\u{1F3C5}'}</span>
              <p className="mt-1 text-xs font-bold text-[var(--bb-ink-60)]">
                T\u00edtulo
              </p>
            </button>
            <button
              onClick={() => setActiveModal('cor')}
              className="min-h-[5rem] rounded-3xl bg-[var(--bb-depth-3)] p-4 text-center shadow-[var(--bb-shadow-md)] ring-1 ring-[var(--bb-glass-border)] transition-all active:scale-95"
            >
              <span className="text-3xl">{'\u{1F3A8}'}</span>
              <p className="mt-1 text-xs font-bold text-[var(--bb-ink-60)]">
                Cor
              </p>
            </button>
          </div>
        </section>

        {/* ── Motivational ─── */}
        <section className="rounded-3xl bg-gradient-to-r from-pink-100 to-yellow-100 p-5 text-center shadow-lg">
          <span className="text-3xl">{'\u{1F308}'}</span>
          <p className="mt-2 text-sm font-extrabold text-[var(--bb-ink-100)]">
            Voc\u00ea \u00e9 incr\u00edvel do jeito que \u00e9!
          </p>
        </section>
      </div>

      {/* ── Mascote Modal ─── */}
      {activeModal === 'mascote' && personalizacao && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-[var(--bb-depth-3)] p-6 shadow-2xl ring-1 ring-[var(--bb-glass-border)]"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-[var(--bb-ink-40)]" />
            </div>
            <h3 className="mt-3 text-center text-xl font-extrabold text-[var(--bb-ink-100)]">
              Trocar Mascote {'\u{1F981}'}
            </h3>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {personalizacao.mascotesDisponiveis.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMascote(m)}
                  className={`flex min-h-[5rem] flex-col items-center rounded-2xl p-3 transition-all active:scale-95 ${
                    m.id === personalizacao.mascoteAtual
                      ? 'ring-2 ring-amber-400 shadow-lg'
                      : ''
                  }`}
                  style={{
                    background: 'var(--bb-depth-1)',
                    opacity: m.desbloqueado ? 1 : 0.4,
                  }}
                >
                  <span className={`text-4xl ${!m.desbloqueado ? 'grayscale' : ''}`}>
                    {m.emoji}
                  </span>
                  <p className="mt-1 text-[10px] font-bold text-[var(--bb-ink-60)]">
                    {m.nome}
                  </p>
                  {!m.desbloqueado && m.requisito && (
                    <p className="text-[9px] text-[var(--bb-ink-40)]">
                      {m.requisito}
                    </p>
                  )}
                  {m.id === personalizacao.mascoteAtual && (
                    <span className="text-xs">{'\u2705'}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full rounded-2xl bg-[var(--bb-depth-1)] py-3 text-sm font-bold text-[var(--bb-ink-60)] transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── T\u00edtulo Modal ─── */}
      {activeModal === 'titulo' && personalizacao && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-[var(--bb-depth-3)] p-6 shadow-2xl ring-1 ring-[var(--bb-glass-border)]"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-[var(--bb-ink-40)]" />
            </div>
            <h3 className="mt-3 text-center text-xl font-extrabold text-[var(--bb-ink-100)]">
              Trocar T\u00edtulo {'\u{1F3C5}'}
            </h3>
            <div className="mt-4 space-y-2">
              {personalizacao.titulosDisponiveis.map((t) => (
                <button
                  key={t.titulo}
                  onClick={() => handleSelectTitulo(t)}
                  className={`flex w-full min-h-[3.5rem] items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.98] ${
                    t.titulo === personalizacao.tituloAtual
                      ? 'ring-2 ring-amber-400 shadow-lg'
                      : ''
                  }`}
                  style={{
                    background: 'var(--bb-depth-1)',
                    opacity: t.desbloqueado ? 1 : 0.4,
                  }}
                >
                  <span className="text-xl">
                    {t.desbloqueado ? t.emoji : '\u{1F512}'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                      {t.titulo}
                    </p>
                    {!t.desbloqueado && t.requisito && (
                      <p className="text-xs text-[var(--bb-ink-40)]">
                        {t.requisito}
                      </p>
                    )}
                  </div>
                  {t.titulo === personalizacao.tituloAtual && (
                    <span className="text-lg">{'\u2705'}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full rounded-2xl bg-[var(--bb-depth-1)] py-3 text-sm font-bold text-[var(--bb-ink-60)] transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── Cor Modal ─── */}
      {activeModal === 'cor' && personalizacao && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-[var(--bb-depth-3)] p-6 shadow-2xl ring-1 ring-[var(--bb-glass-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex justify-center">
              <div className="h-1.5 w-12 rounded-full bg-[var(--bb-ink-40)]" />
            </div>
            <h3 className="mt-3 text-center text-xl font-extrabold text-[var(--bb-ink-100)]">
              Trocar Cor {'\u{1F3A8}'}
            </h3>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {personalizacao.cores.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCor(c)}
                  className="flex min-h-[5rem] flex-col items-center gap-2 transition-all active:scale-95"
                  style={{ opacity: c.desbloqueada ? 1 : 0.4 }}
                >
                  <div
                    className="h-14 w-14 rounded-full shadow-lg transition-all"
                    style={{
                      backgroundColor: c.hex,
                      border:
                        c.id === personalizacao.corAtual
                          ? '3px solid var(--bb-ink-100)'
                          : '3px solid transparent',
                      boxShadow:
                        c.id === personalizacao.corAtual
                          ? `0 0 16px ${c.hex}60`
                          : `0 2px 8px ${c.hex}40`,
                    }}
                  />
                  <p className="text-[10px] font-bold text-[var(--bb-ink-60)]">
                    {c.nome}
                  </p>
                  {!c.desbloqueada && c.requisito && (
                    <p className="text-[8px] text-[var(--bb-ink-40)]">
                      {c.requisito}
                    </p>
                  )}
                  {c.id === personalizacao.corAtual && (
                    <span className="text-xs">{'\u2705'}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full rounded-2xl bg-[var(--bb-depth-1)] py-3 text-sm font-bold text-[var(--bb-ink-60)] transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
