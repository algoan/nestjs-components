import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogOptions, METHOD_LOG_METADATA, MethodMask } from './log.decorator';

/**
 * Masked body
 */
interface MaskedBody {
  [x: string]: string | object;
}

const maskBody = (
  body: { [key: string]: string | { [key: string]: string } },
  mask?: MethodMask,
  prefixKey: string = '',
): MaskedBody => {
  return Object.keys(body).reduce((maskedBody: MaskedBody, currentKey: string): MaskedBody => {
    const mixedKey: string = prefixKey ? `${prefixKey}.${currentKey}` : currentKey;

    // value of param is string or array
    if (typeof body[currentKey] === 'string' || Array.isArray(body[currentKey])) {
      return {
        ...maskedBody,
        [currentKey]:
          mask?.request?.find((param: string): boolean => param === mixedKey) !== undefined ? '****' : body[currentKey],
      };
    }

    // value of param is parsable object
    const subBody: {
      [key: string]: string;
    } = body[currentKey] as { [key: string]: string };

    return {
      ...maskedBody,
      [currentKey]: maskBody(subBody, mask, mixedKey),
    };
  }, {});
};

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = LoggingInterceptor.name;
  private readonly logger: Logger = new Logger(this.ctxPrefix);
  private userPrefix: string = '';

  /**
   * User prefix setter
   * ex. [MyPrefix - LoggingInterceptor - 200 - GET - /]
   */
  public setUserPrefix(prefix: string): void {
    this.userPrefix = `${prefix} - `;
  }

  /**
   * Intercept method, logs before and after the request being processed
   * @param context details about the current request
   * @param call$ implements the handle method that returns an Observable
   */
  public intercept(context: ExecutionContext, call$: CallHandler): Observable<unknown> {
    const req: Request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = req;
    const ctx: string = `${this.userPrefix}${this.ctxPrefix} - ${method} - ${url}`;
    const message: string = `Incoming request - ${method} - ${url}`;
    const options: LogOptions | undefined = Reflect.getMetadata(METHOD_LOG_METADATA, context.getHandler());

    const maskedBody = typeof body === 'object' ? maskBody(body, options?.mask) : body;

    this.logger.log(
      {
        message,
        method,
        body: maskedBody,
        headers,
      },
      ctx,
    );

    return call$.handle().pipe(
      tap({
        next: (val: unknown): void => {
          this.logNext(val, context);
        },
        error: (err: Error): void => {
          this.logError(err, context);
        },
      }),
    );
  }

  /**
   * Logs the request response in success cases
   * @param body body returned
   * @param context details about the current request
   */
  private logNext(body: unknown, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const res: Response = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const { statusCode } = res;
    const ctx: string = `${this.userPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`;
    const message: string = `Outgoing response - ${statusCode} - ${method} - ${url}`;

    this.logger.log(
      {
        message,
        body,
      },
      ctx,
    );
  }

  /**
   * Logs the request response in success cases
   * @param error Error object
   * @param context details about the current request
   */
  private logError(error: Error, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = req;

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus();
      const ctx: string = `${this.userPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`;
      const message: string = `Outgoing response - ${statusCode} - ${method} - ${url}`;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          {
            method,
            url,
            body,
            message,
            error,
          },
          error.stack,
          ctx,
        );
      } else {
        this.logger.warn(
          {
            method,
            url,
            error,
            body,
            message,
          },
          ctx,
        );
      }
    } else {
      this.logger.error(
        {
          message: `Outgoing response - ${method} - ${url}`,
        },
        error.stack,
        `${this.userPrefix}${this.ctxPrefix} - ${method} - ${url}`,
      );
    }
  }
}
