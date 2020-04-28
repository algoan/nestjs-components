import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

/**
 * Fake app service
 */
export class AppService implements OnModuleInit {
  constructor(@Inject('PUBSUB_CLIENT') private readonly client: ClientProxy) {}

  /**
   * Connect the client proxy on module init
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

  /**
   * Emit an event with the request-response pattern
   * @param data Payload sent
   */
  public sendTestEvent(data: { hello: string }): Observable<any> {
    return this.client.send('test_event', data);
  }
}
