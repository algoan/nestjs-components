<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> interceptor to log the incoming/outgoing requests.
</p>

# NestJS Logging interceptor

A simple NestJS interceptor catching request details and logging it using the built-in [Logger](https://docs.nestjs.com/techniques/logger#logger) class. It will use the default Logger implementation unless you pass your own to your Nest application.

## Installation

```bash
npm install --save @algoan/nestjs-logging-interceptor
```

## Usage
Use the interceptor as a global interceptor (cf. refer to the [last paragraph](https://docs.nestjs.com/interceptors#binding-interceptors) of this section for more details).

Example:

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@algoan/nestjs-logging-interceptor';

/**
 * Core module: This module sets the logging interceptor as a global interceptor
 */
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class CoreModule {}
```

In the example above, the interceptor is provided by the CoreModule. It could be set on any module that your main module is using.

## Log messages

This interceptor logs:
  - incoming request details

Example:
```bash
# Incoming request details

# info level
[Nest] 41835   - 04/02/2020, 5:02:10 PM   [LoggingInterceptor] LoggingInterceptor - GET - /
# debug level
[Nest] 41835   - 04/02/2020, 5:02:10 PM   [LoggingInterceptor - GET - /] Object:
{
  "message": "LoggingInterceptor - GET - /",
  "method": "GET",
  "body": {},
  "headers": {
    "host": "localhost:3000",
    "user-agent": "insomnia/7.1.1",
    "authorization": "Bearer 1234",
    "accept": "*/*"
  }
}
```
  - outgoing request details (info + (debug | warn | error))

```bash
# Success example

# info level
[Nest] 41835   - 04/02/2020, 5:02:10 PM   [LoggingInterceptor] LoggingInterceptor - 200 - GET - /
# debug level
[Nest] 41835   - 04/02/2020, 5:02:10 PM   [LoggingInterceptor - 200 - GET - /] Object:
{
  "message": "LoggingInterceptor - 200 - GET - /",
  "body": "Hello World!"
}

# Warning example

# warn level
[Nest] 41835   - 04/02/2020, 5:07:44 PM   [LoggingInterceptor - 400 - GET - /badrequest] Object:
{
  "method": "GET",
  "url": "/badrequest",
  "error": {
    "response": {
      "statusCode": 400,
      "message": "Bad Request"
    },
    "status": 400,
    "message": "Bad Request"
  },
  "body": {},
  "message": "LoggingInterceptor - 400 - GET - /badrequest"
}

# Error example

# error level
[Nest] 41835   - 04/02/2020, 5:10:10 PM   [LoggingInterceptor - 500 - GET - /error] Object:
{
  "method": "GET",
  "url": "/error",
  "body": {},
  "message": "LoggingInterceptor - 500 - GET - /error"
}
 +2ms
Error: Internal Server Error
    at AppController.error (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/dist/app.controller.js:25:15)
    at /Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/@nestjs/core/router/router-execution-context.js:37:29
    at InterceptorsConsumer.transformDeffered (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/@nestjs/core/interceptors/interceptors-consumer.js:30:28)
    at /Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/@nestjs/core/interceptors/interceptors-consumer.js:14:48
    at Observable._subscribe (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/rxjs/internal/observable/defer.js:10:21)
    at Observable._trySubscribe (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/rxjs/internal/Observable.js:44:25)
    at Observable.subscribe (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/rxjs/internal/Observable.js:30:22)
    at Object.subscribeToResult (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/rxjs/internal/util/subscribeToResult.js:12:23)
    at MergeMapSubscriber._innerSub (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/rxjs/internal/operators/mergeMap.js:82:53)
    at MergeMapSubscriber._tryNext (/Users/philippediep/Documents/workspace/algoan/examples/example-manager/node_modules/rxjs/internal/operators/mergeMap.js:76:14)

```