# `google-pubsub-client`

> TODO: description
The client extends the ClientProxy class and  have to override the emit method using @algoan/pubsub

## Installation

```bash
npm install --save @algoan/pubsub @algoan/nestjs-google-pubsub-client
```
## Usage

To instantiate the GCPubSubClient
```ts
import { GCPubSubClient } from '@algoan/nestjs-google-pubsub-client';

const options: GooglePubSubOptions = {
    projectId: 'test',
    subscriptionsPrefix: 'test-app',
}

this.client = new GCPubSubClient(options);
```

To use the GCPubSubClient
```ts
this.client.emit('topic_name', data);
```
