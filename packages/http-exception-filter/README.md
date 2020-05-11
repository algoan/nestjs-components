<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> http exception filter.
</p>

# NestJS Http Exception Filter

A simple NestJS Http [Exception Filter](https://docs.nestjs.com/exception-filters) logging the HTTP response and formatting errors returned by the API.

## Installation

```bash
npm install --save @algoan/nestjs-http-exception-filter
```

## Usage
### Default usage
Use the http exception filter as a global filter (cf. refer to the [last paragraph](https://docs.nestjs.com/exception-filters#binding-filters) of this section for more details).

Example:

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@algoan/nestjs-http-exception-filter';

/**
 * Core module: This module sets the http exception filter globally
 */
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class CoreModule {}
```

Example 2:

```typescript
import { NestFactory} from '@nestjs/core';
import {HttpExceptionFilter} from '@algoan/nestjs-http-exception-filter';
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule,{
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
  console.log(`App listening on port 3000`)
}
bootstrap();
```

### Default response body

```typescript
{
  "code": string,
  "message": string,
  "status": number
}

// Examples
// 400
{
  "code": "BAD_REQUEST",
  "message": "Bad Request",
  "status": 400
}
// 500
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal Server Error",
  "status": 500
}
// 413
{
  code: 'PAYLOAD_TOO_LARGE',
  message: `
    Your request entity size is too big for the server to process it:
      - request size: 590001;
      - request limit: 102400.`,
  status: 413,
}
```

### Default Logger messages
```bash
# Warning
[Nest] 96665   - 04/14/2020, 6:35:27 PM   [HttpExceptionFilter] Object:
{
  "message": "400 [GET /badrequest] has thrown an HTTP client error",
  "exceptionStack": "stackTrace",
  "headers": {
    "host": "localhost:3000",
    "user-agent": "insomnia/7.1.1",
    "accept": "*/*"
  }
}

# Error
[Nest] 96665   - 04/14/2020, 6:34:33 PM   [HttpExceptionFilter] Object:
{
  "message": "500 [GET /error] has thrown a critical error",
  "headers": {
    "host": "localhost:3000",
    "user-agent": "insomnia/7.1.1",
    "accept": "*/*"
  },
  "exceptionStack": "stackTrace",
}
```
 