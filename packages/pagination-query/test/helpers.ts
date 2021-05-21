import { Controller, Get, INestApplication, Module, UseInterceptors } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DataToPaginate,
  MongoQueryPagination,
  PaginationInterceptor,
  PaginationMongoQueryParamDecorator,
} from '../src';

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
  @UseInterceptors(new PaginationInterceptor())
  @Get('/resources')
  public async findAll(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalResources: data.length, resources: data };
  }

  /**
   * Test the pagination decorator
   */
  @Get('/pagination')
  public async testPagination(@PaginationMongoQueryParamDecorator({}) pagination: MongoQueryPagination): Promise<{}> {
    return { pagination };
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
