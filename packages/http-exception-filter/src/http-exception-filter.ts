import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { getCode, getErrorMessage } from './error.utils';

/**
 * Catch and format thrown exception in NestJS application based on Express
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  /**
   * Catch and format thrown exception
   */
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    const status: number =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const code: string =
      exception instanceof HttpException
        ? getCode(exception.getResponse())
        : HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
    const message: string =
      exception instanceof HttpException
        ? getErrorMessage(exception.getResponse())
        : 'An internal server error occurred, please contact us at dev-team@algoan.com';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({
        message: `${status} [${request.method} ${request.url}] has thrown a critical error`,
        headers: request.headers,
        exception,
      });
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn({
        message: `${status} [${request.method} ${request.url}] has thrown an HTTP client error`,
        exception,
        headers: request.headers,
      });
    }
    response.status(status).send({
      code,
      message,
      status,
    });
  }
}
