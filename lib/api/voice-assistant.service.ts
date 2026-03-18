import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    handleServiceError(error, 'voiceAssistant.startListening');
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
    handleServiceError(error, 'voiceAssistant.stopListening');
  }
}

export async function processCommand(audioTranscript: string): Promise<VoiceResponse> {
  try {
    if (isMock()) {
      const { mockProcessCommand } = await import('@/lib/mocks/voice-assistant.mock');
      return mockProcessCommand(audioTranscript);
    }
    try {
      const res = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: audioTranscript }),
      });
      return res.json();
    } catch {
      console.warn('[voice-assistant.processCommand] API not available, using fallback');
      return { command_type: 'unknown', text_response: '', action: null, data: null } as VoiceResponse;
    }
  } catch (error) {
    handleServiceError(error, 'voiceAssistant.processCommand');
  }
}
