import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { expect } from 'chai';
import { getMongoQuery } from '../src';
import { MongoPagination } from '../src/mongo-pagination-param.decorator';

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

  it('MPPD01 - should successfully return default value on empty query', () => {
    req = { query: {} };

    const result: MongoPagination = getMongoQuery(undefined, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: {},
      limit: 10,
      skip: 0,
      sort: [],
      project: [],
    });
  });

  it('MPPD02 - should successfully handle another page', () => {
    req = { query: { page: '2', per_page: '20' } };

    const result: MongoPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: {},
      limit: 20,
      skip: 20,
      sort: [],
      project: [],
    });
  });

  it('MPPD03 - should successfully parse filters', () => {
    req = { query: { page: '1', per_page: '20', filter: '{"key": "value"}', sort: '[]' } };

    const result: MongoPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 20,
      skip: 0,
      sort: [],
      project: [],
    });
  });

  it('MPPD04 - should throw bad request exception on parse error', () => {
    req = { query: { filter: '{invalidJson}' } };

    expect(() => getMongoQuery({}, ctx as ExecutionContext)).to.throw(BadRequestException);
  });

  it('MPPD05 - should handle custom query params name', () => {
    req = { query: { _page: '1', _per_page: '20', filter: '{"key": "value"}', sort: '[]' } };

    const result: MongoPagination = getMongoQuery(
      { pageName: '_page', perPageName: '_per_page' },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 20,
      skip: 0,
      sort: [],
      project: [],
    });
  });

  it('MPPD06 - should successfully parse filters (per_page: 0)', () => {
    req = { query: { page: '1', per_page: '0', filter: '{"key": "value"}', sort: '[]' } };

    const result: MongoPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 0,
      skip: 0,
      sort: [],
      project: [],
    });
  });
});
