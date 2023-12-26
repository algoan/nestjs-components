/* eslint-disable no-null/no-null */
/* eslint-disable max-classes-per-file */
import { plainToInstance } from 'class-transformer';
import { EnumFallback } from '../src';

describe('EnumFallback Decorator', () => {
  enum UserRole {
    ADMIN = 'ADMIN',
    READER = 'READER',
  }

  it('should return the given value if it is valid', async () => {
    class User {
      @EnumFallback({ type: UserRole, fallback: () => UserRole.READER })
      public role?: UserRole;
    }

    const user = plainToInstance(User, { role: 'ADMIN' });

    expect(user.role).toEqual(UserRole.ADMIN);
  });

  it('should return the fallback value if the given value is invalid', async () => {
    class User {
      @EnumFallback({ type: UserRole, fallback: () => UserRole.READER })
      public role?: UserRole;
    }

    const user = plainToInstance(User, { role: 'WRITER' });

    expect(user.role).toEqual(UserRole.READER);
  });

  it('should return undefined if the given value is undefined', async () => {
    class User {
      @EnumFallback({ type: UserRole, fallback: () => UserRole.READER })
      public role?: UserRole;
    }

    const user = plainToInstance(User, { role: undefined });

    expect(user.role).toBeUndefined();
  });

  it('should return undefined if the given value is null', async () => {
    class User {
      @EnumFallback({ type: UserRole, fallback: () => UserRole.READER })
      public role?: UserRole;
    }

    const user = plainToInstance(User, { role: null });

    expect(user.role).toBe(null);
  });

  it('should take into account the transform options', async () => {
    class User {
      @EnumFallback({ type: UserRole, fallback: () => UserRole.READER }, { groups: ['group1'] })
      public role?: UserRole;
    }

    const user = plainToInstance(User, { role: 'WRITER' }, { groups: ['group2'] });

    expect(user.role).toEqual('WRITER');
  });

  it('should return the fallback value for each invalid element if the property is an array', async () => {
    class User {
      @EnumFallback({ type: UserRole, fallback: () => UserRole.READER })
      public roles?: UserRole[];
    }

    const user = plainToInstance(User, { roles: ['WRITER', 'ADMIN'] });

    expect(user.roles).toEqual([UserRole.READER, UserRole.ADMIN]);
  });

  it('should allow to run side effects in fallback function if the given value is invalid', async () => {
    const log = jest.fn();
    // eslint-disable-next-line no-console
    console.log = log;

    class User {
      @EnumFallback({
        type: UserRole,
        fallback: () => {
          // eslint-disable-next-line no-console
          console.log('fallback function called');

          return UserRole.READER;
        },
      })
      public role?: UserRole;
    }

    const user = plainToInstance(User, { role: 'WRITER' });

    expect(user.role).toEqual(UserRole.READER);
    expect(log).toHaveBeenCalledWith('fallback function called');
  });
});
