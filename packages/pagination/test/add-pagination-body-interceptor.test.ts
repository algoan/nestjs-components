import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { createTestAppModule } from './helpers';

describe('Tests related to the pagination interceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tests with a limit', () => {
    it('AD01 - should successfully build the response without params', async () => {
      const res: request.Response = await request(app.getHttpServer()).get('/resource').expect(200);
      expect(res.body.resources).to.be.an('array');
      expect(res.body.pagination).to.deep.equal({
        next: '/resource?page=2&limit=200',
        first: '/resource?page=1&limit=200',
        last: '/resource?page=6&limit=200',
        previous: null,
        totalPages: 6,
        totalResources: 1015,
      });
    });

    it('AD02 - should successfully build the response with params', async () => {
      const res: request.Response = await request(app.getHttpServer()).get('/resource?page=4&limit=100').expect(200);
      expect(res.body.resources).to.be.an('array');
      expect(res.body.pagination).to.deep.equal({
        next: '/resource?page=5&limit=100',
        first: '/resource?page=1&limit=100',
        last: '/resource?page=11&limit=100',
        previous: '/resource?page=3&limit=100',
        totalPages: 11,
        totalResources: 1015,
      });
    });

    it('AD03 - should successfully build the response for the last page', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resource?page=11&per_page=200')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: null,
        first: '/resource?page=1&limit=200',
        last: '/resource?page=6&limit=200',
        previous: null,
        totalPages: 6,
        totalResources: 1015,
      });
    });

    it('AD04 - should successfully build the response with the filter param', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resource?page=4&limit=100&filter={customerIdentifier: my_id_43524}')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: '/resource?page=5&limit=100&filter={customerIdentifier: my_id_43524}',
        first: '/resource?page=1&limit=100&filter={customerIdentifier: my_id_43524}',
        last: '/resource?page=11&limit=100&filter={customerIdentifier: my_id_43524}',
        previous: '/resource?page=3&limit=100&filter={customerIdentifier: my_id_43524}',
        totalPages: 11,
        totalResources: 1015,
      });
    });

    it('AD05 - should not add sort and project if they are already defined', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resource?page=4&limit=100&filter={customerIdentifier: my_id_43524}&sort={created: -1}&project={id: 0}')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: '/resource?page=5&limit=100&filter={customerIdentifier: my_id_43524}&sort={created: -1}&project={id: 0}',
        first: '/resource?page=1&limit=100&filter={customerIdentifier: my_id_43524}&sort={created: -1}&project={id: 0}',
        last: '/resource?page=11&limit=100&filter={customerIdentifier: my_id_43524}&sort={created: -1}&project={id: 0}',
        previous:
          '/resource?page=3&limit=100&filter={customerIdentifier: my_id_43524}&sort={created: -1}&project={id: 0}',
        totalPages: 11,
        totalResources: 1015,
      });
    });

    it('AD06 - should apply page and limit params with custom page and limit names', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resource-custom-props?other_name=4&other_limit_name=100')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: '/resource-custom-props?other_name=5&other_limit_name=100',
        first: '/resource-custom-props?other_name=1&other_limit_name=100',
        last: '/resource-custom-props?other_name=11&other_limit_name=100',
        previous: '/resource-custom-props?other_name=3&other_limit_name=100',
        totalPages: 11,
        totalResources: 1015,
      });
    });

    it('AD07 - should use default values', async () => {
      const res: request.Response = await request(app.getHttpServer())
        .get('/resource-default-props?page=4')
        .expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: '/resource-default-props?page=5&per_page=200',
        first: '/resource-default-props?page=1&per_page=200',
        last: '/resource-default-props?page=6&per_page=200',
        previous: '/resource-default-props?page=3&per_page=200',
        totalPages: 6,
        totalResources: 1015,
      });
    });

    it('AD08 - should return 0 resource', async () => {
      const res: request.Response = await request(app.getHttpServer()).get('/resource-null?page=4').expect(200);
      expect(res.body.pagination).to.deep.equal({
        next: null,
        first: null,
        last: null,
        previous: null,
        totalPages: 0,
        totalResources: 0,
      });
    });
  });
});
