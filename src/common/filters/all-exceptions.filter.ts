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

    const errorCode = this.extractField(responsePayload, 'errorCode');
    if (errorCode) {
      payload.errorCode = errorCode;
    }

    const details = this.extractField(responsePayload, 'details');
    if (details) {
      payload.details = details;
    }

    const errorId = this.extractField(responsePayload, 'errorId');
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

  private extractField(payload: unknown, field: string): string | object | undefined {
    if (payload && typeof payload === 'object' && field in payload) {
      return (payload as Record<string, string | object>)[field];
    }

    return undefined;
  }
}
