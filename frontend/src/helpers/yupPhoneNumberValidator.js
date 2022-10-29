import { matchIsValidTel } from 'mui-tel-input';

export default function isValidPhone(errorMessage) {
  return this.test('isValidPhoneNumber', errorMessage, function check(value) {
    const { path, createError } = this;
    return (
      (value && matchIsValidTel(value)) ||
      createError({ path, message: errorMessage })
    );
  });
}
