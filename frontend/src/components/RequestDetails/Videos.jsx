import React, { useState } from 'react';
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
import TextFieldMUI from '@material-ui/core/TextField';
import PersonalVideoIcon from '@material-ui/icons/PersonalVideo';
import OndemandVideoIcon from '@material-ui/icons/OndemandVideo';
import SyncIcon from '@material-ui/icons/Sync';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import MenuItem from '@material-ui/core/MenuItem';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
// Material React Kit components
import Badge from 'components/material-kit-react/Badge/Badge';
// Form components
import { Formik, Form, Field, getIn } from 'formik';
import { TextField, CheckboxWithLabel } from 'formik-material-ui';
import * as Yup from 'yup';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import {
  createVideoAdmin,
  updateVideoAdmin,
  deleteVideoAdmin,
  createRatingAdmin,
  updateRatingAdmin,
  deleteRatingAdmin,
} from 'api/requestAdminApi';
import { createRating, updateRating, deleteRating } from 'api/requestApi';
import { videoEnumConverter } from 'api/enumConverter';
// Review component
import ReviewDialog from './ReviewDialog';

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
  expansionPanel: {
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
}));

export default function Videos({
  requestId,
  requestData,
  /* setRequestData, */
  staffMembers,
  isAdmin,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [createVideoDialogOpen, setCreateVideoDialogOpen] = useState(false);
  const [ratingRemoveDialog, setRatingRemoveDialog] = useState({
    videoId: 0,
    ratingId: 0,
    open: false,
  });
  const [reviewDialogData, setReviewDialogData] = useState({
    requestId,
    videoId: 0,
    rating: {},
    open: false,
  });
  const [videoDetails, setVideoDetails] = useState({});

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

  const showError = () => {
    enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
      variant: 'error',
      autoHideDuration: 5000,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setVideoDetails((prevVideoDetails) => ({
      ...prevVideoDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (values, videoId) => {
    setLoading(true);
    try {
      if (values && videoId) {
        await updateVideoAdmin(requestId, videoId, values);
      } else {
        await createVideoAdmin(requestId, videoDetails);
        setCreateVideoDialogOpen(false);
      }
      // TODO: Add to data instead of reloading
      window.location.reload();
    } catch (e) {
      showError();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    setLoading(true);
    try {
      await deleteVideoAdmin(requestId, videoId);

      // TODO: Add to data instead of reloading
      window.location.reload();
    } catch (e) {
      showError();
    } finally {
      setLoading(false);
    }
  };

  const handleRatingCreateUpdate = async (value, video) => {
    const rating = getOwnRatingForVideo(video);
    setLoading(true);
    if (value) {
      try {
        if (rating.rating === 0) {
          if (isAdmin) {
            await createRatingAdmin(requestId, video.id, { rating: value });
          } else {
            await createRating(requestId, video.id, { rating: value });
          }
        } else if (isAdmin) {
          await updateRatingAdmin(requestId, video.id, rating.id, {
            rating: value,
          });
        } else {
          await updateRating(requestId, video.id, rating.id, { rating: value });
        }
        // TODO: Add to data instead of reloading
        window.location.reload();
      } catch (e) {
        showError();
      } finally {
        setLoading(false);
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
    setLoading(true);
    try {
      if (isAdmin) {
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
      // TODO: Add to data instead of reloading
      window.location.reload();
    } catch (e) {
      showError();
    } finally {
      setRatingRemoveDialog({
        videoId: 0,
        ratingId: 0,
        open: false,
      });
      setLoading(false);
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
    setVideoDetails({});
  };

  const handleRatingRemoveDialogClose = () => {
    setLoading(false);
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
    }),
  });

  return (
    <div>
      {requestData.videos.length > 0 ? (
        <>
          {requestData.videos.map((video) => (
            <ExpansionPanel
              key={`${video.id}-panel`}
              defaultExpanded={requestData.videos.length === 1}
            >
              <ExpansionPanelSummary
                expandIcon={requestData.videos.length > 1 && <ExpandMoreIcon />}
                classes={{ content: classes.expansionPanel }}
              >
                <Typography className={classes.heading}>
                  {video.title}
                </Typography>
                <div className={classes.statusBadge}>
                  <Badge color="primary">
                    {videoEnumConverter(video.status)}
                  </Badge>
                </div>
              </ExpansionPanelSummary>
              {isAdmin ? (
                <Formik
                  initialValues={{
                    ...video,
                    additional_data: {
                      editing_done: false,
                      coding: {
                        website: false,
                      },
                      publishing: {
                        website: '',
                      },
                      archiving: {
                        hq_archive: false,
                      },
                      ...video.additional_data,
                    },
                  }}
                  onSubmit={(values) => handleSubmit(values, video.id)}
                  validationSchema={validationSchema}
                >
                  {({ submitForm, resetForm, errors, touched }) => (
                    <>
                      <ExpansionPanelDetails>
                        <Form>
                          <Field
                            name="additional_data.editing_done"
                            Label={{ label: 'Vágás' }}
                            component={CheckboxWithLabel}
                            type="checkbox"
                            icon={<PersonalVideoIcon />}
                            checkedIcon={<OndemandVideoIcon />}
                          />
                          <Field
                            name="additional_data.coding.website"
                            Label={{ label: 'Kódolás webre' }}
                            component={CheckboxWithLabel}
                            type="checkbox"
                            icon={<SyncDisabledIcon />}
                            checkedIcon={<SyncIcon />}
                          />
                          <Field
                            name="additional_data.archiving.hq_archive"
                            Label={{ label: 'Archiválás' }}
                            component={CheckboxWithLabel}
                            type="checkbox"
                            icon={<FolderOpenIcon />}
                            checkedIcon={<FolderIcon />}
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
                            label="Vágó"
                            margin="normal"
                            component={TextField}
                            size="small"
                            defaultValue={video.editor ? video.editor.id : ''}
                            fullWidth
                            select
                          >
                            {staffMembers.map((item) => (
                              <MenuItem value={item.id} key={item.id}>
                                {`${item.last_name} ${item.first_name}`}
                              </MenuItem>
                            ))}
                          </Field>
                        </Form>
                      </ExpansionPanelDetails>
                      <Divider />
                      <ExpansionPanelActions
                        className={classes.adminEditButtons}
                      >
                        <IconButton
                          onClick={() => handleDelete(video.id)}
                          disabled={loading}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <Button size="small" onClick={resetForm}>
                          Mégsem
                        </Button>
                        <Button
                          size="small"
                          color="primary"
                          onClick={submitForm}
                        >
                          Mentés
                        </Button>
                      </ExpansionPanelActions>
                    </>
                  )}
                </Formik>
              ) : (
                <>
                  {video.additional_data &&
                    video.additional_data.publishing &&
                    video.additional_data.publishing.website && (
                      <ExpansionPanelDetails>
                        <Typography>
                          Az elkészült videót itt tekintheted meg:{' '}
                          {
                            video.additional_data.publishing.website
                            /* TODO: Backend support needed */
                          }
                        </Typography>
                      </ExpansionPanelDetails>
                    )}
                </>
              )}
              {!isAdmin && <Divider />}
              <ExpansionPanelActions>
                {getOwnRatingForVideo(video).rating > 0 && (
                  <IconButton
                    onClick={() => handleReview(video)}
                    disabled={loading}
                    size="small"
                  >
                    <RateReviewIcon fontSize="small" />
                  </IconButton>
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
                />
              </ExpansionPanelActions>
            </ExpansionPanel>
          ))}
        </>
      ) : (
        <>
          {!isAdmin && (
            <p className={classes.noVideosYet}>
              Még nincsenek videók. <i className="far fa-pause-circle" />
            </p>
          )}
        </>
      )}
      {isAdmin && (
        <>
          <Fab
            color="primary"
            onClick={handleCreateVideoDialogOpen}
            className={classes.fab}
          >
            <AddIcon />
          </Fab>
          <Dialog
            open={createVideoDialogOpen}
            onClose={handleCreateVideoDialogClose}
          >
            <DialogTitle id="add-video-dialog">Új videó hozzáadása</DialogTitle>
            <DialogContent>
              <TextFieldMUI
                id="title"
                name="title"
                label="Videó címe"
                onChange={handleChange}
                fullWidth
                required
              />
              <TextFieldMUI
                className={classes.inputField}
                id="editor_id"
                name="editor_id"
                select
                fullWidth
                label="Vágó"
                onChange={handleChange}
              >
                {staffMembers.map((item) => (
                  <MenuItem value={item.id} key={item.id}>
                    {`${item.last_name} ${item.first_name}`}
                  </MenuItem>
                ))}
              </TextFieldMUI>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCreateVideoDialogClose}
                color="primary"
                disabled={loading}
              >
                Mégsem
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                color="primary"
                disabled={loading}
              >
                Hozzáadás
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      <Dialog
        open={ratingRemoveDialog.open}
        onClose={handleRatingRemoveDialogClose}
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
          <Button onClick={handleRatingRemoveDialogClose} autoFocus>
            Mégsem
          </Button>
          <Button onClick={handleRatingDelete} color="primary">
            Törlés
          </Button>
        </DialogActions>
      </Dialog>
      <ReviewDialog
        reviewDialogData={reviewDialogData}
        setReviewDialogData={setReviewDialogData}
        isAdmin={isAdmin}
        /* setRequestData={setRequestData} */
      />
    </div>
  );
}

Videos.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestData: PropTypes.object.isRequired,
  /* setRequestData: PropTypes.func.isRequired, */
  staffMembers: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
