import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// tslint:disable-next-line
import { map } from 'rxjs/operators';
// tslint:disable-next-line
import { Observable } from 'rxjs';
// tslint:disable-next-line
import { Request } from 'express';

const firstPage: number = 1;
const defaultLimit: number = 200;

/* tslint:disable no-null-keyword */

/**
 * PaginationInterceptor
 */
@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<DataToPaginate<T>, PaginatedData<T>> {
  /**
   * Interceptor core method
   * @param context Current request pipeline details
   * @param next Response stream
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<PaginatedData<T>> {
    const req: Request = context.switchToHttp().getRequest();
    const path: string = req.path;
    const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : firstPage;
    const limit: number =
      !isNaN(Number(req.query.limit)) && Number(req.query.limit) !== 0 ? Number(req.query.limit) : defaultLimit;
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
          data.totalResources > 0 ? this.buildUrl(path, firstPage, limit, filter, sort, project) : null;
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
  public buildUrl = (
    path: string,
    page: number,
    limit: number,
    filter?: unknown,
    sort?: unknown,
    project?: unknown,
  ): string => {
    // tslint:disable-next-line
    let url = `${path}?page=${page}&limit=${limit}`;

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
 * Data
 */
export interface DataToPaginate<T> {
  resources: T[];
  totalResources: number;
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
