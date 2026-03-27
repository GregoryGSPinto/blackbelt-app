'use client';

import { useRouter } from 'next/navigation';
import { AddChildForm } from '@/components/parent/AddChildForm';
import { ChevronLeftIcon } from '@/components/shell/icons';

const MOCK_GUARDIAN_PERSON_ID = 'person-patricia';

export default function NovoFilhoPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="mb-1 text-xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
        Adicionar Filho
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        Cadastre um dependente para acompanhar pelo app
      </p>

      <AddChildForm
        guardianPersonId={MOCK_GUARDIAN_PERSON_ID}
        onSuccess={() => router.push('/parent')}
        onCancel={() => router.back()}
      />
    </div>
  );
}
