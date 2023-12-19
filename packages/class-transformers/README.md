# Nestjs class transformers

Extends [class-transformers package](https://github.com/typestack/class-transformer) with additional features.

## Installation

```bash
npm install --save @algoan/nestjs-class-transformers
```

## EnumFallback

### Usage

```ts
import { EnumFallback } from '@algoan/nestjs-class-transformers';

export enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

class User {
  @EnumFallback({
    type: UserRole,
    fallback: (value: UserRole) => UserRole.READER // if the role is not "ADMIN" or "READER", then the role will be "READER".
  })
  public role?: UserRole;
}
```
