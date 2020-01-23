import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import * as formatLinkHeader from 'format-link-header';
import * as parseLinkHeader from 'parse-link-header';
import * as request from 'supertest';
import { createTestAppModule } from './helpers';

describe('Tests related to the Link Header interceptor', () => {
  let app: INestApplication;

  before(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  it('AD01 - should successfully add Link in headers without params', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .get('/data')
      .expect(200);

    const expectedResult: formatLinkHeader.Links = {
      first: {
        url: '/data?page=1&per_page=100',
        page: '1',
        per_page: '100',
        rel: 'first',
      },
      last: {
        url: '/data?page=11&per_page=100',
        page: '11',
        per_page: '100',
        rel: 'last',
      },
      next: {
        url: '/data?page=2&per_page=100',
        page: '2',
        per_page: '100',
        rel: 'next',
      }
    };

    expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
  });

  it('AD02 - should successfully add Link in headers with params', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .get('/data?page=4&per_page=100')
      .expect(200);

      const expectedResult: formatLinkHeader.Links = {
        first: {
          url: '/data?page=1&per_page=100',
          page: '1',
          per_page: '100',
          rel: 'first',
        },
        last: {
          url: '/data?page=11&per_page=100',
          page: '11',
          per_page: '100',
          rel: 'last',
        },
        next: {
          url: '/data?page=5&per_page=100',
          page: '5',
          per_page: '100',
          rel: 'next',
        },
        prev: {
          url: '/data?page=3&per_page=100',
          page: '3',
          per_page: '100',
          rel: 'prev',
        }
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
  });

  it('AD03 - should successfully add Link in headers for the last page', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .get('/data?page=101&per_page=100')
      .expect(200);

      const expectedResult: formatLinkHeader.Links = {
        first: {
          url: '/data?page=1&per_page=100',
          page: '1',
          per_page: '100',
          rel: 'first',
        },
        last: {
          url: '/data?page=11&per_page=100',
          page: '11',
          per_page: '100',
          rel: 'last',
        },
        prev: {
          url: '/data?page=100&per_page=100',
          page: '100',
          per_page: '100',
          rel: 'prev',
        }
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
  });
});
