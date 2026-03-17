type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function currentLevel(): LogLevel {
  return (process.env.LOG_LEVEL as LogLevel) || 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel()];
}

function formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
  };
  return JSON.stringify(entry);
}

/* eslint-disable no-console */
export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('debug')) console.debug(formatEntry('debug', message, context));
  },
  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('info')) console.info(formatEntry('info', message, context));
  },
  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('warn')) console.warn(formatEntry('warn', message, context));
  },
  error(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('error')) console.error(formatEntry('error', message, context));
  },
};
/* eslint-enable no-console */
