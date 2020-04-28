import { EmittedMessage } from '@algoan/pubsub';

/**
 * Fake app service
 */
export class AppService {
  /**
   * Handle Test event by logging it
   * @param data Payload sent
   */
  public handleTestEvent(data: EmittedMessage<{ hello: string }>): string {
    return data.payload.hello;
  }
}
