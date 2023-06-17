<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> Google PubSub Microservice.
</p>

# NestJS Google Cloud PubSub Micro-service

A custom [NestJS Microservice](https://docs.nestjs.com/microservices/basics) transport strategy using [Google Cloud PubSub](https://cloud.google.com/pubsub/docs).

## Installation

```bash
npm install --save @algoan/pubsub @algoan/nestjs-google-pubsub-microservice
```

## Usage

To start a new Google Cloud PubSub server:

**Server setup**:

```typescript
// main.ts
import { GooglePubSubOptions } from '@algoan/pubsub';
import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GCPubSubServer } from '@algoan/nestjs-google-pubsub-microservice';
import { AppModule } from './app.module';

async function bootstrap() {
  const options: GooglePubSubOptions = {
    projectId: 'test',
    subscriptionsPrefix: 'test-app',
  }

  const app: INestMicroservice = await NestFactory.createMicroservice(AppModule, {
    strategy: new GCPubSubServer(options)
  })

  await app.listen();

  console.log('Server running!')
}
bootstrap()
```

**Controller**:

```typescript
import { EmittedMessage } from '@algoan/pubsub';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Handle the test event
   * @param data Payload sent
   */
  @EventPattern('test_event')
  public async handleTestEvent(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    /**
     * Handle data emitted by Google PubSub
     */
    this.appService.handleTestEvent(data);
  }
}
```

### EventPattern extras

You can add [`ListenOptions`](https://github.com/algoan/pubsub#pubsublistenevent-opts) to the subscription by adding `extras` to the `EventPattern` decorator. For example, if you want a different topic name:

```typescript
/**
  * Handle the test event
  * @param data Payload sent
  */
@EventPattern('test_event', { topicName: 'different_topic' })
public async handleTestEvent(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
  /**
    * Handle data emitted by Google PubSub
    */
  this.appService.handleTestEvent(data);
}
```

When the application will start and look for event patterns, it will get or create the `different_topic` topic from Google Cloud.

## API

This module uses [@algoan/pubsub](https://github.com/algoan/pubsub) library which by default automatically acknowledges emitted messages.

### `GCPubSubServer(options)`

Create a new Server instance of Google PubSub. It retrieves all message handlers patterns and creates [subscriptions](https://cloud.google.com/pubsub/docs/pull).

- `options`: Algoan PubSub options. More information [here](https://github.com/algoan/pubsub/#pubsubfactorycreate-transport-options-).
- `options.listenOptions`: Global options which will be applied to all subscriptions.
- `options.topicsNames`: Only subscribe to topics included in this whitelist.

## Other NestJS Google Cloud PubSub server

Other modules implementing Google Cloud PubSub with NestJS microservices:

- [crallen/nestjs-google-pubsub](https://github.com/crallen/nestjs-google-pubsub)
- [ecobee/nodejs-gcloud-pubsub-module](https://github.com/ecobee/nodejs-gcloud-pubsub-module)
