import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responsePayload = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const payload: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      method: request?.method,
      message: this.extractMessage(responsePayload)
    };

    const errorId = this.extractErrorId(responsePayload);
    if (errorId) {
      payload.errorId = errorId;
    }

    if (request?.requestId) {
      payload.requestId = request.requestId;
    }

    response.status(status).json(payload);
  }

  private extractMessage(payload: unknown): string | string[] | object {
    if (typeof payload === 'string') {
      return payload;
    }

    if (payload && typeof payload === 'object' && 'message' in payload) {
      return (payload as { message: string | string[] }).message;
    }

    return payload as object;
  }

  private extractErrorId(payload: unknown): string | undefined {
    if (payload && typeof payload === 'object' && 'errorId' in payload) {
      return String((payload as { errorId: unknown }).errorId);
    }

    return undefined;
  }
}
