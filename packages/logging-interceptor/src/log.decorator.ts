export const METHOD_LOG_METADATA = 'METHOD_LOG_METADATA';

export interface LogOptions {
  mask?: MethodMask;
}

export interface MethodMask {
  request: string[];
}

export const Log =
  (options: LogOptions): MethodDecorator =>
  (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata(METHOD_LOG_METADATA, options, descriptor.value);
  };
