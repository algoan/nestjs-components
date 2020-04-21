import * as delay from 'delay';

import { GCPubSubServer } from '../src';
import { SUBSCRIPTION_NAME } from './test-app/app.controller';
import { AppService } from './test-app/app.service';
import { getTestingApplication } from './test-app/main';

const Emulator = require('google-pubsub-emulator');

describe('GooglePubSubServer', () => {
  let emulator: any;

  beforeAll(async () => {
    /**
     * Start a new Google PubSub simulator
     */
    emulator = new Emulator({
      projectId: 'algoan-test',
    });

    await emulator.start();
  });

  afterAll(async () => {
    /**
     * Close the fake server and the simulator
     */
    await emulator.stop();
  });

  it('GCPSS01 - should properly listen to a subscription - cb call', async (done: jest.DoneCallback) => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
    });
    const { app } = await getTestingApplication(server);
    /**
     * After launching the application, ensure that all subscriptions have been created
     */
    app.listen(async () => {
      expect(server.gcClient.subscriptions.get(SUBSCRIPTION_NAME)).toBeDefined();
      expect(await server.gcClient.client.subscription(SUBSCRIPTION_NAME).exists()).toEqual([true]);

      await app.close();
      done();
    });
  });

  it('GCPSS02 - should properly listen to a subscription with a prefix', async (done: jest.DoneCallback) => {
    const server: GCPubSubServer = new GCPubSubServer({
      subscriptionsPrefix: 'test-app',
      projectId: 'algoan-test',
      debug: true,
    });
    const { app } = await getTestingApplication(server);
    const subscriptionName: string = `test-app%${SUBSCRIPTION_NAME}`;

    /**
     * After launching the application, ensure that all subscriptions have been created
     */
    app.listen(async () => {
      expect(server.gcClient.subscriptions.get(subscriptionName)).toBeDefined();
      expect(await server.gcClient.client.subscription(subscriptionName).exists()).toEqual([true]);

      await app.close();
      done();
    });
  });

  it('GCPSS03 - Emit an event and test if it is received', async (done: jest.DoneCallback) => {
    const server: GCPubSubServer = new GCPubSubServer({
      projectId: 'algoan-test',
    });
    const { app, module } = await getTestingApplication(server);
    const appService: AppService = module.get(AppService);
    const spy: jest.SpyInstance = jest.spyOn(appService, 'handleTestEvent');
    /**
     * After launching the application, emit an event and check if the app service has been called
     * After closing the app, it should not listen anymore
     */
    app.listen(async () => {
      await server.gcClient.emit(SUBSCRIPTION_NAME, {
        hello: 'world',
      });
      await delay(100);
      expect(spy).toHaveBeenCalledTimes(1);

      await app.close();
      await server.gcClient.emit(SUBSCRIPTION_NAME, {
        hello: 'world',
      });
      await delay(100);
      expect(spy).toHaveBeenCalledTimes(1);

      done();
    });
  });
});
