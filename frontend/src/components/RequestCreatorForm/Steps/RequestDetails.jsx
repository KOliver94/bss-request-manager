import { yupResolver } from '@hookform/resolvers/yup';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { hu } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';

import Button from 'components/material-kit-react/CustomButtons/Button';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import { requestTypes } from 'helpers/enumConstants';

import stylesModule from './RequestDetails.module.scss';

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
    .typeError('Hibás dátum formátum!'),
  end_datetime: Yup.date()
    .min(
      Yup.ref('start_datetime'),
      'A befejezés időpontja nem lehet korábbi mint a kezdés!',
    )
    .required('A várható befejezés megadása kötelező!')
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
    .required('A videó típusának megadása kötelező!'),
});

function RequestDetails({ formData, setFormData, handleNext, handleBack }) {
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hu}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer justifyContent="center">
          <GridItem>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Esemény neve"
                  margin="normal"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Controller
              name="start_datetime"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label="Kezdés időpontja"
                  disablePast
                  slotProps={{
                    textField: {
                      margin: 'normal',
                      fullWidth: true,
                      error: !!errors.start_datetime,
                      helperText: errors.start_datetime?.message,
                    },
                  }}
                />
              )}
            />
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Controller
              name="end_datetime"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label="Várható befejezés"
                  disablePast
                  slotProps={{
                    textField: {
                      margin: 'normal',
                      fullWidth: true,
                      error: !!errors.end_datetime,
                      helperText: errors.end_datetime?.message,
                    },
                  }}
                />
              )}
            />
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Controller
              name="place"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Helyszín"
                  margin="normal"
                  fullWidth
                  error={!!errors.place}
                  helperText={errors.place?.message}
                />
              )}
            />
          </GridItem>
          <GridItem xs={12} sm={6}>
            <Controller
              name="type_obj"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={requestTypes}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    const { inputValue } = params;
                    // Suggest the creation of a new value
                    const isExisting = options.some(
                      (option) => inputValue === option.title,
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
                      return (
                        <li {...props} key={option.label}>
                          {option.label}
                        </li>
                      );
                    }
                    // Regular option
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    return (
                      <li {...props} key={option.text}>
                        {option.text}
                      </li>
                    );
                  }}
                  fullWidth
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  freeSolo
                  autoComplete
                  autoHighlight
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="type_obj"
                      label="Videó típusa"
                      margin="normal"
                      error={!!errors.type_obj}
                      helperText={errors.type_obj?.message}
                    />
                  )}
                  onChange={(e, value) => field.onChange(value)}
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
            <Button
              type="submit"
              color="primary"
              className={stylesModule.button}
            >
              Következő
            </Button>
          </GridItem>
        </GridContainer>
      </form>
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
