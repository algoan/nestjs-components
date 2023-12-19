/* eslint-disable @typescript-eslint/no-explicit-any */

import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

/**
 * Checks if a given value is the member of the provided enum and call a fallback function
 * if the value is invalid
 */
export function EnumFallback(enumType: any, fallback: (value: any) => any, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'enumFallback',
      target: object.constructor,
      propertyName,
      constraints: [enumType, fallback],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [enumTypeValue, fallbackFn] = args.constraints;
          if (value === undefined || !Object.values(enumTypeValue).includes(value)) {
            // eslint-disable-next-line
            const updatedObject = Object.assign({}, args.object, {
              [propertyName]: fallbackFn(value),
            });
            // eslint-disable-next-line
            Object.assign(args.object, updatedObject);
          }

          return true;
        },
      },
    });
  };
}
