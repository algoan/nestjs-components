import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogOptions, METHOD_LOG_METADATA } from './log.decorator';

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = LoggingInterceptor.name;
  private readonly logger: Logger = new Logger(this.ctxPrefix);
  private userPrefix: string;
  private disableMasking: boolean;
  private maskingPlaceholder: string | undefined;

  constructor(@Optional() options?: { userPrefix?: string; disableMasking?: boolean; maskingPlaceholder?: string }) {
    this.userPrefix = options?.userPrefix ?? '';
    this.disableMasking = options?.disableMasking ?? false;
    this.maskingPlaceholder = options?.maskingPlaceholder ?? '****';
  }

  /**
   * User prefix setter
   * ex. [MyPrefix - LoggingInterceptor - 200 - GET - /]
   */
  public setUserPrefix(prefix: string): void {
    this.userPrefix = `${prefix} - `;
  }

  /**
   * Set the disable masking flag
   * @param disableMasking
   */
  public setDisableMasking(disableMasking: boolean): void {
    this.disableMasking = disableMasking;
  }

  /**
   * Set the masking placeholder
   * @param placeholder
   */
  public setMaskingPlaceholder(placeholder: string | undefined): void {
    this.maskingPlaceholder = placeholder;
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

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const maskedBody = options?.mask?.request ? this.maskData(body, options.mask.request) : body;

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

    const options: LogOptions | undefined = Reflect.getMetadata(METHOD_LOG_METADATA, context.getHandler());
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const maskedBody = options?.mask?.response ? this.maskData(body, options.mask.response) : body;

    this.logger.log(
      {
        message,
        body: maskedBody,
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

  /**
   * Mask the given data
   * @param data the data to mask
   * @param maskingOptions the paths of the data to mask
   * @param path the current path
   * @returns the masked data
   */
  private maskData(data: unknown, maskingOptions: string[] | true, path: string = ''): unknown {
    const dataToMask = JSON.parse(JSON.stringify(data));

    if (this.disableMasking) {
      return dataToMask;
    }

    if (maskingOptions === true || maskingOptions.includes(path)) {
      return this.maskingPlaceholder;
    }

    if (Array.isArray(dataToMask)) {
      return dataToMask.map((item: unknown): unknown => this.maskData(item, maskingOptions, path));
    }

    // eslint-disable-next-line no-null/no-null
    if (typeof dataToMask === 'object' && dataToMask !== null) {
      return Object.keys(dataToMask).reduce<object>((maskedObject: object, key: string): object => {
        const nestedPath = path ? `${path}.${key}` : key;

        return {
          ...maskedObject,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [key]: this.maskData((dataToMask as any)[key], maskingOptions, nestedPath),
        };
      }, {});
    }

    return dataToMask;
  }
}
