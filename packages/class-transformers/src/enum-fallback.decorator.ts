import { Transform, TransformOptions } from 'class-transformer';

/**
 * Options for EnumFallback decorator.
 */
export interface EnumFallbackOptions<T> {
  /**
   * The enum type to check against.
   */
  type: { [s: string]: T };
  /**
   * A function that returns the fallback value.
   * @param value The invalid value.
   */
  fallback: (value: T) => T;
}

/**
 * Return given literal value if it is included in the specific enum type.
 * Otherwise, return the value provided by the given fallback function.
 * If the value is an array, the fallback function will be applied to each element.
 */
export const EnumFallback = <T>(
  params: EnumFallbackOptions<T>,
  transformOptions?: TransformOptions,
): PropertyDecorator =>
  Transform((transformParams) => {
    const value = transformParams.value;

    if (Array.isArray(value)) {
      return value.map((element) => transformEnumValue(element, params));
    } else {
      return transformEnumValue(value, params);
    }
  }, transformOptions);

const transformEnumValue = <T>(value: T, { type, fallback }: EnumFallbackOptions<T>): T => {
  // eslint-disable-next-line no-null/no-null
  if (value === undefined || value === null) {
    return value;
  }

  if (!Object.values(type).includes(value)) {
    return fallback(value);
  }

  return value;
};
