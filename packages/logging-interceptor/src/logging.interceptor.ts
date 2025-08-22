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
import { LogOptions, METHOD_LOG_METADATA, TruncationOptions } from './log.decorator';

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
  /**
   * Truncation options to apply to all routes
   */
  truncation?: TruncationOptions;
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
  private truncation: TruncationOptions | undefined;

  constructor(@Optional() options?: LoggingInterceptorOptions) {
    this.userPrefix = options?.userPrefix ?? '';
    this.disableMasking = options?.disableMasking ?? false;
    this.maskingPlaceholder = options?.maskingPlaceholder ?? '****';
    this.mask = options?.mask;
    this.truncation = options?.truncation;
  }

  /**
   * Return the user prefix
   */
  public getUserPrefix(): string {
    return this.userPrefix;
  }

  /**
   * User prefix setter
   * ex. [MyPrefix - LoggingInterceptor - 200 - GET - /]
   */
  public setUserPrefix(prefix: string): void {
    this.userPrefix = `${prefix} - `;
  }

  /**
   * Return the disable masking flag
   */
  public getDisabledMasking(): boolean {
    return this.disableMasking;
  }

  /**
   * Set the disable masking flag
   * @param disableMasking
   */
  public setDisableMasking(disableMasking: boolean): void {
    this.disableMasking = disableMasking;
  }

  /**
   * Return the masking placeholder
   */
  public getMaskingPlaceholder(): string | undefined {
    return this.maskingPlaceholder;
  }

  /**
   * Set the masking placeholder
   * @param placeholder
   */
  public setMaskingPlaceholder(placeholder: string | undefined): void {
    this.maskingPlaceholder = placeholder;
  }

  /**
   * Return the masking options
   */
  public getMask(): LoggingInterceptorMaskingOptions | undefined {
    return this.mask;
  }

  /**
   * Set the masking options
   * @param mask
   */
  public setMask(mask: LoggingInterceptorMaskingOptions): void {
    this.mask = mask;
  }

  /**
   * Return the truncation options
   */
  public getTruncation(): TruncationOptions | undefined {
    return this.truncation;
  }

  /**
   * Set the truncation options
   * @param truncate
   */
  public setTruncation(truncate: TruncationOptions): void {
    this.truncation = truncate;
  }

  /**
   * Return the disable truncation flag
   */
  public getDisableTruncation(): boolean {
    return this.truncation?.disable === true;
  }

  /**
   * Set the disable truncation flag
   * @param disableTruncation
   */
  public setDisableTruncation(disableTruncation: boolean): void {
    this.truncation ??= {};
    this.truncation.disable = disableTruncation;
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
    const truncatedMaskedBody = this.truncate(maskedBody, options);

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const maskedHeaders = options?.mask?.disableHeaderMasking ? headers : this.maskHeaders(headers);

    this.logger.log(
      {
        message,
        method,
        body: truncatedMaskedBody,
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
    const truncatedMaskedBody = this.truncate(maskedBody, options);

    this.logger.log(
      {
        message,
        body: truncatedMaskedBody,
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
      const truncatedMaskedBody = this.truncate(maskedBody, options);

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          {
            method,
            url,
            body: truncatedMaskedBody,
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
            body: truncatedMaskedBody,
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
    if (this.disableMasking || this.mask?.requestHeader === undefined) {
      return headers;
    }

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
          try {
            return {
              ...maskedHeaders,
              [headerKey]: mask(headerValue),
            };
          } catch (err) {
            this.logger.warn(`LoggingInterceptor - Masking error for header ${headerKey}`, err);

            return {
              ...maskedHeaders,
              [headerKey]: this.maskingPlaceholder,
            };
          }
        }

        return maskedHeaders;
      },
      headers,
    );
  }

  /**
   * Truncate the request body if it exceeds the specified limit.
   * @param body The request body to truncate.
   * @param options The truncation options.
   * @returns The truncated request body.
   */
  private truncate(body: unknown, options?: LogOptions): unknown {
    if (this.truncation?.disable === true) {
      return body;
    }

    const { disable, limit, truncate } = options?.truncation ?? this.truncation ?? {};

    if (disable === true || limit === undefined || body === undefined) {
      return body;
    }

    // Convert body to string safely
    let stringifiedBody: string;
    try {
      stringifiedBody = JSON.stringify(body);
    } catch {
      stringifiedBody = String(body);
    }

    if (stringifiedBody.length > limit) {
      return truncate ? truncate(body) : stringifiedBody.substring(0, limit);
    }

    return body;
  }
}
