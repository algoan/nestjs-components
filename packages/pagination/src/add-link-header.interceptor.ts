import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as contentRange from 'content-range';
import { Request, Response as ExpressResponse } from 'express';
import * as formatLinkHeader from 'format-link-header';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response extends from Express
 */
export interface Response<T> extends ExpressResponse {
  data: Data<T>;
}

/**
 * Data interface
 */
interface Data<T> {
  resource: T[];
  totalDocs: number;
}

type Relation = 'first' | 'next' | 'prev' | 'last';
/**
 * Argument required to build the Link header
 */
interface LinkOptions {
  page: string;
  limit: string;
  resourceUrl: string;
  totalDocs: number;
}
/**
 * Interceptor adding a Link Header
 * RFC 5988 (https://tools.ietf.org/html/rfc5988)
 */
@Injectable()
export class LinkHeaderInterceptor<T> implements NestInterceptor<T, T[]> {
  private readonly resource: string;
  private readonly pageName: string = 'page';
  private readonly perPageName: string = 'per_page';

  constructor({
    resource,
    pageName = 'page',
    perPageName = 'per_page',
  }: {
    resource: string;
    pageName?: string;
    perPageName?: string;
  }) {
    this.resource = resource;
    this.pageName = pageName;
    this.perPageName = perPageName;
  }

  /**
   * Interceptor core method
   * @param context Current request pipeline details
   * @param next Response stream
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<T[]> {
    const request: Request = context.switchToHttp().getRequest();

    const resourceUrl: string = request.url.split('?')[0];
    const page: string = request.query[this.pageName] ?? '1';
    const limit: string = request.query[this.perPageName] ?? '100';

    return next.handle().pipe(
      map((data: Data<T>) => {
        const response: Response<T> = context.switchToHttp().getResponse();

        /**
         * Set Link Header
         */
        const linkHeader: string = this.setLinkHeader({
          page,
          limit,
          resourceUrl,
          totalDocs: data.totalDocs,
        });

        response.setHeader('Link', linkHeader);

        /**
         * Set Content-Range header
         */
        response.setHeader(
          'Content-Range',
          this.buildContentRangeHeader({
            page,
            limit,
            resourceUrl,
            totalDocs: data.totalDocs,
          }),
        );

        return data.resource;
      }),
    );
  }

  /**
   * Set a link header
   * @param linkOptions Required argument to build the header
   */
  private readonly setLinkHeader = (linkOptions: LinkOptions): string => {
    const page: number = Number(linkOptions.page);
    const hasNextPage: boolean = page <= Math.floor(linkOptions.totalDocs / Number(linkOptions.limit));
    const isFirstPage: boolean = page === 1;

    const linkObject: formatLinkHeader.Links = {
      first: this.buildLink('first', linkOptions),
      last: this.buildLink('last', linkOptions),
    };

    if (hasNextPage) {
      linkObject.next = this.buildLink('next', linkOptions);
    }

    if (!isFirstPage) {
      linkObject.prev = this.buildLink('prev', linkOptions);
    }

    return formatLinkHeader(linkObject);
  };

  /**
   * Build a link object
   * @param rel Relation
   * @param linkOptions Link optioins
   */
  private readonly buildLink = (rel: Relation, linkOptions: LinkOptions): formatLinkHeader.Link => {
    const page: number = Number(linkOptions.page);
    const link: formatLinkHeader.Link = {
      url: linkOptions.resourceUrl,
      rel,
      per_page: linkOptions.limit,
      page: linkOptions.page,
    };

    switch (rel) {
      case 'first':
        link.page = '1';
        link.url += `?${this.pageName}=1`;
        break;

      case 'prev':
        link.page = (page - 1).toString();
        link.url += `?${this.pageName}=${page - 1}`;
        break;

      case 'last':
        link.url += `?${this.pageName}=${Math.floor(linkOptions.totalDocs / Number(linkOptions.limit)) + 1}`;
        break;

      // Next relation
      default:
        link.page = (page + 1).toString();
        link.url += `?${this.pageName}=${page + 1}`;
        break;
    }

    link.url += `&${this.perPageName}=${linkOptions.limit}`;

    return link;
  };

  /**
   * Build the content-range header
   * @param linkOptions Link Options
   */
  private buildContentRangeHeader(linkOptions: LinkOptions): string {
    const limit: number = Number(linkOptions.limit);
    let endIndex: number = Number(linkOptions.page) * limit;
    const startIndex: number = endIndex - limit;

    if (endIndex > linkOptions.totalDocs) {
      endIndex = linkOptions.totalDocs + 1;
    }

    return contentRange.format({
      first: startIndex,
      last: endIndex - 1,
      length: linkOptions.totalDocs,
      unit: this.resource,
    });
  }
}
