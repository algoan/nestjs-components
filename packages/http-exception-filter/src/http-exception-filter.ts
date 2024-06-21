import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { get } from 'lodash';
import { getCode, getErrorMessage } from './error.utils';

/**
 * Option to mask headers
 */
export type MaskHeaders = Record<string, boolean | ((headerValue: string | string[]) => unknown)>;

/**
 * HttpExceptionFilter options
 */
export interface HttpExceptionFilterOptions {
  /**
   * Disable the masking of headers
   * @default false
   */
  disableMasking?: boolean;

  /**
   * Placeholder to use when masking a header
   * @default '****';
   */
  maskingPlaceholder?: string;

  /**
   * Mask configuration
   */
  mask?: {
    /**
     * The headers to mask with their mask configuration
     * - `true` to replace the header value with the `maskingPlaceholder`
     * - a function to replace the header value with the result of the function
     * @example
     * ```ts
     * mask: {
     *  requestHeader: {
     *    // log authorization type only
     *   'authorization': (headerValue: string) => headerValue.split(' ')[0],
     *   'x-api-key': true,
     *  }
     * }
     * ```
     */
    requestHeader?: MaskHeaders;
  };
}

/**
 * Catch and format thrown exception in NestJS application based on Express
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  private readonly disableMasking: boolean;
  private readonly maskingPlaceholder: string;
  private readonly mask: HttpExceptionFilterOptions['mask'];

  constructor(options?: HttpExceptionFilterOptions) {
    this.disableMasking = options?.disableMasking ?? false;
    this.maskingPlaceholder = options?.maskingPlaceholder ?? '****';
    this.mask = options?.mask ?? {};
  }

  /**
   * Catch and format thrown exception
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public catch(exception: any, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    let status: number;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else {
      // Case of a PayloadTooLarge
      const type: string | undefined = get(exception, 'type');
      status = type === 'entity.too.large' ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    let code: string =
      exception instanceof HttpException
        ? getCode(exception.getResponse())
        : HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
    let message: string =
      exception instanceof HttpException
        ? getErrorMessage(exception.getResponse())
        : 'An internal server error occurred';

    if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
      code = HttpStatus[HttpStatus.PAYLOAD_TOO_LARGE];
      message = `
        Your request entity size is too big for the server to process it:
          - request size: ${get(exception, 'length')};
          - request limit: ${get(exception, 'limit')}.`;
    }
    const exceptionStack: string = 'stack' in exception ? exception.stack : '';
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          message: `${status} [${request.method} ${request.url}] has thrown a critical error`,
          headers: this.maskHeaders(request.headers),
        },
        exceptionStack,
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn({
        message: `${status} [${request.method} ${request.url}] has thrown an HTTP client error`,
        exceptionStack,
        headers: this.maskHeaders(request.headers),
      });
    }
    response.status(status).send({
      code,
      message,
      status,
    });
  }

  /**
   * Mask the given headers
   * @param headers the headers to mask
   * @returns the masked headers
   */
  private maskHeaders(headers: Request['headers']): Record<string, unknown> {
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
          } catch (error) {
            this.logger.warn(`HttpFilterOptions - Masking error for header ${headerKey}`, { error, mask, headerKey });

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
}
