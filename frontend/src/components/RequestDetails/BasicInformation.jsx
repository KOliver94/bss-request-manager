import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// MUI components
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BackupIcon from '@mui/icons-material/Backup';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import makeStyles from '@mui/styles/makeStyles';
import MUITextField from '@mui/material/TextField';
// Form components
import { Formik, Form, Field } from 'formik';
import {
  Autocomplete,
  CheckboxWithLabel,
  Select,
  TextField,
  ToggleButtonGroup,
} from 'formik-mui';
import { DatePicker, DateTimePicker } from 'formik-mui-lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
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
  toggleButtonGroup: {
    padding: '5px 0',
  },
  toggleButtonText: {
    margin: 0,
    lineHeight: 0,
    paddingLeft: '2px',
  },
  beforeDividerTextField: {
    margin: '16px 0',
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
      .required('Az esemény nevének megadása kötelező!'),
    start_datetime: Yup.date()
      .required('A kezdés időpontjának megadása kötelező!')
      .nullable()
      .typeError('Hibás dátum formátum!'),
    end_datetime: Yup.date()
      .min(
        Yup.ref('start_datetime'),
        'A befejezés időpontja nem lehet korábbi mint a kezdés!'
      )
      .required('A várható befejezés megadása kötelező!')
      .nullable()
      .typeError('Hibás dátum formátum!'),
    place: Yup.string()
      .min(1, 'Túl rövid helyszín!')
      .max(150, 'Túl hosszú helyszín!')
      .trim()
      .required('A helyszín megadása kötelező!'),
    type: Yup.string()
      .min(1, 'Túl rövid típus!')
      .max(50, 'Túl hosszú típus!')
      .trim()
      .required('A videó típusának megadása kötelező!'),
    deadline: Yup.date()
      .min(
        Yup.ref('end_datetime'),
        'A határidőnek a felkérés várható befejezése után kell lennie!'
      )
      .required('A várható befejezés megadása kötelező!')
      .nullable()
      .typeError('Hibás dátum formátum!'),
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
        status: values.status_field ? parseInt(values.status_field, 10) : null,
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
                    size="large"
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
                    <IconButton
                      onClick={changeView}
                      disabled={loading}
                      size="large"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            {!editing && (
              <Tooltip title="Frissítés" placement="top" arrow>
                <span>
                  <IconButton
                    onClick={handleReload}
                    disabled={loading}
                    size="large"
                  >
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
                    <IconButton
                      onClick={handleEditing}
                      disabled={loading}
                      size="large"
                    >
                      {editing ? <CheckIcon /> : <EditIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                {editing ? (
                  <Tooltip title="Elvetés" placement="top" arrow>
                    <span>
                      <IconButton
                        onClick={handleDiscard}
                        disabled={loading}
                        size="large"
                      >
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
                        size="large"
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
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={hu}>
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
                additional_data: {
                  ...requestData.additional_data,
                  recording: {
                    removed: false,
                    copied_to_gdrive: false,
                    ...requestData.additional_data.recording,
                  },
                },
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
                      component={ToggleButtonGroup}
                      name="additional_data.accepted"
                      type="checkbox"
                      disabled={!isAdmin()}
                      className={classes.toggleButtonGroup}
                      exclusive
                      fullWidth
                    >
                      <ToggleButton
                        value
                        color="success"
                        aria-label="Elfogadva"
                      >
                        <SentimentVerySatisfiedIcon />
                        <Typography
                          variant="inherit"
                          className={classes.toggleButtonText}
                        >
                          Elfogadva
                        </Typography>
                      </ToggleButton>
                      <ToggleButton
                        value={false}
                        color="error"
                        aria-label="Elutasítva"
                      >
                        <SentimentVeryDissatisfiedIcon />
                        <Typography
                          variant="inherit"
                          className={classes.toggleButtonText}
                        >
                          Elutasítva
                        </Typography>
                      </ToggleButton>
                    </Field>
                    <Field
                      component={ToggleButtonGroup}
                      name="additional_data.canceled"
                      type="checkbox"
                      disabled={!isAdmin()}
                      className={classes.toggleButtonGroup}
                      exclusive
                      fullWidth
                    >
                      <ToggleButton value color="warning" aria-label="Lemondva">
                        <NotInterestedIcon />
                        <Typography
                          variant="inherit"
                          className={classes.toggleButtonText}
                        >
                          Lemondva
                        </Typography>
                      </ToggleButton>
                    </Field>
                    <Field
                      component={ToggleButtonGroup}
                      name="additional_data.failed"
                      type="checkbox"
                      disabled={!isAdmin()}
                      className={classes.toggleButtonGroup}
                      exclusive
                      fullWidth
                    >
                      <ToggleButton value color="info" aria-label="Meghiúsult">
                        <ErrorOutlineIcon />
                        <Typography
                          variant="inherit"
                          className={classes.toggleButtonText}
                        >
                          Meghiúsult
                        </Typography>
                      </ToggleButton>
                    </Field>
                    <Field
                      name="status_field"
                      component={Select}
                      labelId="status_field"
                      label="Státusz felülírás"
                      disabled={!isAdmin()}
                      formControl={{
                        fullWidth: true,
                        margin: 'normal',
                        className: classes.beforeDividerTextField,
                      }}
                      formHelperText={{
                        children:
                          requestData.additional_data &&
                          requestData.additional_data.status_by_admin &&
                          requestData.additional_data.status_by_admin
                            .admin_name &&
                          `Utoljára módosította: ${requestData.additional_data.status_by_admin.admin_name}`,
                      }}
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
                    <Divider />
                    <Field
                      name="responsible"
                      component={Autocomplete}
                      options={staffMembers}
                      getOptionLabel={(option) =>
                        `${option.last_name} ${option.first_name}`
                      }
                      renderOption={(props, option) => {
                        return (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Avatar
                              alt={`${option.first_name} ${option.last_name}`}
                              src={option.profile.avatar_url}
                              className={classes.smallAvatar}
                            />
                            {`${option.last_name} ${option.first_name}`}
                          </li>
                        );
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      autoHighlight
                      clearOnEscape
                      fullWidth
                      renderInput={(params) => (
                        <MUITextField
                          {...params}
                          name="responsible"
                          label="Felelős"
                          margin="normal"
                        />
                      )}
                    />
                    <Field
                      name="deadline"
                      label="Határidő"
                      component={DatePicker}
                      toolbarTitle="Határidő kiválasztása"
                      okText="Rendben"
                      cancelText="Mégsem"
                      clearText="Törlés"
                      inputFormat="yyyy.MM.dd."
                      mask="____.__.__."
                      textField={{
                        margin: 'normal',
                        fullWidth: true,
                        error: touched.deadline && !!errors.deadline,
                        helperText: touched.deadline && errors.deadline,
                      }}
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
                      color="secondary"
                      icon={<BackupIcon />}
                      checkedIcon={<CloudDoneIcon />}
                      indeterminateIcon={<BackupIcon />}
                    />
                    <Field
                      name="additional_data.recording.removed"
                      Label={{ label: 'Törölve' }}
                      component={CheckboxWithLabel}
                      type="checkbox"
                      color="secondary"
                      icon={<DeleteOutlineIcon />}
                      checkedIcon={<DeleteIcon />}
                      indeterminateIcon={<DeleteOutlineIcon />}
                    />
                    <Field
                      name="recording_path"
                      label="Nyersek helye"
                      margin="normal"
                      component={TextField}
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
                      fullWidth
                      error={touched.title && !!errors.title}
                      helperText={touched.title && errors.title}
                    />
                    <Field
                      name="start_datetime"
                      label="Kezdés időpontja"
                      toolbarTitle="Esemény kezdésének időpontja"
                      okText="Rendben"
                      cancelText="Mégsem"
                      clearText="Törlés"
                      component={DateTimePicker}
                      inputFormat="yyyy.MM.dd. HH:mm"
                      mask="____.__.__. __:__"
                      textField={{
                        margin: 'normal',
                        fullWidth: true,
                        error:
                          touched.start_datetime && !!errors.start_datetime,
                        helperText:
                          touched.start_datetime && errors.start_datetime,
                      }}
                    />
                    <Field
                      name="end_datetime"
                      label="Várható befejezés"
                      toolbarTitle="Esemény végének időpontja"
                      okText="Rendben"
                      cancelText="Mégsem"
                      clearText="Törlés"
                      component={DateTimePicker}
                      inputFormat="yyyy.MM.dd. HH:mm"
                      mask="____.__.__. __:__"
                      textField={{
                        margin: 'normal',
                        fullWidth: true,
                        error: touched.end_datetime && !!errors.end_datetime,
                        helperText: touched.end_datetime && errors.end_datetime,
                      }}
                    />
                    <Field
                      name="place"
                      label="Helyszín"
                      margin="normal"
                      component={TextField}
                      fullWidth
                      error={touched.place && !!errors.place}
                      helperText={touched.place && errors.place}
                    />
                    <Field
                      name="type"
                      label="Videó típusa"
                      margin="normal"
                      component={TextField}
                      fullWidth
                      error={touched.type && !!errors.type}
                      helperText={touched.type && errors.type}
                    />
                  </div>
                </Form>
              )}
            </Formik>
          </LocalizationProvider>
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
              color="inherit"
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
