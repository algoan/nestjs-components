import { Controller, Get, INestApplication, Module, UseInterceptors } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CustomParamFactory } from '@nestjs/common/interfaces/features/custom-route-param-factory.interface';
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
  @UseInterceptors(new LinkHeaderInterceptor('data'))
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
