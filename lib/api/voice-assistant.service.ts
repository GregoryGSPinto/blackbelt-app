import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export type VoiceCommandType =
  | 'start_timer'
  | 'stop_timer'
  | 'next_exercise'
  | 'time_remaining'
  | 'check_posture'
  | 'register_attendance'
  | 'next_training'
  | 'match_result'
  | 'unknown';

export interface VoiceResponse {
  command_type: VoiceCommandType;
  text_response: string;
  action: string | null;
  data: Record<string, unknown> | null;
}

export interface ListeningState {
  is_listening: boolean;
  transcript: string;
  confidence: number;
}

const COMMAND_MAP: [RegExp, VoiceCommandType][] = [
  [/iniciar\s*cron[oô]metro/i, 'start_timer'],
  [/parar\s*cron[oô]metro/i, 'stop_timer'],
  [/pr[oó]ximo\s*exerc[ií]cio/i, 'next_exercise'],
  [/quanto\s*tempo\s*falta/i, 'time_remaining'],
  [/como\s*est[aá]\s*minha\s*postura/i, 'check_posture'],
  [/registrar\s*presen[cç]a/i, 'register_attendance'],
  [/qual\s*meu\s*pr[oó]ximo\s*treino/i, 'next_training'],
  [/resultado\s*da\s*luta/i, 'match_result'],
];

export function parseCommand(transcript: string): VoiceCommandType {
  for (const [pattern, type] of COMMAND_MAP) {
    if (pattern.test(transcript)) return type;
  }
  return 'unknown';
}

export async function startListening(): Promise<ListeningState> {
  try {
    if (isMock()) {
      const { mockStartListening } = await import('@/lib/mocks/voice-assistant.mock');
      return mockStartListening();
    }
    // Web Speech API would be initialized here
    return { is_listening: true, transcript: '', confidence: 0 };
  } catch (error) {
    logServiceError(error, 'voice-assistant');
    return { is_listening: false, transcript: '', confidence: 0 };
  }
}

export async function stopListening(): Promise<ListeningState> {
  try {
    if (isMock()) {
      const { mockStopListening } = await import('@/lib/mocks/voice-assistant.mock');
      return mockStopListening();
    }
    return { is_listening: false, transcript: '', confidence: 0 };
  } catch (error) {
    logServiceError(error, 'voice-assistant');
    return { is_listening: false, transcript: '', confidence: 0 };
  }
}

export async function processCommand(audioTranscript: string): Promise<VoiceResponse> {
  try {
    if (isMock()) {
      const { mockProcessCommand } = await import('@/lib/mocks/voice-assistant.mock');
      return mockProcessCommand(audioTranscript);
    }
    // Log voice command to DB for analytics
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    await supabase.from('telemetry_events').insert({
      event: 'voice_command',
      payload: { transcript: audioTranscript },
    }).then(() => {}, () => {});

    // Use local keyword matching — no external API needed
    const cmdType = parseCommand(audioTranscript);
    const responses: Record<VoiceCommandType, string> = {
      start_timer: 'Cronômetro iniciado.',
      stop_timer: 'Cronômetro parado.',
      next_exercise: 'Avançando para o próximo exercício.',
      time_remaining: 'Verificando tempo restante.',
      check_posture: 'Análise de postura requer configuração da Vision API.',
      register_attendance: 'Registrando presença.',
      next_training: 'Verificando próximo treino.',
      match_result: 'Consultando resultado da luta.',
      unknown: 'Comando não reconhecido. Tente novamente.',
    };

    return {
      command_type: cmdType,
      text_response: responses[cmdType],
      action: cmdType !== 'unknown' ? cmdType : null,
      data: null,
    };
  } catch (error) {
    logServiceError(error, 'voice-assistant');
    return { command_type: 'unknown', text_response: 'Assistente de voz em desenvolvimento.', action: null, data: null };
  }
}
