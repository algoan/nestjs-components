<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> interceptor to display the <a href="https://tools.ietf.org/html/rfc5988">Link</a> and the <a href="https://tools.ietf.org/html/rfc7233#section-4.2"> Content Range </a> in the response headers.
</p>

# NestJS Request Pagination

A simple NestJS interceptor catching query parameters and format a Link Header, based on [GitHub](https://developer.github.com/v3/guides/traversing-with-pagination/) pagination API.
This module uses [format-link-header](https://github.com/jonathansamines/format-link-header) node module to build the response Link Header.

## Installation

```bash
npm install --save @algoan/nestjs-pagination
```

## Requirements

- On this version, the API attached with this interceptor needs to return an object:

```json
{
  "totalDocs": 1530,
  "resource": [ { ... }, ..., { ... }]
}
```

- The resource has to be specified in the interceptor constructor

## Limits

- This module does not take into account what is returned in the `resource` property. It may be inconsistent with headers set by the interceptor.

## Quick Start

Import `LinkHeaderInterceptor` next to a controller method.

```typescript
import { LinkHeaderInterceptor } from '@algoan/nestjs-pagination';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@Controller()
/**
 * Controller returning a lot of documents
 */
class AppController {
  /**
   * Find all documents
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data' }))
  @Get('/data')
  public async findAll(): Promise<{ totalDocs: number; resource: DataToReturn[] }> {
    const data: DataToReturn = await model.find(...);
    const count: number = await model.count();

    return { totalDocs: count, resource: data };
  }
}
```

For instance, if you have 1015 resources, calling `GET /data?page=4&per_page=100` will return:

```
Content-Range: data 300-399/1015
Link: </data?page=1&per_page=100>; rel="first", </data?page=11&per_page=100>; rel="last", </data?page=5&per_page=100>; rel="next", </data?page=3&per_page=100>; rel="prev"
```

If you use MongoDB as your database, we also provide a `ParamDecorator` you can use to convert the request to a mongo query parameter.
```typescript
import { LinkHeaderInterceptor, MongoPaginationParamDecorator, MongoPagination, Pageable } from '@algoan/nestjs-pagination';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@Controller()
/**
 * Controller returning a lot of documents
 */
class AppController {
  /**
   * Find all documents
   */
  @UseInterceptors(new LinkHeaderInterceptor({ resource: 'data' }))
  @Get('/data')
  public async findAll(@MongoPaginationParamDecorator() pagination: MongoPagination ): Promise<Pageable<DataToReturn>> {
    const data: DataToReturn[] = await model.find(pagination);
    const count: number = await model.count(pagination.filter);

    return { totalDocs: count, resource: data };
  }
}
```

## Usage

By default, the interceptor and the decorator will look for the query parameters `page` and  `per_page` (which is 100 by default).
You can also change the name of those parameters and the default per page limit if you want, by passing a configuration object. Beware that if you use both the interceptor and the decorator, you need to pass the configuration to both of them.

```typescript
new LinkHeaderInterceptor({ resource: 'data', pageName: '_page', perPageName: 'numberPerPage', defaultLimit: 50 })

@MongoPaginationParamDecorator({ pageName: '_page', perPageName: 'numberPerPage', defaultLimit: 50  })
```

You can also use the pagination in body interceptor by passing the configuration object

```typescript
new LinkHeaderInterceptor({pageName: 'page', perPageName: 'limit'})

@MongoPaginationParamDecorator({pageName: 'page', perPageName: 'limit'})
```
