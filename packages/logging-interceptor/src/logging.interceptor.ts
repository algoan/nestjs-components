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

interface MaskConfigType {
  request?: {
    url?: string;
    method?: string;
    pattern?: string;
    params?: string[];
  };
}

interface MaskedBody {
  [x: string]: any;
}

const VAR = '{var}';

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
   * Parse and Mask the body by maskConfigs
   * @param maskConfig maskConfig
   * @param body parsed body
   * @param prefixKey prefixKey for nest structure
   * @returns MaskedBody
   */
  private parseBody(
    maskConfig: MaskConfigType,
    body: { [key: string]: string | { [key: string]: string } },
    prefixKey?: string,
  ): MaskedBody {
    const maskedBody = Object.keys(body).reduce((maskedBody: MaskedBody, currentKey: string) => {
      const mixedKey = prefixKey ? `${prefixKey}.${currentKey}` : currentKey;

      // value of param is string or array
      if (typeof body[currentKey] === 'string' || Array.isArray(body[currentKey])) {
        return {
          ...maskedBody,
          [currentKey]: maskConfig?.request?.params?.find((param) => param === mixedKey) ? '****' : body[currentKey],
        };
      }

      // value of param is parsable object
      const subBody = body[currentKey] as { [key: string]: string };

      return {
        ...maskedBody,
        [currentKey]: this.parseBody(maskConfig, subBody, mixedKey),
      };
    }, {} as MaskedBody);

    return maskedBody;
  }

  /**
   * Get consist pattern url from raw url
   * @param rawUrl raw url
   * @param configUrl config url mask configurations
   * @param pattern url pattern to get pattern url
   * @returns Fixed Url replaced with pattern
   */
  private getPatternUrl(rawUrl: string = '', configUrl: string = '', pattern: string = VAR) {
    const rawUrlPieces = rawUrl.split('/');
    const constUrlPatternPieces = configUrl.split('/');

    const patternIndexes = constUrlPatternPieces.reduce((pieces: number[], piece, index) => {
      if (piece === pattern) {
        pieces.push(index);
      }

      return pieces;
    }, []);

    patternIndexes.forEach((index) => {
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
  private needMask(patternUrl: string, method: string, maskConfig: MaskConfigType) {
    return (
      patternUrl === maskConfig?.request?.url && method.toLowerCase() === maskConfig?.request?.method?.toLowerCase()
    );
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

    let patternUrl = '';
    let maskedBody: string | object;
    const maskConfig =
      this?.maskConfigs?.find((config) => {
        const temporaryPatternUrl = this.getPatternUrl(url, config?.request?.url, config?.request?.pattern);
        if (this.needMask(temporaryPatternUrl, method, config)) {
          patternUrl = temporaryPatternUrl;

          return true;
        }

        return false;
      }) || {};

    if (this.needMask(patternUrl, method, maskConfig)) {
      if (typeof body === 'object') {
        maskedBody = this.parseBody(maskConfig, body);
      } else {
        maskedBody = '****';
      }
    } else {
      maskedBody = body;
    }

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
