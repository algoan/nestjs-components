/* eslint-disable @typescript-eslint/no-explicit-any */

import { applyDecorators } from '@nestjs/common';
import { Transform, TransformOptions } from 'class-transformer';

/**
 * Checks if a given value is the member of the provided enum and call a fallback function
 * if the value is invalid
 */
interface EnumFallbackOptions<T> {
  type: unknown;
  fallback: (value: T) => T;
}

export function EnumFallback<T>(options: EnumFallbackOptions<T>, transformOptions?: TransformOptions) {
  const { type, fallback } = options;

  return applyDecorators(
    Transform(({ value }) => {
      if (value === undefined || !Object.values(type as string[]).includes(value)) {
        return fallback(value);
      }

      return value;
    }, transformOptions),
  );
}
