import { setTimeout } from 'node:timers/promises';

import { GCPubSubServer } from '../src';
import {
  SUBSCRIPTION_NAME,
  SUBSCRIPTION_NAME_2,
  SUBSCRIPTION_NAME_3,
  SUBSCRIPTION_NAME_4,
  SUBSCRIPTION_NAME_5,
  TOPIC_NAME,
} from './test-app/app.controller';
import { AppService } from './test-app/app.service';
import { getTestingApplication } from './test-app/main';

const Emulator = require('google-pubsub-emulator');

jest.setTimeout(20000);

describe('GooglePubSubServer', () => {
  let emulator: any;

  beforeAll(async () => {
    /**
     * Start a new Google PubSub simulator
     */
    emulator = new Emulator({
      projectId: 'algoan-test',
      debug: process.env.ENABLE_EMULATOR_DEBUG === 'true',
    });

    await emulator.start();
  });

  afterAll(async () => {
    /**
     * Close the fake server and the simulator
     */
    await emulator.stop();
  });

  it('GCPSS01 - should properly listen to a subscription - cb call', async () => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
      topicsNames: [SUBSCRIPTION_NAME],
    });
    const { app } = await getTestingApplication(server);
    /**
     * After launching the application, ensure that all subscriptions have been created
     */
    await app.listen();

    await setTimeout(1000);
    expect(server.gcClient.subscriptions.get(SUBSCRIPTION_NAME)).toBeDefined();
    expect(await server.gcClient.client.subscription(SUBSCRIPTION_NAME).exists()).toEqual([true]);

    await app.close();
  });

  it('GCPSS02 - should properly listen to a subscription with a prefix', async () => {
    const server: GCPubSubServer = new GCPubSubServer({
      subscriptionsPrefix: 'test-app',
      projectId: 'algoan-test',
      topicsNames: [SUBSCRIPTION_NAME],
      listenOptions: {
        subscriptionOptions: {
          sub: {
            streamingOptions: {
              maxStreams: 1,
            },
          },
        },
      },
    });
    const { app } = await getTestingApplication(server);
    const subscriptionName: string = `test-app%${SUBSCRIPTION_NAME}`;

    /**
     * After launching the application, ensure that all subscriptions have been created
     */
    await app.listen();
    await setTimeout(1000);

    expect(server.gcClient.subscriptions.get(subscriptionName)).toBeDefined();
    expect(await server.gcClient.client.subscription(subscriptionName).exists()).toEqual([true]);

    await app.close();
  });

  it('GCPSS03 - Emit an event and test if it is received', async () => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
      topicsNames: [SUBSCRIPTION_NAME],
    });
    const { app, module } = await getTestingApplication(server);
    const appService: AppService = module.get(AppService);
    const spy: jest.SpyInstance = jest.spyOn(appService, 'handleTestEvent');
    /**
     * After launching the application, emit an event and check if the app service has been called
     * After closing the app, it should not listen anymore
     */
    await app.listen();
    await server.gcClient.emit(SUBSCRIPTION_NAME, {
      hello: 'world',
    });
    await setTimeout(100);
    expect(spy).toHaveBeenCalledTimes(1);

    await app.close();
    await server.gcClient.emit(SUBSCRIPTION_NAME, {
      hello: 'world',
    });
    await setTimeout(100);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('GCPSS04 - should properly listen to all subscriptions - cb call', async () => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
    });
    const { app } = await getTestingApplication(server);
    /**
     * After launching the application and creating a topic, ensure that all subscriptions have been created
     */
    const [topic] = await server.gcClient.client.createTopic(TOPIC_NAME);

    await app.listen();

    expect(server.gcClient.subscriptions.get(SUBSCRIPTION_NAME)).toBeDefined();
    expect(await server.gcClient.client.subscription(SUBSCRIPTION_NAME).exists()).toEqual([true]);
    expect(server.gcClient.subscriptions.get(SUBSCRIPTION_NAME_2)).toBeDefined();
    expect(await server.gcClient.client.subscription(SUBSCRIPTION_NAME_2).exists()).toEqual([true]);
    expect(server.gcClient.subscriptions.get(SUBSCRIPTION_NAME_3)).toBeDefined();
    expect(await server.gcClient.client.subscription(SUBSCRIPTION_NAME_3).exists()).toEqual([true]);
    expect(server.gcClient.subscriptions.get(SUBSCRIPTION_NAME_4)).toBeDefined();
    expect(await server.gcClient.client.subscription(SUBSCRIPTION_NAME_4).exists()).toEqual([true]);

    await topic.delete();
    await server.gcClient.client.subscription(SUBSCRIPTION_NAME_4).delete();
    await server.gcClient.client.subscription(SUBSCRIPTION_NAME_3).delete();

    await app.close();
  });

  it('GCPSS05 - Emit an event and test if it is received twice', async () => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
      debug: true,
    });

    /**
     * First, create a topic to ensure it already exists
     */
    const [topic] = await server.gcClient.client.createTopic(TOPIC_NAME);

    const { app, module } = await getTestingApplication(server);
    const appService: AppService = module.get(AppService);
    const spy: jest.SpyInstance = jest.spyOn(appService, 'handleTestEvent');
    await app.listen();
    await server.gcClient.emit(TOPIC_NAME, {
      hello: 'world',
    });
    await setTimeout(2000);

    /**
     * Since we have two listeners on the same topic, the spy must be called twice
     */
    expect(spy).toHaveBeenCalledTimes(2);

    await topic.delete();

    await app.close();
  });

  it('GCPSS06 - Emit an event and test if it wait to have 0 messages to close subscriptions', async () => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
      topicsNames: [SUBSCRIPTION_NAME_5],
    });

    const { app, module } = await getTestingApplication(server);
    const appService: AppService = module.get(AppService);
    const spy: jest.SpyInstance = jest.spyOn(appService, 'handleTestEvent');

    /**
     * After the application starts, an event is emitted and a check is made to see if the application service has been called.
     * After receiving a signal to close the server, it waits until it has no messages to close the subscriptions.
     */
    await app.listen();
    await server.gcClient.emit(SUBSCRIPTION_NAME_5, {
      hello: 'world',
    });
    await setTimeout(100);

    expect(server.counterMessage).toBe(1);

    await server.close();

    expect(server.counterMessage).toBe(0);

    expect(spy).toHaveBeenCalledTimes(1);

    await app.close();
  });
});
