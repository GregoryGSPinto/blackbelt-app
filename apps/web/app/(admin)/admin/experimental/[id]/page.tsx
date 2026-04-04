'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  getTrialStudent,
  getTrialActivity,
  updateTrialStudent,
  scheduleFollowUp,
  markFollowUpDone,
  extendTrial,
  cancelTrial,
  startConversion,
  generateFollowUpWhatsAppLink,
} from '@/lib/api/trial.service';
import type { TrialStudent, TrialActivity } from '@/lib/api/trial.service';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft, MessageCircle, ChevronDown,
  Plus, Check, X, Phone, Award, Star,
} from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativo' },
  converted: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Convertido' },
  expired: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Expirado' },
  cancelled: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', label: 'Cancelado' },
  no_show: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Não compareceu' },
};

const ACTIVITY_ICONS: Record<string, string> = {
  registered: '📝', first_visit: '🏠', class_attended: '🥋', checkin: '✅',
  viewed_schedule: '📅', viewed_modality: '👁️', opened_app: '📱', watched_video: '🎬',
  met_professor: '🤝', received_belt: '🥋', feedback_given: '⭐', plan_viewed: '💰',
  conversion_started: '🚀', converted: '🎉', expired: '⏰', follow_up_call: '📞',
  follow_up_whatsapp: '💬',
};

const ACTIVITY_LABELS: Record<string, string> = {
  registered: 'Se cadastrou',
  first_visit: 'Primeira visita',
  class_attended: 'Participou de aula',
  checkin: 'Fez check-in',
  viewed_schedule: 'Viu grade de horários',
  viewed_modality: 'Explorou modalidade',
  opened_app: 'Abriu o app',
  watched_video: 'Assistiu conteúdo',
  met_professor: 'Conheceu professor',
  received_belt: 'Experimentou faixa',
  feedback_given: 'Deu feedback',
  plan_viewed: 'Viu planos',
  conversion_started: 'Iniciou matrícula',
  converted: 'Se matriculou',
  expired: 'Trial expirou',
  follow_up_call: 'Academia ligou',
  follow_up_whatsapp: 'WhatsApp enviado',
};

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function progressPercent(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (now >= e) return 100;
  if (now <= s) return 0;
  return Math.round(((now - s) / (e - s)) * 100);
}

export default function ExperimentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [student, setStudent] = useState<TrialStudent | null>(null);
  const [activities, setActivities] = useState<TrialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [s, a] = await Promise.all([
          getTrialStudent(id),
          getTrialActivity(id),
        ]);
        setStudent(s);
        setActivities(a);
        if (s) {
          setNotes(s.admin_notes ?? '');
          setFollowUpDate(s.follow_up_date ?? '');
        }
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSaveNotes() {
    if (!student) return;
    setSavingNotes(true);
    try {
      const updated = await updateTrialStudent(student.id, { admin_notes: notes });
      if (updated) setStudent(updated);
      toast('Notas salvas', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
    finally { setSavingNotes(false); }
  }

  async function handleFollowUp() {
    if (!student || !followUpDate) return;
    try {
      await scheduleFollowUp(student.id, followUpDate);
      setStudent((prev) => prev ? { ...prev, follow_up_date: followUpDate, follow_up_done: false } : null);
      toast('Follow-up agendado', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleFollowUpDone() {
    if (!student) return;
    try {
      await markFollowUpDone(student.id, notes);
      setStudent((prev) => prev ? { ...prev, follow_up_done: true } : null);
      toast('Follow-up marcado como feito', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleExtend(days: number) {
    if (!student) return;
    try {
      const updated = await extendTrial(student.id, days);
      if (updated) setStudent(updated);
      toast(`Trial estendido em ${days} dias`, 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleConvert() {
    if (!student) return;
    try {
      const result = await startConversion(student.id);
      if (result) router.push(result.redirect_url);
    } catch (err) { toast(translateError(err), 'error'); }
  }

  async function handleCancel() {
    if (!student) return;
    try {
      const updated = await cancelTrial(student.id, 'Cancelado pelo admin');
      if (updated) setStudent(updated);
      toast('Trial cancelado', 'success');
    } catch (err) { toast(translateError(err), 'error'); }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-60" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center gap-3 p-8" style={{ color: 'var(--bb-ink-40)' }}>
        <p className="text-sm">Aluno experimental não encontrado</p>
        <Link href="/admin/experimental" className="text-sm" style={{ color: 'var(--bb-brand)' }}>Voltar</Link>
      </div>
    );
  }

  const days = daysRemaining(student.trial_end_date);
  const progress = progressPercent(student.trial_start_date, student.trial_end_date);
  const status = STATUS_STYLES[student.status] ?? STATUS_STYLES.active;

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      {/* Back */}
      <Link href="/admin/experimental" className="flex items-center gap-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* Header card */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{student.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              <Phone className="h-3 w-3" /> {student.phone}
              {student.email && <> · {student.email}</>}
            </div>
          </div>
          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: status.bg, color: status.text }}>
            {status.label}
          </span>
        </div>

        {/* Progress bar */}
        {student.status === 'active' && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              <span>{student.trial_start_date}</span>
              <span className="font-semibold" style={{ color: days <= 2 ? '#ef4444' : days <= 4 ? '#eab308' : '#22c55e' }}>
                {days > 0 ? `${days} dias restantes` : 'Expirado'}
              </span>
              <span>{student.trial_end_date}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-3)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: days <= 2 ? '#ef4444' : days <= 4 ? '#eab308' : '#22c55e',
                }}
              />
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-4 flex gap-4 text-center">
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{student.trial_classes_attended}</p>
            <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Aulas</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{student.modalities_interest.length}</p>
            <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Modalidades</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{student.rating ?? '-'}</p>
            <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-40)' }}>Nota</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {student.status === 'active' && (
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button
              onClick={() => setShowWhatsApp(!showWhatsApp)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white"
              style={{ background: '#25D366' }}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp <ChevronDown className="h-3 w-3" />
            </button>
            {showWhatsApp && (
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-lg py-1 shadow-lg" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                {(['day3', 'day5', 'expiry', 'offer'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => { window.open(generateFollowUpWhatsAppLink(student, type), '_blank'); setShowWhatsApp(false); }}
                    className="block w-full px-3 py-2 text-left text-xs hover:brightness-90"
                    style={{ color: 'var(--bb-ink-80)' }}
                  >
                    {{ day3: 'Lembrete dia 3', day5: 'Lembrete dia 5', expiry: 'Aviso expiração', offer: 'Oferta especial' }[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => handleExtend(3)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
          >
            <Plus className="h-3 w-3" /> Estender +3 dias
          </button>
          <button
            onClick={handleConvert}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white"
            style={{ background: 'var(--bb-brand)' }}
          >
            <Award className="h-4 w-4" /> Converter em Aluno
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{ color: '#ef4444' }}
          >
            <X className="h-3 w-3" /> Cancelar
          </button>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Informações</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="Modalidades" value={student.modalities_interest.join(', ')} />
          <Detail label="Experiência" value={student.experience_level} />
          <Detail label="Fonte" value={student.source} />
          <Detail label="Objetivo" value={student.goals ?? '-'} />
          {student.has_health_issues && <Detail label="Saúde" value={student.health_notes ?? 'Sim'} />}
          {student.birth_date && <Detail label="Nascimento" value={student.birth_date} />}
        </div>
      </div>

      {/* Admin notes */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Notas do Admin</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione observações sobre o aluno..."
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        />
        <button
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--bb-brand)' }}
        >
          {savingNotes ? 'Salvando...' : 'Salvar notas'}
        </button>
      </div>

      {/* Follow-up */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Follow-up</h3>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
          />
          <button
            onClick={handleFollowUp}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ background: 'var(--bb-brand)' }}
          >
            Agendar
          </button>
          {student.follow_up_date && !student.follow_up_done && (
            <button
              onClick={handleFollowUpDone}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
            >
              <Check className="h-3 w-3" /> Feito
            </button>
          )}
        </div>
        {student.follow_up_date && (
          <p className="mt-1 text-xs" style={{ color: student.follow_up_done ? '#22c55e' : 'var(--bb-ink-40)' }}>
            {student.follow_up_done ? '✅ Follow-up realizado' : `📅 Agendado para ${student.follow_up_date}`}
          </p>
        )}
      </div>

      {/* Feedback */}
      {student.rating && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          <h3 className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Feedback do Aluno</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4" style={{ color: s <= (student.rating ?? 0) ? '#eab308' : 'var(--bb-ink-20)' }} fill={s <= (student.rating ?? 0) ? '#eab308' : 'none'} />
            ))}
            <span className="ml-1 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>{student.rating}/5</span>
          </div>
          {student.feedback && <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{student.feedback}</p>}
          {student.would_recommend !== undefined && (
            <p className="mt-1 text-xs" style={{ color: student.would_recommend ? '#22c55e' : '#ef4444' }}>
              {student.would_recommend ? '👍 Recomendaria' : '👎 Não recomendaria'}
            </p>
          )}
        </div>
      )}

      {/* Activity timeline */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Timeline de Atividades</h3>
        {activities.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma atividade registrada</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={a.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-lg">{ACTIVITY_ICONS[a.activity_type] ?? '📌'}</span>
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'var(--bb-glass-border)' }} />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                    {ACTIVITY_LABELS[a.activity_type] ?? a.activity_type}
                  </p>
                  {a.details && Object.keys(a.details).length > 0 && (
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {Object.entries(a.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px]" style={{ color: 'var(--bb-ink-20)' }}>
                    {new Date(a.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase" style={{ color: 'var(--bb-ink-20)' }}>{label}</p>
      <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{value}</p>
    </div>
  );
}
