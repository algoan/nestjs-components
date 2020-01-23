import { Controller, Get, INestApplication, Module, UseInterceptors } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { LinkHeaderInterceptor } from '../src';

/**
 * Fake data format
 */
interface FakeDataToReturn {
  name: string;
  index: number;
  createdAt: Date;
}

/**
 * Controller
 */
@Controller()
/**
 * Controller returning a lot of documents
 */
class FakeAppController {
  /**
   * Find all documents
   */
  @UseInterceptors(LinkHeaderInterceptor)
  @Get('/data')
  public async findAll(): Promise<{ totalDocs: number; resource: FakeDataToReturn[] }> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalDocs: data.length, resource: data };
  }
}

/**
 * Fake app module
 */
/* tslint:disable */
@Module({
  controllers: [FakeAppController],
})
class AppModule {}
/* tslint:enable */

export async function createTestAppModule(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return moduleFixture.createNestApplication();
}
