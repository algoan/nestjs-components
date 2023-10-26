import { Controller, Get, INestApplication, Module, UseInterceptors } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CustomParamFactory } from '@nestjs/common/interfaces/features/custom-route-param-factory.interface';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DataToPaginate,
  LinkHeaderInterceptor,
  MongoPagination,
  MongoPaginationParamDecorator,
  PaginationBodyInterceptor,
} from '../src';

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
  public async findAll(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalResources: data.length, resources: data };
  }

  /**
   * Find no documents
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'resources' }))
  @Get('/resources')
  public async find(): Promise<DataToPaginate<FakeDataToReturn>> {
    return { totalResources: 0, resources: [] };
  }

  /**
   * Find 1 document
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data' }))
  @Get('/one-data')
  public async findOneDocument(): Promise<DataToPaginate<FakeDataToReturn>> {
    return { totalResources: 1, resources: [{ name: `doc_1`, index: 1, createdAt: new Date() }] };
  }

  /**
   * Find all documents
   */
  @UseInterceptors(
    new LinkHeaderInterceptor({ resource: 'data-custom-query', pageName: '_page', perPageName: 'numberPerPage' }),
  )
  @Get('/data-custom-query')
  public async findAllWithCustomQuery(): Promise<DataToPaginate<FakeDataToReturn>> {
    return this.findAll();
  }

  /**
   * Find all documents
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data', defaultLimit: CUSTOM_LIMIT }))
  @Get('/data-limit')
  public async findAllWithLimit(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];

    for (let i: number = 0; i < CUSTOM_LIMIT; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalResources: 1015, resources: data };
  }

  /**
   * Test the pagination decorator
   */
  @Get('/pagination')
  public async testPagination(@MongoPaginationParamDecorator({}) pagination: MongoPagination): Promise<{}> {
    return { pagination };
  }

  /**
   * Find all documents with the new query pagination
   */
  @UseInterceptors(new PaginationBodyInterceptor({ defaultLimit: 200, pageName: 'page', perPageName: 'limit' }))
  @Get('/resource')
  public async findAllWithQueryParam(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalResources: data.length, resources: data };
  }

  /**
   * Find all documents with the new query pagination and
   */
  @UseInterceptors(new PaginationBodyInterceptor({ pageName: 'other_name', perPageName: 'other_limit_name' }))
  @Get('/resource-custom-props')
  public async findAllCustomQueryParams(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalResources: data.length, resources: data };
  }

  /**
   * Find all documents with the new query pagination and
   */
  @UseInterceptors(new PaginationBodyInterceptor({}))
  @Get('/resource-default-props')
  public async findAllDefaultQueryParams(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];
    const maxDocuments: number = 1015;

    for (let i: number = 0; i < maxDocuments; i++) {
      data.push({ name: `doc_${i}`, index: i, createdAt: new Date() });
    }

    return { totalResources: data.length, resources: data };
  }

  /**
   * Find all documents with the new query pagination and
   */
  @UseInterceptors(new PaginationBodyInterceptor({}))
  @Get('/resource-null')
  public async findZeroResource(): Promise<DataToPaginate<FakeDataToReturn>> {
    const data: FakeDataToReturn[] = [];

    return { totalResources: data.length, resources: [] };
  }
}

/**
 * Fake app module
 */
/* eslint-disable */
@Module({
  controllers: [FakeAppController],
})
class AppModule {}
/* eslint-enable */

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

  class TestClass {
    /**
     * Test method
     */
    public test(@decorator() _value: {}): void {
      return;
    }
  }

  const metadata: { [key: string]: { factory: CustomParamFactory } } = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestClass,
    'test',
  );

  return metadata[Object.keys(metadata)[0]].factory;
}
