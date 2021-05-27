import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// tslint:disable-next-line:variable-name
export const User: () => ParameterDecorator = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<object> => {
    const request: { user: object } = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
