import { GCPubSubServer } from '@algoan/nestjs-google-pubsub-microservice';
import { INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';

/**
 * Bootstrap method
 */
export async function getTestingServer(
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
