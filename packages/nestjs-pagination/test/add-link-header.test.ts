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

  describe('Tests with a limit of 100', () => {
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
        },
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
      expect(res.header['content-range']).to.equal('data 0-99/1015');
      expect(res.body.totalDocs).to.be.undefined;
      expect(res.body.resource).to.be.undefined;
      expect(res.body).to.be.an('array');
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
        },
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
      expect(res.header['content-range']).to.equal('data 300-399/1015');
      expect(res.body.totalDocs).to.be.undefined;
      expect(res.body.resource).to.be.undefined;
      expect(res.body).to.be.an('array');
    });

    it('AD03 - should successfully add Link in headers for the last page', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/data?page=11&per_page=100')
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
          url: '/data?page=10&per_page=100',
          page: '10',
          per_page: '100',
          rel: 'prev',
        },
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
      expect(res.header['content-range']).to.equal('data 1000-1015/1015');
      expect(res.body.totalDocs).to.be.undefined;
      expect(res.body.resource).to.be.undefined;
      expect(res.body).to.be.an('array');
    });
  });

  describe('Tests with a limit of 25', () => {
    it('AD10 - should successfully add Link in headers with params', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/data?page=4&per_page=25')
        .expect(200);

      const expectedResult: formatLinkHeader.Links = {
        first: {
          url: '/data?page=1&per_page=25',
          page: '1',
          per_page: '25',
          rel: 'first',
        },
        last: {
          url: '/data?page=41&per_page=25',
          page: '41',
          per_page: '25',
          rel: 'last',
        },
        next: {
          url: '/data?page=5&per_page=25',
          page: '5',
          per_page: '25',
          rel: 'next',
        },
        prev: {
          url: '/data?page=3&per_page=25',
          page: '3',
          per_page: '25',
          rel: 'prev',
        },
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
      expect(res.header['content-range']).to.equal('data 75-99/1015');
      expect(res.body.totalDocs).to.be.undefined;
      expect(res.body.resource).to.be.undefined;
      expect(res.body).to.be.an('array');
    });

    it('AD11 - should successfully add Link in headers for the last page', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/data?page=41&per_page=25')
        .expect(200);

      const expectedResult: formatLinkHeader.Links = {
        first: {
          url: '/data?page=1&per_page=25',
          page: '1',
          per_page: '25',
          rel: 'first',
        },
        last: {
          url: '/data?page=41&per_page=25',
          page: '41',
          per_page: '25',
          rel: 'last',
        },
        prev: {
          url: '/data?page=40&per_page=25',
          page: '40',
          per_page: '25',
          rel: 'prev',
        },
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
      expect(res.header['content-range']).to.equal('data 1000-1015/1015');
      expect(res.body.totalDocs).to.be.undefined;
      expect(res.body.resource).to.be.undefined;
      expect(res.body).to.be.an('array');
    });
  });

  describe('Tests with custom configuration', () => {
    it('AD12 - should successfully handle custom query parameters', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/data-custom-query?_page=41&numberPerPage=25')
        .expect(200);

      const expectedResult: formatLinkHeader.Links = {
        first: {
          url: '/data-custom-query?_page=1&numberPerPage=25',
          page: '1',
          per_page: '25',
          _page: '1',
          numberPerPage: '25',
          rel: 'first',
        },
        last: {
          url: '/data-custom-query?_page=41&numberPerPage=25',
          page: '41',
          per_page: '25',
          _page: '41',
          numberPerPage: '25',
          rel: 'last',
        },
        prev: {
          url: '/data-custom-query?_page=40&numberPerPage=25',
          page: '40',
          per_page: '25',
          _page: '40',
          numberPerPage: '25',
          rel: 'prev',
        },
      };

      expect(parseLinkHeader(res.header.link)).to.deep.equal(expectedResult);
      expect(res.header['content-range']).to.equal('data-custom-query 1000-1015/1015');
      expect(res.body.totalDocs).to.be.undefined;
      expect(res.body.resource).to.be.undefined;
      expect(res.body).to.be.an('array');
    });
  });
});
