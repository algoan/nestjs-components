import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercept method, logs before and after the request being processed
   * @param context details about the current request
   * @param call$ implements the handle method that returns an Observable
   */
  public intercept(context: ExecutionContext, call$: CallHandler): Observable<unknown> {
    const req: Request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = req;
    const message: string = `${method} - ${url}`;

    this.logger.log(message);
    this.logger.debug({
      message,
      method,
      body,
      headers,
    });

    return call$.handle().pipe(
      tap({
        next: (val: unknown): void => {
          this.log(val, context);
        },
      }),
    );
  }

  /**
   * Logs the request response
   * @param body body returned
   * @param context details about the current request
   */
  private log(body: unknown, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const { method, url } = req;
    const { status } = res;

    const message: string = `${status} - ${method} - ${url}"`;

    let logLevel: keyof LoggerService = 'log';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      logLevel = 'error';
    } else if (status >= HttpStatus.BAD_REQUEST) {
      logLevel = 'warn';
    }

    this.logger[logLevel]({
      message,
      body,
    });
  }
}
