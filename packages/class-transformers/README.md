# Nestjs class transformers

A set of class transformers

## Installation

```bash
npm install --save @algoan/nestjs-class-validators
```

## EnumFallback


### Usage 

```ts
export enum UserRole {
  ADMIN = 'ADMIN',
  READER = 'READER',
}

class UserDto {
  @EnumFallback({
    type: UserRole,
    fallback: (value: UserRole) => UserRole.READER // if the role is not "ADMIN" or "READER", then the role will be "READER". 
  })
  public role?: UserRole;
}
```