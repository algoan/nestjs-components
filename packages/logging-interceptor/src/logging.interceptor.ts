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

/**
 * Configuration arguments to require masking.
 */
interface MaskConfigType {
  request?: {
    url?: string;
    method?: string;
    routePattern?: string;
    params?: string[];
  };
}

/**
 * Masked body
 */
interface MaskedBody {
  [x: string]: string | object;
}

// The default route parameter pattern name in a url
const VAR: string = '{var}';

/**
 * Parse and Mask the body by maskConfigs
 * @param maskConfig maskConfig
 * @param body parsed body of request
 * @param prefixKey prefixKey for nest structure
 * @returns MaskedBody
 */
function parseBody(
  maskConfig: MaskConfigType,
  body: { [key: string]: string | { [key: string]: string } },
  prefixKey: string = '',
): MaskedBody {
  return Object.keys(body).reduce((maskedBody: MaskedBody, currentKey: string): MaskedBody => {
    const mixedKey: string = prefixKey ? `${prefixKey}.${currentKey}` : currentKey;

    // value of param is string or array
    if (typeof body[currentKey] === 'string' || Array.isArray(body[currentKey])) {
      return {
        ...maskedBody,
        [currentKey]:
          maskConfig?.request?.params?.find((param: string): boolean => param === mixedKey) !== undefined
            ? '****'
            : body[currentKey],
      };
    }

    // value of param is parsable object
    const subBody: {
      [key: string]: string;
    } = body[currentKey] as { [key: string]: string };

    return {
      ...maskedBody,
      [currentKey]: parseBody(maskConfig, subBody, mixedKey),
    };
  }, {});
}

/**
 * Get consist pattern url from raw url
 * @param rawUrl raw url
 * @param configUrl config url mask configurations
 * @param pattern url pattern to get pattern url
 * @returns Fixed Url replaced with pattern
 */
function getPatternUrl(rawUrl: string = '', configUrl: string = '', pattern: string = VAR): string {
  const rawUrlPieces: string[] = rawUrl.split('/');
  const constUrlPatternPieces: string[] = configUrl.split('/');

  const patternIndexes: number[] = constUrlPatternPieces.reduce(
    (pieces: number[], piece: string, index: number): number[] => {
      if (piece === pattern) {
        pieces.push(index);
      }

      return pieces;
    },
    [],
  );

  patternIndexes.forEach((index: number): void => {
    rawUrlPieces[index] = pattern;
  });

  return rawUrlPieces.join('/');
}

/**
 * check the url is needs masking
 * @param patternUrl url pattern to get pattern url
 * @param method raw url
 * @param maskConfig maskConfig
 * @returns boolean
 */
function needMask(patternUrl: string, method: string, maskConfig: MaskConfigType): boolean {
  return patternUrl === maskConfig?.request?.url && method.toLowerCase() === maskConfig?.request?.method?.toLowerCase();
}

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = LoggingInterceptor.name;
  private readonly logger: Logger = new Logger(this.ctxPrefix);
  private userPrefix: string = '';
  private maskConfigs?: MaskConfigType[];

  constructor(config?: MaskConfigType[]) {
    this.maskConfigs = config;
  }

  /**
   * User prefix setter
   * ex. [MyPrefix - LoggingInterceptor - 200 - GET - /]
   */
  public setUserPrefix(prefix: string): void {
    this.userPrefix = `${prefix} - `;
  }

  /**
   * User mask configuration
   * ex. [{request: {url: 'xxx/yyy', method: 'post', params: ['param', 'param.subParam']}}]
   */
  public setMaskConfig(config?: MaskConfigType[]): void {
    this.maskConfigs = config;
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

    let patternUrl: string = '';
    let maskedBody: string | object;
    const maskConfig: MaskConfigType =
      this?.maskConfigs?.find((config: MaskConfigType): boolean => {
        const temporaryPatternUrl: string = getPatternUrl(url, config?.request?.url, config?.request?.routePattern);
        if (needMask(temporaryPatternUrl, method, config)) {
          patternUrl = temporaryPatternUrl;

          return true;
        }

        return false;
      }) ?? {};

    maskedBody = needMask(patternUrl, method, maskConfig)
      ? typeof body === 'object'
        ? (maskedBody = parseBody(maskConfig, body))
        : '****'
      : body;

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
