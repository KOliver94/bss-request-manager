import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';

import { TextField } from '@mui/material';
import stylesModule from './OtherInformation.module.scss';

function OtherInformation({ formData, setFormData, handleNext, handleBack }) {
  const { control, handleSubmit } = useForm({
    defaultValues: formData,
  });

  const onSubmit = (data) => {
    setFormData(data);
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GridContainer justifyContent="center">
        <GridItem>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Megjegyzések"
                margin="normal"
                fullWidth
                multiline
                rows={10}
                placeholder="További fontos információk (esemény menetrendje időpontokkal, különleges igények, pontos helyszín, stb)"
              />
            )}
          />
        </GridItem>
      </GridContainer>
      <GridContainer justifyContent="center">
        <GridItem>
          <Button onClick={handleBack} className={stylesModule.button}>
            Vissza
          </Button>
          <Button type="submit" color="primary" className={stylesModule.button}>
            Következő
          </Button>
        </GridItem>
      </GridContainer>
    </form>
  );
}

OtherInformation.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default OtherInformation;
