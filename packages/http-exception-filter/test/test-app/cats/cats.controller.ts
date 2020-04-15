import { BadRequestException, Controller, Get, InternalServerErrorException, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './create-cat.dto';

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
    throw new BadRequestException(`The request is malformed.`);
  }
  /**
   * Fetching internalerror
   */
  @Get('internalerror')
  public internalerror(): string {
    throw new InternalServerErrorException(`A critical error happened.`);
  }
  /**
   * Create a cat
   */
  @Post('create')
  public create(@Body() _createCatDto: CreateCatDto): string {
    return 'This action adds a new cat';
  }
}
