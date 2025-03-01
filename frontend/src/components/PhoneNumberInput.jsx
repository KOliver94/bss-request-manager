import { forwardRef } from 'react';

import { styled } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';

const CustomizedMuiPhoneNumber = styled(MuiTelInput)`
  & .MuiIconButton-root {
    margin-left: -7px;
    margin-right: -5px;
  }
`;

const PhoneNumberInput = forwardRef((props, ref) => {
  return (
    <CustomizedMuiPhoneNumber
      defaultCountry="HU"
      preferredCountries={['HU', 'RO', 'SK', 'UA']}
      continents={['EU']}
      langOfCountryName="hu"
      {...props}
      {...ref}
    />
  );
});
PhoneNumberInput.displayName = 'PhoneNumberInput';

export default PhoneNumberInput;
