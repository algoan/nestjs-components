import { Module } from '@nestjs/common';

import { GCPubSubClient } from '../../src';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Fake App module
 */
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'PUBSUB_CLIENT',
      useFactory: () => {
        return new GCPubSubClient({
          projectId: 'algoan-test',
          port: 4000,
        });
      },
    },
  ],
})
export class AppModule {}
