import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {HttpExceptionFilter} from '../../../src';

/**
 * Core module: This module sets the http exception filter globally
 */
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ],
})
export class CoreModule {}
