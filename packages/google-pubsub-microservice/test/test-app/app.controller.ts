import { EmittedMessage } from '@algoan/pubsub';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

export const SUBSCRIPTION_NAME: string = 'test_event';
export const SUBSCRIPTION_NAME_2: string = 'test_event_2';
export const SUBSCRIPTION_NAME_3: string = 'test_event_3';
export const SUBSCRIPTION_NAME_4: string = 'test_event_4';
export const SUBSCRIPTION_NAME_5: string = 'test_event_5';
export const TOPIC_NAME: string = 'my_topic';

/**
 * Fake app controller
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Handle the test event
   * @param data Payload sent
   */
  @EventPattern(SUBSCRIPTION_NAME)
  public async handleTestEvent(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    this.appService.handleTestEvent(data);
  }

  /**
   * Handle the test event (2)
   * @param data Payload sent
   */
  @EventPattern(SUBSCRIPTION_NAME_2)
  public async handleTestEvent2(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    this.appService.handleTestEvent(data);
  }

  /**
   * Handle the test event (3)
   * @param data Payload sent
   */
  @EventPattern(SUBSCRIPTION_NAME_3, { topicName: TOPIC_NAME })
  public async handleTestEvent3(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    this.appService.handleTestEvent(data);
  }

  /**
   * Handle the test event (4) based on the same topic than (3)
   * @param data Payload sent
   */
  @EventPattern(SUBSCRIPTION_NAME_4, { topicName: TOPIC_NAME })
  public async handleTestEvent4(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    this.appService.handleTestEvent(data);
  }

  /**
   * Handle the test event (5)
   * @param data Payload sent
   */
  @EventPattern(SUBSCRIPTION_NAME_5)
  public async handleTestEvent5(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    // eslint-disable-next-line no-magic-numbers
    await new Promise((r) => setTimeout(r, 1000));
    this.appService.handleTestEvent(data);
  }
}
