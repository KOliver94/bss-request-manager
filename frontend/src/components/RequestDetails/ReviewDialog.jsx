import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// MUI components
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import { updateRatingAdmin } from 'src/api/requestAdminApi';
import { updateRating } from 'src/api/requestApi';
import handleError from 'src/helpers/errorHandler';

export default function ReviewDialog({
  reviewDialogData,
  setReviewDialogData,
  isPrivileged,
  requestData,
  setRequestData,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    setReviewData({ review: reviewDialogData.rating.review });
  }, [reviewDialogData]);

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
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
      if (isPrivileged) {
        result = await updateRatingAdmin(
          reviewDialogData.requestId,
          reviewDialogData.videoId,
          reviewDialogData.rating.id,
          reviewData,
        );
      } else {
        result = await updateRating(
          reviewDialogData.requestId,
          reviewDialogData.videoId,
          reviewDialogData.rating.id,
          reviewData,
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
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={reviewDialogData.open}
      onClose={handleCancel}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="review-dialog">Értékelés írása</DialogTitle>
      <DialogContent>
        <TextField
          id="review-dialog-textfield"
          name="review"
          label="Értékelés"
          multiline
          fullWidth
          margin="dense"
          rows={4}
          placeholder="Írd le pár mondatban a véleményedet a videóról illetve a stáb munkájáról."
          value={reviewData.review}
          onChange={handleChange}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleCancel} disabled={loading}>
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

ReviewDialog.propTypes = {
  reviewDialogData: PropTypes.object.isRequired,
  setReviewDialogData: PropTypes.func.isRequired,
  isPrivileged: PropTypes.bool.isRequired,
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
};
