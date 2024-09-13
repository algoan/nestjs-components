/* eslint-disable */
import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, Post } from '@nestjs/common';
import { Log } from '../../../src';
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
   * Create a cat
   */
  @Post()
  @Log({
    mask: {
      request: ['birthdate', 'interests.description', 'address', 'enemies'],
      response: ['id', 'birthdate', 'interests.description', 'address', 'enemies'],
    },
  })
  public createCat(@Body() payload: CreateCatDto) {
    if (payload.name === 'dog') {
      throw new BadRequestException({ message: 'You cannot name a cat dog' });
    }

    return { id: 1, ...payload };
  }

  @Post('header')
  @Log({
    mask: {
      request: ['birthdate', 'interests.description', 'address', 'enemies'],
      response: ['id', 'birthdate', 'interests.description', 'address', 'enemies'],
      disableHeaderMask: true,
    },
  })
  public createCatUnmaskedHeader(@Body() payload: CreateCatDto) {
    if (payload.name === 'dog') {
      throw new BadRequestException({ message: 'You cannot name a cat dog' });
    }

    return { id: 1, ...payload };
  }

  @Get()
  @Log({
    mask: {
      response: ['interests.description', 'unknownProperty'],
    },
  })
  public getCats() {
    return [
      {
        id: 1,
        name: 'Tom',
        interests: [
          { description: 'Eating Jerry', level: 'HIGH' },
          { description: 'Sleeping', level: 'MEDIUM' },
        ],
      },
      {
        id: 2,
        name: 'Sylvestre',
        interests: [{ description: 'Eating Titi', level: 'HIGH' }],
      },
    ];
  }

  /**
   * Create a password for a cat
   */
  @Post(':id/password')
  @Log({ mask: { request: true, response: true } })
  public createPassword(@Param('id') id: string, @Body() payload: { password: string }) {
    return `The password for cat ${id} is ${payload.password}`;
  }
}
