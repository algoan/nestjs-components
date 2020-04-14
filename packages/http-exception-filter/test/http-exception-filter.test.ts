import { INestApplication, Logger, HttpStatus, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CatsModule } from './test-app/cats/cats.module';
import { CoreModule } from './test-app/core/core.module';

describe('Http Exception Filter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, CatsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(Logger);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a formatted bad request reponse', async () => {
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const url: string = `/cats/badrequest`;

    const { body: resBody } = await request(app.getHttpServer()).get(url).expect(HttpStatus.BAD_REQUEST);

    expect(warnSpy).toHaveBeenCalledWith({
      message: `400 [GET ${url}] has thrown an HTTP client error`,
      exception: expect.any(Error),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      code: 'BAD_REQUEST',
      message: 'The request is malformed.',
      status: 400,
    });
  });

  it('returns a formatted bad request after failing DTO validation', async () => {
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const url: string = `/cats/create`;

    const { body: resBody } = await request(app.getHttpServer()).post(url).expect(HttpStatus.BAD_REQUEST);

    expect(warnSpy).toHaveBeenCalledWith({
      message: `400 [POST ${url}] has thrown an HTTP client error`,
      exception: expect.any(Error),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      code: 'BAD_REQUEST',
      message: 'name should not be empty',
      status: 400,
    });
  });

  it('returns a formatted internal server error reponse', async () => {
    const errorSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'error');
    const url: string = `/cats/internalerror`;

    const { body: resBody } = await request(app.getHttpServer()).get(url).expect(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(errorSpy).toHaveBeenCalledWith({
      message: `500 [GET ${url}] has thrown a critical error`,
      exception: expect.any(Error),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'A critical error happened.',
      status: 500,
    });
  });

  it('returns a formatted bad request after failing DTO validation', async () => {
    const warnSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn');
    const url: string = `/cats/create`;

    const { body: resBody } = await request(app.getHttpServer()).post(url).send(new Array(10000).fill({
      name: 'Garfield',
      email: 'garfield-the-cat@yopmail.com'
    })).expect(HttpStatus.PAYLOAD_TOO_LARGE);

    expect(warnSpy).toHaveBeenCalledWith({
      message: `413 [POST ${url}] has thrown an HTTP client error`,
      exception: expect.any(Error),
      headers: expect.anything(),
    });

    expect(resBody).toEqual({
      code: 'PAYLOAD_TOO_LARGE',
      message: `
        Your request entity size is too big for the server to process it:
          - request size: 590001;
          - request limit: 102400.`,
      status: 413,
    });
  });
});
