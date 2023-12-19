import { EnumFallback } from '../src';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';

enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

class UserDto {
  @EnumFallback(UserRole, (_value: UserRole) => UserRole.READER)
  public role?: UserRole;
}

describe('EnumFallback Decorator', () => {
  it('should apply the fallback functions when we have an invalid value', async () => {
    const userDto = new UserDto();
    userDto.role = 'WRITER' as UserRole;

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UserDto,
      data: '',
    };
    const result = await target.transform(userDto, metadata);

    expect(result.role).toEqual(UserRole.READER);
  });

  it('should not apply the fallback function when the value is valid', async () => {
    const userDto = new UserDto();
    userDto.role = UserRole.ADMIN;

    let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UserDto,
      data: '',
    };
    const result = await target.transform(userDto, metadata);

    expect(result.role).toBe(UserRole.ADMIN);
  });
});
