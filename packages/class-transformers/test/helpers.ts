import {
  Body,
  Controller,
  ExecutionContext,
  INestApplication,
  Logger,
  Module,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { EnumFallback } from '../src';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

const fakeJWT: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IddsqkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

export class UserDto {
  private static readonly logger: Logger = new Logger(UserDto.name);

  @EnumFallback({
    type: UserRole,
    fallback: (value: UserRole) => {
      UserDto.logger.error(`Invalid user role ${value}`);
      return UserRole.ADMIN;
    },
  })
  public role?: UserRole;
}

/**
 * Mock of the AuthGuard class
 */
class AuthGuardMock {
  /**
   * Check token
   */
  public canActivate(context: ExecutionContext): boolean {
    const request: { user: { someId: string }; accessTokenJWT: string } = context.switchToHttp().getRequest();
    request.user = {
      someId: 'id',
    };
    request.accessTokenJWT = fakeJWT;
    return true;
  }
}

/**
 * Test Controller
 */
@Controller()
export class FakeAppController {
  @Post('/user')
  public createUser(@Body() user: UserDto): unknown {
    console.log('[AL] user', user);
    return user;
  }
}

/**
 * Fake app module
 */
/* eslint-disable */
@Module({
  controllers: [FakeAppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuardMock,
    },
  ],
})
class AppModule {}
/* eslint-enable */

export async function createTestAppModule(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication({});

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  return app;
}
