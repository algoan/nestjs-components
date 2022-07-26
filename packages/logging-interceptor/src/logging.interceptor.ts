import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Util method, obtains http request metadata from the execution context
 * @param context details about the current request
 */
function getRequestMeta(context: ExecutionContext): {
  method: string;
  url: string;
  body: Record<string, unknown>;
  headers: IncomingHttpHeaders;
} {
  if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext: GqlExecutionContext = GqlExecutionContext.create(context);
    const _req: Request | undefined = gqlContext.getContext().req;
    if (typeof _req === 'undefined') {
      throw new Error(
        `'req' object not found on context, please ensure you have provided a 'req' argument to the context passed to GraphQL execution `,
      );
    }

    return {
      method: _req.method,
      url: _req.baseUrl,
      body: _req.body,
      headers: _req.headers,
    };
  }
  const req: Request = context.switchToHttp().getRequest<Request>();

  return {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
  };
}

/**
 * Util method, obtains http response metadata from the execution context
 * @param context details about the current request
 */
function getResponseMeta(context: ExecutionContext): {
  statusCode: number;
} {
  if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext: GqlExecutionContext = GqlExecutionContext.create(context);
    const _res: Response | undefined = gqlContext.getContext().res;
    if (typeof _res === 'undefined') {
      throw new Error(
        `'res' object not found on context, please ensure you have provided a 'res' argument to the context passed to GraphQL execution `,
      );
    }

    return {
      statusCode: _res.statusCode,
    };
  }
  const res: Response = context.switchToHttp().getResponse<Response>();

  return {
    statusCode: res.statusCode,
  };
}

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
    const { method, url, body, headers } = getRequestMeta(context);
    const ctx: string = `${this.userPrefix}${this.ctxPrefix} - ${method} - ${url}`;
    const message: string = `Incoming request - ${method} - ${url}`;

    this.logger.log(
      {
        message,
        method,
        body,
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
    const { method, url } = getRequestMeta(context);
    const { statusCode } = getResponseMeta(context);
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
    const { method, url, body } = getRequestMeta(context);

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
