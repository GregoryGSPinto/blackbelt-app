import { BeltLevel } from '@/lib/types/domain';
import type { KidsDashboardDTO } from '@/lib/api/kids.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGetKidsDashboard(_studentId: string): Promise<KidsDashboardDTO> {
  await delay();
  return {
    student_id: 'stu-kids-helena',
    display_name: 'Helena',
    avatar: null,
    belt: {
      current: BeltLevel.Gray,
      current_label: 'Faixa Cinza',
      current_color: '#9ca3af',
      next: BeltLevel.Yellow,
      next_label: 'Faixa Amarela',
      next_color: '#facc15',
      stars_to_next: 22,
    },
    stars: {
      total: 78,
      new_this_week: 5,
    },
    next_class: {
      class_name: 'Jiu-Jitsu Kids',
      day_label: 'Quinta',
      time: '17h',
      days_until: 2,
    },
    sticker_album: {
      total: 30,
      collected: 15,
      stickers: [
        { id: 'st-1', name: 'Leão Corajoso', image_emoji: '🦁', collected: true },
        { id: 'st-2', name: 'Dragão de Fogo', image_emoji: '🐉', collected: true },
        { id: 'st-3', name: 'Águia Veloz', image_emoji: '🦅', collected: true },
        { id: 'st-4', name: 'Tigre Forte', image_emoji: '🐯', collected: true },
        { id: 'st-5', name: 'Urso Guerreiro', image_emoji: '🐻', collected: true },
        { id: 'st-6', name: 'Lobo Astuto', image_emoji: '🐺', collected: true },
        { id: 'st-7', name: 'Pantera Ninja', image_emoji: '🐆', collected: true },
        { id: 'st-8', name: 'Cobra Flexível', image_emoji: '🐍', collected: true },
        { id: 'st-9', name: 'Gorila Poderoso', image_emoji: '🦍', collected: true },
        { id: 'st-10', name: 'Tubarão Rápido', image_emoji: '🦈', collected: true },
        { id: 'st-11', name: 'Falcão Preciso', image_emoji: '🦅', collected: true },
        { id: 'st-12', name: 'Touro Resistente', image_emoji: '🐂', collected: true },
        { id: 'st-13', name: 'Tartaruga Sábia', image_emoji: '🐢', collected: true },
        { id: 'st-14', name: 'Raposa Esperta', image_emoji: '🦊', collected: true },
        { id: 'st-15', name: 'Coruja Mestre', image_emoji: '🦉', collected: true },
        { id: 'st-16', name: 'Elefante Guardião', image_emoji: '🐘', collected: false },
        { id: 'st-17', name: 'Polvo Ágil', image_emoji: '🐙', collected: false },
        { id: 'st-18', name: 'Rinoceronte Blindado', image_emoji: '🦏', collected: false },
        { id: 'st-19', name: 'Jacaré Poderoso', image_emoji: '🐊', collected: false },
        { id: 'st-20', name: 'Golfinho Inteligente', image_emoji: '🐬', collected: false },
        { id: 'st-21', name: 'Cavalo Veloz', image_emoji: '🐴', collected: false },
        { id: 'st-22', name: 'Pinguim Persistente', image_emoji: '🐧', collected: false },
        { id: 'st-23', name: 'Unicórnio Lendário', image_emoji: '🦄', collected: false },
        { id: 'st-24', name: 'Fênix Imortal', image_emoji: '🔥', collected: false },
        { id: 'st-25', name: 'Dragão Dourado', image_emoji: '✨', collected: false },
        { id: 'st-26', name: 'Leão Alado', image_emoji: '🦁', collected: false },
        { id: 'st-27', name: 'Samurai Mestre', image_emoji: '⚔️', collected: false },
        { id: 'st-28', name: 'Sensei Supremo', image_emoji: '🥋', collected: false },
        { id: 'st-29', name: 'Campeão Mundial', image_emoji: '🏆', collected: false },
        { id: 'st-30', name: 'Lenda do Tatame', image_emoji: '🌟', collected: false },
      ],
    },
    exchange_options: [
      { id: 'ex-1', stars_cost: 50, label: 'Figurinha Especial', emoji: '🌟', available: true },
      { id: 'ex-2', stars_cost: 100, label: 'Título Super Lutador', emoji: '💥', available: false },
      { id: 'ex-3', stars_cost: 200, label: 'Medalha Física', emoji: '🏅', available: false },
    ],
    motivational_message: 'Você está arrasando, Helena! Continue assim!',
  };
}
