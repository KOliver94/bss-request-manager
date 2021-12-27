import MuiPhoneNumber from 'material-ui-phone-number';
import PropTypes from 'prop-types';
import { fieldToTextField } from 'formik-mui';

export default function PhoneNumberInput(props) {
  const {
    form: { setFieldValue },
    field: { name },
    disabled,
  } = props;

  return (
    <MuiPhoneNumber
      {...fieldToTextField(props)}
      preferredCountries={['hu']}
      defaultCountry="hu"
      regions="europe"
      disableAreaCodes
      disableDropdown={disabled}
      onChange={(value) => {
        setFieldValue(name, value);
      }}
    />
  );
}

PhoneNumberInput.propTypes = {
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};
