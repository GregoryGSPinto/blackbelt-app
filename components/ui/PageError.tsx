import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';
import { type ServiceError } from '@/lib/api/errors';

export interface PageErrorProps extends HTMLAttributes<HTMLDivElement> {
  error: ServiceError | Error;
  onRetry?: () => void;
}

export const PageError = forwardRef<HTMLDivElement, PageErrorProps>(
  ({ error, onRetry, className, ...props }, ref) => {
    const statusCode = 'statusCode' in error ? (error as ServiceError).statusCode : 500;

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
        {...props}
      >
        <p className="text-5xl font-bold text-bb-gray-300">{statusCode}</p>
        <h2 className="mt-4 text-lg font-semibold text-bb-gray-900">Algo deu errado</h2>
        <p className="mt-1 max-w-md text-sm text-bb-gray-500">{error.message}</p>
        {onRetry && (
          <Button className="mt-6" variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  },
);
PageError.displayName = 'PageError';
