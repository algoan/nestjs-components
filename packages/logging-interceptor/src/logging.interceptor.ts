import { IncomingHttpHeaders } from 'http';
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
import { parse, stringify } from 'flatted';
import { LogOptions, METHOD_LOG_METADATA } from './log.decorator';

/**
 * Logging interceptor options
 */
export interface LoggingInterceptorOptions {
  /**
   * User prefix to add to the logs
   */
  userPrefix?: string;
  /**
   * Disable masking
   */
  disableMasking?: boolean;
  /**
   * Masking placeholder
   */
  maskingPlaceholder?: string;
  /**
   * Masking options to apply to all routes
   */
  mask?: LoggingInterceptorMaskingOptions;
}

/**
 * Masking options of the logging interceptor
 */
export interface LoggingInterceptorMaskingOptions {
  /**
   * Masking options to apply to the headers of the request
   */
  requestHeader?: RequestHeaderMask;
}

/**
 * Masking options of the request headers
 */
export interface RequestHeaderMask {
  /**
   * Mask of a request header. The key is the header name and the value is a boolean or a function that returns the data to log.
   */
  [headerKey: string]: boolean | ((headerValue: string | string[]) => unknown);
}

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
  private mask: LoggingInterceptorMaskingOptions | undefined;

  constructor(@Optional() options?: LoggingInterceptorOptions) {
    this.userPrefix = options?.userPrefix ?? '';
    this.disableMasking = options?.disableMasking ?? false;
    this.maskingPlaceholder = options?.maskingPlaceholder ?? '****';
    this.mask = options?.mask;
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
   * Set the masking options
   * @param mask
   */
  public setMask(mask: LoggingInterceptorMaskingOptions): void {
    this.mask = mask;
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
    const maskedHeaders = this.maskHeaders(headers);

    this.logger.log(
      {
        message,
        method,
        body: maskedBody,
        headers: maskedHeaders,
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

      const options: LogOptions | undefined = Reflect.getMetadata(METHOD_LOG_METADATA, context.getHandler());

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const maskedBody = options?.mask?.request ? this.maskData(body, options.mask.request) : body;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          {
            method,
            url,
            body: maskedBody,
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
            body: maskedBody,
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
    // Parse the data to avoid having constructors like new ObjectId() in the body and handle circular references
    const parsedData = parse(stringify(data));

    if (this.disableMasking) {
      return parsedData;
    }

    if (maskingOptions === true || maskingOptions.includes(path)) {
      return this.maskingPlaceholder;
    }

    if (Array.isArray(parsedData)) {
      return parsedData.map((item: unknown): unknown => this.maskData(item, maskingOptions, path));
    }

    // eslint-disable-next-line no-null/no-null
    if (typeof parsedData === 'object' && parsedData !== null) {
      return Object.keys(parsedData).reduce<object>((maskedObject: object, key: string): object => {
        const nestedPath = path ? `${path}.${key}` : key;

        return {
          ...maskedObject,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [key]: this.maskData((parsedData as any)[key], maskingOptions, nestedPath),
        };
      }, {});
    }

    return parsedData;
  }

  /**
   * Mask the given headers
   * @param headers the headers to mask
   * @returns the masked headers
   */
  private maskHeaders(headers: IncomingHttpHeaders): Record<string, unknown> {
    return Object.keys(headers).reduce<Record<string, unknown>>(
      (maskedHeaders: Record<string, unknown>, headerKey: string): Record<string, unknown> => {
        const headerValue = headers[headerKey];
        const mask = this.mask?.requestHeader?.[headerKey];

        if (headerValue === undefined) {
          return maskedHeaders;
        }

        if (mask === true) {
          return {
            ...maskedHeaders,
            [headerKey]: this.maskingPlaceholder,
          };
        }

        if (typeof mask === 'function') {
          return {
            ...maskedHeaders,
            [headerKey]: mask(headerValue),
          };
        }

        return maskedHeaders;
      },
      headers,
    );
  }
}
