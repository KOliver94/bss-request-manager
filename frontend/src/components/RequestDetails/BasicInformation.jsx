import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
// Material UI components
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import BackupIcon from '@material-ui/icons/Backup';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import MUITextField from '@material-ui/core/TextField';
// Material React Kit components
import Badge from 'components/material-kit-react/Badge/Badge';
// Form components
import { Formik, Form, Field } from 'formik';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';
import { DateTimePicker } from 'formik-material-ui-pickers';
import { Autocomplete } from 'formik-material-ui-lab';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import * as Yup from 'yup';
// Date format
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import { updateRequestAdmin, deleteRequestAdmin } from 'api/requestAdminApi';
import { requestEnumConverter } from 'api/enumConverter';

const useStyles = makeStyles(() => ({
  title: {
    padding: '10px 15px',
  },
  paper: {
    padding: '15px',
    margin: '16px',
  },
  statusBadge: {
    padding: '10px 15px',
    display: 'flex',
    alignSelf: 'center',
  },
  form: {
    margin: 0,
  },
  formSection: {
    padding: '15px 0px',
  },
  formSectionFirst: {
    paddingBottom: '15px',
  },
  formSectionLast: {
    paddingTop: '15px',
  },
}));

export default function BasicInformation({
  requestId,
  requestData,
  setRequestData,
  staffMembers,
  isAdmin,
}) {
  const classes = useStyles();
  const formRef = useRef();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(1, 'Az esemény neve túl rövid!')
      .max(200, 'Az esemény neve túl hosszú!')
      .required('Az esemény nevének megadása kötelező'),
    start_datetime: Yup.date()
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

  const handleEditing = () => {
    if (formRef.current && editing) {
      formRef.current.submitForm();
    } else {
      setEditing(!editing);
    }
  };

  const handleDiscard = () => {
    setEditing(!editing);
  };

  const handleSubmit = async (val) => {
    const values = val;
    if (values.responsible_id !== undefined) {
      values.responsible_id = values.responsible_id && values.responsible_id.id;
    }
    setLoading(true);
    try {
      await updateRequestAdmin(requestId, values).then((response) => {
        setLoading(false);
        setRequestData(response.data);
        setEditing(!editing);
      });
    } catch (e) {
      enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRequestAdmin(requestId).then(() => {
        history.replace('/admin/requests');
      });
    } catch (e) {
      enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              Alapinformációk
            </Typography>
          </Grid>
          <div className={classes.statusBadge}>
            <Badge color="primary">
              {requestEnumConverter(requestData.status)}
            </Badge>
          </div>
          {isAdmin && (
            <Grid item>
              <IconButton onClick={handleEditing} disabled={loading}>
                {editing ? <CheckIcon /> : <EditIcon />}
              </IconButton>
              {editing ? (
                <IconButton onClick={handleDiscard} disabled={loading}>
                  <ClearIcon />
                </IconButton>
              ) : (
                <IconButton onClick={handleDelete} disabled={loading}>
                  <DeleteForeverIcon />
                </IconButton>
              )}
            </Grid>
          )}
        </Grid>
      </div>
      <Divider variant="middle" />
      <Paper className={classes.paper} elevation={2}>
        {editing ? (
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={hu}>
            <Formik
              initialValues={requestData}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
              innerRef={formRef}
            >
              {({ errors, touched }) => (
                <Form className={classes.form}>
                  <div className={classes.formSectionFirst}>
                    <Typography variant="h6">Részletek</Typography>
                    {localStorage.getItem('role') === 'admin' && (
                      <>
                        <Field
                          name="additional_data.accepted"
                          Label={{ label: 'Elfogadva' }}
                          component={CheckboxWithLabel}
                          type="checkbox"
                          icon={<SentimentVeryDissatisfiedIcon />}
                          checkedIcon={<SentimentVerySatisfiedIcon />}
                          indeterminateIcon={<RadioButtonUncheckedIcon />}
                        />
                        <Field
                          name="additional_data.canceled"
                          Label={{ label: 'Lemondva' }}
                          component={CheckboxWithLabel}
                          type="checkbox"
                          icon={<RadioButtonUncheckedIcon />}
                          checkedIcon={<NotInterestedIcon />}
                          indeterminateIcon={<RadioButtonUncheckedIcon />}
                        />
                        <Field
                          name="additional_data.failed"
                          Label={{ label: 'Meghiúsult' }}
                          component={CheckboxWithLabel}
                          type="checkbox"
                          icon={<RadioButtonUncheckedIcon />}
                          checkedIcon={<ErrorOutlineIcon />}
                          indeterminateIcon={<RadioButtonUncheckedIcon />}
                        />
                      </>
                    )}
                    <Field
                      name="responsible_id"
                      component={Autocomplete}
                      options={staffMembers}
                      getOptionLabel={(option) =>
                        `${option.last_name} ${option.first_name}`
                      }
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      defaultValue={
                        requestData.responsible ? requestData.responsible : null
                      }
                      autoHighlight
                      clearOnEscape
                      fullWidth
                      renderInput={(params) => (
                        <MUITextField
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...params}
                          label="Felelős"
                          variant="outlined"
                          margin="normal"
                        />
                      )}
                    />
                  </div>
                  <Divider />
                  <div className={classes.formSection}>
                    <Typography variant="h6">Nyersek</Typography>
                    <Field
                      name="additional_data.recording.copied_to_gdrive"
                      Label={{ label: 'Google Driveba felmásolva' }}
                      component={CheckboxWithLabel}
                      type="checkbox"
                      icon={<BackupIcon />}
                      checkedIcon={<CloudDoneIcon />}
                      indeterminateIcon={<BackupIcon />}
                    />
                    <Field
                      name="additional_data.recording.removed"
                      Label={{ label: 'Törölve' }}
                      component={CheckboxWithLabel}
                      type="checkbox"
                      icon={<DeleteOutlineIcon />}
                      checkedIcon={<DeleteIcon />}
                      indeterminateIcon={<DeleteOutlineIcon />}
                    />
                    <Field
                      name="additional_data.recording.path"
                      label="Nyersek helye"
                      margin="normal"
                      component={TextField}
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                  <Divider />
                  <div className={classes.formSectionLast}>
                    <Typography variant="h6">Alapinformációk</Typography>
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
                    <Field
                      name="start_datetime"
                      label="Kezdés időpontja"
                      margin="normal"
                      component={DateTimePicker}
                      inputVariant="outlined"
                      value=""
                      ampm={false}
                      format="yyyy. MMMM dd. HH:mm"
                      fullWidth
                      error={touched.start_datetime && errors.start_datetime}
                      helperText={
                        touched.start_datetime && errors.start_datetime
                      }
                    />
                    <Field
                      name="end_datetime"
                      label="Várható befejezés"
                      margin="normal"
                      component={DateTimePicker}
                      inputVariant="outlined"
                      ampm={false}
                      format="yyyy. MMMM dd. HH:mm"
                      fullWidth
                      error={touched.end_datetime && errors.end_datetime}
                      helperText={touched.end_datetime && errors.end_datetime}
                    />
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
                  </div>
                </Form>
              )}
            </Formik>
          </MuiPickersUtilsProvider>
        ) : (
          <>
            <p>
              Esemény neve: <b>{requestData.title}</b>
            </p>
            <p>
              Beküldve:{' '}
              <b>
                {format(
                  new Date(requestData.created),
                  'yyyy. MMMM d. (eeee) | H:mm',
                  {
                    locale: hu,
                  }
                )}
              </b>
            </p>
            <p>
              Kezdés időpontja:{' '}
              <b>
                {format(
                  new Date(requestData.start_datetime),
                  'yyyy. MMMM d. (eeee) | H:mm',
                  { locale: hu }
                )}
              </b>
            </p>
            <p>
              Várható befejezés:{' '}
              <b>
                {format(
                  new Date(requestData.end_datetime),
                  'yyyy. MMMM d. (eeee) | H:mm',
                  { locale: hu }
                )}
              </b>
            </p>
            <p>
              Helyszín: <b>{requestData.place}</b>
            </p>
            <p>
              Videó típusa: <b>{requestData.type}</b>
            </p>
            <p>
              Felkérő:{' '}
              <b>
                {`${requestData.requester.last_name} ${requestData.requester.first_name}`}
              </b>
              <br />
              <b>
                (
                <a href={`mailto:${requestData.requester.email}`}>
                  {requestData.requester.email}
                </a>
                {requestData.requester.userprofile.phone_number && (
                  <>
                    {', '}
                    <a
                      href={`tel:${requestData.requester.userprofile.phone_number}`}
                    >
                      {requestData.requester.userprofile.phone_number}
                    </a>
                  </>
                )}
                )
              </b>
            </p>
            <p>
              Felelős:{' '}
              {requestData.responsible && (
                <>
                  <b>
                    {`${requestData.responsible.last_name} ${requestData.responsible.first_name}`}
                  </b>
                  <br />
                  <b>
                    (
                    <a href={`mailto:${requestData.responsible.email}`}>
                      {requestData.responsible.email}
                    </a>
                    {requestData.responsible.userprofile.phone_number && (
                      <>
                        {', '}
                        <a
                          href={`tel:${requestData.responsible.userprofile.phone_number}`}
                        >
                          {requestData.responsible.userprofile.phone_number}
                        </a>
                      </>
                    )}
                    )
                  </b>
                </>
              )}
            </p>
          </>
        )}
      </Paper>
    </div>
  );
}

BasicInformation.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
  staffMembers: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
