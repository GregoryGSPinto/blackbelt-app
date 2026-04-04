'use client';

import { CreateFamilyWizard } from '@/components/admin/CreateFamilyWizard';
import Link from 'next/link';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

export default function CadastroFamiliaPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6" data-stagger>
      <div className="animate-reveal mb-6 flex items-center gap-3">
        <Link
          href="/admin/alunos"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
          style={{ background: 'var(--bb-depth-2)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)' }}
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Criar Familia
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Cadastro completo de responsavel e dependentes
          </p>
        </div>
      </div>
      <CreateFamilyWizard academyId={getActiveAcademyId()} />
    </div>
  );
}
