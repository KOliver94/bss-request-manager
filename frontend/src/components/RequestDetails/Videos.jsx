import { useState } from 'react';
import PropTypes from 'prop-types';
// MUI components
import IconButton from '@mui/material/IconButton';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
// Material React Kit components
import Badge from 'src/components/material-kit-react/Badge/Badge';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import { isSelf } from 'src/api/loginApi';
import { createRating, updateRating, deleteRating } from 'src/api/requestApi';
import { videoStatuses } from 'src/helpers/enumConstants';
import compareValues from 'src/helpers/objectComperator';
import handleError from 'src/helpers/errorHandler';
// Review component
import ReviewDialog from './ReviewDialog';

import stylesModule from './Videos.module.css';

export default function Videos({ requestId, requestData, setRequestData }) {
  const { enqueueSnackbar } = useSnackbar();
  const [ratingLoading, setRatingLoading] = useState(false);
  const [videoAccordionOpen, setVideoAccordionOpen] = useState(
    requestData.videos.length === 1
      ? `${requestData.videos[0].id}-panel`
      : null,
  );
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
      found = video.ratings.find((rating) => isSelf(rating.author.id));
    }
    return found || { rating: 0, review: '' };
  };

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
    });
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
          result = await createRating(requestId, video.id, { rating: value });
          handleReview(video, result.data);
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
          result = await updateRating(requestId, video.id, rating.id, {
            rating: value,
          });
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
      await deleteRating(
        requestId,
        ratingRemoveDialog.videoId,
        ratingRemoveDialog.ratingId,
      );
      setRequestData({
        ...requestData,
        videos: requestData.videos.map((video) => {
          if (video.id !== ratingRemoveDialog.videoId) {
            return video;
          }

          return {
            ...video,
            ratings: video.ratings.filter(
              (rating) => rating.id !== ratingRemoveDialog.ratingId,
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

  const handleRatingRemoveDialogClose = () => {
    setRatingRemoveDialog({
      videoId: 0,
      ratingId: 0,
      open: false,
    });
  };

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
                classes={{ content: stylesModule.accordion }}
              >
                <Typography className={stylesModule.heading}>
                  {video.title}
                </Typography>
                <div className={stylesModule.statusBadge}>
                  <Badge color="primary">
                    {videoStatuses.find((x) => x.id === video.status).text}
                  </Badge>
                </div>
              </AccordionSummary>

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

              {video.status >= 5 && (
                <>
                  <Divider />
                  <AccordionActions>
                    {getOwnRatingForVideo(video).rating > 0 && (
                      <Tooltip
                        title="Szöveges értékelés írása"
                        classes={{ tooltip: stylesModule.tooltip }}
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
        <p className={stylesModule.noVideosYet}>
          Még nincsenek videók. <i className="fa-regular fa-circle-pause" />
        </p>
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
};
