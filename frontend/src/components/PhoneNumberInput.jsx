import { MuiTelInput } from 'mui-tel-input';
import PropTypes from 'prop-types';
import { fieldToTextField } from 'formik-mui';
import { styled } from '@mui/material/styles';

const CustomizedMuiPhoneNumber = styled(MuiTelInput)`
  & .MuiIconButton-root {
    margin-left: -7px;
    margin-right: -5px;
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
      defaultCountry="HU"
      preferredCountries={['HU', 'RO', 'SK', 'UA']}
      continents={['EU']}
      langOfCountryName="hu"
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
