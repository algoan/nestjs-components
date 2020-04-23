const Emulator = require('google-pubsub-emulator');
import { GCPubSubClient } from '../src';
import { PubSub, Subscription } from '@google-cloud/pubsub';

describe.only('GooglePubSubServer', () => {
  const projectId: string = 'algoan-test';
  const topicName: string = 'test-topic';
  const subscriptionName: string = 'test-subs';
  const data: { foo: string } = { foo: 'bar' };
  let emulator: any;

  beforeAll(async () => {
    /**
     * Start a new Google PubSub simulator
     */

    emulator = new Emulator({
      projectId,
      port: 4000,
    });
    await emulator.start();
  });

  afterAll(async () => {
    /**
     * Close the fake server and the simulator
     */
    await emulator.stop();
  });

  it('GCPSC01 - should properly emit an event', async (done: jest.DoneCallback) => {
    /**
     * Create a pubsub client
     */
    const pubsub: PubSub = new PubSub({ projectId });

    /**
     * Subscribe to the topic
     */
    await pubsub.createTopic(topicName);
    await pubsub.topic(topicName).createSubscription(subscriptionName);
    const subscription: Subscription = pubsub.subscription(subscriptionName);

    subscription.on('message', (message) => {
      expect(message.data.toString()).toEqual(JSON.stringify(data));
      done();
    });

    const client: GCPubSubClient = new GCPubSubClient({
      projectId,
    });

    client.emit(topicName, data);
  });
});
