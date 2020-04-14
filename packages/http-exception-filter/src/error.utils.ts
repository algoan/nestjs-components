import { ValidationError } from 'class-validator';
import { isEmpty, snakeCase, toUpper } from 'lodash';
/**
 *
 * Extract the stringified error code
 *
 * @param exResponse - exception response
 * @returns - string that describes the error
 */
export function getCode(exResponse: ExceptionResponse | string): string {
  if (typeof exResponse === 'string') {
    return formatErrorCode(exResponse);
  }

  return formatErrorCode(exResponse.error);
}

/*
    Extract the error messages
  */
export function getErrorMessage(exResponse: ExceptionResponse | string): string {
  if (typeof exResponse === 'string') {
    return exResponse;
  }

  if (typeof exResponse.message === 'string') {
    return exResponse.message;
  }

  if (Array.isArray(exResponse.message)) {
    const error: ValidationError = exResponse.message[0];
    const validationError: string = parseErrorMessage(error);
    if (validationError) {
      return validationError;
    }
  }

  return 'INTERNAL_SERVER_ERROR';
}

/**
 * Format a string to uppercase and snakeCase
 *
 * @param error - string
 * @returns - ex `Bad Request` become `BAD_REQUEST`
 */
function formatErrorCode(error: string = 'INTERNAL_SERVER_ERROR'): string {
  return toUpper(snakeCase(error));
}

/*
    Aggregation of error messages for a given ValidationError
  */
function parseErrorMessage(error: ValidationError): string {
  let message: string = '';
  const messages: Constraint = findConstraints(error);
  Object.keys(messages).forEach((key: string): void => {
    message += `${message === '' ? '' : ' -- '}${messages[key]}`;
  });

  return message;
}

/**
 * Find contraints in an error oject
 */
function findConstraints(error: ValidationError): Constraint {
  let objectToIterate: ValidationError = error;
  while (!isEmpty(objectToIterate.children)) {
    objectToIterate = objectToIterate.children[0];
  }

  return objectToIterate.constraints;
}

/**
 * Contraints of the validation
 */
interface Constraint {
  [type: string]: string;
}

/**
 * Exception response
 */
interface ExceptionResponse {
  error?: string;
  message?: string | ValidationError[];
}
