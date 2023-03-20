import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../../../src';

/**
 * Core module: This module sets the logging interceptor as a global interceptor
 */
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => {
        const interceptor: LoggingInterceptor = new LoggingInterceptor([
          {
            request: {
              url: '/cats/{catId}',
              routePattern: '{catId}',
              method: 'put',
              params: ['password', 'interests', 'address.country', 'address.city', 'payments.bank.name'],
            },
          },
          {
            request: {
              url: '/cats/login',
              method: 'post',
              params: ['password'],
            },
          },
        ]);
        return interceptor;
      },
    },
  ],
})
export class CoreModule {}
