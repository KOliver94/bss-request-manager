import { useEffect, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';

import {
  createRating,
  updateRating,
  deleteRating,
  listVideos,
} from 'api/requestApi';
import StatusBadge from 'components/material-kit-react/Badge/StatusBadge';
import ReviewDialog from 'components/RequestDetails/ReviewDialog';
import { videoStatuses } from 'helpers/enumConstants';
import handleError from 'helpers/errorHandler';
import compareValues from 'helpers/objectComperator';

import stylesModule from './Videos.module.scss';

export default function Videos({ requestId, reload }) {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [videoAccordionOpen, setVideoAccordionOpen] = useState(null);
  const [ratingRemoveDialog, setRatingRemoveDialog] = useState({
    videoId: 0,
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

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
    });
  };

  const handleReview = (video) => {
    setReviewDialogData({
      ...reviewDialogData,
      ...{
        videoId: video.id,
        rating: video.rating,
        open: true,
      },
    });
  };

  const handleRatingCreateUpdate = async (value, video) => {
    let result;
    if (value) {
      setRatingLoading(true);
      try {
        if (!video.rating.rating) {
          result = await createRating(requestId, video.id, { rating: value });
          handleReview(video, result.data);
          setData([
            ...data.map((vid) => {
              if (vid.id !== video.id) {
                return vid;
              }

              return {
                ...vid,
                rating: result.data,
              };
            }),
          ]);
        } else {
          result = await updateRating(requestId, video.id, {
            rating: value,
          });
          setData([
            ...data.map((vid) => {
              if (vid.id !== video.id) {
                return vid;
              }

              return {
                ...vid,
                rating: result.data,
              };
            }),
          ]);
        }
      } catch (e) {
        showError(e);
      } finally {
        setRatingLoading(false);
      }
    } else {
      setRatingRemoveDialog({
        videoId: video.id,
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
      await deleteRating(requestId, ratingRemoveDialog.videoId);
      setData([
        ...data.map((vid) => {
          if (vid.id !== ratingRemoveDialog.videoId) {
            return vid;
          }

          return {
            ...vid,
            rating: {},
          };
        }),
      ]);
      setRatingRemoveDialog({
        videoId: 0,
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

  const handleRatingReviewSubmit = async (review) => {
    await updateRating(requestId, reviewDialogData.videoId, review)
      .then((response) => {
        setData([
          ...data.map((vid) => {
            if (vid.id !== reviewDialogData.videoId) {
              return vid;
            }

            return {
              ...vid,
              rating: response.data,
            };
          }),
        ]);
        setReviewDialogData({
          ...reviewDialogData,
          videoId: 0,
          rating: {},
          open: false,
        });
      })
      .catch((e) => showError(e));
  };

  const handleRatingRemoveDialogClose = () => {
    setRatingRemoveDialog({
      videoId: 0,
      open: false,
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadData(reqId) {
      try {
        const result = await listVideos(reqId, {
          signal: controller.signal,
        });
        setData(result.data);
        setLoading(false);
        setVideoAccordionOpen(
          result.data.length === 1 && `${result.data[0].id}-panel`,
        );
      } catch (e) {
        const errorMessage = handleError(e);
        if (errorMessage) {
          enqueueSnackbar(errorMessage, {
            variant: 'error',
          });
        }
      }
      return [];
    }

    setLoading(true);
    loadData(requestId);

    return () => {
      controller.abort();
    };
  }, [requestId, enqueueSnackbar, setVideoAccordionOpen, reload]);

  return (
    <div>
      {loading ? (
        <Box sx={{ paddingY: '20px' }}>
          <LinearProgress />
        </Box>
      ) : data.length > 0 ? (
        <>
          {data.sort(compareValues('id')).map((video) => {
            const videoStatus = videoStatuses.find(
              (x) => x.id === video.status,
            );
            return (
              <Accordion
                key={`${video.id}-panel`}
                expanded={`${video.id}-panel` === videoAccordionOpen}
                onChange={() => {
                  handleVideoAccordionChange(`${video.id}-panel`);
                }}
              >
                <AccordionSummary
                  expandIcon={data.length > 1 && <ExpandMoreIcon />}
                  classes={{ content: stylesModule.accordion }}
                >
                  <Typography className={stylesModule.heading}>
                    {video.title}
                  </Typography>
                  <div className={stylesModule.statusBadge}>
                    <StatusBadge color={videoStatus.color}>
                      {videoStatus.text}
                    </StatusBadge>
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
                      {video.rating.rating > 0 && (
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
                        value={video.rating.rating || 0}
                        onChange={(event, value) =>
                          handleRatingCreateUpdate(value, video)
                        }
                        disabled={reviewDialogData.open || ratingLoading}
                      />
                    </AccordionActions>
                  </>
                )}
              </Accordion>
            );
          })}
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
        handleRatingReviewSubmit={handleRatingReviewSubmit}
      />
    </div>
  );
}

Videos.propTypes = {
  requestId: PropTypes.string.isRequired,
  reload: PropTypes.bool.isRequired,
};
