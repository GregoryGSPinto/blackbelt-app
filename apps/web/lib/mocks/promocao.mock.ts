import { BeltLevel, BELT_ORDER } from '@/lib/types';
import type {
  PromotionCandidateDTO,
  ExecutePromotionPayload,
  PromotionResult,
} from '@/lib/api/promocao.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetPromotionCandidate(_studentId: string): Promise<PromotionCandidateDTO> {
  await delay();
  const currentBelt = BeltLevel.Blue;
  const nextIndex = BELT_ORDER.indexOf(currentBelt) + 1;
  const nextBelt = BELT_ORDER[nextIndex] ?? BeltLevel.Black;

  return {
    student_id: _studentId,
    academy_id: 'academy-1',
    display_name: 'Lucas Mendes',
    avatar: null,
    current_belt: currentBelt,
    next_belt: nextBelt,
    total_classes: 187,
    months_at_current_belt: 14,
    attendance_streak: 23,
    last_evaluation_score: 92,
    achievements_count: 12,
    xp_total: 4850,
  };
}

export async function mockExecutePromotion(data: ExecutePromotionPayload): Promise<PromotionResult> {
  // Simulate a longer delay for the ceremony
  await new Promise((r) => setTimeout(r, 1500));

  return {
    success: true,
    progression_id: `prog-${Date.now()}`,
    new_belt: data.to_belt,
    xp_awarded: 100,
    actions: [
      {
        type: 'notification',
        label: 'Notificação enviada',
        detail: `${data.teacher_message || 'Parabéns pela conquista!'}`,
        done: true,
      },
      {
        type: 'feed_post',
        label: 'Post no feed',
        detail: `Promoção de ${data.from_belt} para ${data.to_belt} publicada no feed da academia`,
        done: true,
      },
      {
        type: 'xp_bonus',
        label: '+100 XP concedidos',
        detail: 'Bônus de experiência por promoção de faixa',
        done: true,
      },
      {
        type: 'achievement',
        label: 'Conquista desbloqueada',
        detail: `Faixa ${data.to_belt} — nova conquista registrada`,
        done: true,
      },
    ],
  };
}
