import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const FIRST_PAGE: number = 1;
const DEFAULT_NUMBER_OF_RESULTS: number = 200;

/**
 * Mongo query
 */
export interface MongoPagination {
  filter: Record<string, unknown>;
  limit: number;
  skip: number;
  sort?: {
    [key: string]: SortValue;
  };
  project?: {
    [key: string]: 0 | 1;
  };
}

/**
 * Sort values available for Mongoose
 * Ref: https://mongoosejs.com/docs/api/query.html#query_Query-sort
 */
type SortValue = 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1;

/**
 * Configuration Options
 */
interface MongoPaginationOptions {
  pageName?: string;
  perPageName?: string;
  defaultLimit?: number;
  excludedKeys?: string[];
}

export const getMongoQuery = (options: MongoPaginationOptions = {}, ctx: ExecutionContext): MongoPagination => {
  const req: Request = ctx.switchToHttp().getRequest();

  const {
    pageName = 'page',
    perPageName = 'per_page',
    defaultLimit = DEFAULT_NUMBER_OF_RESULTS,
    excludedKeys = ['$where', 'mapreduce', '$accumulator', '$function'],
  } = options;

  const page: number = !isNaN(Number(req.query[pageName])) ? Number(req.query[pageName]) : FIRST_PAGE;
  const limit: number = !isNaN(Number(req.query[perPageName])) ? Number(req.query[perPageName]) : defaultLimit;
  let filter: MongoPagination['filter'];
  let sort: MongoPagination['sort'];
  let project: MongoPagination['project'];
  let excludePattern: string = '';

  if (limit <= 0) {
    throw new BadRequestException(`${perPageName} should be a strictly positive number, got: ${limit}`);
  }

  try {
    filter = req.query.filter !== undefined ? JSON.parse(req.query.filter as string) : {};
    sort = req.query.sort !== undefined ? JSON.parse(req.query.sort as string) : {};
    project = req.query.project !== undefined ? JSON.parse(req.query.project as string) : {};
  } catch (exception) {
    throw new BadRequestException('Either the sort, filter or project parameter cannot be parsed');
  }

  if (Array.isArray(excludedKeys)) {
    const excludeStrings: string[] = excludedKeys.filter((elem: unknown): boolean => typeof elem === 'string');

    if (excludeStrings.length > 0) {
      excludePattern = buildExcludePattern(excludeStrings);
    }
  }

  if (excludePattern) {
    const excludeRegex: RegExp = new RegExp(excludePattern);

    filter = sanitize(filter, excludeRegex);
    sort = sanitize(sort, excludeRegex);
    project = sanitize(project, excludeRegex);
  }

  return {
    filter,
    limit,
    skip: (page - 1) * limit,
    sort,
    project,
  };
};

/**
 * Traverse the list of excluding keywords to build a regex pattern,
 * e.g. ^(\$where|mapreduce|\$function)$
 */
const buildExcludePattern = (excludeArray: string[]): string =>
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

const sanitize = <T>(value: T, excludeRegex: RegExp): T => {
  // Recursively traverse the keys to detect and remove the matching ones
  if (value instanceof Object) {
    for (const key in value) {
      if (excludeRegex.test(key)) {
        // eslint-disable-next-line
        delete (value as any)[key];
      } else {
        // eslint-disable-next-line
        sanitize((value as any)[key], excludeRegex);
      }
    }
  }

  return value;
};

export const MongoPaginationParamDecorator = createParamDecorator(getMongoQuery);
