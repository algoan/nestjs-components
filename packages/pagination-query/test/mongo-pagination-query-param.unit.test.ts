import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { expect } from 'chai';
import { getMongoQuery } from '../src/mongo-pagination-query-param.decorator';
import { MongoQueryPagination } from '../src';

describe('Unit tests related to the MongoPagination ParamDecorator', () => {
  let req: {} = {};

  const ctx = {
    switchToHttp() {
      return {
        getRequest() {
          return req;
        },
      };
    },
  };

  it('MPPQD01 - should successfully return default value on empty query', () => {
    req = { query: {} };

    const result: MongoQueryPagination = getMongoQuery(undefined, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: {},
      limit: 200,
      skip: 0,
      sort: {},
      project: {},
    });
  });

  it('MPPQD02 - should successfully handle another page', () => {
    req = { query: { page: '2', limit: '20' } };
    const result: MongoQueryPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: {},
      limit: 20,
      skip: 20,
      sort: {},
      project: {},
    });
  });

  it('MPPQD03 - should successfully parse filters', () => {
    req = {
      query: {
        page: '1',
        limit: '20',
        filter: '{"key": "value"}',
        sort: '{"key": 1, "value": -1}',
        project: '{"key": 1, "value": 1}',
      },
    };

    const result: MongoQueryPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 20,
      skip: 0,
      sort: { key: 1, value: -1 },
      project: { key: 1, value: 1 },
    });
  });

  it('MPPQD04 - should throw bad request exception on parse error', () => {
    req = { query: { filter: '{invalidJson} ' } };

    expect(() => getMongoQuery({}, ctx as ExecutionContext)).to.throw(BadRequestException);
  });

  it('MPPQD05 - should successfully parse filters (limit: 0)', () => {
    req = { query: { page: '1', limit: '0', filter: '{"key": "value"}', sort: '{}' } };

    const result: MongoQueryPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 0,
      skip: 0,
      sort: {},
      project: {},
    });
  });

  it('MPPQD06 - should successfully sanitize the keys', () => {
    req = {
      query: {
        page: '1',
        limit: '0',
        filter:
          '{"key": "value", "mapreduce": "", "$expr": {"$function": { "body": "function () { return true; }", "args": [], "lang": "js" } } }',
        project: '{"$where": "function () { return true; }"}',
      },
    };

    const result: MongoQueryPagination = getMongoQuery(
      { excludedKeys: ['$where', 'mapreduce', '$function'] },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: { key: 'value', $expr: {} },
      limit: 0,
      skip: 0,
      sort: {},
      project: {},
    });
  });
});
