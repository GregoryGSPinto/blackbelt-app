import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types/domain';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface KidsBeltDTO {
  current: BeltLevel;
  current_label: string;
  current_color: string;
  next: BeltLevel;
  next_label: string;
  next_color: string;
  stars_to_next: number;
}

export interface KidsNextClassDTO {
  class_name: string;
  day_label: string;
  time: string;
  days_until: number;
}

export interface KidsStickerDTO {
  id: string;
  name: string;
  image_emoji: string;
  collected: boolean;
}

export interface KidsStickerAlbumDTO {
  total: number;
  collected: number;
  stickers: KidsStickerDTO[];
}

export interface KidsExchangeOptionDTO {
  id: string;
  stars_cost: number;
  label: string;
  emoji: string;
  available: boolean;
}

export interface KidsWeekStarsDTO {
  total: number;
  new_this_week: number;
}

export interface KidsDashboardDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: KidsBeltDTO;
  stars: KidsWeekStarsDTO;
  next_class: KidsNextClassDTO | null;
  sticker_album: KidsStickerAlbumDTO;
  exchange_options: KidsExchangeOptionDTO[];
  motivational_message: string;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getKidsDashboard(studentId: string): Promise<KidsDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetKidsDashboard } = await import('@/lib/mocks/kids.mock');
      return mockGetKidsDashboard(studentId);
    }
    const EMPTY: KidsDashboardDTO = {
      student_id: '', display_name: '', avatar: null,
      belt: { current: 'branca' as BeltLevel, current_label: 'Branca', current_color: '#fff', next: 'cinza' as BeltLevel, next_label: 'Cinza', next_color: '#9ca3af', stars_to_next: 0 },
      stars: { total: 0, new_this_week: 0 },
      next_class: null,
      sticker_album: { total: 0, collected: 0, stickers: [] },
      exchange_options: [],
      motivational_message: 'Bem-vindo ao BlackBelt!',
    };

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Belt display mappings
      const BELT_MAP: Record<string, { label: string; color: string }> = {
        white: { label: 'Branca', color: '#ffffff' },
        gray: { label: 'Cinza', color: '#9ca3af' },
        yellow: { label: 'Amarela', color: '#eab308' },
        orange: { label: 'Laranja', color: '#f97316' },
        green: { label: 'Verde', color: '#22c55e' },
        blue: { label: 'Azul', color: '#3b82f6' },
        purple: { label: 'Roxa', color: '#a855f7' },
        brown: { label: 'Marrom', color: '#92400e' },
        black: { label: 'Preta', color: '#000000' },
      };
      const BELT_ORDER: BeltLevel[] = ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'] as BeltLevel[];
      const STARS_PER_BELT = 50;

      // ── Parallel queries ─────────────────────────────────────
      const [studentRes, xpTotalRes, xpWeekRes, stickersRes, enrollmentsRes] = await Promise.all([
        supabase.from('students')
          .select('id, belt, profiles!students_profile_id_fkey(display_name, avatar)')
          .eq('id', studentId)
          .single(),
        supabase.from('xp_ledger')
          .select('amount')
          .eq('student_id', studentId),
        supabase.from('xp_ledger')
          .select('amount')
          .eq('student_id', studentId)
          .gte('created_at', weekAgo),
        supabase.from('achievements')
          .select('id, type, granted_at, achievement_definitions(id, name, icon)')
          .eq('student_id', studentId),
        supabase.from('class_enrollments')
          .select('class_id, classes(id, schedule, modalities(name))')
          .eq('student_id', studentId)
          .eq('status', 'active'),
      ]);

      if (studentRes.error || !studentRes.data) {
        console.warn('[getKidsDashboard] student not found:', studentRes.error?.message);
        return EMPTY;
      }

      const student = studentRes.data;
      const profileData = student.profiles as Record<string, unknown> | null;
      const displayName = (profileData?.display_name ?? '') as string;
      const avatar = (profileData?.avatar ?? null) as string | null;
      const currentBelt = (student.belt ?? 'white') as BeltLevel;
      const beltIdx = BELT_ORDER.indexOf(currentBelt);
      const nextBeltIdx = Math.min(beltIdx + 1, BELT_ORDER.length - 1);
      const nextBelt = BELT_ORDER[nextBeltIdx];

      // Stars (XP)
      const totalStars = (xpTotalRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0), 0);
      const weekStars = (xpWeekRes.data ?? []).reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0), 0);

      // Belt progress
      const starsInCurrentBelt = totalStars - (beltIdx * STARS_PER_BELT);
      const starsToNext = beltIdx === nextBeltIdx ? 0 : Math.max(0, STARS_PER_BELT - starsInCurrentBelt);

      const belt: KidsBeltDTO = {
        current: currentBelt,
        current_label: BELT_MAP[currentBelt]?.label ?? 'Branca',
        current_color: BELT_MAP[currentBelt]?.color ?? '#fff',
        next: nextBelt,
        next_label: BELT_MAP[nextBelt]?.label ?? '',
        next_color: BELT_MAP[nextBelt]?.color ?? '#9ca3af',
        stars_to_next: starsToNext,
      };

      // Stickers from achievements
      const stickers: KidsStickerDTO[] = (stickersRes.data ?? []).map((a: Record<string, unknown>) => {
        const def = a.achievement_definitions as Record<string, unknown> | null;
        return {
          id: String(a.id ?? ''),
          name: String(def?.name ?? ''),
          image_emoji: String(def?.icon ?? '⭐'),
          collected: true,
        };
      });

      const stickerAlbum: KidsStickerAlbumDTO = {
        total: Math.max(stickers.length, 12),
        collected: stickers.length,
        stickers,
      };

      // Next class
      let nextClass: KidsNextClassDTO | null = null;
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

      for (const enrollment of (enrollmentsRes.data ?? []) as Record<string, unknown>[]) {
        const cls = enrollment.classes as Record<string, unknown> | null;
        if (!cls) continue;
        const schedule = (cls.schedule as Array<{ day_of_week: number; start_time: string; end_time: string }>) ?? [];
        const mod = cls.modalities as Record<string, unknown> | null;

        for (const slot of schedule) {
          // Find the next upcoming class (today later or upcoming days)
          let daysUntil = slot.day_of_week - currentDay;
          if (daysUntil < 0) daysUntil += 7;
          if (daysUntil === 0 && slot.start_time <= currentTime) daysUntil = 7;

          if (!nextClass || daysUntil < nextClass.days_until || (daysUntil === nextClass.days_until && slot.start_time < nextClass.time)) {
            nextClass = {
              class_name: (mod?.name ?? '') as string,
              day_label: dayLabels[slot.day_of_week] ?? '',
              time: slot.start_time,
              days_until: daysUntil,
            };
          }
        }
      }

      // Motivational messages
      const messages = [
        `Você já tem ${totalStars} estrelas! Continue assim! ⭐`,
        'Cada treino te deixa mais forte! 💪',
        'Sua próxima faixa está chegando! 🥋',
        'Você é incrível! Continue treinando! 🌟',
      ];
      const motivationalMessage = messages[Math.floor(now.getTime() / 86400000) % messages.length];

      return {
        student_id: studentId,
        display_name: displayName,
        avatar,
        belt,
        stars: { total: totalStars, new_this_week: weekStars },
        next_class: nextClass,
        sticker_album: stickerAlbum,
        exchange_options: [],
        motivational_message: motivationalMessage,
      };
    } catch (err) {
      console.warn('[getKidsDashboard] Supabase error, returning fallback:', err);
      return EMPTY;
    }
  } catch (error) {
    console.warn('[getKidsDashboard] Fallback:', error);
    return {
      student_id: '', display_name: '', avatar: null,
      belt: { current: 'branca' as BeltLevel, current_label: 'Branca', current_color: '#fff', next: 'cinza' as BeltLevel, next_label: 'Cinza', next_color: '#9ca3af', stars_to_next: 0 },
      stars: { total: 0, new_this_week: 0 },
      next_class: null,
      sticker_album: { total: 0, collected: 0, stickers: [] },
      exchange_options: [],
      motivational_message: 'Bem-vindo ao BlackBelt!',
    };
  }
}
