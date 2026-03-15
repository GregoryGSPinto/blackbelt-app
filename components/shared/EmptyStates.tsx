'use client';

import { Button } from '@/components/ui/Button';

// ─── Types ──────────────────────────────────────────────────

interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface EmptyStateCardProps extends EmptyStateConfig {
  className?: string;
}

// ─── Generic Empty State Card ───────────────────────────────

function EmptyStateCard({ icon, title, description, actionLabel, onAction, className }: EmptyStateCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className ?? ''}`}>
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bb-gray-100">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-bb-gray-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-bb-gray-500">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ─── Prebuilt Empty States ──────────────────────────────────

interface NoClassTodayProps {
  nextClass?: string;
  className?: string;
}

export function NoClassToday({ nextClass, className }: NoClassTodayProps) {
  return (
    <EmptyStateCard
      icon={'\uD83E\uDDD8'}
      title="Sem aula hoje"
      description={nextClass ? `Descansa hoje! Amanha: ${nextClass}` : 'Descansa hoje! Volte amanha.'}
      className={className}
    />
  );
}

interface NoAchievementsProps {
  onExplore?: () => void;
  className?: string;
}

export function NoAchievements({ onExplore, className }: NoAchievementsProps) {
  return (
    <EmptyStateCard
      icon={'\uD83C\uDFC5'}
      title="Nenhuma conquista ainda"
      description="Sua primeira conquista esta proxima! Continue treinando e ela vai chegar."
      actionLabel={onExplore ? 'Ver conquistas disponiveis' : undefined}
      onAction={onExplore}
      className={className}
    />
  );
}

interface NoMessagesProps {
  onStartConversation?: () => void;
  className?: string;
}

export function NoMessages({ onStartConversation, className }: NoMessagesProps) {
  return (
    <EmptyStateCard
      icon={'\uD83D\uDCAC'}
      title="Nenhuma mensagem ainda"
      description="Inicie uma conversa com seu professor ou colegas de treino."
      actionLabel={onStartConversation ? 'Nova mensagem' : undefined}
      onAction={onStartConversation}
      className={className}
    />
  );
}

interface NoStudentsProps {
  onInvite?: () => void;
  className?: string;
}

export function NoStudents({ onInvite, className }: NoStudentsProps) {
  return (
    <EmptyStateCard
      icon={'\uD83E\uDD4B'}
      title="Nenhum aluno encontrado"
      description="Convide alunos para comecar a gerenciar sua academia."
      actionLabel={onInvite ? 'Convidar alunos' : undefined}
      onAction={onInvite}
      className={className}
    />
  );
}

interface NoDataProps {
  entity?: string;
  className?: string;
}

export function NoData({ entity = 'dados', className }: NoDataProps) {
  return (
    <EmptyStateCard
      icon={'\uD83D\uDCC2'}
      title={`Nenhum ${entity}`}
      description={`Nao encontramos ${entity} para exibir no momento.`}
      className={className}
    />
  );
}

interface NoResultsProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export function NoResults({ query, onClear, className }: NoResultsProps) {
  return (
    <EmptyStateCard
      icon={'\uD83D\uDD0D'}
      title="Nenhum resultado"
      description={query ? `Nao encontramos resultados para "${query}".` : 'Nao encontramos resultados para sua busca.'}
      actionLabel={onClear ? 'Limpar filtros' : undefined}
      onAction={onClear}
      className={className}
    />
  );
}

interface ErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ onRetry, className }: ErrorStateProps) {
  return (
    <EmptyStateCard
      icon={'\u26A0\uFE0F'}
      title="Algo deu errado"
      description="Ocorreu um erro ao carregar os dados. Tente novamente."
      actionLabel={onRetry ? 'Tentar novamente' : undefined}
      onAction={onRetry}
      className={className}
    />
  );
}
