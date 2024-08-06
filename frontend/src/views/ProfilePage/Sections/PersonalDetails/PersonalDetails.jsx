import PropTypes from 'prop-types';
// @mui components
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// core components
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import { Controller } from 'react-hook-form';
import PhoneNumberInput from 'src/components/PhoneNumberInput';
import { TextField } from '@mui/material';

import stylesModule from '../../ProfilePage.module.scss';

export default function PersonalDetails({ control, errors, disabled, isUser }) {
  const theme = useTheme();
  const isMobileView = !useMediaQuery(theme.breakpoints.up('md'));

  return (
    <GridContainer justifyContent="center">
      <GridItem>
        {!isUser && (
          <Alert
            severity="warning"
            className={
              isMobileView ? stylesModule.alertAdMobile : stylesModule.alertAd
            }
          >
            Adataidat a BSS címtár szolgáltatásában kell módosítani.
          </Alert>
        )}
      </GridItem>
      <GridItem xs={12} sm={6}>
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Vezetéknév"
              margin="normal"
              fullWidth
              disabled={disabled}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          )}
        />
      </GridItem>
      <GridItem xs={12} sm={6}>
        <Controller
          name="first_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Keresztnév"
              margin="normal"
              fullWidth
              disabled={disabled}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          )}
        />
      </GridItem>
      <GridItem>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="email"
              label="E-mail cím"
              margin="normal"
              fullWidth
              disabled={disabled}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
      </GridItem>
      <GridItem>
        <Controller
          name="profile.phone_number"
          control={control}
          render={({ field }) => (
            <PhoneNumberInput
              {...field}
              type="tel"
              label="Telefonszám"
              margin="normal"
              fullWidth
              disabled={disabled}
              error={!!errors.profile?.phone_number}
              helperText={errors.profile?.phone_number?.message}
            />
          )}
        />
      </GridItem>
    </GridContainer>
  );
}

PersonalDetails.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.shape({
    last_name: PropTypes.string,
    first_name: PropTypes.string,
    email: PropTypes.string,
    profile: PropTypes.shape({ phone_number: PropTypes.string }),
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  isUser: PropTypes.bool.isRequired,
};
