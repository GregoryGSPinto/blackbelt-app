'use client';

import { forwardRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { sendBroadcast } from '@/lib/api/mensagens.service';
import type { MessageTarget, SendBroadcastOptions } from '@/lib/types/messaging';
import { Role } from '@/lib/types/domain';
import { SendIcon } from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface BroadcastComposerProps {
  academyId: string;
  senderId: string;
  role: Role;
  onSent: () => void;
  onClose: () => void;
  open: boolean;
}

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

interface TargetOption {
  value: MessageTarget;
  label: string;
  recipientCount: number;
  adminOnly?: boolean;
}

const TARGET_OPTIONS: TargetOption[] = [
  { value: 'all', label: 'Todos da academia', recipientCount: 60, adminOnly: true },
  { value: 'all_students', label: 'Todos os alunos', recipientCount: 45 },
  { value: 'all_professors', label: 'Todos os professores', recipientCount: 8, adminOnly: true },
  { value: 'all_parents', label: 'Todos os responsaveis', recipientCount: 25, adminOnly: true },
  { value: 'class', label: 'Uma turma especifica', recipientCount: 18 },
  { value: 'belt', label: 'Uma faixa especifica', recipientCount: 12 },
];

const MOCK_CLASSES = [
  { id: 'class-bjj-ini', name: 'BJJ Iniciante' },
  { id: 'class-bjj-ava', name: 'BJJ Avancado' },
  { id: 'class-bjj-kids', name: 'BJJ Kids' },
  { id: 'class-judo', name: 'Judo' },
  { id: 'class-muay', name: 'Muay Thai' },
];

const BELT_OPTIONS = [
  { value: 'white', label: 'Branca' },
  { value: 'gray', label: 'Cinza' },
  { value: 'yellow', label: 'Amarela' },
  { value: 'orange', label: 'Laranja' },
  { value: 'green', label: 'Verde' },
  { value: 'blue', label: 'Azul' },
  { value: 'purple', label: 'Roxa' },
  { value: 'brown', label: 'Marrom' },
  { value: 'black', label: 'Preta' },
];

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

const BroadcastComposer = forwardRef<HTMLDivElement, BroadcastComposerProps>(
  function BroadcastComposer(
    { academyId, senderId, role, onSent, onClose, open },
    _ref,
  ) {
    const [target, setTarget] = useState<MessageTarget>('all_students');
    const [targetClassId, setTargetClassId] = useState('');
    const [targetBelt, setTargetBelt] = useState('');
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = role === Role.Admin || role === Role.Gestor || role === Role.Superadmin;

    const availableTargets = TARGET_OPTIONS.filter(
      (t) => !t.adminOnly || isAdmin,
    );

    const selectedTarget = availableTargets.find((t) => t.value === target);

    function getRecipientCount(): number {
      return selectedTarget?.recipientCount ?? 0;
    }

    async function handleSend() {
      if (!text.trim()) {
        setError('Digite a mensagem do comunicado');
        return;
      }
      if (target === 'class' && !targetClassId) {
        setError('Selecione uma turma');
        return;
      }
      if (target === 'belt' && !targetBelt) {
        setError('Selecione uma faixa');
        return;
      }

      setError('');
      setSending(true);

      try {
        const opts: SendBroadcastOptions = {
          subject: subject.trim() || undefined,
        };
        if (target === 'class') opts.target_class_id = targetClassId;
        if (target === 'belt') opts.target_belt = targetBelt;

        await sendBroadcast(academyId, senderId, target, text.trim(), opts);
        // Reset form
        setTarget('all_students');
        setTargetClassId('');
        setTargetBelt('');
        setSubject('');
        setText('');
        onSent();
      } catch {
        setError('Erro ao enviar comunicado. Tente novamente.');
      } finally {
        setSending(false);
      }
    }

    return (
      <Modal open={open} onClose={onClose} title="Novo Comunicado">
        <div className="space-y-4">
          {/* Target selection */}
          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Destinatarios
            </label>
            <div className="space-y-1.5">
              {availableTargets.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                  style={{
                    background:
                      target === opt.value
                        ? 'var(--bb-brand-surface)'
                        : 'var(--bb-depth-4)',
                    border:
                      target === opt.value
                        ? '1px solid var(--bb-brand)'
                        : '1px solid transparent',
                    borderRadius: 'var(--bb-radius-md)',
                  }}
                >
                  <input
                    type="radio"
                    name="broadcast-target"
                    value={opt.value}
                    checked={target === opt.value}
                    onChange={() => setTarget(opt.value)}
                    className="sr-only"
                  />
                  <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor:
                        target === opt.value ? 'var(--bb-brand)' : 'var(--bb-ink-40)',
                    }}
                  >
                    {target === opt.value && (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: 'var(--bb-brand)' }}
                      />
                    )}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Class selector */}
          {target === 'class' && (
            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Selecione a turma
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                style={{
                  color: 'var(--bb-ink-100)',
                  background: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-md)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <option value="">Selecione...</option>
                {MOCK_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Belt selector */}
          {target === 'belt' && (
            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Selecione a faixa
              </label>
              <select
                value={targetBelt}
                onChange={(e) => setTargetBelt(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                style={{
                  color: 'var(--bb-ink-100)',
                  background: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-md)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <option value="">Selecione...</option>
                {BELT_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Assunto (opcional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Lembrete importante"
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
              style={{
                color: 'var(--bb-ink-100)',
                background: 'var(--bb-depth-4)',
                borderRadius: 'var(--bb-radius-md)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          {/* Message */}
          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Mensagem
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o comunicado..."
              rows={4}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none"
              style={{
                color: 'var(--bb-ink-100)',
                background: 'var(--bb-depth-4)',
                borderRadius: 'var(--bb-radius-md)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>

          {/* Recipient count */}
          <p
            className="text-xs"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Destinatarios: <strong>{getRecipientCount()} pessoas</strong>
          </p>

          {/* Error */}
          {error && (
            <p className="text-xs" style={{ color: 'var(--bb-error, #ef4444)' }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSend} loading={sending} disabled={sending}>
              <SendIcon className="mr-1.5 h-4 w-4" />
              Enviar comunicado
            </Button>
          </div>
        </div>
      </Modal>
    );
  },
);

BroadcastComposer.displayName = 'BroadcastComposer';

export { BroadcastComposer };
