import { BadRequestException, Controller, Get, InternalServerErrorException } from '@nestjs/common';

/**
 * Controller: /cats
 */
@Controller('cats')
export class CatsController {
  /**
   * Fetching cats ok
   */
  @Get('ok')
  public ok(): string {
    return 'This action returns all cats';
  }
  /**
   * Fetching bad request
   */
  @Get('badrequest')
  public badRequest(): string {
    throw new BadRequestException();
  }
  /**
   * Fetching internalerror
   */
  @Get('internalerror')
  public internalerror(): string {
    throw new InternalServerErrorException();
  }
}
