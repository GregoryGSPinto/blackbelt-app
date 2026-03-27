'use client';

import { forwardRef, useState, useMemo } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { createPerson, createFamilyLink } from '@/lib/api/family.service';
import type { FamilyRelationship } from '@/lib/types/domain';

// ── Types ──────────────────────────────────────────────────────────────

interface AddChildFormProps {
  guardianPersonId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  birthDate: string;
  gender: string;
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  relationship: FamilyRelationship;
  hasOwnLogin: boolean;
  email: string;
  password: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS: { value: FamilyRelationship; label: string }[] = [
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mae' },
  { value: 'avo', label: 'Avo (paterno)' },
  { value: 'avo_materna', label: 'Avo (materna)' },
  { value: 'tio', label: 'Tio' },
  { value: 'tia', label: 'Tia' },
  { value: 'padrasto', label: 'Padrasto' },
  { value: 'madrasta', label: 'Madrasta' },
  { value: 'responsavel_legal', label: 'Responsavel Legal' },
  { value: 'outro', label: 'Outro' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Nao informar' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function calcAge(dateStr: string): number {
  const today = new Date();
  const birth = new Date(dateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── Component ──────────────────────────────────────────────────────────

const AddChildForm = forwardRef<HTMLFormElement, AddChildFormProps>(
  function AddChildForm({ guardianPersonId, onSuccess, onCancel }, ref) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<FormState>({
      name: '',
      birthDate: '',
      gender: '',
      medicalNotes: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      relationship: 'pai',
      hasOwnLogin: false,
      email: '',
      password: '',
    });

    const age = useMemo(() => (form.birthDate ? calcAge(form.birthDate) : null), [form.birthDate]);

    const roleLabel = useMemo(() => {
      if (age === null) return null;
      if (age >= 5 && age <= 12) return 'Kids';
      if (age >= 13 && age <= 17) return 'Teen';
      return null;
    }, [age]);

    const ageError = useMemo(() => {
      if (age === null) return null;
      if (age < 5) return 'Idade minima para cadastro de dependente e 5 anos';
      if (age > 17) return 'Para maiores de 17 anos, use o cadastro de aluno adulto';
      return null;
    }, [age]);

    function update(field: keyof FormState, value: string | boolean) {
      setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!form.name.trim()) { toast('Informe o nome do filho', 'error'); return; }
      if (!form.birthDate) { toast('Informe a data de nascimento', 'error'); return; }
      if (ageError) { toast(ageError, 'error'); return; }

      setLoading(true);
      try {
        const person = await createPerson({
          fullName: form.name.trim(),
          birthDate: form.birthDate,
          gender: form.gender || undefined,
          medicalNotes: form.medicalNotes || undefined,
          emergencyContactName: form.emergencyContactName || undefined,
          emergencyContactPhone: form.emergencyContactPhone || undefined,
        });

        await createFamilyLink({
          guardianPersonId,
          dependentPersonId: person.id,
          relationship: form.relationship,
          isPrimaryGuardian: true,
          isFinancialResponsible: true,
        });

        toast(`${form.name.trim()} cadastrado com sucesso!`, 'success');
        onSuccess?.();
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }

    const inputStyle = {
      background: 'var(--bb-depth-2)',
      color: 'var(--bb-ink-100)',
      border: '1px solid var(--bb-glass-border)',
    };

    const labelStyle = { color: 'var(--bb-ink-80)' };

    return (
      <form ref={ref} onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={labelStyle}>
            Nome completo *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Nome do filho(a)"
            required
            className="h-12 w-full rounded-lg px-3 text-sm"
            style={inputStyle}
          />
        </div>

        {/* Data de nascimento */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={labelStyle}>
            Data de nascimento *
          </label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => update('birthDate', e.target.value)}
            required
            className="h-12 w-full rounded-lg px-3 text-sm"
            style={inputStyle}
          />
          {age !== null && !ageError && (
            <span className="text-xs" style={{ color: 'var(--bb-brand)' }}>
              {age} anos — perfil {roleLabel}
            </span>
          )}
          {ageError && (
            <span className="text-xs" style={{ color: 'var(--bb-error, #ef4444)' }}>
              {ageError}
            </span>
          )}
        </div>

        {/* Genero */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={labelStyle}>Genero</label>
          <select
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
            className="h-12 w-full rounded-lg px-3 text-sm"
            style={inputStyle}
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Parentesco */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={labelStyle}>Parentesco *</label>
          <select
            value={form.relationship}
            onChange={(e) => update('relationship', e.target.value)}
            className="h-12 w-full rounded-lg px-3 text-sm"
            style={inputStyle}
          >
            {RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Observacoes medicas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={labelStyle}>
            Observacoes medicas / alergias
          </label>
          <textarea
            value={form.medicalNotes}
            onChange={(e) => update('medicalNotes', e.target.value)}
            placeholder="Alergias, medicamentos, condicoes especiais..."
            rows={3}
            className="w-full rounded-lg p-3 text-sm"
            style={inputStyle}
          />
        </div>

        {/* Contato de emergencia */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={labelStyle}>Contato de emergencia</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={form.emergencyContactName}
              onChange={(e) => update('emergencyContactName', e.target.value)}
              placeholder="Nome"
              className="h-12 w-full rounded-lg px-3 text-sm"
              style={inputStyle}
            />
            <input
              type="tel"
              value={form.emergencyContactPhone}
              onChange={(e) => update('emergencyContactPhone', e.target.value)}
              placeholder="Telefone"
              className="h-12 w-full rounded-lg px-3 text-sm"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Toggle login proprio (so para teen) */}
        {roleLabel === 'Teen' && (
          <div className="flex flex-col gap-3 rounded-lg p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Login proprio para o teen
                </p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Se ativado, o teen podera acessar o app com email e senha proprios
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.hasOwnLogin}
                onClick={() => update('hasOwnLogin', !form.hasOwnLogin)}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ background: form.hasOwnLogin ? 'var(--bb-brand)' : 'var(--bb-depth-3)' }}
              >
                <span
                  className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                  style={{ transform: form.hasOwnLogin ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
            {form.hasOwnLogin && (
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="Email do teen"
                  className="h-12 w-full rounded-lg px-3 text-sm"
                  style={inputStyle}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Senha (minimo 6 caracteres)"
                  className="h-12 w-full rounded-lg px-3 text-sm"
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        )}

        {/* Botoes */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg px-4 py-3 text-sm font-medium"
              style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)', border: '1px solid var(--bb-glass-border)' }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !!ageError}
            className="flex-1 rounded-lg px-4 py-3 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: 'var(--bb-brand)', color: '#fff' }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Filho'}
          </button>
        </div>
      </form>
    );
  },
);

AddChildForm.displayName = 'AddChildForm';

export { AddChildForm };
export type { AddChildFormProps };
