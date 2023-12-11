import { IsEnum } from '../src/is-enum.decorator';
import { Validator, ValidatorOptions } from 'class-validator';

function validateValues(
  object: { testProperty: any },
  values: any[],
  validatorOptions?: ValidatorOptions,
): Promise<any> {
  const validator = new Validator();
  const promises = values.map((value) => {
    object.testProperty = value;
    return validator.validate(object, validatorOptions).then((errors) => {
      expect(errors.length).toEqual(0);
      if (errors.length > 0) {
        console.log(`Unexpected errors: ${JSON.stringify(errors)}`);
        throw new Error('Unexpected validation errors');
      }
    });
  });

  return Promise.all(promises);
}

function checkReturnedError(
  object: { testProperty: any },
  values: any[],
  validationType: string,
  messages: string[],
  validatorOptions?: ValidatorOptions,
): Promise<any> {
  let messagesIncrementor: number = 0;
  const validator = new Validator();
  const promises = values.map((value) => {
    object.testProperty = value;
    return validator.validate(object, validatorOptions).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].target).toEqual(object);
      expect(errors[0].property).toEqual('testProperty');
      expect(errors[0].constraints).toEqual({ [validationType]: messages[messagesIncrementor] });
      expect(errors[0].value).toEqual(value);
      messagesIncrementor++;
    });
  });

  return Promise.all(promises);
}

describe('Tests related to the custom IsEnum Decorator', () => {
  enum CustomEnum {
    FIRST_ITEM = 'first-item',
    SECOND_ITEM = 'second-item',
  }

  class TestClass {
    @IsEnum(CustomEnum)
    testProperty: CustomEnum = CustomEnum.FIRST_ITEM;
  }

  it('should validate the correct values', () => {
    return validateValues(new TestClass(), [
      CustomEnum.FIRST_ITEM,
      CustomEnum.SECOND_ITEM,
      'first-item',
      'second-item',
    ]);
  });

  it('should not validate invalid values and return the correct errors', () => {
    const validationType = 'isEnum';
    const firstMessage =
      'testProperty has the value false-value-1 but must be one of the following values: first-item, second-item';
    const secondMessage =
      'testProperty has the value false-value-2 but must be one of the following values: first-item, second-item';
    return checkReturnedError(new TestClass(), ['false-value-1', 'false-value-2'], validationType, [
      firstMessage,
      secondMessage,
    ]);
  });
});
