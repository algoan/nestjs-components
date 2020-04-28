# `google-pubsub-client`

The client extends the ClientProxy class and  have to override the emit method using @algoan/pubsub.

⚠️ **This Client only overrides the [abstract `dispatchEvent` method](https://github.com/nestjs/nest/blob/master/packages/microservices/client/client-proxy.ts#L80). Therefore, only the `client#emit` method can be called.**

## Installation

```bash
npm install --save @algoan/pubsub @algoan/nestjs-google-pubsub-client
```

## Usage

To instantiate the GCPubSubClient:


**Module**:

```ts
// app.module.ts
import { Module } from '@nestjs/common';

import { GCPubSubClient } from '../../src';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * App module
 */
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'PUBSUB_CLIENT',
      useFactory: () => {
        // Use a factory to add you custom options
        return new GCPubSubClient({});
      },
    },
  ],
})
export class AppModule {}

```

**Service**:

```typescript
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

/**
 * Fake app service
 */
export class AppService implements OnModuleInit {
  constructor(@Inject('PUBSUB_CLIENT') private readonly client: ClientProxy) {}

  /**
   * Connect the client proxy on module init
   * NOTE: this is optional with GooglePubSubClient. It is called anyway in the emit method
   * See https://github.com/nestjs/nest/blob/master/packages/microservices/client/client-proxy.ts#L67
   */
  public async onModuleInit(): Promise<void> {
    await this.client.connect();
  }
  /**
   * Emit a test event
   * @param data Payload sent
   */
  public emitTestEvent(data: { hello: string }): void {
    this.client.emit('test_event', data);
  }
}
```

### `new GCPubSubClient(options)`

Initiate a new Google Cloud PubSub Client proxy.

- `options`: Options related to the GC PubSub instance. More details on options [here](https://github.com/algoan/pubsub#pubsubfactorycreate-transport-options-)
