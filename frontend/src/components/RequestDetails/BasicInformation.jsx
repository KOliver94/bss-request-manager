import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// Material UI components
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
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
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
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
import { requestStatuses } from 'helpers/enumConstants';
import handleError from 'helpers/errorHandler';
import ConditionalWrapper from 'components/ConditionalWrapper';

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
  chip: {
    marginBottom: 10,
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
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

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
    if (values.responsible !== undefined) {
      values.responsible_id = values.responsible ? values.responsible.id : null;
    }
    if (values.deadline && typeof values.deadline.getMonth === 'function') {
      // eslint-disable-next-line prefer-destructuring
      values.deadline = values.deadline.toISOString().split('T')[0];
    }
    if (
      values.status_field !== undefined &&
      (values.additional_data.status_by_admin || values.status_field)
    ) {
      values.additional_data.status_by_admin = {
        status: values.status_field ? values.status_field : null,
        admin_id: parseInt(localStorage.getItem('user_id'), 10),
        admin_name: localStorage.getItem('name'),
      };
    }
    if (values.recording_path !== undefined) {
      if (values.additional_data.recording) {
        values.additional_data.recording.path = values.recording_path;
      } else {
        values.additional_data.recording = {
          path: values.recording_path,
        };
      }
    }
    setLoading(true);
    try {
      await updateRequestAdmin(requestId, values).then((response) => {
        setLoading(false);
        setEditing(!editing);
        setRequestData(response.data);
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
        navigate('/admin/requests', { replace: true });
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
      navigate(`/my-requests/${requestId}`, { replace: true });
    } else {
      navigate(`/admin/requests/${requestId}`, { replace: true });
    }
  };

  return (
    <div>
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              Alapinformációk
            </Typography>
          </Grid>
          <Grid item>
            {!editing && (
              <Tooltip
                title="Vissza a felkérések listájához"
                placement="top"
                arrow
              >
                <span>
                  <IconButton
                    onClick={() =>
                      navigate(
                        isPrivileged ? '/admin/requests' : '/my-requests',
                        { replace: true }
                      )
                    }
                    disabled={loading}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
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
                      <IconButton
                        onClick={() => setRemoveDialogOpen(true)}
                        disabled={loading}
                      >
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
              initialValues={{
                ...requestData,
                status_field:
                  requestData.additional_data &&
                  requestData.additional_data.status_by_admin &&
                  requestData.additional_data.status_by_admin.status
                    ? requestData.additional_data.status_by_admin.status
                    : '',
                recording_path:
                  requestData.additional_data &&
                  requestData.additional_data.recording &&
                  requestData.additional_data.recording.path
                    ? requestData.additional_data.recording.path
                    : '',
              }}
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
                      <InputLabel htmlFor="status_field">
                        Státusz felülírás
                      </InputLabel>
                      <Field
                        labelId="status_field"
                        label="Státusz felülírás"
                        name="status_field"
                        component={Select}
                        disabled={!isAdmin()}
                      >
                        <MenuItem value="">
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
                      name="responsible"
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
                      autoHighlight
                      clearOnEscape
                      fullWidth
                      renderInput={(params) => (
                        <MUITextField
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...params}
                          name="responsible"
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
                      name="recording_path"
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
              Esemény neve: <strong>{requestData.title}</strong>
            </p>
            <p>
              Kezdés időpontja:{' '}
              <strong>
                {format(
                  new Date(requestData.start_datetime),
                  'yyyy. MMMM d. (eeee) | H:mm',
                  { locale: hu }
                )}
              </strong>
            </p>
            <p>
              Várható befejezés:{' '}
              <strong>
                {format(
                  new Date(requestData.end_datetime),
                  'yyyy. MMMM d. (eeee) | H:mm',
                  { locale: hu }
                )}
              </strong>
            </p>
            <p>
              Helyszín: <strong>{requestData.place}</strong>
            </p>
            <p>
              Videó típusa: <strong>{requestData.type}</strong>
            </p>
            {isPrivileged &&
              requestData.additional_data &&
              requestData.additional_data.requester &&
              (requestData.requester.first_name !==
                requestData.additional_data.requester.first_name ||
                requestData.requester.last_name !==
                  requestData.additional_data.requester.last_name ||
                requestData.requester.profile.phone_number !==
                  requestData.additional_data.requester.phone_number) && (
                <Tooltip
                  title={`${requestData.additional_data.requester.last_name} ${requestData.additional_data.requester.first_name} (${requestData.additional_data.requester.phone_number})`}
                  placement="top"
                  arrow
                >
                  <Chip
                    color="secondary"
                    size="small"
                    label="A felhasználó adatai és a felkéréskor beküldött adatok nem egyeznek!"
                    className={classes.chip}
                  />
                </Tooltip>
              )}
            <p>
              Felkérő:{' '}
              <ConditionalWrapper
                condition={isPrivileged}
                wrapper={(children) => (
                  <Link to={`/admin/users/${requestData.requester.id}`}>
                    {children}
                  </Link>
                )}
              >
                <strong>
                  {`${requestData.requester.last_name} ${requestData.requester.first_name}`}
                </strong>
              </ConditionalWrapper>
              <br />
              <strong>
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
              </strong>
            </p>
            {requestData.requested_by &&
              requestData.requested_by.id !== requestData.requester.id && (
                <p>
                  Beküldő:{' '}
                  <ConditionalWrapper
                    condition={isPrivileged}
                    wrapper={(children) => (
                      <Link to={`/admin/users/${requestData.requested_by.id}`}>
                        {children}
                      </Link>
                    )}
                  >
                    <strong>
                      {`${requestData.requested_by.last_name} ${requestData.requested_by.first_name}`}
                    </strong>
                  </ConditionalWrapper>
                </p>
              )}
            <Divider />
            <p className={classes.afterDivider}>
              Beküldve:{' '}
              <strong>
                {format(
                  new Date(requestData.created),
                  'yyyy. MMMM d. (eeee) | H:mm',
                  {
                    locale: hu,
                  }
                )}
              </strong>
            </p>
            {isPrivileged && (
              <>
                <p>
                  Határidő:{' '}
                  <strong>
                    {format(
                      new Date(requestData.deadline),
                      'yyyy. MMMM d. (eeee)',
                      { locale: hu }
                    )}
                  </strong>
                </p>
                {requestData.additional_data &&
                  requestData.additional_data.recording &&
                  requestData.additional_data.recording.path && (
                    <p>
                      Nyersek helye:{' '}
                      <strong>
                        {requestData.additional_data.recording.path}
                      </strong>
                    </p>
                  )}
              </>
            )}
            {requestData.responsible && (
              <p>
                Felelős:{' '}
                <ConditionalWrapper
                  condition={isPrivileged}
                  wrapper={(children) => (
                    <Link to={`/admin/users/${requestData.responsible.id}`}>
                      {children}
                    </Link>
                  )}
                >
                  <strong>
                    {`${requestData.responsible.last_name} ${requestData.responsible.first_name}`}
                  </strong>
                </ConditionalWrapper>
                <br />
                <strong>
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
                </strong>
              </p>
            )}
          </>
        )}
      </Paper>
      {isPrivileged && (
        <Dialog
          open={removeDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="request-delete-confirmation">
            Biztosan törölni akarod a felkérést?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="request-delete-confirmation-description">
              A felkérés törlésével az összes videó, stábtag, hozzászólás és
              értékelés is törlésre kerül. A művelet visszavonhatatlan!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRemoveDialogOpen(false)}
              autoFocus
              disabled={loading}
            >
              Mégsem
            </Button>
            <Button onClick={handleDelete} color="primary" disabled={loading}>
              Törlés
            </Button>
          </DialogActions>
        </Dialog>
      )}
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
