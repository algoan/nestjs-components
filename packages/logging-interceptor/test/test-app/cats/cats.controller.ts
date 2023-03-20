import { BadRequestException, Controller, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';

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

  /**
   * Update a cat by id
   */
  @Put('/:catId')
  public getCatById(@Param('catId') catId: string) {
    return `This action returns a cat(id: ${catId}) from the cats' list`;
  }

  /**
   * Login
   */
  @Post('login')
  public login() {
    return 'This action login with a cat credential';
  }
}
