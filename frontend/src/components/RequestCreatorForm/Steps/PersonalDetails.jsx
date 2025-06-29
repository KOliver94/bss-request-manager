import { yupResolver } from '@hookform/resolvers/yup';
import { TextField } from '@mui/material';
import Alert from '@mui/material/Alert';
import MUIButton from '@mui/material/Button';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';

import Button from 'components/material-kit-react/CustomButtons/Button';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import PhoneNumberInput from 'components/PhoneNumberInput';
import isValidPhone from 'helpers/yupPhoneNumberValidator';

import stylesModule from './PersonalDetails.module.scss';

Yup.addMethod(Yup.string, 'phone', isValidPhone);
const validationSchema = Yup.object({
  requester_first_name: Yup.string()
    .min(2, 'Túl rövid keresztnév!')
    .max(30, 'Túl hosszú keresztnév!')
    .trim()
    .required('A keresztnév megadása kötelező!'),
  requester_last_name: Yup.string()
    .min(2, 'Túl rövid vezetéknév!')
    .max(150, 'Túl hosszú vezetéknév!')
    .trim()
    .required('A vezetéknév megadása kötelező!'),
  requester_email: Yup.string()
    .email('Érvénytelen e-mail cím!')
    .required('Az e-mail cím megadása kötelező!'),
  requester_mobile: Yup.string()
    .phone('Érvénytelen telefonszám!')
    .required('A telefonszám megadása kötelező!'),
});

function PersonalDetails({
  formData,
  setFormData,
  handleNext,
  isAuthenticated,
}) {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: formData,
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = (data) => {
    setFormData(data);
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GridContainer sx={{ justifyContent: 'center' }}>
        <GridItem>
          {isAuthenticated ? (
            <Alert
              severity="warning"
              className={stylesModule.alert}
              action={
                <MUIButton
                  color="inherit"
                  size="small"
                  onClick={() => {
                    navigate('/profile');
                  }}
                >
                  Ugrás
                </MUIButton>
              }
            >
              Adataidat a profilodban módosíthatod.
            </Alert>
          ) : (
            <Alert
              severity="info"
              className={stylesModule.alert}
              action={
                <MUIButton
                  color="inherit"
                  size="small"
                  onClick={() => {
                    navigate('/login', {
                      state: { from: { pathname: '/new-request' } },
                    });
                  }}
                >
                  Ugrás
                </MUIButton>
              }
            >
              Jelentkezz be az oldalra, hogy követhesd a felkérésed aktuális
              státuszát, írhass hozzászólást és értékelhesd az elkészült videót.
            </Alert>
          )}
        </GridItem>
        <GridItem size={{ xs: 12, sm: 6 }}>
          <Controller
            name="requester_last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Vezetéknév"
                margin="normal"
                fullWidth
                disabled={isAuthenticated}
                error={!!errors.requester_last_name}
                helperText={errors.requester_last_name?.message}
              />
            )}
          />
        </GridItem>
        <GridItem size={{ xs: 12, sm: 6 }}>
          <Controller
            name="requester_first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Keresztnév"
                margin="normal"
                fullWidth
                disabled={isAuthenticated}
                error={!!errors.requester_first_name}
                helperText={errors.requester_first_name?.message}
              />
            )}
          />
        </GridItem>
        <GridItem>
          <Controller
            name="requester_email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                label="E-mail cím"
                margin="normal"
                fullWidth
                disabled={isAuthenticated}
                error={!!errors.requester_email}
                helperText={errors.requester_email?.message}
              />
            )}
          />
        </GridItem>
        <GridItem>
          <Controller
            name="requester_mobile"
            control={control}
            render={({ field }) => (
              <PhoneNumberInput
                {...field}
                type="tel"
                label="Telefonszám"
                margin="normal"
                fullWidth
                disabled={isAuthenticated}
                error={!!errors.requester_mobile}
                helperText={errors.requester_mobile?.message}
              />
            )}
          />
        </GridItem>
      </GridContainer>
      <GridContainer sx={{ justifyContent: 'center' }}>
        <GridItem size={{ xs: 12, sm: 12, md: 4 }}>
          <Button type="submit" color="primary" className={stylesModule.button}>
            Következő
          </Button>
        </GridItem>
      </GridContainer>
    </form>
  );
}

PersonalDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default PersonalDetails;
