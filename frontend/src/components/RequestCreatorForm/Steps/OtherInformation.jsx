import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import Button from 'src/components/material-kit-react/CustomButtons/Button';

import stylesModule from './OtherInformation.module.css';

function OtherInformation({ formData, setFormData, handleNext, handleBack }) {
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
          <GridContainer justifyContent="center">
            <GridItem>
              <Field
                name="comment_text"
                label="Megjegyzések"
                margin="normal"
                component={TextField}
                fullWidth
                multiline
                rows={10}
                placeholder="További fontos információk (esemény menetrendje időpontokkal, különleges igények, pontos helyszín, stb)"
              />
            </GridItem>
          </GridContainer>
          <GridContainer justifyContent="center">
            <GridItem>
              <Button onClick={handleBack} className={stylesModule.button}>
                Vissza
              </Button>
              <Button
                type="submit"
                color="primary"
                className={stylesModule.button}
              >
                Következő
              </Button>
            </GridItem>
          </GridContainer>
        </Form>
      )}
    </Formik>
  );
}

OtherInformation.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default OtherInformation;
