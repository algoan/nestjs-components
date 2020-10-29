import {
  EmittedMessage,
  GCListenOptions,
  GCPubSub,
  GooglePubSubOptions,
  PubSubFactory,
  Transport,
} from '@algoan/pubsub';
import { Logger } from '@nestjs/common';
import { CustomTransportStrategy, MessageHandler, Server } from '@nestjs/microservices';

/**
 * Google Pub Sub Server class extending NestJS Microservice strategy
 */
export class GCPubSubServer extends Server implements CustomTransportStrategy {
  /**
   * Algoan Google PubSub client
   */
  public gcClient!: GCPubSub;

  /**
   * Extended logger
   */
  protected readonly logger: Logger = new Logger(GCPubSubServer.name);

  constructor(private readonly options?: GooglePubSubOptions & { listenOptions?: GCListenOptions }) {
    super();
  }

  /**
   * Server listening method
   */
  public listen(callback: () => void): void {
    const gcPubSub: GCPubSub = PubSubFactory.create({
      transport: Transport.GOOGLE_PUBSUB,
      options: this.options,
    });

    this.gcClient = gcPubSub;
    const handlers: Promise<void>[] = [];

    this.messageHandlers.forEach((messageHandler: MessageHandler, subscriptionName: string) => {
      if (!messageHandler.isEventHandler) {
        return;
      }
      this.logger.debug(`Registered new subscription "${subscriptionName}"`);

      handlers.push(
        gcPubSub.listen(subscriptionName, {
          onMessage: this.handleMessage(subscriptionName),
          onError: this.handleError,
          options: this.options?.listenOptions,
        }),
      );
    });

    Promise.all(handlers).then(callback).catch(this.handleError);
  }

  /**
   * Close all subscriptions when subscriptions is closing
   */
  public async close(): Promise<void> {
    for (const mapValue of this.gcClient.subscriptions) {
      await mapValue[1].close();
    }
  }

  /**
   * Handle server error
   */
  protected handleError = (error: unknown): void => {
    this.logger.error({
      message: 'An error occurred with the GoogleCloudPubSubServer',
      error,
    });

    if (error instanceof Error) {
      super.handleError(error.message);

      return;
    }

    return;
  };

  /**
   * Handle messages
   */
  // tslint:disable-next-line: no-any
  private handleMessage<T = any>(subscriptionName: string): (message: EmittedMessage<T>) => Promise<void> {
    return async (message: EmittedMessage<T>): Promise<void> => {
      const handler: MessageHandler | null = this.getHandlerByPattern(subscriptionName);

      if (handler === null) {
        return;
      }

      await handler(message);
    };
  }
}
