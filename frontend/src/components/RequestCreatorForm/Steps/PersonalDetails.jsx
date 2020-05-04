import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
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

const phoneRegExp = /((?:\+?3|0)6)(?:-|\()?(\d{1,2})(?:-|\))?(\d{3})-?(\d{3,4})/;

const validationSchema = Yup.object({
  requester_first_name: Yup.string()
    .min(2, 'Túl rövid keresztnév!')
    .max(30, 'Túl hosszú keresztnév!')
    .required('A keresztnév megadása kötelező'),
  requester_last_name: Yup.string()
    .min(2, 'Túl rövid vezetéknév!')
    .max(150, 'Túl hosszú vezetéknév!')
    .required('A vezetéknév megadása kötelező'),
  requester_email: Yup.string()
    .email('Érvénytelen e-mail cím')
    .required('Az e-mail cím megadása kötelező'),
  requester_mobile: Yup.string()
    .matches(phoneRegExp, 'Érvénytelen telefonszám')
    .required('A telefonszám megadása kötelező'),
});

const PersonalDetails = ({ formData, setFormData, handleNext }) => {
  const classes = useStyles();
  return (
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
            <GridItem xs={10} sm={6}>
              <Field
                name="requester_last_name"
                label="Vezetéknév"
                margin="normal"
                component={TextField}
                variant="outlined"
                fullWidth
                error={
                  touched.requester_last_name && errors.requester_last_name
                }
                helperText={
                  touched.requester_last_name && errors.requester_last_name
                }
              />
            </GridItem>
            <GridItem xs={10} sm={6}>
              <Field
                name="requester_first_name"
                label="Keresztnév"
                margin="normal"
                component={TextField}
                variant="outlined"
                fullWidth
                error={
                  touched.requester_first_name && errors.requester_first_name
                }
                helperText={
                  touched.requester_first_name && errors.requester_first_name
                }
              />
            </GridItem>
            <GridItem xs={10} sm={12}>
              <Field
                type="email"
                name="requester_email"
                label="E-mail cím"
                margin="normal"
                component={TextField}
                variant="outlined"
                fullWidth
                error={touched.requester_email && errors.requester_email}
                helperText={touched.requester_email && errors.requester_email}
              />
            </GridItem>
            <GridItem xs={10} sm={12}>
              <Field
                name="requester_mobile"
                label="Telefonszám"
                margin="normal"
                component={TextField}
                variant="outlined"
                fullWidth
                error={touched.requester_mobile && errors.requester_mobile}
                helperText={touched.requester_mobile && errors.requester_mobile}
              />
            </GridItem>
          </GridContainer>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={4}>
              <Button type="submit" color="primary" className={classes.button}>
                Következő
              </Button>
            </GridItem>
          </GridContainer>
        </Form>
      )}
    </Formik>
  );
};

PersonalDetails.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default PersonalDetails;
