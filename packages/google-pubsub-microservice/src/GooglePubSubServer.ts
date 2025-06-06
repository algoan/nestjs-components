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

  /**
   * Flag used to stop message processing when the signal to close the connection to pubsub arrived
   */
  private shuttingDown = false;

  /**
   * Message counter to manage the connection closing logic with pubsub
   */
  public counterMessage = 0;

  /**
   * Wait a maximum of 5 seconds to close the pubsub connection if messages are in process
   */
  // eslint-disable-next-line no-magic-numbers
  private static readonly MAX_RETRY_BEFORE_CLOSING = 50;
  // eslint-disable-next-line no-magic-numbers
  private static readonly CLOSE_RETRY_INTERVAL = 100;

  constructor(
    private readonly options?: GooglePubSubOptions & { listenOptions?: GCListenOptions; topicsNames?: string[] },
  ) {
    super();
    const gcPubSub: GCPubSub = PubSubFactory.create({
      transport: Transport.GOOGLE_PUBSUB,
      options: this.options,
    });

    this.gcClient = gcPubSub;
  }

  /**
   * Server listening method
   */
  public listen(callback: (error?: Error, info?: unknown[]) => void): void {
    const handlers: Promise<void>[] = [];

    for (const [subscriptionName, messageHandler] of this.messageHandlers) {
      if (this.options?.topicsNames !== undefined && !this.options?.topicsNames?.includes(subscriptionName)) {
        continue;
      }
      this.logger.debug(`Registered new subscription "${subscriptionName}"`);

      handlers.push(
        this.gcClient.listen(subscriptionName, {
          onMessage: this.handleMessage(subscriptionName),
          onError: this.handleError,
          options: {
            autoAck: true,
            ...this.options?.listenOptions,
            ...(messageHandler.extras as GCListenOptions),
          },
        }),
      );
    }

    Promise.all(handlers)
      .then((res: unknown[]): void => {
        callback(undefined, res);
      })
      .catch((err: Error): void => {
        callback(err);
      });
  }

  /**
   * Close all subscriptions when subscriptions is closing
   */
  public async close(): Promise<void> {
    this.shuttingDown = true;

    let retry = 0;
    while (this.counterMessage > 0 && retry < GCPubSubServer.MAX_RETRY_BEFORE_CLOSING) {
      ++retry;
      await new Promise((resolve) => setTimeout(resolve, GCPubSubServer.CLOSE_RETRY_INTERVAL));
    }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleMessage<T = any>(subscriptionName: string): (message: EmittedMessage<T>) => Promise<void> {
    return async (message: EmittedMessage<T>): Promise<void> => {
      const handler: MessageHandler | null = this.getHandlerByPattern(subscriptionName);

      // eslint-disable-next-line no-null/no-null
      if (handler === null) {
        return;
      }

      if (this.shuttingDown) {
        message.nack();

        return;
      }

      ++this.counterMessage;

      try {
        await handler(message);
      } finally {
        --this.counterMessage;
      }
    };
  }
}
