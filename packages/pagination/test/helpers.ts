import { Controller, Get, INestApplication, Module, UseInterceptors } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CustomParamFactory } from '@nestjs/common/interfaces/features/custom-route-param-factory.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { LinkHeaderInterceptor, MongoPagination, MongoPaginationParamDecorator, Pageable } from '../src';

const CUSTOM_LIMIT: number = 50;
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
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data' }))
  @Get('/data')
  public async findAll(): Promise<Pageable<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalDocs: data.length, resource: data };
  }

  /**
   * Find no documents
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'resources' }))
  @Get('/resources')
  public async find(): Promise<Pageable<FakeDataToReturn>> {
    return { totalDocs: 0, resource: [] };
  }

  /**
   * Find 1 document
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data' }))
  @Get('/one-data')
  public async findOneDocument(): Promise<Pageable<FakeDataToReturn>> {
    return { totalDocs: 1, resource: [{ name: `doc_1`, index: 1, createdAt: new Date() }] };
  }

  /**
   * Find all documents
   */
  @UseInterceptors(
    new LinkHeaderInterceptor({ resource: 'data-custom-query', pageName: '_page', perPageName: 'numberPerPage' }),
  )
  @Get('/data-custom-query')
  public async findAllWithCustomQuery(): Promise<Pageable<FakeDataToReturn>> {
    return this.findAll();
  }

  /**
   * Find all documents
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data', defaultLimit: CUSTOM_LIMIT }))
  @Get('/data-limit')
  public async findAllWithLimit(): Promise<Pageable<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];

    for (let i: number = 0; i < CUSTOM_LIMIT; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalDocs: 1015, resource: data };
  }

  /**
   * Test the pagination decorator
   */
  @Get('/pagination')
  public async testPagination(@MongoPaginationParamDecorator({}) pagination: MongoPagination): Promise<{}> {
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

export function getParamDecoratorFactory(decorator: Function): CustomParamFactory {
  /**
   * Test class
   */
  // tslint:disable-next-line:max-classes-per-file
  class TestClass {
    /**
     * Test method
     */
    public test(@decorator() _value: {}): void {
      return;
    }
  }

  // tslint:disable-next-line:completed-docs
  const metadata: { [key: string]: { factory: CustomParamFactory } } = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestClass,
    'test',
  );

  return metadata[Object.keys(metadata)[0]].factory;
}
