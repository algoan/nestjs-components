import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Minimal pass-through interceptor used in GCPSS07 to exercise the transport's Observable
 * subscription path. A handler decorated with this causes NestJS to return a cold Observable
 * from `handler(message)` instead of a plain Promise.
 */
export class PassThroughInterceptor implements NestInterceptor {
  // eslint-disable-next-line class-methods-use-this
  public intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle();
  }
}
