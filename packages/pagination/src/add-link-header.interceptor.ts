import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as contentRange from 'content-range';
import { Request, Response as ExpressResponse } from 'express';
import * as formatLinkHeader from 'format-link-header';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataToPaginate } from './interfaces';

const DEFAULT_LIMIT: number = 100;

/**
 * Response extends from Express
 */
export interface Response<T> extends ExpressResponse {
  data: DataToPaginate<T>;
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
 * Configuration options
 */
interface LinkHeaderInterceptorOptions {
  resource: string;
  pageName?: string;
  perPageName?: string;
  defaultLimit?: number;
}

/**
 * Interceptor adding a Link Header
 * RFC 5988 (https://tools.ietf.org/html/rfc5988)
 */
@Injectable()
export class LinkHeaderInterceptor<T> implements NestInterceptor<T, T[]> {
  private readonly resource: string;
  private readonly pageName: string;
  private readonly perPageName: string;
  private readonly defaultLimit: string;

  constructor(options: LinkHeaderInterceptorOptions) {
    const { resource, defaultLimit = DEFAULT_LIMIT, pageName = 'page', perPageName = 'per_page' } = options;

    this.resource = resource;
    this.pageName = pageName;
    this.perPageName = perPageName;
    this.defaultLimit = `${defaultLimit}`;
  }

  /**
   * Interceptor core method
   * @param context Current request pipeline details
   * @param next Response stream
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<T[]> {
    const request: Request = context.switchToHttp().getRequest();

    const resourceUrl: string = request.url.split('?')[0];
    const page: string = (request.query[this.pageName] as string) ?? '1';
    const limit: string = (request.query[this.perPageName] as string) ?? this.defaultLimit;

    return next.handle().pipe(
      map((data: DataToPaginate<T>): T[] => {
        const response: Response<T> = context.switchToHttp().getResponse();

        /**
         * Set Link Header
         */
        const linkHeader: string = this.setLinkHeader({
          page,
          limit,
          resourceUrl,
          totalDocs: data.totalResources,
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
            totalDocs: data.totalResources,
          }),
        );

        return data.resources;
      }),
    );
  }

  /**
   * Set a link header
   * @param linkOptions Required argument to build the header
   */
  private readonly setLinkHeader = (linkOptions: LinkOptions): string => {
    const page: number = Number(linkOptions.page);
    const hasNextPage: boolean = page < Math.ceil(linkOptions.totalDocs / Number(linkOptions.limit));
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
        break;

      case 'prev':
        link.page = (page - 1).toString();
        break;

      case 'last':
        link.page = `${Math.ceil(linkOptions.totalDocs / Number(linkOptions.limit))}`;
        link.page = link.page === '0' ? '1' : link.page;
        break;

      // Next relation
      default:
        link.page = (page + 1).toString();
        break;
    }

    link.url += `?${this.pageName}=${link.page}&${this.perPageName}=${linkOptions.limit}`;

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

    /**
     * If there is no document, return a "{resource} 0-0/0"
     * NOTE: Otherwise the contentRange lib is returning "{resource} 0-NaN/0"
     */
    if (linkOptions.totalDocs === 1) {
      return `${this.resource} 0-0/1`;
    }

    if (endIndex > linkOptions.totalDocs) {
      endIndex = linkOptions.totalDocs;
    }

    return contentRange.format({
      first: startIndex,
      last: endIndex - 1,
      length: linkOptions.totalDocs,
      limit,
      unit: this.resource,
    });
  }
}
