import { SetMetadata } from '@nestjs/common';

export const METHOD_LOG_METADATA: string = 'METHOD_LOG_METADATA';

/**
 * Log options
 */
export interface LogOptions {
  /**
   * Masking options
   */
  mask?: MaskingOptions;
}

/**
 * Masking options
 */
export interface MaskingOptions {
  /**
   * Mask of the request body. It can be a boolean or an array of strings.
   * If it is true, it will mask all the body.
   * If it is an array of strings, it will mask only the specified fields.
   */
  request?: string[] | boolean;
  /**
   * Mask of the response body. It can be a boolean or an array of strings.
   * If it is true, it will mask all the body.
   * If it is an array of strings, it will mask only the specified fields.
   */
  response?: string[] | boolean;
  /**
   * If true, it will disable the header masking.
   */
  disableHeaderMasking?: boolean;
}

/**
 * Log decorator. It allows to customise logging behaviour for each route.
 * @param options the logging options
 */
export const Log = (options: LogOptions) => SetMetadata(METHOD_LOG_METADATA, options);
