import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  button: {
    marginTop: '15px',
  },
}));

const OtherInformation = ({
  formData,
  setFormData,
  handleNext,
  handleBack,
}) => {
  const classes = useStyles();
  return (
    <Formik
      initialValues={formData}
      onSubmit={(values) => {
        setFormData(values);
        handleNext();
      }}
    >
      {() => (
        <Form>
          <GridContainer justify="center">
            <GridItem xs={10} sm={12}>
              <Field
                name="comment_text"
                label="Megjegyzések"
                margin="normal"
                component={TextField}
                variant="outlined"
                fullWidth
                multiline
                rows={10}
                placeholder="További fontos információk (esemény menetrendje időpontokkal, különleges igények, stb)"
              />
            </GridItem>
          </GridContainer>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12}>
              <Button onClick={handleBack} className={classes.button}>
                Vissza
              </Button>
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

OtherInformation.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default OtherInformation;
