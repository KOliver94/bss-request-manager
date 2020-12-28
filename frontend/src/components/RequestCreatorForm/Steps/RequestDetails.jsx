import PropTypes from 'prop-types';
import { Formik, Form, Field, getIn } from 'formik';
import { TextField } from 'formik-material-ui';
import { DateTimePicker } from 'formik-material-ui-pickers';
import { Autocomplete } from 'formik-material-ui-lab';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { hu } from 'date-fns/locale';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';
import MUITextField from '@material-ui/core/TextField';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import * as Yup from 'yup';
import { requestTypes } from 'api/enumConstants';

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
    .required('Az esemény nevének megadása kötelező'),
  start_datetime: Yup.date()
    .min(new Date(), 'A mostaninál korábbi időpont nem adható meg!')
    .required('A kezdés időpontjának megadása kötelező')
    .nullable(),
  end_datetime: Yup.date()
    .min(
      Yup.ref('start_datetime'),
      'A befejezés időpontja nem lehet korábbi mint a kezdés!'
    )
    .required('A várható befejezés megadása kötelező')
    .nullable(),
  place: Yup.string()
    .min(1, 'Túl rövid helyszín!')
    .max(150, 'Túl hosszú helyszín!')
    .trim()
    .required('A helyszín megadása kötelező'),
  type_obj: Yup.object()
    .shape({
      text: Yup.string()
        .min(1, 'Túl rövid típus!')
        .max(50, 'Túl hosszú típus!')
        .trim(),
    })
    .required('A videó típusának megadása kötelező')
    .nullable(),
});

const RequestDetails = ({ formData, setFormData, handleNext, handleBack }) => {
  const classes = useStyles();
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={hu}>
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
            <GridContainer justify="center">
              <GridItem xs={10} sm={12}>
                <Field
                  name="title"
                  label="Esemény neve"
                  margin="normal"
                  component={TextField}
                  variant="outlined"
                  fullWidth
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                />
              </GridItem>
              <GridItem xs={10} sm={6}>
                <Field
                  name="start_datetime"
                  label="Kezdés időpontja"
                  margin="normal"
                  component={DateTimePicker}
                  inputVariant="outlined"
                  clearable
                  ampm={false}
                  disablePast
                  fullWidth
                  error={touched.start_datetime && !!errors.start_datetime}
                  helperText={touched.start_datetime && errors.start_datetime}
                />
              </GridItem>
              <GridItem xs={10} sm={6}>
                <Field
                  name="end_datetime"
                  label="Várható befejezés"
                  margin="normal"
                  component={DateTimePicker}
                  inputVariant="outlined"
                  clearable
                  ampm={false}
                  disablePast
                  fullWidth
                  error={touched.end_datetime && !!errors.end_datetime}
                  helperText={touched.end_datetime && errors.end_datetime}
                />
              </GridItem>
              <GridItem xs={10} sm={6}>
                <Field
                  name="place"
                  label="Helyszín"
                  margin="normal"
                  component={TextField}
                  variant="outlined"
                  fullWidth
                  error={touched.place && !!errors.place}
                  helperText={touched.place && errors.place}
                />
              </GridItem>
              <GridItem xs={10} sm={6}>
                <Field
                  name="type_obj"
                  component={Autocomplete}
                  options={requestTypes}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    // Suggest the creation of a new value
                    if (params.inputValue !== '') {
                      filtered.push({
                        text: params.inputValue,
                        label: `Egyéb: "${params.inputValue}"`,
                      });
                    }

                    return filtered;
                  }}
                  getOptionLabel={(option) => option.text}
                  renderOption={(option) => {
                    // Add "xxx" option created dynamically
                    if (option.label) {
                      return option.label;
                    }
                    // Regular option
                    return option.text;
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
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...params}
                      name="type_obj"
                      label="Videó típusa"
                      margin="normal"
                      variant="outlined"
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
            <GridContainer justify="center">
              <GridItem xs={12} sm={12}>
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
    </MuiPickersUtilsProvider>
  );
};

RequestDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default RequestDetails;
