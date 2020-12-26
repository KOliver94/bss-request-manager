import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
// Material UI components
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import RateReviewIcon from '@material-ui/icons/RateReview';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import PersonalVideoIcon from '@material-ui/icons/PersonalVideo';
import OndemandVideoIcon from '@material-ui/icons/OndemandVideo';
import SyncIcon from '@material-ui/icons/Sync';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionActions from '@material-ui/core/AccordionActions';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Rating from '@material-ui/lab/Rating';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { makeStyles } from '@material-ui/core/styles';
import MUITextField from '@material-ui/core/TextField';
// Material React Kit components
import Badge from 'components/material-kit-react/Badge/Badge';
// Form components
import { Formik, Form, Field, getIn } from 'formik';
import { TextField, CheckboxWithLabel, Select } from 'formik-material-ui';
import { Autocomplete } from 'formik-material-ui-lab';
import { KeyboardTimePicker } from 'formik-material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import * as Yup from 'yup';
// Date format
import { hu } from 'date-fns/locale';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import {
  getRequestAdmin,
  createVideoAdmin,
  updateVideoAdmin,
  deleteVideoAdmin,
  createRatingAdmin,
  updateRatingAdmin,
  deleteRatingAdmin,
} from 'api/requestAdminApi';
import { isAdmin } from 'api/loginApi';
import { createRating, updateRating, deleteRating } from 'api/requestApi';
import { videoStatuses } from 'api/enumConstants';
import compareValues from 'api/objectComperator';
import handleError from 'api/errorHandler';
// Review component
import ReviewDialog from './ReviewDialog';
import RatingsDialog from './RatingsDialog';

const useStyles = makeStyles((theme) => ({
  inputField: {
    marginTop: '24px',
  },
  fab: {
    top: '10px',
    right: '10px',
    bottom: 'auto',
    left: 'auto',
    position: 'absolute',
  },
  noVideosYet: {
    textAlign: 'center',
    paddingTop: '10px',
    fontWeight: '300',
  },
  accordion: {
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '70%',
    flexShrink: 0,
  },
  statusBadge: {
    display: 'block',
    alignSelf: 'center',
  },
  adminEditButtons: {
    paddingBottom: '0px',
  },
  ratingLabel: {
    fontSize: 'inherit',
    color: 'inherit',
  },
  tooltip: {
    marginRight: 5,
  },
  smallAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: 5,
  },
}));

export default function Videos({
  requestId,
  requestData,
  setRequestData,
  staffMembers,
  isPrivileged,
}) {
  const classes = useStyles();
  const isInitialMount = useRef(true);
  const { enqueueSnackbar } = useSnackbar();
  const [videoDeleteLoading, setVideoDeleteLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [createVideoDialogOpen, setCreateVideoDialogOpen] = useState(false);
  const [ratingRemoveDialog, setRatingRemoveDialog] = useState({
    videoId: 0,
    ratingId: 0,
    open: false,
    loading: false,
  });
  const [reviewDialogData, setReviewDialogData] = useState({
    requestId,
    videoId: 0,
    rating: {},
    open: false,
  });
  const [ratingsDialogData, setRatingsDialogData] = useState({
    requestId,
    videoId: 0,
    open: false,
  });

  const getOwnRatingForVideo = (video) => {
    let found = null;
    if (video.ratings.length > 0) {
      found = video.ratings.find(
        (rating) =>
          rating.author.id.toString() === localStorage.getItem('user_id')
      );
    }
    return found || { rating: 0, review: '' };
  };

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
      autoHideDuration: 5000,
    });
  };

  useEffect(() => {
    const updateRequestStatus = async () => {
      const result = await getRequestAdmin(requestId);
      setRequestData({
        ...requestData,
        status: result.data.status,
        videos: result.data.videos,
      });
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (isPrivileged) {
      updateRequestStatus();
    }
    // eslint-disable-next-line
  }, [requestData.videos]);

  const handleSubmit = async (val, videoId = 0) => {
    const values = val;
    if (values.editor_id) {
      values.editor_id = values.editor_id.id;
    }
    if (values.additional_data && values.additional_data.length) {
      values.additional_data.length =
        values.additional_data.length.getHours() * 60 * 60 +
        values.additional_data.length.getMinutes() * 60 +
        values.additional_data.length.getSeconds();
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
    let result;
    try {
      if (values && videoId) {
        result = await updateVideoAdmin(requestId, videoId, values);
        setRequestData({
          ...requestData,
          videos: requestData.videos.map((video) => {
            if (video.id === videoId) {
              return result.data;
            }
            return video;
          }),
        });
      } else {
        result = await createVideoAdmin(requestId, values);
        setCreateVideoDialogOpen(false);
        setRequestData({
          ...requestData,
          videos: [...requestData.videos, result.data],
        });
      }
    } catch (e) {
      showError(e);
    }
  };

  const handleDelete = async (videoId) => {
    setVideoDeleteLoading(true);
    try {
      await deleteVideoAdmin(requestId, videoId);
      setRequestData({
        ...requestData,
        videos: requestData.videos.filter((video) => video.id !== videoId),
      });
    } catch (e) {
      showError(e);
    } finally {
      setVideoDeleteLoading(false);
    }
  };

  const handleRatingCreateUpdate = async (value, video) => {
    const rating = getOwnRatingForVideo(video);
    let result;
    if (value) {
      setRatingLoading(true);
      try {
        if (rating.rating === 0) {
          if (isPrivileged) {
            result = await createRatingAdmin(requestId, video.id, {
              rating: value,
            });
          } else {
            result = await createRating(requestId, video.id, { rating: value });
          }
          setRequestData({
            ...requestData,
            videos: requestData.videos.map((vid) => {
              if (vid.id !== video.id) {
                return vid;
              }

              return {
                ...vid,
                ratings: [...vid.ratings, result.data],
              };
            }),
          });
        } else {
          if (isPrivileged) {
            result = await updateRatingAdmin(requestId, video.id, rating.id, {
              rating: value,
            });
          } else {
            result = await updateRating(requestId, video.id, rating.id, {
              rating: value,
            });
          }
          setRequestData({
            ...requestData,
            videos: requestData.videos.map((vid) => {
              if (vid.id !== video.id) {
                return vid;
              }

              return {
                ...vid,
                ratings: vid.ratings.map((rat) => {
                  if (rat.id === rating.id) {
                    return result.data;
                  }
                  return rat;
                }),
              };
            }),
          });
        }
      } catch (e) {
        showError(e);
      } finally {
        setRatingLoading(false);
      }
    } else {
      setRatingRemoveDialog({
        videoId: video.id,
        ratingId: rating.id,
        open: true,
      });
    }
  };

  const handleRatingDelete = async () => {
    setRatingRemoveDialog({
      ...ratingRemoveDialog,
      loading: true,
    });
    try {
      if (isPrivileged) {
        await deleteRatingAdmin(
          requestId,
          ratingRemoveDialog.videoId,
          ratingRemoveDialog.ratingId
        );
      } else {
        await deleteRating(
          requestId,
          ratingRemoveDialog.videoId,
          ratingRemoveDialog.ratingId
        );
      }
      setRequestData({
        ...requestData,
        videos: requestData.videos.map((video) => {
          if (video.id !== ratingRemoveDialog.videoId) {
            return video;
          }

          return {
            ...video,
            ratings: video.ratings.filter(
              (rating) => rating.id !== ratingRemoveDialog.ratingId
            ),
          };
        }),
      });
      setRatingRemoveDialog({
        videoId: 0,
        ratingId: 0,
        open: false,
        loading: false,
      });
    } catch (e) {
      showError(e);
      setRatingRemoveDialog({
        ...ratingRemoveDialog,
        loading: false,
      });
    }
  };

  const handleReview = (video) => {
    setReviewDialogData({
      ...reviewDialogData,
      ...{
        videoId: video.id,
        rating: getOwnRatingForVideo(video),
        open: true,
      },
    });
  };

  const handleCreateVideoDialogOpen = () => {
    setCreateVideoDialogOpen(true);
  };

  const handleCreateVideoDialogClose = () => {
    setCreateVideoDialogOpen(false);
  };

  const handleRatingRemoveDialogClose = () => {
    setRatingRemoveDialog({
      videoId: 0,
      ratingId: 0,
      open: false,
    });
  };

  const validationSchema = Yup.object().shape({
    additional_data: Yup.object().shape({
      publishing: Yup.object().shape({
        website: Yup.string().url('Nem megfelelő URL formátum'),
      }),
      aired: Yup.array().of(
        Yup.string().matches(
          /(([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])))/,
          'Kérlek a dátumot ÉÉÉÉ-HH-NN formában add meg!'
        )
      ),
      length: Yup.date().nullable(),
    }),
  });

  const newVideoValidationSchema = Yup.object({
    title: Yup.string()
      .min(1, 'A videó címe túl rövid!')
      .max(200, 'A videó címe túl hosszú!')
      .trim()
      .required('A videó címének megadása kötelező'),
  });

  return (
    <div>
      {requestData.videos.length > 0 ? (
        <>
          {requestData.videos.sort(compareValues('id')).map((video) => (
            <Accordion
              key={`${video.id}-panel`}
              defaultExpanded={requestData.videos.length === 1}
            >
              <AccordionSummary
                expandIcon={requestData.videos.length > 1 && <ExpandMoreIcon />}
                classes={{ content: classes.accordion }}
              >
                <Typography className={classes.heading}>
                  {video.title}
                </Typography>
                <div className={classes.statusBadge}>
                  <Badge color="primary">
                    {videoStatuses.find((x) => x.id === video.status).text}
                  </Badge>
                </div>
              </AccordionSummary>
              {isPrivileged ? (
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={hu}>
                  <Formik
                    enableReinitialize
                    initialValues={{
                      ...video,
                      additional_data: {
                        aired: [],
                        ...video.additional_data,
                        length: video.additional_data.length
                          ? new Date(
                              new Date('1970-01-01T00:00:00').setSeconds(
                                video.additional_data.length
                              )
                            )
                          : null,
                      },
                    }}
                    onSubmit={(values) => handleSubmit(values, video.id)}
                    validationSchema={validationSchema}
                  >
                    {({
                      submitForm,
                      resetForm,
                      isSubmitting,
                      errors,
                      touched,
                    }) => (
                      <>
                        <AccordionDetails>
                          <Form>
                            <Field
                              name="additional_data.editing_done"
                              Label={{ label: 'Vágás' }}
                              component={CheckboxWithLabel}
                              type="checkbox"
                              icon={<PersonalVideoIcon />}
                              checkedIcon={<OndemandVideoIcon />}
                              indeterminateIcon={<PersonalVideoIcon />}
                            />
                            <Field
                              name="additional_data.coding.website"
                              Label={{ label: 'Kódolás webre' }}
                              component={CheckboxWithLabel}
                              type="checkbox"
                              icon={<SyncDisabledIcon />}
                              checkedIcon={<SyncIcon />}
                              indeterminateIcon={<SyncDisabledIcon />}
                            />
                            <Field
                              name="additional_data.archiving.hq_archive"
                              Label={{ label: 'Archiválás' }}
                              component={CheckboxWithLabel}
                              type="checkbox"
                              icon={<FolderOpenIcon />}
                              checkedIcon={<FolderIcon />}
                              indeterminateIcon={<FolderOpenIcon />}
                            />
                            <Field
                              name="additional_data.publishing.website"
                              label="Videó elérési útja a honlapon"
                              margin="normal"
                              component={TextField}
                              size="small"
                              fullWidth
                              className={
                                getIn(
                                  errors,
                                  'additional_data.publishing.website'
                                ) &&
                                getIn(
                                  touched,
                                  'additional_data.publishing.website'
                                )
                                  ? 'text-input error'
                                  : 'text-input'
                              }
                            />
                            <Field
                              name="editor_id"
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
                              defaultValue={video.editor ? video.editor : null}
                              size="small"
                              autoHighlight
                              clearOnEscape
                              fullWidth
                              renderInput={(params) => (
                                <MUITextField
                                  // eslint-disable-next-line react/jsx-props-no-spreading
                                  {...params}
                                  label="Vágó"
                                  margin="normal"
                                />
                              )}
                            />
                            <Field
                              name="additional_data.length"
                              label="Videó hossza"
                              margin="normal"
                              component={KeyboardTimePicker}
                              fullWidth
                              ampm={false}
                              format="HH:mm:ss"
                              openTo="minutes"
                              views={['hours', 'minutes', 'seconds']}
                              error={
                                touched.additional_data &&
                                touched.additional_data.length &&
                                errors.additional_data &&
                                !!errors.additional_data.length
                              }
                              helperText={
                                touched.additional_data &&
                                touched.additional_data.length &&
                                errors.additional_data &&
                                errors.additional_data.length
                              }
                            />
                            <Field
                              name="additional_data.aired"
                              component={Autocomplete}
                              options={[]}
                              freeSolo
                              multiple
                              autoSelect
                              limitTags={3}
                              size="small"
                              fullWidth
                              renderInput={(params) => (
                                <MUITextField
                                  // eslint-disable-next-line react/jsx-props-no-spreading
                                  {...params}
                                  name="additional_data.aired"
                                  label="Adásba kerülés"
                                  margin="normal"
                                  error={
                                    touched.additional_data &&
                                    touched.additional_data.aired &&
                                    errors.additional_data &&
                                    !!errors.additional_data.aired
                                  }
                                  helperText={
                                    touched.additional_data &&
                                    touched.additional_data.aired &&
                                    errors.additional_data &&
                                    errors.additional_data.aired
                                  }
                                />
                              )}
                            />
                            <FormControl fullWidth margin="normal">
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
                                {videoStatuses.map((status) => {
                                  return (
                                    <MenuItem key={status.id} value={status.id}>
                                      {status.text}
                                    </MenuItem>
                                  );
                                })}
                              </Field>
                              {video.additional_data &&
                                video.additional_data.status_by_admin &&
                                video.additional_data.status_by_admin
                                  .admin_name && (
                                  <FormHelperText>
                                    Utoljára módosította:{' '}
                                    {
                                      video.additional_data.status_by_admin
                                        .admin_name
                                    }
                                  </FormHelperText>
                                )}
                            </FormControl>
                          </Form>
                        </AccordionDetails>
                        <Divider />
                        <AccordionActions
                          className={
                            video.status >= 3 ? classes.adminEditButtons : null
                          }
                        >
                          <Tooltip
                            title="Törlés"
                            classes={{ tooltip: classes.tooltip }}
                            placement="left"
                            arrow
                          >
                            <IconButton
                              onClick={() => handleDelete(video.id)}
                              disabled={isSubmitting || videoDeleteLoading}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            onClick={resetForm}
                            disabled={isSubmitting || videoDeleteLoading}
                          >
                            Mégsem
                          </Button>
                          <Button
                            size="small"
                            color="primary"
                            onClick={submitForm}
                            disabled={isSubmitting || videoDeleteLoading}
                          >
                            Mentés
                          </Button>
                        </AccordionActions>
                      </>
                    )}
                  </Formik>
                </MuiPickersUtilsProvider>
              ) : (
                <>
                  {video.video_url && (
                    <AccordionDetails>
                      <Typography variant="body2" align="justify" gutterBottom>
                        Az elkészült videót itt tekintheted meg:{' '}
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {video.video_url}
                        </a>
                      </Typography>
                    </AccordionDetails>
                  )}
                </>
              )}
              {((isPrivileged && video.status >= 3) ||
                (!isPrivileged && video.status >= 5)) && (
                <>
                  {!isPrivileged && <Divider />}
                  <AccordionActions>
                    {isPrivileged && video.avg_rating && (
                      <Tooltip
                        title={`Összes értékelés. Átlag: ${
                          Math.round(
                            (video.avg_rating + Number.EPSILON) * 100
                          ) / 100
                        }`}
                        classes={{ tooltip: classes.tooltip }}
                        placement="left"
                        arrow
                      >
                        <IconButton
                          onClick={() =>
                            setRatingsDialogData({
                              ...ratingsDialogData,
                              ...{
                                videoId: video.id,
                                open: true,
                              },
                            })
                          }
                          disabled={ratingsDialogData.open}
                          size="small"
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {getOwnRatingForVideo(video).rating > 0 && (
                      <Tooltip
                        title="Szöveges értékelés írása"
                        classes={{ tooltip: classes.tooltip }}
                        placement="left"
                        arrow
                      >
                        <IconButton
                          onClick={() => handleReview(video)}
                          disabled={reviewDialogData.open || ratingLoading}
                          size="small"
                        >
                          <RateReviewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Rating
                      name={`${video.id}-own-rating`}
                      classes={{
                        label: classes.ratingLabel,
                      }}
                      value={getOwnRatingForVideo(video).rating}
                      onChange={(event, value) =>
                        handleRatingCreateUpdate(value, video)
                      }
                      disabled={reviewDialogData.open || ratingLoading}
                    />
                  </AccordionActions>
                </>
              )}
            </Accordion>
          ))}
        </>
      ) : (
        <>
          {!isPrivileged && (
            <p className={classes.noVideosYet}>
              Még nincsenek videók. <i className="far fa-pause-circle" />
            </p>
          )}
        </>
      )}
      {isPrivileged && (
        <>
          <Tooltip title="Új videó hozzáadása" arrow>
            <Fab
              color="primary"
              onClick={handleCreateVideoDialogOpen}
              className={classes.fab}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
          <Dialog
            open={createVideoDialogOpen}
            onClose={handleCreateVideoDialogClose}
            fullWidth
            maxWidth="xs"
          >
            <Formik
              initialValues={{
                title: '',
              }}
              onSubmit={(values) => handleSubmit(values)}
              validationSchema={newVideoValidationSchema}
            >
              {({ submitForm, isSubmitting, errors, touched }) => (
                <>
                  <DialogTitle>Új videó hozzáadása</DialogTitle>
                  <DialogContent>
                    <Form>
                      <Field
                        name="title"
                        label="Videó címe"
                        margin="normal"
                        component={TextField}
                        fullWidth
                        error={touched.title && !!errors.title}
                        helperText={touched.title && errors.title}
                      />
                      <Field
                        name="editor_id"
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
                            label="Vágó"
                            margin="normal"
                          />
                        )}
                      />
                    </Form>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleCreateVideoDialogClose}
                      color="primary"
                      disabled={isSubmitting}
                    >
                      Mégsem
                    </Button>
                    <Button
                      onClick={submitForm}
                      color="primary"
                      disabled={isSubmitting}
                    >
                      Hozzáadás
                    </Button>
                  </DialogActions>
                </>
              )}
            </Formik>
          </Dialog>
          <RatingsDialog
            ratingsDialogData={ratingsDialogData}
            setRatingsDialogData={setRatingsDialogData}
            setRequestData={setRequestData}
            isAdmin={isAdmin()}
          />
        </>
      )}
      <Dialog
        open={ratingRemoveDialog.open}
        onClose={handleRatingRemoveDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="rating-delete-confirmation">
          Biztosan törölni akarod az értékelést?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="rating-delete-confirmation-description">
            Az értékelés törlésével a szöveges értékelés is törlésre kerül.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRatingRemoveDialogClose}
            autoFocus
            disabled={ratingRemoveDialog.loading}
          >
            Mégsem
          </Button>
          <Button
            onClick={handleRatingDelete}
            color="primary"
            disabled={ratingRemoveDialog.loading}
          >
            Törlés
          </Button>
        </DialogActions>
      </Dialog>
      <ReviewDialog
        reviewDialogData={reviewDialogData}
        setReviewDialogData={setReviewDialogData}
        isPrivileged={isPrivileged}
        requestData={requestData}
        setRequestData={setRequestData}
      />
    </div>
  );
}

Videos.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
  staffMembers: PropTypes.array.isRequired,
  isPrivileged: PropTypes.bool.isRequired,
};
