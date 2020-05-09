import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Material UI components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import { updateRatingAdmin } from 'api/requestAdminApi';
import { updateRating } from 'api/requestApi';

export default function Videos({
  reviewDialogData,
  setReviewDialogData,
  isAdmin,
  requestData,
  setRequestData,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    setReviewData({ review: reviewDialogData.rating.review });
  }, [reviewDialogData]);

  const showError = () => {
    enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
      variant: 'error',
      autoHideDuration: 5000,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReviewData((prevReviewData) => ({
      ...prevReviewData,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setReviewDialogData({ ...reviewDialogData, open: false });
  };

  const handleSave = async () => {
    setLoading(true);
    let result;
    try {
      if (isAdmin) {
        result = await updateRatingAdmin(
          reviewDialogData.requestId,
          reviewDialogData.videoId,
          reviewDialogData.rating.id,
          reviewData
        );
      } else {
        result = await updateRating(
          reviewDialogData.requestId,
          reviewDialogData.videoId,
          reviewDialogData.rating.id,
          reviewData
        );
      }
      setReviewDialogData({ ...reviewDialogData, open: false });
      setRequestData({
        ...requestData,
        videos: requestData.videos.map((vid) => {
          if (vid.id !== reviewDialogData.videoId) {
            return vid;
          }

          return {
            ...vid,
            ratings: vid.ratings.map((rat) => {
              if (rat.id === reviewDialogData.rating.id) {
                return result.data;
              }
              return rat;
            }),
          };
        }),
      });
    } catch (e) {
      showError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={reviewDialogData.open} onClose={handleCancel}>
      <DialogTitle id="review-dialog">Értékelés írása</DialogTitle>
      <DialogContent>
        <TextField
          id="review-dialog-textfield"
          name="review"
          label="Értékelés"
          multiline
          fullWidth
          rows={4}
          placeholder="Írd le pár mondatban a véleményedet a videóról illetve a stáb munkájáról."
          variant="outlined"
          value={reviewData.review}
          onChange={handleChange}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Mégsem
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          autoFocus
          disabled={loading}
        >
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}

Videos.propTypes = {
  reviewDialogData: PropTypes.object.isRequired,
  setReviewDialogData: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
};
