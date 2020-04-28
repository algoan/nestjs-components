import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';

/**
 * Bootstrap method
 */
export async function getTestingApplication(): Promise<{ app: INestApplication; module: TestingModule }> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return {
    module,
    app: module.createNestApplication(),
  };
}
