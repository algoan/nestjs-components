import { INestApplication } from '@nestjs/common';
import { createTestAppModule } from './helpers';
import * as request from 'supertest';

describe('E2e tests related to the DecodeJWT ParamDecorator', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Add successfully the decoded jwt to the params', async () => {
    await request(app.getHttpServer()).get('/decode-jwt').expect(200).expect({
      iat: 1516239022,
      name: 'John Doe',
      sub: '1234567890',
    });
  });
});
