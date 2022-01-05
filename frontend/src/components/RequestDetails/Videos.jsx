import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
// MUI components
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import makeStyles from '@mui/styles/makeStyles';
import MUITextField from '@mui/material/TextField';
// Material React Kit components
import Badge from 'components/material-kit-react/Badge/Badge';
// Form components
import { Formik, Form, Field, getIn } from 'formik';
import { Autocomplete, TextField, CheckboxWithLabel, Select } from 'formik-mui';
import { TimePicker } from 'formik-mui-lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
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
import { videoStatuses } from 'helpers/enumConstants';
import compareValues from 'helpers/objectComperator';
import handleError from 'helpers/errorHandler';
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
  const [videoAccordionOpen, setVideoAccordionOpen] = useState(
    requestData.videos.length === 1 ? `${requestData.videos[0].id}-panel` : null
  );
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
  const handleVideoAccordionChange = (panel) => {
    if (videoAccordionOpen !== panel) {
      setVideoAccordionOpen(panel);
    } else {
      setVideoAccordionOpen(null);
    }
  };

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
      isInitialMount.current = true;
      updateRequestStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestData.videos]);

  const handleSubmit = async (val, videoId = 0) => {
    const values = val;
    if (values.editor !== undefined) {
      values.editor_id = values.editor ? values.editor.id : null;
    }
    if (
      values.additional_data &&
      values.additional_data.length &&
      typeof values.additional_data.length.getHours === 'function' &&
      !Number.isNaN(values.additional_data.length.getHours())
    ) {
      values.additional_data.length =
        values.additional_data.length.getHours() * 60 * 60 +
        values.additional_data.length.getMinutes() * 60 +
        values.additional_data.length.getSeconds();
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
    if (values.website_url !== undefined) {
      if (values.additional_data.publishing) {
        values.additional_data.publishing.website = values.website_url;
      } else {
        values.additional_data.publishing = {
          website: values.website_url,
        };
      }
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
        setVideoAccordionOpen(`${result.data.id}-panel`);
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

  const handleReview = (video, rating = getOwnRatingForVideo(video)) => {
    setReviewDialogData({
      ...reviewDialogData,
      ...{
        videoId: video.id,
        rating,
        open: true,
      },
    });
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
            handleReview(video, result.data);
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
    website_url: Yup.string().url('Nem megfelelő URL formátum!'),
    additional_data: Yup.object().shape({
      aired: Yup.array().of(
        Yup.string().matches(
          /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/,
          'Kérlek a dátumot ÉÉÉÉ-HH-NN formában add meg!'
        )
      ),
      length: Yup.date().nullable().typeError('Hibás formátum!'),
    }),
  });

  const newVideoValidationSchema = Yup.object({
    title: Yup.string()
      .min(1, 'A videó címe túl rövid!')
      .max(200, 'A videó címe túl hosszú!')
      .trim()
      .required('A videó címének megadása kötelező!'),
  });

  return (
    <div>
      {requestData.videos.length > 0 ? (
        <>
          {requestData.videos.sort(compareValues('id')).map((video) => (
            <Accordion
              key={`${video.id}-panel`}
              expanded={`${video.id}-panel` === videoAccordionOpen}
              onChange={() => {
                handleVideoAccordionChange(`${video.id}-panel`);
              }}
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
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={hu}>
                  <Formik
                    enableReinitialize
                    initialValues={{
                      ...video,
                      additional_data: {
                        aired: [],
                        editing_done: false,
                        ...video.additional_data,
                        length: video.additional_data.length
                          ? new Date(
                              new Date('1970-01-01T00:00:00').setSeconds(
                                video.additional_data.length
                              )
                            )
                          : null,
                        coding: {
                          website: false,
                          ...video.additional_data.coding,
                        },
                        archiving: {
                          hq_archive: false,
                          ...video.additional_data.archiving,
                        },
                      },
                      status_field:
                        video.additional_data &&
                        video.additional_data.status_by_admin &&
                        video.additional_data.status_by_admin.status
                          ? video.additional_data.status_by_admin.status
                          : '',
                      website_url:
                        video.additional_data &&
                        video.additional_data.publishing &&
                        video.additional_data.publishing.website
                          ? video.additional_data.publishing.website
                          : '',
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
                              Label={{ label: 'Megvágva' }}
                              component={CheckboxWithLabel}
                              type="checkbox"
                              color="secondary"
                              icon={<PersonalVideoIcon />}
                              checkedIcon={<OndemandVideoIcon />}
                            />
                            <Field
                              name="additional_data.coding.website"
                              Label={{ label: 'Webre kikódolva' }}
                              component={CheckboxWithLabel}
                              type="checkbox"
                              color="secondary"
                              icon={<SyncDisabledIcon />}
                              checkedIcon={<SyncIcon />}
                            />
                            <Field
                              name="additional_data.archiving.hq_archive"
                              Label={{ label: 'Archiválva' }}
                              component={CheckboxWithLabel}
                              type="checkbox"
                              color="secondary"
                              icon={<FolderOpenIcon />}
                              checkedIcon={<FolderIcon />}
                            />
                            <Field
                              name="website_url"
                              label="Videó linkje (honlap, YouTube vagy Google Drive)"
                              margin="normal"
                              component={TextField}
                              size="small"
                              variant="standard"
                              fullWidth
                              error={
                                touched.website_url && !!errors.website_url
                              }
                              helperText={
                                touched.website_url && !!errors.website_url
                              }
                            />
                            <Field
                              name="editor"
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
                              size="small"
                              autoHighlight
                              clearOnEscape
                              fullWidth
                              renderInput={(params) => (
                                <MUITextField
                                  {...params}
                                  name="editor"
                                  label="Vágó"
                                  margin="normal"
                                  variant="standard"
                                />
                              )}
                            />
                            <Field
                              name="additional_data.length"
                              label="Videó hossza"
                              component={TimePicker}
                              toolbarTitle="Videó hossza"
                              okText="Rendben"
                              cancelText="Mégsem"
                              clearText="Törlés"
                              clearable
                              inputFormat="HH:mm:ss"
                              mask="__:__:__"
                              openTo="minutes"
                              views={['hours', 'minutes', 'seconds']}
                              textField={{
                                margin: 'normal',
                                fullWidth: true,
                                variant: 'standard',
                                error:
                                  touched.additional_data &&
                                  touched.additional_data.length &&
                                  errors.additional_data &&
                                  !!errors.additional_data.length,
                                helperText:
                                  touched.additional_data &&
                                  touched.additional_data.length &&
                                  errors.additional_data &&
                                  errors.additional_data.length,
                              }}
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
                                  {...params}
                                  name="additional_data.aired"
                                  label="Adásba kerülés"
                                  margin="normal"
                                  variant="standard"
                                  error={
                                    getIn(touched, 'additional_data.aired') &&
                                    !!getIn(errors, 'additional_data.aired')
                                  }
                                  helperText={
                                    getIn(touched, 'additional_data.aired') &&
                                    getIn(errors, 'additional_data.aired')
                                  }
                                />
                              )}
                            />
                            <Field
                              name="status_field"
                              component={Select}
                              variant="standard"
                              labelId="status_field"
                              label="Státusz felülírás"
                              disabled={!isAdmin()}
                              formControl={{
                                fullWidth: true,
                                margin: 'normal',
                                variant: 'standard',
                              }}
                              formHelperText={{
                                children:
                                  video.additional_data &&
                                  video.additional_data.status_by_admin &&
                                  video.additional_data.status_by_admin
                                    .admin_name &&
                                  `Utoljára módosította: ${video.additional_data.status_by_admin.admin_name}`,
                              }}
                            >
                              <MenuItem value="">
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
                            <span>
                              <IconButton
                                onClick={() => handleDelete(video.id)}
                                disabled={isSubmitting || videoDeleteLoading}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Button
                            size="small"
                            color="inherit"
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
                </LocalizationProvider>
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
                        <span>
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
                        </span>
                      </Tooltip>
                    )}
                    {getOwnRatingForVideo(video).rating > 0 && (
                      <Tooltip
                        title="Szöveges értékelés írása"
                        classes={{ tooltip: classes.tooltip }}
                        placement="left"
                        arrow
                      >
                        <span>
                          <IconButton
                            onClick={() => handleReview(video)}
                            disabled={reviewDialogData.open || ratingLoading}
                            size="small"
                          >
                            <RateReviewIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    <Rating
                      name={`${video.id}-own-rating`}
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
                editor: null,
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
                        variant="standard"
                        fullWidth
                        error={touched.title && !!errors.title}
                        helperText={touched.title && errors.title}
                      />
                      <Field
                        name="editor"
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
                            name="editor"
                            label="Vágó"
                            margin="normal"
                            variant="standard"
                          />
                        )}
                      />
                    </Form>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleCreateVideoDialogClose}
                      color="inherit"
                      disabled={isSubmitting}
                    >
                      Mégsem
                    </Button>
                    <Button
                      onClick={submitForm}
                      color="primary"
                      autoFocus
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
            color="inherit"
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
