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
### Default usage
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

### Factory
You can also manually pass an interceptor instance through a factory function. This will give the possibility to set a `userPrefix` on the head of the default context message:

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
      useClass: () => {
        const interceptor: LoggingInterceptor = new LoggingInterceptor();
        interceptor.setUserPrefix('ExampleApp');

        return interceptor;
      },
    },
  ],
})
export class CoreModule {}
```

The context message will be preprend by the provided `userPrefix`:
```bash
[LoggingInterceptor - GET - /error] Incoming request - GET - /error
==>
[ExampleApp - LoggingInterceptor - GET - /error] Incoming request - GET - /error
```

## Log messages

This interceptor logs:
  - incoming request details

### Default Logger messages
```bash
# Incoming request details

# info level
[Nest] 27080   - 04/06/2020, 10:11:54 AM   [LoggingInterceptor - GET - /] Object:
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

# Info level
[Nest] 27080   - 04/06/2020, 10:11:54 AM   [LoggingInterceptor - 200 - GET - /] Object:
{
  "message": "LoggingInterceptor - 200 - GET - /",
  "body": "Hello World!"
}

# Warning example

# warn level
[Nest] 27080   - 04/06/2020, 10:12:44 AM   [LoggingInterceptor - 400 - GET - /badrequest] Object:
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
[Nest] 27080   - 04/06/2020, 10:12:17 AM   [LoggingInterceptor - 500 - GET - /error] Object:
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

### Use a custom Logger

#### Nest-pino

In this example, we are going to override the default Logger implementation with a Pino logger (refer to the [this official NestJS documentation](https://docs.nestjs.com/techniques/logger#using-the-logger-for-application-logging))

```typescript
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module'; // the module importing the @algoan/nestjs-logging-interceptor
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [LoggerModule.forRoot(), CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Then in the application bootstrap, set the [Pino logger](https://github.com/iamolegga/nestjs-pino) as the one to substitute to the default Logger.

```typescript
import { NestFactory} from '@nestjs/core';
import { Logger } from "nestjs-pino";
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule,{
    logger: false
  });

  app.useLogger(app.get(Logger))
  await app.listen(3000);
}
bootstrap();
```

The Pino logger will be set as the Logger implementation to use.

```bash
# With default Logger
[Nest] 84392   - 04/03/2020, 2:02:04 PM   [RoutesResolver] AppController {}: +7ms
[Nest] 84392   - 04/03/2020, 2:02:04 PM   [RouterExplorer] Mapped {, GET} route +3ms
[Nest] 84392   - 04/03/2020, 2:02:04 PM   [RouterExplorer] Mapped {/badrequest, GET} route +0ms
[Nest] 84392   - 04/03/2020, 2:02:04 PM   [RouterExplorer] Mapped {/error, GET} route +0ms
[Nest] 84392   - 04/03/2020, 2:02:04 PM   [NestApplication] Nest application successfully started +3ms

# With Pino Logger
{"level":30,"time":1585915251917,"pid":83826,"hostname":"computername.local","context":"RoutesResolver","msg":"AppController {}: true","v":1}
{"level":30,"time":1585915251919,"pid":83826,"hostname":"computername.local","context":"RouterExplorer","msg":"Mapped {, GET} route true","v":1}
{"level":30,"time":1585915251919,"pid":83826,"hostname":"computername.local","context":"RouterExplorer","msg":"Mapped {/badrequest, GET} route true","v":1}
{"level":30,"time":1585915251919,"pid":83826,"hostname":"computername.local","context":"RouterExplorer","msg":"Mapped {/error, GET} route true","v":1}
{"level":30,"time":1585915251921,"pid":83826,"hostname":"computername.local","context":"NestApplication","msg":"Nest application successfully started true","v":1}
```
