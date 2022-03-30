import MuiPhoneNumber from 'material-ui-phone-number-2';
import PropTypes from 'prop-types';
import { fieldToTextField } from 'formik-mui';
import { styled } from '@mui/material/styles';

const CustomizedMuiPhoneNumber = styled(MuiPhoneNumber)`
  & .MuiIconButton-root {
    padding: 5px;
  }
`;

export default function PhoneNumberInput(props) {
  const {
    form: { setFieldValue },
    field: { name },
    disabled,
  } = props;

  return (
    <CustomizedMuiPhoneNumber
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
