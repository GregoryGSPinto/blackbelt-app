'use client';

import { forwardRef, useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { getMyContacts } from '@/lib/api/mensagens.service';
import type { Contact } from '@/lib/types/messaging';
import { Role } from '@/lib/types/domain';
import { SearchIcon } from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface NewConversationModalProps {
  profileId: string;
  role: Role;
  academyId: string;
  onSelect: (contact: Contact) => void;
  onClose: () => void;
  open: boolean;
}

// ────────────────────────────────────────────────────────────
// GROUP LABELS
// ────────────────────────────────────────────────────────────

function getGroupKey(role: Role): string {
  if (role === Role.Admin || role === Role.Gestor) return 'admin';
  if (role === Role.AlunoAdulto || role === Role.AlunoTeen) return 'alunos';
  if (role === Role.Professor) return 'professores';
  if (role === Role.Responsavel) return 'responsaveis';
  if (role === Role.Recepcao) return 'recepcao';
  return 'outros';
}

function getGroupLabel(key: string): string {
  const map: Record<string, string> = {
    admin: 'Administracao',
    professores: 'Professores',
    alunos: 'Alunos',
    responsaveis: 'Responsaveis',
    recepcao: 'Recepcao',
    outros: 'Outros',
  };
  return map[key] ?? key;
}

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

const NewConversationModal = forwardRef<HTMLDivElement, NewConversationModalProps>(
  function NewConversationModal(
    { profileId, role, academyId, onSelect, onClose, open },
    _ref,
  ) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadContacts = useCallback(async () => {
      if (!open) return;
      setLoading(true);
      try {
        const result = await getMyContacts(profileId, role, academyId);
        setContacts(result);
      } catch {
        // Error handled by service
      } finally {
        setLoading(false);
      }
    }, [profileId, role, academyId, open]);

    useEffect(() => {
      loadContacts();
    }, [loadContacts]);

    useEffect(() => {
      if (!open) {
        setSearchQuery('');
      }
    }, [open]);

    const filtered = contacts.filter((c) =>
      c.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Group contacts by role
    const grouped = filtered.reduce<Record<string, Contact[]>>((acc, c) => {
      const key = getGroupKey(c.role);
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});

    // Maintain order
    const groupOrder = ['admin', 'professores', 'alunos', 'responsaveis', 'recepcao', 'outros'];
    const sortedGroups = groupOrder.filter((k) => grouped[k] && grouped[k].length > 0);

    return (
      <Modal open={open} onClose={onClose} title="Nova Conversa">
        {/* Search */}
        <div
          className="mb-4 flex items-center gap-2 px-3 py-2"
          style={{
            background: 'var(--bb-depth-4)',
            borderRadius: 'var(--bb-radius-md)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <SearchIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
          <input
            type="text"
            placeholder="Buscar contato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
            style={{ color: 'var(--bb-ink-100)' }}
            autoFocus
          />
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="card" className="h-14" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p
              className="py-8 text-center text-sm"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              {searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato disponivel'}
            </p>
          ) : (
            <div className="space-y-4">
              {sortedGroups.map((groupKey) => (
                <div key={groupKey}>
                  <p
                    className="mb-2 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--bb-ink-40)' }}
                  >
                    {getGroupLabel(groupKey)}
                  </p>
                  <div className="space-y-1">
                    {grouped[groupKey].map((contact) => (
                      <button
                        key={contact.profile_id}
                        onClick={() => onSelect(contact)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                        style={{ background: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bb-depth-4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Avatar
                          name={contact.display_name}
                          src={contact.avatar_url}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--bb-ink-100)' }}
                          >
                            {contact.display_name}
                          </p>
                          {contact.classes_in_common.length > 0 && (
                            <p
                              className="mt-0.5 truncate text-[11px]"
                              style={{ color: 'var(--bb-ink-40)' }}
                            >
                              {contact.classes_in_common.join(', ')}
                            </p>
                          )}
                          {contact.children_linked.length > 0 && (
                            <p
                              className="mt-0.5 text-[11px]"
                              style={{ color: 'var(--bb-brand)' }}
                            >
                              Sobre: {contact.children_linked.join(', ')}
                            </p>
                          )}
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: 'var(--bb-depth-4)',
                            color: 'var(--bb-ink-60)',
                          }}
                        >
                          {contact.role_badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    );
  },
);

NewConversationModal.displayName = 'NewConversationModal';

export { NewConversationModal };
