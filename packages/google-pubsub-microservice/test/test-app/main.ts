import { INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GCPubSubServer } from '../../src';
import { AppModule } from './app.module';

/**
 * Bootstrap method
 */
export async function getTestingApplication(
  server: GCPubSubServer,
): Promise<{ app: INestMicroservice; module: TestingModule }> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return {
    module,
    app: module.createNestMicroservice({
      strategy: server,
    }),
  };
}
