import { INestApplication } from '@nestjs/common';
import { FakeAppController, UserRole, createTestAppModule } from './helpers';
import * as request from 'supertest';

describe('EnumFallback Decorator', () => {
  let app: INestApplication;
  let appController: FakeAppController;

  beforeAll(async () => {
    app = await createTestAppModule();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    appController = app.get<FakeAppController>(FakeAppController);
  });

  it('should apply the fallback functions when we have an invalid value', async () => {
    const result = appController.createUser({ role: 'WRITER' as UserRole });
    expect((result as { role: UserRole }).role).toEqual(UserRole.ADMIN);
  });

  it('should not apply the fallback function when the value is valid', async () => {
    await request(app.getHttpServer()).post('/user').send({ role: 'READER' }).expect(201);
  });
});
