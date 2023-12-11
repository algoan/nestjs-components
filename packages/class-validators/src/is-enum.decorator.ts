import { IsEnum as OriginalIsEnum, ValidationOptions } from 'class-validator';

/**
 * Checks if a given value is the member of the provided enum.
 *
 * This an override for the class-validator IsEnum validator.
 * The error message is enhanced with the invalid value
 */
export const IsEnum = (entity: object, validationOptions?: ValidationOptions): PropertyDecorator =>
  OriginalIsEnum(entity, {
    message: '$property has the value $value but must be one of the following values: $constraint2',
    ...validationOptions,
  });
