import { buildMessage, isEnum, ValidateBy, ValidationOptions } from 'class-validator';

const IS_ENUM = 'isEnum';

/**
 * Returns the possible values from an enum (both simple number indexed and string indexed enums).
 */
// eslint-disable-next-line
function validEnumValues(entity: any): string[] {
  return (
    Object.entries(entity)
      // @ts-ignore
      // eslint-disable-next-line
      .filter(([key, value]) => isNaN(parseInt(key)))
      // @ts-ignore
      .map(([key, value]) => value as string)
  );
}

export function IsEnum(entity: object, validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_ENUM,
      constraints: [entity, validEnumValues(entity)],
      validator: {
        validate: (value, args): boolean => isEnum(value, args?.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property has the value $value but must be one of the following values: $constraint2`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
