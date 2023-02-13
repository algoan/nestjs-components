import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataToPaginate } from './interfaces';

const FIRST_PAGE: number = 1;
const DEFAULT_LIMIT: number = 200;
const PAGE_NAME: string = 'page';
const PER_PAGE_NAME: string = 'per_page';

/* tslint:disable no-null-keyword */

/**
 * Configuration options
 */
interface PaginationBodyInterceptorOptions {
  pageName?: string;
  perPageName?: string;
  defaultLimit?: number;
}

/**
 * PaginationInterceptor
 */
@Injectable()
export class PaginationBodyInterceptor<T> implements NestInterceptor<DataToPaginate<T>, PaginatedData<T>> {
  private readonly pageName: string;
  private readonly perPageName: string;
  private readonly defaultLimit: number;

  constructor(options: PaginationBodyInterceptorOptions) {
    const { defaultLimit = DEFAULT_LIMIT, pageName = PAGE_NAME, perPageName = PER_PAGE_NAME } = options;

    this.pageName = pageName;
    this.perPageName = perPageName;
    this.defaultLimit = defaultLimit;
  }

  /**
   * Interceptor core method
   * @param context Current request pipeline details
   * @param next Response stream
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<PaginatedData<T>> {
    const req: Request = context.switchToHttp().getRequest();
    const path: string = req.path;
    const page: number = !isNaN(Number(req.query[this.pageName])) ? Number(req.query[this.pageName]) : FIRST_PAGE;
    const limit: number =
      !isNaN(Number(req.query.limit)) && Number(req.query[this.perPageName]) !== 0
        ? Number(req.query[this.perPageName])
        : this.defaultLimit;
    const filter: unknown = req.query.filter;
    const sort: unknown = req.query.sort;
    const project: unknown = req.query.project;

    return next.handle().pipe(
      // tslint:disable-next-line
      map((data: DataToPaginate<T>) => {
        const totalPages: number = Math.ceil(data.totalResources / limit);
        const nextUri: string | null =
          page < totalPages ? this.buildUrl(path, page + 1, limit, filter, sort, project) : null;
        const previousUri: string | null =
          page > 1 && page <= totalPages ? this.buildUrl(path, page - 1, limit, filter, sort, project) : null;
        const firstUri: string | null =
          data.totalResources > 0 ? this.buildUrl(path, FIRST_PAGE, limit, filter, sort, project) : null;
        const lastUri: string | null =
          data.totalResources > 0 ? this.buildUrl(path, totalPages, limit, filter, sort, project) : null;

        return {
          resources: data.resources,
          pagination: {
            next: nextUri,
            previous: previousUri,
            first: firstUri,
            last: lastUri,
            totalPages,
            totalResources: data.totalResources,
          },
        };
      }),
    );
  }

  /**
   * Build url
   */
  private readonly buildUrl = (
    path: string,
    page: number,
    limit: number,
    filter?: unknown,
    sort?: unknown,
    project?: unknown,
  ): string => {
    // tslint:disable-next-line
    let url = `${path}?page=${page}&${this.perPageName}=${limit}`;

    if (filter !== undefined) {
      url += `&filter=${filter}`;
    }

    if (sort !== undefined) {
      url += `&sort=${sort}`;
    }

    if (project !== undefined) {
      url += `&project=${project}`;
    }

    return url;
  };
}

/**
 * Result
 */
interface PaginatedData<T> {
  resources: T[];
  pagination: {
    next: string | null;
    previous: string | null;
    first: string | null;
    last: string | null;
    totalPages: number | null;
    totalResources: number | null;
  };
}
