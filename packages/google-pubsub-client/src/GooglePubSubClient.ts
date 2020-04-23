import { EmitOptions, GCListenOptions, GCPubSub, GooglePubSubOptions, PubSubFactory, Transport } from '@algoan/pubsub';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';

/**
 * Algoan pub sub client
 */
export class GCPubSubClient extends ClientProxy {
  public pubSub: GCPubSub;

  constructor(options: GooglePubSubOptions) {
    super();
    this.pubSub = PubSubFactory.create({
      transport: Transport.GOOGLE_PUBSUB,
      options,
    });
  }

  /**
   * Connect
   */
  public async connect(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Close
   */
  public async close(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Publish
   */
  // tslint:disable-next-line
  public publish(_packet: ReadPacket, _callback: (packet: WritePacket) => void): any {
    return undefined;
  }

  /**
   *
   * dispatchEvent
   */
  // tslint:disable-next-line
  public async dispatchEvent(_packet: ReadPacket): Promise<any> {
    return undefined;
  }

  /**
   * Emit an event
   */
  // tslint:disable-next-line
  public emit(pattern: string, data: any, options?: EmitOptions<GCListenOptions>): Observable<any> {
    return of(this.pubSub.emit(pattern, data, options));
  }
}
