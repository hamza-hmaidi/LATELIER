import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ResponseEnvelope = {
  data: unknown;
  meta: unknown;
};

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((response) => this.wrap(response)));
  }

  private wrap(response: unknown): ResponseEnvelope {
    if (this.isAlreadyEnveloped(response)) {
      return response;
    }

    return {
      data: response ?? null,
      meta: null
    };
  }

  private isAlreadyEnveloped(response: unknown): response is ResponseEnvelope {
    return (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      'meta' in response
    );
  }
}
