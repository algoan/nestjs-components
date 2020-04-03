import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';

/**
 * Cats module
 */
@Module({
  controllers: [CatsController],
})
export class CatsModule {}
