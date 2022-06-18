import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

/**
 * Resolver: /cats
 */
@Resolver()
export class CatsResolver {
  /**
   * Fetching cats ok
   */
  @Query('ok')
  public ok(): unknown {
    return { message: 'This action returns all cats' };
  }
  /**
   * Fetching bad request
   */
  @Query('badRequest')
  public badRequest(): unknown {
    throw new BadRequestException();
  }
  /**
   * Fetching internalerror
   */
  @Query('internalerror')
  public internalerror(): unknown {
    throw new InternalServerErrorException();
  }
}
