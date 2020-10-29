import { EmittedMessage } from '@algoan/pubsub';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

export const SUBSCRIPTION_NAME: string = 'test_event';
export const SUBSCRIPTION_NAME_2: string = 'test_event_2';

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
}
