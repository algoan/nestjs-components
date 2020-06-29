import { EmittedMessage, isPayloadError } from '@algoan/pubsub';

/**
 * Fake app service
 */
export class AppService {
  /**
   * Handle Test event by logging it
   * @param data Payload sent
   */
  public handleTestEvent(data: EmittedMessage<{ hello: string }>): string | undefined {
    if (isPayloadError(data.payload)) {
      return undefined;
    }

    return data.payload.hello;
  }
}
