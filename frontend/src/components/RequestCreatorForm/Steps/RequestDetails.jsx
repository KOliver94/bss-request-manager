import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { DateTimePicker } from 'formik-material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { hu } from 'date-fns/locale';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';
import { makeStyles } from '@material-ui/core/styles';
import * as Yup from 'yup';

const useStyles = makeStyles(() => ({
  button: {
    marginTop: '15px',
  },
}));

const validationSchema = Yup.object({
  title: Yup.string()
    .min(1, 'Az esemény neve túl rövid!')
    .max(200, 'Az esemény neve túl hosszú!')
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
    .required('A helyszín megadása kötelező'),
  type: Yup.string()
    .min(1, 'Túl rövid típus!')
    .max(50, 'Túl hosszú típus!')
    .required('A videó típusának megadása kötelező'),
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
                  error={touched.title && errors.title}
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
                  error={touched.start_datetime && errors.start_datetime}
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
                  error={touched.end_datetime && errors.end_datetime}
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
                  error={touched.place && errors.place}
                  helperText={touched.place && errors.place}
                />
              </GridItem>
              <GridItem xs={10} sm={6}>
                <Field
                  name="type"
                  label="Videó típusa"
                  margin="normal"
                  component={TextField}
                  variant="outlined"
                  fullWidth
                  error={touched.type && errors.type}
                  helperText={touched.type && errors.type}
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
