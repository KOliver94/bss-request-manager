import { isValidPhoneNumber } from 'mui-tel-input';

export default function isValidPhone(errorMessage) {
  return this.test('isValidPhoneNumber', errorMessage, function check(value) {
    const { path, createError } = this;
    return (
      (value && isValidPhoneNumber(value)) ||
      createError({ path, message: errorMessage })
    );
  });
}
