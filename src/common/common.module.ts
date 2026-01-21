import { Global, Module } from '@nestjs/common';
import { ErrorHandlerService } from './errors/error-handler.service';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { RequestContextService } from './request-context/request-context.service';

@Global()
@Module({
  providers: [
    ErrorHandlerService,
    RequestContextService,
    RequestIdMiddleware,
    RequestLoggerMiddleware
  ],
  exports: [ErrorHandlerService, RequestContextService]
})
export class CommonModule {}
