# Nestjs class validators

A set of class validators based on the class-validator package (https://www.npmjs.com/package/@nestjs/class-validator/v/0.13.1).

## Installation

```bash
npm install --save @algoan/nestjs-class-validators
```

## IsEnum

A class validator that validates the enum type.

### Usage

```ts
 @IsEnum(UserType)
 public userType: UserType;
```

