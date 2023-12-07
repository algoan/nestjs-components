/* eslint-disable max-lines */
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ApplicationConfig } from '@nestjs/core';
import { LoggingInterceptor } from '../src';
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

  describe('Default behaviour', () => {
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
  });

  describe('@Log - Masking options', () => {
    const placeholder = '****';

    it('allows to mask given properties of the request body', async () => {
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats`;

      await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Tom',
          birthdate: '1980-01-01',
          enemies: ['Jerry', 'Titi'],
          interests: [
            { description: 'Eating Jerry', level: 'HIGH' },
            { description: 'Sleeping', level: 'MEDIUM' },
          ],
          address: { country: 'USA', city: 'New York' },
        })
        .expect(HttpStatus.CREATED);

      const ctx: string = `LoggingInterceptor - POST - ${url}`;
      const incomingMsg: string = `Incoming request - POST - ${url}`;

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[0]).toEqual([
        {
          body: {
            name: 'Tom',
            birthdate: placeholder,
            enemies: placeholder,
            interests: [
              { description: placeholder, level: 'HIGH' },
              { description: placeholder, level: 'MEDIUM' },
            ],
            address: placeholder,
          },
          headers: expect.any(Object),
          message: incomingMsg,
          method: `POST`,
        },
        ctx,
      ]);
    });

    it('allows to mask the whole request body', async () => {
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/1/password`;

      await request(app.getHttpServer()).post(url).send({ password: 'secret password' }).expect(HttpStatus.CREATED);

      const ctx: string = `LoggingInterceptor - POST - ${url}`;
      const incomingMsg: string = `Incoming request - POST - ${url}`;

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[0]).toEqual([
        {
          body: placeholder,
          headers: expect.any(Object),
          message: incomingMsg,
          method: `POST`,
        },
        ctx,
      ]);
    });

    it('allows to mask given properties of the response body', async () => {
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats`;

      await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Tom',
          birthdate: '1980-01-01',
          enemies: ['Jerry', 'Titi'],
          interests: [
            { description: 'Eating Jerry', level: 'HIGH' },
            { description: 'Sleeping', level: 'MEDIUM' },
          ],
          address: { country: 'USA', city: 'New York' },
        })
        .expect(HttpStatus.CREATED);

      const ctx: string = `LoggingInterceptor - 201 - POST - ${url}`;
      const outgoingMsg: string = `Outgoing response - 201 - POST - ${url}`;

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[1]).toEqual([
        {
          body: {
            id: placeholder,
            name: 'Tom',
            birthdate: placeholder,
            enemies: placeholder,
            interests: [
              { description: placeholder, level: 'HIGH' },
              { description: placeholder, level: 'MEDIUM' },
            ],
            address: placeholder,
          },
          message: outgoingMsg,
        },
        ctx,
      ]);
    });

    it('allows to mask the whole response body', async () => {
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/1/password`;

      await request(app.getHttpServer()).post(url).send({ password: 'secret password' }).expect(HttpStatus.CREATED);

      const ctx: string = `LoggingInterceptor - 201 - POST - ${url}`;
      const outgoingMsg: string = `Outgoing response - 201 - POST - ${url}`;

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[1]).toEqual([
        {
          body: placeholder,
          message: outgoingMsg,
        },
        ctx,
      ]);
    });

    it('should ignore unknown properties', async () => {
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats`;

      await request(app.getHttpServer()).get(url).expect(HttpStatus.OK);

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[1][0].body).toEqual([
        {
          id: 1,
          name: 'Tom',
          interests: [
            { description: placeholder, level: 'HIGH' },
            { description: placeholder, level: 'MEDIUM' },
          ],
        },
        {
          id: 2,
          name: 'Sylvestre',
          interests: [{ description: placeholder, level: 'HIGH' }],
        },
      ]);
    });

    it("shouldn't mask anything if masking is disabled", async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setDisableMasking(true);
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats`;

      const newCat = {
        name: 'Tom',
        birthdate: '1980-01-01',
        enemies: ['Jerry', 'Titi'],
        interests: [
          { description: 'Eating Jerry', level: 'HIGH' },
          { description: 'Sleeping', level: 'MEDIUM' },
        ],
        address: { country: 'USA', city: 'New York' },
      };

      await request(app.getHttpServer()).post(url).send(newCat).expect(HttpStatus.CREATED);

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[0][0].body).toEqual(newCat);

      expect(logSpy.mock.calls[1][0].body).toEqual({ ...newCat, id: 1 });

      interceptor.setDisableMasking(false);
    });

    it('should be possible to change the masking placeholder', async () => {
      const customPlaceholder = undefined;
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMaskingPlaceholder(customPlaceholder);

      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats`;

      await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'Tom',
          birthdate: '1980-01-01',
        })
        .expect(HttpStatus.CREATED);

      const ctx: string = `LoggingInterceptor - POST - ${url}`;
      const incomingMsg: string = `Incoming request - POST - ${url}`;

      expect(logSpy).toBeCalledTimes(2);
      expect(logSpy.mock.calls[0]).toEqual([
        {
          body: {
            name: 'Tom',
            birthdate: customPlaceholder,
          },
          headers: expect.any(Object),
          message: incomingMsg,
          method: `POST`,
        },
        ctx,
      ]);

      interceptor.setMaskingPlaceholder(placeholder);
    });

    it('should mask http exception response', async () => {
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats`;

      await request(app.getHttpServer())
        .post(url)
        .send({
          name: 'dog',
          birthdate: '1980-01-01',
        })
        .expect(HttpStatus.BAD_REQUEST);

      const ctx: string = `LoggingInterceptor - POST - ${url}`;
      const incomingMsg: string = `Incoming request - POST - ${url}`;

      expect(logSpy).toBeCalledTimes(1);
      expect(logSpy.mock.calls[0]).toEqual([
        {
          body: {
            name: 'dog',
            birthdate: placeholder,
          },
          headers: expect.any(Object),
          message: incomingMsg,
          method: `POST`,
        },
        ctx,
      ]);
    });
  });

  describe('LoggingInterceptor - Masking options', () => {
    const placeholder = '****';

    it('allows to mask the whole content of a request header', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({ requestHeader: { authorization: true } });
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).set('authorization', 'access-token').expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toEqual(placeholder);
    });

    it('allows to mask a request header with a specific handler function', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({
        requestHeader: {
          authorization: (header: string | string[]) => {
            if (typeof header === 'string') {
              const [type, value] = header.split(' ');

              return { type, value };
            } else {
              return header;
            }
          },
        },
      });
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).set('authorization', 'Bearer JWT').expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toEqual({
        type: 'Bearer',
        value: 'JWT',
      });
    });

    it('should not mask a request header if the corresponding mask is undefined', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({ requestHeader: {} });
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).set('authorization', 'Bearer JWT').expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toBe('Bearer JWT');
    });

    it('should not mask a request header if the corresponding mask is false', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({ requestHeader: { authorization: false } });
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).set('authorization', 'Bearer JWT').expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toBe('Bearer JWT');
    });

    it('should not modify the request header if it is not passed with the request but defined in masking option', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({ requestHeader: { authorization: true } });
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toBeUndefined();
    });

    it('should not fail if the masking function throws an error and mask the whole header as fallback', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({
        requestHeader: {
          authorization: () => {
            throw new Error('This is an error');
          },
        },
      });
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).set('authorization', 'Bearer JWT').expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toBe(placeholder);
    });

    it('should not mask request headers if masking is disabled', async () => {
      const interceptor = app.get(ApplicationConfig).getGlobalInterceptors()[0] as LoggingInterceptor;
      interceptor.setMask({ requestHeader: { authorization: true } });
      interceptor.setDisableMasking(true);
      const logSpy: jest.SpyInstance = jest.spyOn(Logger.prototype, 'log');
      const url: string = `/cats/ok`;

      await request(app.getHttpServer()).get(url).set('authorization', 'Bearer JWT').expect(HttpStatus.OK);

      expect(logSpy.mock.calls[0][0].headers.authorization).toBe('Bearer JWT');
    });
  });
});
