import { IsEnum as OriginalIsEnum, ValidationOptions } from 'class-validator';

export const IsEnum = (entity: object, validationOptions?: ValidationOptions): PropertyDecorator =>
  OriginalIsEnum(entity, {
    message: '$property has the value $value but must be one of the following values: $constraint2',
    ...validationOptions,
  });
