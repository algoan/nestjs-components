import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwtDecode from 'jwt-decode';
// tslint:disable-next-line:variable-name
export const DecodeJWT: () => ParameterDecorator = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const request: { accessTokenJWT: string } = ctx.switchToHttp().getRequest();
    const jwt: string = request.accessTokenJWT;
    let decodedJwt: object;
    try {
      decodedJwt = jwtDecode(jwt);
    } catch (err) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return decodedJwt;
  },
);
