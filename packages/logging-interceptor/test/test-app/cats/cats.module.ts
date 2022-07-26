import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsResolver } from './cats.resolver';

/**
 * Cats module
 */
@Module({
  providers: [CatsResolver],
  controllers: [CatsController],
})
export class CatsModule {}
