import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const start = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - start;
      const requestId = request.requestId ?? '-';
      const method = request.method;
      const url = request.originalUrl ?? request.url;
      const statusCode = response.statusCode;
      const contentLength = response.getHeader('content-length') ?? 0;

      this.logger.log(
        `${method} ${url} ${statusCode} ${durationMs}ms ${contentLength}b requestId=${requestId}`
      );
    });

    next();
  }
}
