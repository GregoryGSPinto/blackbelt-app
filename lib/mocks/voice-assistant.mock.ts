import type { ListeningState, VoiceResponse, VoiceCommandType } from '@/lib/api/voice-assistant.service';
import { parseCommand } from '@/lib/api/voice-assistant.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_RESPONSES: Record<VoiceCommandType, VoiceResponse> = {
  start_timer: {
    command_type: 'start_timer',
    text_response: 'Cronômetro iniciado! Contando a partir de agora.',
    action: 'timer_start',
    data: { started_at: new Date().toISOString() },
  },
  stop_timer: {
    command_type: 'stop_timer',
    text_response: 'Cronômetro parado. Tempo total: 5 minutos e 32 segundos.',
    action: 'timer_stop',
    data: { elapsed_sec: 332, formatted: '5:32' },
  },
  next_exercise: {
    command_type: 'next_exercise',
    text_response: 'Próximo exercício: Drill de passagem toreando. 3 minutos cada lado. Foque na pressão e controle de manga.',
    action: 'show_exercise',
    data: { exercise: 'Drill de passagem toreando', duration_min: 6, notes: '3 min cada lado' },
  },
  time_remaining: {
    command_type: 'time_remaining',
    text_response: 'Faltam 12 minutos e 45 segundos para o final da aula.',
    action: 'show_time',
    data: { remaining_sec: 765, formatted: '12:45' },
  },
  check_posture: {
    command_type: 'check_posture',
    text_response: 'Sua postura está com score 72. Atenção: mãos baixas e base estreita. Levante as mãos na altura do queixo e afaste os pés.',
    action: 'open_posture',
    data: { score: 72, issues: ['mãos baixas', 'base estreita'] },
  },
  register_attendance: {
    command_type: 'register_attendance',
    text_response: 'Presença registrada com sucesso! Você está no seu 9º dia consecutivo. Continue assim!',
    action: 'checkin',
    data: { checked_in: true, streak: 9 },
  },
  next_training: {
    command_type: 'next_training',
    text_response: 'Seu próximo treino é amanhã, segunda-feira às 19:30. Turma Avançada com foco em guarda, com Professor Marcos.',
    action: 'show_schedule',
    data: { class_name: 'Turma Avançada - Guarda', time: '19:30', professor: 'Professor Marcos', day: 'Segunda-feira' },
  },
  match_result: {
    command_type: 'match_result',
    text_response: 'Sua última luta: vitória por finalização aos 5 minutos e 48 segundos. Mata-leão das costas. Placar: 18 a 2. Parabéns!',
    action: 'show_match',
    data: { result: 'victory', technique: 'Mata-leão', time: '5:48', score_student: 18, score_opponent: 2 },
  },
  unknown: {
    command_type: 'unknown',
    text_response: 'Desculpe, não entendi o comando. Tente: "Iniciar cronômetro", "Próximo exercício", "Registrar presença" ou "Qual meu próximo treino?".',
    action: null,
    data: null,
  },
};

const MOCK_TRANSCRIPTS = [
  'Iniciar cronômetro',
  'Parar cronômetro',
  'Próximo exercício',
  'Quanto tempo falta?',
  'Como está minha postura?',
  'Registrar presença',
  'Qual meu próximo treino?',
  'Resultado da luta',
];

export async function mockStartListening(): Promise<ListeningState> {
  await delay();
  return { is_listening: true, transcript: '', confidence: 0 };
}

export async function mockStopListening(): Promise<ListeningState> {
  await delay();
  const randomTranscript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
  return { is_listening: false, transcript: randomTranscript, confidence: 0.92 };
}

export async function mockProcessCommand(audioTranscript: string): Promise<VoiceResponse> {
  await delay();
  const commandType = parseCommand(audioTranscript);
  return { ...MOCK_RESPONSES[commandType] };
}
