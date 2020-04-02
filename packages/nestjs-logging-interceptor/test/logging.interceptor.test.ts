import { BadRequestException, HttpStatus, INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CatsModule } from './testApp/cats/cats.module';
import { CoreModule } from './testApp/core/core.module';

describe('Logging interceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, CatsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(Logger);
    // logger = moduleRef.get<Logger>(Logger);

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
    const debugSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'debug');

    await request(app.getHttpServer()).get('/cats/ok').expect(HttpStatus.OK);

    const ctx: string = `LoggingInterceptor - GET - /cats/ok`;
    const resCtx: string = `LoggingInterceptor - 200 - GET - /cats/ok`;
    /**
     * log level
     */
    expect(logSpy).toBeCalledTimes(2);
    expect(logSpy.mock.calls[0]).toEqual([ctx]);
    expect(logSpy.mock.calls[1]).toEqual([resCtx]);

    /**
     * debug level
     */
    expect(debugSpy).toBeCalledTimes(2);
    expect(debugSpy.mock.calls[0]).toEqual([
      {
        body: {},
        headers: expect.any(Object),
        message: ctx,
        method: `GET`,
      },
      ctx,
    ]);
    expect(debugSpy.mock.calls[1]).toEqual([
      {
        message: resCtx,
        body: `This action returns all cats`,
      },
      resCtx,
    ]);
  });

  it('logs the input and output request details - BAD_REQUEST status code', async () => {
    const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
    const debugSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'debug');
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');

    await request(app.getHttpServer()).get('/cats/badrequest').expect(HttpStatus.BAD_REQUEST);
    // console.log(result.body)

    const ctx: string = `LoggingInterceptor - GET - /cats/badrequest`;
    const resCtx: string = `LoggingInterceptor - 400 - GET - /cats/badrequest`;
    /**
     * log level
     */
    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy.mock.calls[0]).toEqual([ctx]);

    /**
     * debug level
     */
    expect(debugSpy).toBeCalledTimes(1);
    expect(debugSpy.mock.calls[0]).toEqual([
      {
        body: {},
        headers: expect.any(Object),
        message: ctx,
        method: `GET`,
      },
      ctx,
    ]);

    expect(warnSpy).toBeCalledTimes(1);
    expect(warnSpy.mock.calls[0]).toEqual([
      {
        message: resCtx,
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
    const debugSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'debug');
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');

    await request(app.getHttpServer()).get('/cats/internalerror').expect(HttpStatus.INTERNAL_SERVER_ERROR);
    // console.log(result.body)

    const ctx: string = `LoggingInterceptor - GET - /cats/internalerror`;
    const resCtx: string = `LoggingInterceptor - 500 - GET - /cats/internalerror`;
    /**
     * log level
     */
    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy.mock.calls[0]).toEqual([ctx]);

    /**
     * debug level
     */
    expect(debugSpy).toBeCalledTimes(1);
    expect(debugSpy.mock.calls[0]).toEqual([
      {
        body: {},
        headers: expect.any(Object),
        message: ctx,
        method: `GET`,
      },
      ctx,
    ]);

    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy.mock.calls[0]).toEqual([
      {
        message: resCtx,
        method: 'GET',
        url: '/cats/internalerror',
        body: {},
      },
      expect.any(String),
      resCtx,
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
