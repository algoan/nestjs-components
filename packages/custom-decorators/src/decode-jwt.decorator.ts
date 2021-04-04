import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import jwtDecode from 'jwt-decode';
// tslint:disable-next-line:variable-name
export const DecodeJWT: () => ParameterDecorator = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<unknown> => {
    const request: { accessTokenJWT: string } = ctx.switchToHttp().getRequest();
    const jwt: string = request.accessTokenJWT;
    let decodedJwt: unknown;
    try {
      decodedJwt = jwtDecode(jwt);
    } catch (err) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return decodedJwt;
  },
);
