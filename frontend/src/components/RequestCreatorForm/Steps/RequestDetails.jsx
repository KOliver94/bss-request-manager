import PropTypes from 'prop-types';
import { Formik, Form, Field, getIn } from 'formik';
import { Autocomplete, TextField } from 'formik-mui';
import { DateTimePicker } from 'formik-mui-x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { hu } from 'date-fns/locale';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';
import MUITextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material/Autocomplete';
import makeStyles from '@mui/styles/makeStyles';
import * as Yup from 'yup';
import { requestTypes } from 'helpers/enumConstants';

const useStyles = makeStyles(() => ({
  button: {
    marginTop: '15px',
  },
}));

const filter = createFilterOptions();

const validationSchema = Yup.object({
  title: Yup.string()
    .min(1, 'Az esemény neve túl rövid!')
    .max(200, 'Az esemény neve túl hosszú!')
    .trim()
    .required('Az esemény nevének megadása kötelező!'),
  start_datetime: Yup.date()
    .min(new Date(), 'A mostaninál korábbi időpont nem adható meg!')
    .required('A kezdés időpontjának megadása kötelező!')
    .nullable()
    .typeError('Hibás dátum formátum!'),
  end_datetime: Yup.date()
    .min(
      Yup.ref('start_datetime'),
      'A befejezés időpontja nem lehet korábbi mint a kezdés!'
    )
    .required('A várható befejezés megadása kötelező!')
    .nullable()
    .typeError('Hibás dátum formátum!'),
  place: Yup.string()
    .min(1, 'Túl rövid helyszín!')
    .max(150, 'Túl hosszú helyszín!')
    .trim()
    .required('A helyszín megadása kötelező!'),
  type_obj: Yup.object()
    .shape({
      text: Yup.string()
        .min(1, 'Túl rövid típus!')
        .max(50, 'Túl hosszú típus!')
        .trim(),
    })
    .required('A videó típusának megadása kötelező!')
    .nullable(),
});

function RequestDetails({ formData, setFormData, handleNext, handleBack }) {
  const classes = useStyles();
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hu}>
      <Formik
        initialValues={formData}
        onSubmit={(values) => {
          setFormData(values);
          handleNext();
        }}
        validationSchema={validationSchema}
      >
        {({ errors, touched }) => (
          <Form>
            <GridContainer justifyContent="center">
              <GridItem>
                <Field
                  name="title"
                  label="Esemény neve"
                  margin="normal"
                  component={TextField}
                  fullWidth
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <Field
                  name="start_datetime"
                  label="Kezdés időpontja"
                  toolbarTitle="Esemény kezdésének időpontja"
                  okText="Rendben"
                  cancelText="Mégsem"
                  clearText="Törlés"
                  component={DateTimePicker}
                  clearable
                  disablePast
                  inputFormat="yyyy.MM.dd. HH:mm"
                  mask="____.__.__. __:__"
                  textField={{
                    margin: 'normal',
                    fullWidth: true,
                    error: touched.start_datetime && !!errors.start_datetime,
                    helperText: touched.start_datetime && errors.start_datetime,
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <Field
                  name="end_datetime"
                  label="Várható befejezés"
                  toolbarTitle="Esemény végének időpontja"
                  okText="Rendben"
                  cancelText="Mégsem"
                  clearText="Törlés"
                  component={DateTimePicker}
                  clearable
                  disablePast
                  inputFormat="yyyy.MM.dd. HH:mm"
                  mask="____.__.__. __:__"
                  textField={{
                    margin: 'normal',
                    fullWidth: true,
                    error: touched.end_datetime && !!errors.end_datetime,
                    helperText: touched.end_datetime && errors.end_datetime,
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <Field
                  name="place"
                  label="Helyszín"
                  margin="normal"
                  component={TextField}
                  fullWidth
                  error={touched.place && !!errors.place}
                  helperText={touched.place && errors.place}
                />
              </GridItem>
              <GridItem xs={12} sm={6}>
                <Field
                  name="type_obj"
                  component={Autocomplete}
                  options={requestTypes}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    const { inputValue } = params;
                    // Suggest the creation of a new value
                    const isExisting = options.some(
                      (option) => inputValue === option.title
                    );
                    if (inputValue !== '' && !isExisting) {
                      filtered.push({
                        text: inputValue,
                        label: `Egyéb: "${inputValue}"`,
                      });
                    }

                    return filtered;
                  }}
                  getOptionLabel={(option) => option.text}
                  renderOption={(props, option) => {
                    // Add "xxx" option created dynamically
                    if (option.label) {
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      return <li {...props}>{option.label}</li>;
                    }
                    // Regular option
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    return <li {...props}>{option.text}</li>;
                  }}
                  fullWidth
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  freeSolo
                  autoComplete
                  autoHighlight
                  renderInput={(params) => (
                    <MUITextField
                      {...params}
                      name="type_obj"
                      label="Videó típusa"
                      margin="normal"
                      error={touched.type_obj && !!errors.type_obj}
                      helperText={
                        touched.type_obj &&
                        (getIn(errors, 'type_obj.text') ||
                          getIn(errors, 'type_obj'))
                      }
                    />
                  )}
                />
              </GridItem>
            </GridContainer>
            <GridContainer justifyContent="center">
              <GridItem>
                <Button onClick={handleBack} className={classes.button}>
                  Vissza
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className={classes.button}
                >
                  Következő
                </Button>
              </GridItem>
            </GridContainer>
          </Form>
        )}
      </Formik>
    </LocalizationProvider>
  );
}

RequestDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default RequestDetails;
