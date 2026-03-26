'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { registerTrialStudent, generateWelcomeWhatsAppLink } from '@/lib/api/trial.service';
import type { TrialStudent, TrialSource, ExperienceLevel } from '@/lib/api/trial.service';
import { formatBrazilianPhone } from '@/lib/utils/validation';
import { ChevronDown, ChevronUp, UserPlus, MessageCircle, Copy, Check } from 'lucide-react';

const MODALITIES = ['BJJ', 'Judô', 'Karatê', 'MMA', 'Muay Thai', 'Taekwondo', 'Boxe', 'Wrestling'];
const GOALS = ['Emagrecer', 'Defesa pessoal', 'Competir', 'Disciplina', 'Saúde', 'Diversão', 'Condicionamento'];

const SOURCE_OPTIONS: { value: TrialSource; label: string }[] = [
  { value: 'walk_in', label: 'Passou na frente' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google', label: 'Google' },
  { value: 'referral', label: 'Indicação de aluno' },
  { value: 'event', label: 'Evento/Campeonato' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Site' },
  { value: 'other', label: 'Outro' },
];

const EXP_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Nunca treinei' },
  { value: 'some_experience', label: 'Já treinei um pouco' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
];

export default function NovoExperimentalPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  // Optional fields
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [source, setSource] = useState<TrialSource>('walk_in');
  const [expLevel, setExpLevel] = useState<ExperienceLevel>('beginner');
  const [goals, setGoals] = useState<string[]>([]);
  const [hasHealth, setHasHealth] = useState(false);
  const [healthNotes, setHealthNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<TrialStudent | null>(null);
  const [copied, setCopied] = useState(false);

  function toggleMod(mod: string) {
    setSelectedMods((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  }

  function toggleGoal(g: string) {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  async function handleSubmit() {
    if (!name.trim()) { toast('Informe o nome do aluno', 'error'); return; }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      toast('Informe um WhatsApp válido', 'error'); return;
    }
    if (selectedMods.length === 0) { toast('Selecione ao menos uma modalidade', 'error'); return; }

    setSaving(true);
    try {
      const student = await registerTrialStudent(getActiveAcademyId(), {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim() || undefined,
        birth_date: birthDate || undefined,
        source,
        modalities_interest: selectedMods,
        experience_level: expLevel,
        goals: goals.length > 0 ? goals.join(', ') : undefined,
        has_health_issues: hasHealth,
        health_notes: hasHealth ? healthNotes.trim() || undefined : undefined,
      });
      if (!student) { toast('Erro ao cadastrar', 'error'); return; }
      setCreated(student);
      toast(`Aluno experimental cadastrado! Boas-vindas, ${student.name}!`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleCopyCredentials() {
    if (!created) return;
    const text = `Bem-vindo(a) à academia!\nAcesse o app com:\nEmail: ${created.email || 'N/A'}\nSenha provisória: BlackBelt@2026`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    if (!created) return;
    const link = generateWelcomeWhatsAppLink(created);
    window.open(link, '_blank');
  }

  // ── Success screen ──
  if (created) {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 sm:p-6">
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.2)' }}>
            <Check className="h-8 w-8" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Cadastro realizado!
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            {created.name} tem <strong>7 dias</strong> para conhecer a academia
          </p>
        </div>

        {created.email && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <p className="mb-2 text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Credenciais de Acesso</p>
            <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>Email: {created.email}</p>
            <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>Senha: BlackBelt@2026</p>
            <button
              onClick={handleCopyCredentials}
              className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-80)' }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
            style={{ background: '#25D366' }}
          >
            <MessageCircle className="h-5 w-5" />
            Enviar boas-vindas via WhatsApp
          </button>

          <button
            onClick={() => {
              setCreated(null);
              setName(''); setPhone(''); setSelectedMods([]); setEmail('');
              setBirthDate(''); setSource('walk_in'); setExpLevel('beginner');
              setGoals([]); setHasHealth(false); setHealthNotes('');
            }}
            className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
          >
            Cadastrar outro aluno
          </button>

          <button
            onClick={() => router.push('/admin/experimental')}
            className="text-sm font-medium"
            style={{ color: 'var(--bb-brand)' }}
          >
            Ver lista de experimentais
          </button>
        </div>
      </div>
    );
  }

  // ── Registration form ──
  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Cadastro Rápido — Experimental
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Preencha em menos de 1 minuto. O aluno terá acesso completo por 7 dias.
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>
          Nome completo *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do aluno"
          className="w-full rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>
          WhatsApp *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatBrazilianPhone(e.target.value))}
          placeholder="(00) 00000-0000"
          className="w-full rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
        />
      </div>

      {/* Modalities */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>
          Modalidade de interesse *
        </label>
        <div className="flex flex-wrap gap-2">
          {MODALITIES.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => toggleMod(mod)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                selectedMods.includes(mod)
                  ? { background: 'var(--bb-brand)', color: '#fff' }
                  : { background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }
              }
            >
              {mod}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedMods([...MODALITIES])}
            className="rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-brand)', border: '1px dashed var(--bb-brand)' }}
          >
            Quero experimentar todas
          </button>
        </div>
      </div>

      {/* Toggle more info */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Mais informações (opcional)
      </button>

      {showMore && (
        <div className="space-y-4 rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            />
          </div>

          {/* Birth date */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Data de nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            />
          </div>

          {/* Source */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Como conheceu a academia</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as TrialSource)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Experience level */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Nível de experiência</label>
            <div className="flex flex-wrap gap-2">
              {EXP_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setExpLevel(o.value)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  style={
                    expLevel === o.value
                      ? { background: 'var(--bb-brand)', color: '#fff' }
                      : { background: 'var(--bb-depth-1)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase" style={{ color: 'var(--bb-ink-40)' }}>Objetivo</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGoal(g)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  style={
                    goals.includes(g)
                      ? { background: 'var(--bb-brand)', color: '#fff' }
                      : { background: 'var(--bb-depth-1)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Health */}
          <div>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              <input
                type="checkbox"
                checked={hasHealth}
                onChange={(e) => setHasHealth(e.target.checked)}
                className="rounded"
              />
              Tem alguma condição de saúde?
            </label>
            {hasHealth && (
              <textarea
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Descreva: lesão, asma, condição cardíaca..."
                className="mt-2 w-full rounded-lg px-3 py-2 text-sm"
                rows={2}
                style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-base font-bold text-white transition-opacity disabled:opacity-50"
        style={{ background: '#22c55e' }}
      >
        <UserPlus className="h-5 w-5" />
        {saving ? 'Cadastrando...' : 'INICIAR PERÍODO EXPERIMENTAL — 7 DIAS'}
      </button>
      <p className="text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        O aluno terá acesso completo a todas as modalidades por 7 dias
      </p>
    </div>
  );
}
