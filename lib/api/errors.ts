import { logger } from '@/lib/monitoring/logger';

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly service: string,
    message?: string,
  ) {
    super(message ?? `Service error in ${service}: ${statusCode}`);
    this.name = 'ServiceError';
  }
}

export function handleServiceError(error: unknown, service: string): never {
  if (error instanceof ServiceError) {
    logger.error(error.message, { service, statusCode: error.statusCode });
    throw error;
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error(message, { service });
  throw new ServiceError(500, service, message);
}

/** Non-throwing variant — logs the error via structured logger and returns void. */
export function logServiceError(error: unknown, service: string): void {
  if (error instanceof ServiceError) {
    logger.error(error.message, { service, statusCode: error.statusCode });
    return;
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error(message, { service });
}
