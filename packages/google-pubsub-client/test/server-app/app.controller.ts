import { EmittedMessage } from '@algoan/pubsub';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

export const SUBSCRIPTION_NAME: string = 'test_event';

/**
 * Fake app controller
 */
@Controller()
export class AppController {
  protected logger: Logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  /**
   * Handle the test event
   * @param data Payload sent
   */
  @EventPattern(SUBSCRIPTION_NAME)
  public async handleTestEvent(@Payload() data: EmittedMessage<{ hello: string }>): Promise<void> {
    this.appService.handleTestEvent(data);
  }
}
