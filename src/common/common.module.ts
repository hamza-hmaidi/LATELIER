import { Global, Module } from '@nestjs/common';
import { ErrorHandlerService } from './errors/error-handler.service';
import { RequestContextService } from './request-context/request-context.service';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

@Global()
@Module({
  providers: [ErrorHandlerService, RequestContextService, RequestIdMiddleware],
  exports: [ErrorHandlerService, RequestContextService]
})
export class CommonModule {}
