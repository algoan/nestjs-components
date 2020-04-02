import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
/**
 * Response interface
 */
export interface Response<T> {
  data: T;
}
/**
 * Transform interceptor
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * Intercept requests
   */
  public intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    // tslint:disable-next-line: typedef
    return next.handle().pipe(map(data => ({ data })));
  }
}