import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CatsModule } from './test-app/cats/cats.module';
import { CoreModule } from './test-app/core/core.module';

describe('Logging interceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, CatsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(Logger);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs the input and output request details - OK status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const url: string = `/cats/ok`;

    await request(app.getHttpServer()).get(url).expect(HttpStatus.OK);

    const ctx: string = `LoggingInterceptor - GET - ${url}`;
    const resCtx: string = `LoggingInterceptor - 200 - GET - ${url}`;
    const incomingMsg: string = `Incoming request - GET - ${url}`;
    const outgoingMsg: string = `Outgoing response - 200 - GET - ${url}`;

    /**
     * Info level
     */
    expect(logSpy).toBeCalledTimes(2);
    expect(logSpy.mock.calls[0]).toEqual([
      {
        body: {},
        headers: expect.any(Object),
        message: incomingMsg,
        method: `GET`,
      },
      ctx,
    ]);
    expect(logSpy.mock.calls[1]).toEqual([
      {
        message: outgoingMsg,
        body: `This action returns all cats`,
      },
      resCtx,
    ]);
  });

  it('logs the input and output request details - BAD_REQUEST status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = `/cats/badrequest`;

    await request(app.getHttpServer()).get(url).expect(HttpStatus.BAD_REQUEST);

    const ctx: string = `LoggingInterceptor - GET - ${url}`;
    const resCtx: string = `LoggingInterceptor - 400 - GET - ${url}`;
    const incomingMsg: string = `Incoming request - GET - ${url}`;
    const outgoingMsg: string = `Outgoing response - 400 - GET - ${url}`;

    /**
     * Info level
     */
    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy.mock.calls[0]).toEqual([
      {
        body: {},
        headers: expect.any(Object),
        message: incomingMsg,
        method: `GET`,
      },
      ctx,
    ]);

    expect(warnSpy).toBeCalledTimes(1);
    expect(warnSpy.mock.calls[0]).toEqual([
      {
        message: outgoingMsg,
        method: 'GET',
        url: '/cats/badrequest',
        body: {},
        error: expect.any(BadRequestException),
      },
      resCtx,
    ]);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs the input and output request details - INTERNAL_SERVER_ERROR status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = '/cats/internalerror';

    await request(app.getHttpServer()).get(url).expect(HttpStatus.INTERNAL_SERVER_ERROR);

    const ctx: string = `LoggingInterceptor - GET - ${url}`;
    const resCtx: string = `LoggingInterceptor - 500 - GET - ${url}`;
    const incomingMsg: string = `Incoming request - GET - ${url}`;
    const outgoingMsg: string = `Outgoing response - 500 - GET - ${url}`;

    /**
     * Info level
     */
    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy.mock.calls[0]).toEqual([
      {
        body: {},
        headers: expect.any(Object),
        message: incomingMsg,
        method: `GET`,
      },
      ctx,
    ]);

    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy.mock.calls[0]).toEqual([
      {
        message: outgoingMsg,
        method: 'GET',
        url: '/cats/internalerror',
        body: {},
        error: expect.any(InternalServerErrorException),
      },
      expect.any(String),
      resCtx,
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  // GraphQL Tests

  it('logs the input and output request details (GraphQL) - OK status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const url: string = `/graphql`;

    await request(app.getHttpServer()).post(url).send({ query: '{ok{message}}' }).expect(HttpStatus.OK);

    const ctx: string = `LoggingInterceptor - POST - ${url}`;
    const resCtx: string = `LoggingInterceptor - 200 - POST - ${url}`;
    const incomingMsg: string = `Incoming request - POST - ${url}`;
    const outgoingMsg: string = `Outgoing response - 200 - POST - ${url}`;

    /**
     * Info level
     */
    expect(logSpy).toBeCalledTimes(2);
    expect(logSpy.mock.calls[0]).toEqual([
      {
        body: {
          query: '{ok{message}}',
        },
        headers: expect.any(Object),
        message: incomingMsg,
        method: `POST`,
      },
      ctx,
    ]);
    expect(logSpy.mock.calls[1]).toEqual([
      {
        message: outgoingMsg,
        body: { message: `This action returns all cats` },
      },
      resCtx,
    ]);
  });

  it('logs the input and output request details (GraphQL) - BAD_REQUEST status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = `/graphql`;

    await request(app.getHttpServer()).post(url).send({ query: '{badRequest{message}}' }).expect(HttpStatus.OK);

    const ctx: string = `LoggingInterceptor - POST - ${url}`;
    const resCtx: string = `LoggingInterceptor - 400 - POST - ${url}`;
    const incomingMsg: string = `Incoming request - POST - ${url}`;
    const outgoingMsg: string = `Outgoing response - 400 - POST - ${url}`;

    /**
     * Info level
     */
    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy.mock.calls[0]).toEqual([
      {
        body: {
          query: '{badRequest{message}}',
        },
        headers: expect.any(Object),
        message: incomingMsg,
        method: `POST`,
      },
      ctx,
    ]);

    expect(warnSpy).toBeCalledTimes(1);
    expect(warnSpy.mock.calls[0]).toEqual([
      {
        message: outgoingMsg,
        method: 'POST',
        url: url,
        body: {
          query: '{badRequest{message}}',
        },
        error: expect.any(BadRequestException),
      },
      resCtx,
    ]);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs the input and output request details (GraphQL) - INTERNAL_SERVER_ERROR status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = '/graphql';

    // await request(app.getHttpServer()).get(url).expect(HttpStatus.INTERNAL_SERVER_ERROR);
    await request(app.getHttpServer()).post(url).send({ query: '{internalerror{message}}' }).expect(HttpStatus.OK);

    const ctx: string = `LoggingInterceptor - POST - ${url}`;
    const resCtx: string = `LoggingInterceptor - 500 - POST - ${url}`;
    const incomingMsg: string = `Incoming request - POST - ${url}`;
    const outgoingMsg: string = `Outgoing response - 500 - POST - ${url}`;

    /**
     * Info level
     */
    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy.mock.calls[0]).toEqual([
      {
        body: {
          query: '{internalerror{message}}',
        },
        headers: expect.any(Object),
        message: incomingMsg,
        method: `POST`,
      },
      ctx,
    ]);

    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy.mock.calls[0]).toEqual([
      {
        message: outgoingMsg,
        method: 'POST',
        url: url,
        body: {
          query: '{internalerror{message}}',
        },
        error: expect.any(InternalServerErrorException),
      },
      expect.any(String),
      resCtx,
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
