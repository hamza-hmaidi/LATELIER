import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from '../request-context/request-context.service';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const incoming = request.header('x-request-id');
    const trimmed = typeof incoming === 'string' ? incoming.trim() : '';
    const requestId = trimmed && trimmed.length <= 128 ? trimmed : randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    this.requestContext.run(requestId, () => next());
  }
}
