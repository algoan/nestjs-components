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
      limit: 200,
      skip: 0,
      sort: {},
      project: {},
    });
  });

  it('MPPD02 - should successfully handle another page', () => {
    req = { query: { page: '2', per_page: '20' } };

    const result: MongoPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: {},
      limit: 20,
      skip: 20,
      sort: {},
      project: {},
    });
  });

  it('MPPD03 - should successfully parse filters', () => {
    req = {
      query: {
        page: '1',
        per_page: '20',
        filter: '{"key": "value"}',
        sort: '{"key": 1, "value": -1}',
        project: '{"key": 1, "value": 1}',
      },
    };

    const result: MongoPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 20,
      skip: 0,
      sort: { key: 1, value: -1 },
      project: { key: 1, value: 1 },
    });
  });

  it('MPPD04 - should throw bad request exception on parse error', () => {
    req = { query: { filter: '{invalidJson}' } };

    expect(() => getMongoQuery({}, ctx as ExecutionContext)).to.throw(BadRequestException);
  });

  it('MPPD05 - should handle custom query params name', () => {
    req = { query: { _page: '1', _per_page: '20', filter: '{"key": "value"}', sort: '{}' } };

    const result: MongoPagination = getMongoQuery(
      { pageName: '_page', perPageName: '_per_page' },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 20,
      skip: 0,
      sort: {},
      project: {},
    });
  });

  it('MPPD06 - should successfully parse filters (per_page: 0)', () => {
    req = { query: { page: '1', per_page: '0', filter: '{"key": "value"}', sort: '{}' } };

    const result: MongoPagination = getMongoQuery({}, ctx as ExecutionContext);

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 0,
      skip: 0,
      sort: {},
      project: {},
    });
  });

  it('MPPD07 - should successfully sanitize the keys', () => {
    req = {
      query: {
        page: '1',
        per_page: '0',
        filter:
          '{"key": "value", "mapreduce": "", "$expr": {"$function": { "body": "function () { return true; }", "args": [], "lang": "js" } } }',
        project: '{"$where": "function () { return true; }"}',
      },
    };

    const result: MongoPagination = getMongoQuery(
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

  it('MPPQD08 - should successfully return default value on empty query using the query parameter pagination', () => {
    req = { query: {} };

    const defaultLimit = 200;

    const result: MongoPagination = getMongoQuery(
      { pageName: 'page', perPageName: 'limit', defaultLimit: defaultLimit },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: {},
      limit: 200,
      skip: 0,
      sort: {},
      project: {},
    });
  });

  it('MPPQD09 - should successfully handle another page with the query parameter pagination', () => {
    req = { query: { page: '2', limit: '20' } };

    const defaultLimit = 200;

    const result: MongoPagination = getMongoQuery(
      { pageName: 'page', perPageName: 'limit', defaultLimit: defaultLimit },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: {},
      limit: 20,
      skip: 20,
      sort: {},
      project: {},
    });
  });

  it('MPPQD10 - should successfully parse filters with the query parameter pagination', () => {
    req = {
      query: {
        page: '1',
        limit: '20',
        filter: '{"key": "value"}',
        sort: '{"key": 1, "value": -1}',
        project: '{"key": 1, "value": 1}',
      },
    };

    const defaultLimit = 200;

    const result: MongoPagination = getMongoQuery(
      { pageName: 'page', perPageName: 'limit', defaultLimit: defaultLimit },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 20,
      skip: 0,
      sort: { key: 1, value: -1 },
      project: { key: 1, value: 1 },
    });
  });

  it('MPPQD11 - should throw bad request exception on parse error with the query parameter pagination', () => {
    req = { query: { filter: '{invalidJson} ' } };

    const defaultLimit = 200;

    expect(() =>
      getMongoQuery({ pageName: 'page', perPageName: 'limit', defaultLimit: defaultLimit }, ctx as ExecutionContext),
    ).to.throw(BadRequestException);
  });

  it('MPPQD12 - should successfully parse filters (limit: 0) with the query parameter pagination', () => {
    req = { query: { page: '1', limit: '0', filter: '{"key": "value"}', sort: '{}' } };

    const defaultLimit = 200;

    const result: MongoPagination = getMongoQuery(
      { pageName: 'page', perPageName: 'limit', defaultLimit: defaultLimit },
      ctx as ExecutionContext,
    );

    expect(result).to.deep.equal({
      filter: { key: 'value' },
      limit: 0,
      skip: 0,
      sort: {},
      project: {},
    });
  });
});
