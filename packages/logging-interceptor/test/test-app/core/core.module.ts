import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';

import { LoggingInterceptor } from '../../../src';

/**
 * Core module: This module sets the logging interceptor as a global interceptor
 */
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.gql'],
      installSubscriptionHandlers: true,
      context: ({ req, res }: { req: Request; res: Response }): { req: Request; res: Response } => ({ req, res }),
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class CoreModule {}
