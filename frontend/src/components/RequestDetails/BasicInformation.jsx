import { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
// Material UI components
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import VisibilityIcon from '@material-ui/icons/Visibility';
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
import Avatar from '@material-ui/core/Avatar';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';
import MUITextField from '@material-ui/core/TextField';
// Form components
import { Formik, Form, Field } from 'formik';
import { TextField, CheckboxWithLabel, Select } from 'formik-material-ui';
import { DatePicker, DateTimePicker } from 'formik-material-ui-pickers';
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
import {
  getRequestAdmin,
  updateRequestAdmin,
  deleteRequestAdmin,
} from 'api/requestAdminApi';
import { getRequest } from 'api/requestApi';
import { isAdmin, isPrivileged as isPrivilegedCheck } from 'api/loginApi';
import { requestStatuses } from 'api/enumConstants';
import handleError from 'api/errorHandler';

const useStyles = makeStyles((theme) => ({
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
  afterDivider: {
    marginTop: 10,
  },
  smallAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: 5,
  },
}));

export default function BasicInformation({
  requestId,
  requestData,
  setRequestData,
  staffMembers,
  isPrivileged,
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
      .trim()
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
      .trim()
      .required('A helyszín megadása kötelező'),
    type: Yup.string()
      .min(1, 'Túl rövid típus!')
      .max(50, 'Túl hosszú típus!')
      .trim()
      .required('A videó típusának megadása kötelező'),
    deadline: Yup.date()
      .min(
        Yup.ref('end_datetime'),
        'A határidőnek a felkérés várható befejezése után kell lennie!'
      )
      .required('A várható befejezés megadása kötelező')
      .nullable(),
  });

  const handleReload = async () => {
    setLoading(true);
    try {
      if (isPrivileged) {
        await getRequestAdmin(requestId).then((response) => {
          setLoading(false);
          setRequestData(response.data);
        });
      } else {
        await getRequest(requestId).then((response) => {
          setLoading(false);
          setRequestData(response.data);
        });
      }
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
    }
  };

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
    if (values.responsible_id) {
      values.responsible_id = values.responsible_id.id;
    }
    if (values.deadline && typeof values.deadline.getMonth === 'function') {
      // eslint-disable-next-line prefer-destructuring
      values.deadline = values.deadline.toISOString().split('T')[0];
    }
    if (
      values.additional_data.status_by_admin &&
      values.additional_data.status_by_admin.status !== undefined
    ) {
      values.additional_data.status_by_admin.admin_id = parseInt(
        localStorage.getItem('user_id'),
        10
      );
      values.additional_data.status_by_admin.admin_name = localStorage.getItem(
        'name'
      );
    }
    setLoading(true);
    try {
      await updateRequestAdmin(requestId, values).then((response) => {
        setLoading(false);
        setRequestData(response.data);
        setEditing(!editing);
      });
    } catch (e) {
      enqueueSnackbar(handleError(e), {
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
      enqueueSnackbar(handleError(e), {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
    }
  };

  const changeView = () => {
    if (isPrivileged) {
      history.replace(`/my-requests/${requestId}`);
    } else {
      history.replace(`/admin/requests/${requestId}`);
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
          <Grid item>
            {!editing &&
              isPrivilegedCheck() &&
              requestData.requester.id.toString() ===
                localStorage.getItem('user_id') && (
                <Tooltip
                  title={
                    isPrivileged
                      ? 'Megtekintés felkérőként'
                      : 'Megtekintés adminként'
                  }
                  placement="top"
                  arrow
                >
                  <span>
                    <IconButton onClick={changeView} disabled={loading}>
                      <VisibilityIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            {!editing && (
              <Tooltip title="Frissítés" placement="top" arrow>
                <span>
                  <IconButton onClick={handleReload} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isPrivileged && (
              <>
                <Tooltip
                  title={editing ? 'Mentés' : 'Szerkesztés'}
                  placement="top"
                  arrow
                >
                  <span>
                    <IconButton onClick={handleEditing} disabled={loading}>
                      {editing ? <CheckIcon /> : <EditIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                {editing ? (
                  <Tooltip title="Elvetés" placement="top" arrow>
                    <span>
                      <IconButton onClick={handleDiscard} disabled={loading}>
                        <ClearIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Törlés" placement="top" arrow>
                    <span>
                      <IconButton onClick={handleDelete} disabled={loading}>
                        <DeleteForeverIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </>
            )}
          </Grid>
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
                    <Field
                      name="additional_data.accepted"
                      Label={{ label: 'Elfogadva' }}
                      component={CheckboxWithLabel}
                      type="checkbox"
                      icon={<SentimentVeryDissatisfiedIcon />}
                      checkedIcon={<SentimentVerySatisfiedIcon />}
                      indeterminateIcon={<RadioButtonUncheckedIcon />}
                      disabled={!isAdmin()}
                    />
                    <Field
                      name="additional_data.canceled"
                      Label={{ label: 'Lemondva' }}
                      component={CheckboxWithLabel}
                      type="checkbox"
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<NotInterestedIcon />}
                      indeterminateIcon={<RadioButtonUncheckedIcon />}
                      disabled={!isAdmin()}
                    />
                    <Field
                      name="additional_data.failed"
                      Label={{ label: 'Meghiúsult' }}
                      component={CheckboxWithLabel}
                      type="checkbox"
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<ErrorOutlineIcon />}
                      indeterminateIcon={<RadioButtonUncheckedIcon />}
                      disabled={!isAdmin()}
                    />
                    <FormControl fullWidth variant="outlined" margin="normal">
                      <InputLabel htmlFor="additional_data.status_by_admin.status">
                        Státusz felülírás
                      </InputLabel>
                      <Field
                        labelId="additional_data.status_by_admin.status"
                        label="Státusz felülírás"
                        name="additional_data.status_by_admin.status"
                        component={Select}
                        defaultValue={null}
                        disabled={!isAdmin()}
                      >
                        <MenuItem value={null}>
                          <em>Nincs</em>
                        </MenuItem>
                        {requestStatuses.map((status) => {
                          return (
                            <MenuItem key={status.id} value={status.id}>
                              {status.text}
                            </MenuItem>
                          );
                        })}
                      </Field>
                      {requestData.additional_data &&
                        requestData.additional_data.status_by_admin &&
                        requestData.additional_data.status_by_admin
                          .admin_name && (
                          <FormHelperText>
                            Utoljára módosította:{' '}
                            {
                              requestData.additional_data.status_by_admin
                                .admin_name
                            }
                          </FormHelperText>
                        )}
                    </FormControl>
                    <Field
                      name="responsible_id"
                      component={Autocomplete}
                      options={staffMembers}
                      getOptionLabel={(option) =>
                        `${option.last_name} ${option.first_name}`
                      }
                      renderOption={(option) => {
                        return (
                          <>
                            <Avatar
                              alt={`${option.first_name} ${option.last_name}`}
                              src={option.profile.avatar_url}
                              className={classes.smallAvatar}
                            />
                            {`${option.last_name} ${option.first_name}`}
                          </>
                        );
                      }}
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
                    <Field
                      name="deadline"
                      label="Határidő"
                      margin="normal"
                      component={DatePicker}
                      inputVariant="outlined"
                      format="yyyy. MMMM dd."
                      fullWidth
                      error={touched.deadline && !!errors.deadline}
                      helperText={touched.deadline && errors.deadline}
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
                      error={touched.title && !!errors.title}
                      helperText={touched.title && errors.title}
                    />
                    <Field
                      name="start_datetime"
                      label="Kezdés időpontja"
                      margin="normal"
                      component={DateTimePicker}
                      inputVariant="outlined"
                      ampm={false}
                      format="yyyy. MMMM dd. HH:mm"
                      fullWidth
                      error={touched.start_datetime && !!errors.start_datetime}
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
                      error={touched.end_datetime && !!errors.end_datetime}
                      helperText={touched.end_datetime && errors.end_datetime}
                    />
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
                    <Field
                      name="type"
                      label="Videó típusa"
                      margin="normal"
                      component={TextField}
                      variant="outlined"
                      fullWidth
                      error={touched.type && !!errors.type}
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
                {requestData.requester.profile.phone_number && (
                  <>
                    {', '}
                    <a
                      href={`tel:${requestData.requester.profile.phone_number}`}
                    >
                      {requestData.requester.profile.phone_number}
                    </a>
                  </>
                )}
                )
              </b>
            </p>
            <Divider />
            <p className={classes.afterDivider}>
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
            {isPrivileged && (
              <>
                <p>
                  Határidő:{' '}
                  <b>
                    {format(
                      new Date(requestData.deadline),
                      'yyyy. MMMM d. (eeee)',
                      { locale: hu }
                    )}
                  </b>
                </p>
                {requestData.additional_data &&
                  requestData.additional_data.recording &&
                  requestData.additional_data.recording.path && (
                    <p>
                      Nyersek helye:{' '}
                      <b>{requestData.additional_data.recording.path}</b>
                    </p>
                  )}
              </>
            )}
            {requestData.responsible && (
              <p>
                Felelős:{' '}
                <b>
                  {`${requestData.responsible.last_name} ${requestData.responsible.first_name}`}
                </b>
                <br />
                <b>
                  (
                  <a href={`mailto:${requestData.responsible.email}`}>
                    {requestData.responsible.email}
                  </a>
                  {requestData.responsible.profile.phone_number && (
                    <>
                      {', '}
                      <a
                        href={`tel:${requestData.responsible.profile.phone_number}`}
                      >
                        {requestData.responsible.profile.phone_number}
                      </a>
                    </>
                  )}
                  )
                </b>
              </p>
            )}
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
  isPrivileged: PropTypes.bool.isRequired,
};
