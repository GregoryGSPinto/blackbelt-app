// ============================================================
// BlackBelt v2 — Constantes de Domínio
//
// Valores de referência usados por regras de negócio (rules.ts)
// e validações em todo o sistema.
// ============================================================

import { BeltLevel, Role } from './domain';

/**
 * Ordem oficial das faixas — do menor ao maior grau.
 * Usado para comparação: indexOf(a) < indexOf(b) → a é inferior a b.
 * Belt só sobe, nunca desce.
 */
export const BELT_ORDER: readonly BeltLevel[] = [
  BeltLevel.White,
  BeltLevel.Gray,
  BeltLevel.Yellow,
  BeltLevel.Orange,
  BeltLevel.Green,
  BeltLevel.Blue,
  BeltLevel.Purple,
  BeltLevel.Brown,
  BeltLevel.Black,
] as const;

/**
 * Número mínimo de presenças exigidas para promoção à próxima faixa.
 * Chave = faixa de DESTINO. Exemplo: para subir para Gray, precisa de 20 presenças.
 *
 * White não consta pois é a faixa inicial (todo aluno começa nela).
 * Valores crescentes refletem a dificuldade progressiva das graduações.
 */
export const MIN_ATTENDANCE_FOR_PROMOTION: Readonly<Record<BeltLevel, number>> = {
  [BeltLevel.White]: 0,
  [BeltLevel.Gray]: 20,
  [BeltLevel.Yellow]: 30,
  [BeltLevel.Orange]: 40,
  [BeltLevel.Green]: 50,
  [BeltLevel.Blue]: 60,
  [BeltLevel.Purple]: 80,
  [BeltLevel.Brown]: 100,
  [BeltLevel.Black]: 150,
};

/**
 * Máximo de aulas que um aluno pode frequentar por dia.
 * Previne check-ins abusivos ou erros de registro.
 */
export const MAX_CLASSES_PER_DAY = 4 as const;

/**
 * Timeout da sessão autenticada em minutos.
 * Após esse tempo de inatividade, o access token expira
 * e o refresh token é usado para renovação silenciosa.
 */
export const SESSION_TIMEOUT_MINUTES = 30 as const;

/**
 * Mapeia role → URL do dashboard correspondente.
 * Usado pelo middleware e pelo redirect pós-login.
 */
export const ROLE_DASHBOARD: Readonly<Record<Role, string>> = {
  [Role.Admin]: '/admin',
  [Role.Professor]: '/professor',
  [Role.AlunoAdulto]: '/dashboard',
  [Role.AlunoTeen]: '/teen',
  [Role.AlunoKids]: '/kids',
  [Role.Responsavel]: '/parent',
};
