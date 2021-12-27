import PropTypes from 'prop-types';
// @mui components
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
// core components
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
// Formik
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import PhoneNumberInput from 'components/PhoneNumberInput';

import styles from 'assets/jss/material-kit-react/views/profilePage';

const useStyles = makeStyles(styles);

export default function PersonalDetails({ errors, touched, disabled, isUser }) {
  const classes = useStyles();
  const theme = useTheme();
  const isMobileView = !useMediaQuery(theme.breakpoints.up('md'));

  return (
    <GridContainer justifyContent="center">
      <GridItem>
        {!isUser && (
          <Alert
            severity="warning"
            className={isMobileView ? classes.alertAdMobile : classes.alertAd}
          >
            Adataidat az Active Directoryban kell módosítani.
          </Alert>
        )}
      </GridItem>
      <GridItem xs={12} sm={6}>
        <Field
          name="last_name"
          label="Vezetéknév"
          margin="normal"
          component={TextField}
          fullWidth
          disabled={disabled}
          error={touched.last_name && !!errors.last_name}
          helperText={touched.last_name && errors.last_name}
        />
      </GridItem>
      <GridItem xs={12} sm={6}>
        <Field
          name="first_name"
          label="Keresztnév"
          margin="normal"
          component={TextField}
          fullWidth
          disabled={disabled}
          error={touched.first_name && !!errors.first_name}
          helperText={touched.first_name && errors.first_name}
        />
      </GridItem>
      <GridItem>
        <Field
          type="email"
          name="email"
          label="E-mail cím"
          margin="normal"
          component={TextField}
          fullWidth
          disabled={disabled}
          error={touched.email && !!errors.email}
          helperText={touched.email && errors.email}
        />
      </GridItem>
      <GridItem>
        <Field
          name="phone_number"
          label="Telefonszám"
          margin="normal"
          component={PhoneNumberInput}
          variant="outlined"
          fullWidth
          disabled={disabled}
          error={touched.phone_number && !!errors.phone_number}
          helperText={touched.phone_number && errors.phone_number}
        />
      </GridItem>
    </GridContainer>
  );
}

PersonalDetails.propTypes = {
  errors: PropTypes.shape({
    last_name: PropTypes.string,
    first_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
  }).isRequired,
  touched: PropTypes.shape({
    last_name: PropTypes.bool,
    first_name: PropTypes.bool,
    email: PropTypes.bool,
    phone_number: PropTypes.bool,
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  isUser: PropTypes.bool.isRequired,
};
