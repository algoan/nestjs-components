import { INestApplication } from '@nestjs/common';
import { createTestAppModule } from './helpers';
import * as request from 'supertest';

describe('E2e tests related to the User ParamDecorator', () => {
  let app: INestApplication;

  before(async () => {
    app = await createTestAppModule();
    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('Add successfully the user to the params', async () => {
    await request(app.getHttpServer()).get('/user').expect(200).expect({
      someId: 'id',
    });
  });
});
