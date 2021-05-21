import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const firstPage: number = 1;
const defaultLimit: number = 200;

/**
 * Mongo query interface
 */

export interface MongoQueryPagination {
  filter?: {
    // tslint:disable-next-line
    [key: string]: any;
  };
  limit: number;
  skip: number;
  sort?: {
    [key: string]: SortValue;
  };
  project?: {
    [key: string]: 0 | 1;
  };
}

// eslint-disable-next-line
type SortValue = 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1;

export const getMongoQuery = (_data: unknown, ctx: ExecutionContext): MongoQueryPagination => {
  const req: Request = ctx.switchToHttp().getRequest();

  // tslint:disable-next-line
  const excludedKeys = ['$where', 'mapreduce', '$accumulator', '$function'];

  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : firstPage;
  const limit: number = !isNaN(Number(req.query.limit)) ? Number(req.query.limit) : defaultLimit;

  // eslint-disable-next-line
  let filter: {};
  // eslint-disable-next-line
  let sort: {};
  // eslint-disable-next-line
  let project: {};
  let excludedPattern: string = '';

  try {
    // eslint-disable-next-line
    filter = req.query.filter !== undefined ? JSON.parse(req.query.filter as string) : {};
    // eslint-disable-next-line
    sort = req.query.sort !== undefined ? JSON.parse(req.query.sort as string) : {};
    // eslint-disable-next-line
    project = req.query.project !== undefined ? JSON.parse(req.query.project as string) : {};
  } catch (exception) {
    throw new BadRequestException('Either the sort, filter or project parameter cannot be parsed');
  }

  if (Array.isArray(excludedKeys)) {
    const excludeStrings: string[] = excludedKeys.filter((elem: unknown): boolean => typeof elem === 'string');

    if (excludeStrings.length > 0) {
      excludedPattern = buildExcludePattern(excludeStrings);
    }
  }

  if (excludedPattern) {
    const excludeRegex: RegExp = new RegExp(excludedPattern);

    // eslint-disable-next-line
    filter = sanitize(filter, excludeRegex) as object;
    // eslint-disable-next-line
    sort = sanitize(sort, excludeRegex) as object;
    // eslint-disable-next-line
    project = sanitize(project, excludeRegex) as object;
  }

  return {
    filter,
    limit,
    skip: (page - 1) * limit,
    sort,
    project,
  };
};

const buildExcludePattern = (excludeArray: string[]): string =>
  /**
   * Traverse the list of excluding keywords to build a regex pattern, e.g.
   * ^(\$where|mapreduce|\$function)$
   */
  excludeArray
    .reduce((previousValue: string, currentValue: string, currentIndex: number): string => {
      let accumulator: string = previousValue;

      if (currentIndex > 0) {
        accumulator += '|';
      }

      if (currentValue && currentValue.charAt(0) === '$') {
        accumulator += '\\';
      }

      return accumulator + currentValue;
    }, '^(')
    .concat(')$');

const sanitize = (value: unknown, excludeRegex: RegExp): unknown => {
  /**
   * Recursively traverse the keys to detect and remove the matching ones
   */
  if (value instanceof Object) {
    for (const key in value) {
      if (excludeRegex.test(key)) {
        // tslint:disable-next-line
        delete (value as any)[key];
      } else {
        // tslint:disable-next-line
        sanitize((value as any)[key], excludeRegex);
      }
    }
  }

  return value;
};

// tslint:disable-next-line
export const PaginationMongoQueryParamDecorator = createParamDecorator(getMongoQuery);
