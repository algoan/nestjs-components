import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

export const SUBSCRIPTION_NAME: string = 'test_event';

/**
 * Fake app controller
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Handle the test event
   */
  @Post('/emit')
  public async emitTestEvent(): Promise<void> {
    this.appService.emitTestEvent({ hello: 'world' });
  }

  /**
   * Send a test event
   */
  @Post('/send')
  public async sendTestEvent(): Promise<void> {
    return this.appService.sendTestEvent({ hello: 'world' }).toPromise();
  }
}
