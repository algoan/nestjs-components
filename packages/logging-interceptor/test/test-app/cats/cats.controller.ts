import { BadRequestException, Controller, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';
import { Log } from '../../../src/log.decorator';

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
  @Log({ mask: { request: ['password', 'interests', 'address.country', 'address.city', 'payments.bank.name'] } })
  public getCatById(@Param('catId') catId: string) {
    return `This action returns a cat(id: ${catId}) from the cats' list`;
  }

  /**
   * Login
   */
  @Post('login')
  @Log({ mask: { request: ['password'] } })
  public login() {
    return 'This action login with a cat credential';
  }
}
