import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RequestContextService } from '../request-context/request-context.service';

export type ErrorContext = {
  action: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  constructor(private readonly requestContext: RequestContextService) {}

  handle(error: unknown, context: ErrorContext): never {
    const errorId = randomUUID();
    const enrichedContext: ErrorContext = {
      ...context,
      requestId: context.requestId ?? this.requestContext.getRequestId()
    };

    if (error instanceof HttpException) {
      const status = error.getStatus();

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logError(error, enrichedContext, errorId, status);
        throw new InternalServerErrorException({ message: 'Unexpected error', errorId });
      }

      this.logWarn(error, enrichedContext, errorId, status);
      throw error;
    }

    this.logError(error, enrichedContext, errorId);
    throw new InternalServerErrorException({ message: 'Unexpected error', errorId });
  }

  private logError(
    error: unknown,
    context: ErrorContext,
    errorId: string,
    status?: number
  ): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const suffix = this.formatContext(context);
    const statusPart = status ? ` status=${status}` : '';

    this.logger.error(`[${errorId}] ${context.action}${statusPart}${suffix}: ${message}`, stack);
  }

  private logWarn(
    error: unknown,
    context: ErrorContext,
    errorId: string,
    status: number
  ): void {
    const message = error instanceof Error ? error.message : String(error);
    const suffix = this.formatContext(context);

    this.logger.warn(`[${errorId}] ${context.action} status=${status}${suffix}: ${message}`);
  }

  private formatContext(context: ErrorContext): string {
    const parts: string[] = [];

    if (context.requestId) {
      parts.push(`requestId=${context.requestId}`);
    }

    if (context.metadata) {
      const serialized = this.safeStringify(context.metadata);
      if (serialized) {
        parts.push(`meta=${serialized}`);
      }
    }

    return parts.length > 0 ? ` | ${parts.join(' ')}` : '';
  }

  private safeStringify(value: unknown): string | null {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
}
