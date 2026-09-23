import { GCPubSub, GooglePubSubOptions, PubSubFactory, Transport } from '@algoan/pubsub';
import { Logger } from '@nestjs/common';
import { ClientProxy, ReadPacket } from '@nestjs/microservices';

export type GCPubSubClientOptions = GooglePubSubOptions & { messageMetadataKey?: string };
/**
 * Algoan pub sub client
 */
export class GCPubSubClient extends ClientProxy {
  /**
   * Logger
   */
  protected logger: Logger = new Logger(GCPubSubClient.name);
  /**
   * Algoan PubSub client
   */
  protected pubSub?: GCPubSub;

  /**
   * Algoan PubSub client
   */
  private readonly options?: GCPubSubClientOptions;

  constructor(options?: GCPubSubClientOptions) {
    super();
    this.options = options;
  }

  /**
   * Connect
   */
  public async connect(): Promise<void> {
    const isPubSubInstanceExisting: boolean = this.pubSub !== undefined;
    if (this.options?.debug === true) {
      this.logger.debug(
        {
          isPubSubInstanceExisting,
        },
        `Trying to connect to the Google PubSub Client Proxy`,
      );
    }

    if (isPubSubInstanceExisting) {
      return;
    }

    this.pubSub = PubSubFactory.create({
      transport: Transport.GOOGLE_PUBSUB,
      options: this.options,
    });
  }

  /**
   * Close the connection with the client
   */
  public async close(): Promise<void> {
    if (this.options?.debug === true) {
      this.logger.debug('Closing the GooglePubSubClient Proxy');
    }

    /**
     * Release the reference before awaiting: a concurrent "connect" must be able to
     * install a replacement, and this close must not clear it when it completes.
     * Doing it first also means a rejecting "close" cannot skip the reset.
     */
    const closingPubSub: GCPubSub | undefined = this.pubSub;
    this.pubSub = undefined;

    if (closingPubSub !== undefined) {
      await closingPubSub.client.close();
    }
  }

  /**
   * Return the underlying Algoan PubSub client
   */
  public unwrap<T>(): T {
    if (this.pubSub === undefined) {
      throw new Error('Not initialized. Please call the "connect" method first.');
    }

    return this.pubSub as T;
  }

  /**
   * Override the abstract "dispatchEvent" by simply emitting an Event
   * @param _packet Containing the event pattern and the payload sent
   */
  // eslint-disable-next-line
  public async dispatchEvent(_packet: ReadPacket): Promise<any> {
    if (this.pubSub === undefined) {
      return undefined;
    }

    const opts: { metadata?: { [key: string]: string } } = {};
    if (
      this.options?.messageMetadataKey !== undefined &&
      _packet.data[this.options?.messageMetadataKey] !== undefined
    ) {
      opts.metadata = _packet.data[this.options?.messageMetadataKey];
      delete _packet.data[this.options?.messageMetadataKey];
    }

    const pattern: string = this.normalizePattern(_packet.pattern);
    if (this.options?.debug === true) {
      this.logger.debug(
        {
          pattern,
          data: _packet.data,
          opts,
        },
        'Emitting an event through the GCPubSubClient',
      );
    }

    return this.pubSub.emit(pattern, _packet.data, opts);
  }

  /**
   * NOTE: this method has not been yet implemented
   * It will be in the future 😉
   */
  // eslint-disable-next-line
  public publish(): () => void {
    throw new Error('NOT_YET_IMPLEMENTED');
  }
}
