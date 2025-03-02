import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';

export default function ReviewDialog({
  reviewDialogData,
  setReviewDialogData,
  handleRatingReviewSubmit,
}) {
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    setReviewData({ review: reviewDialogData.rating.review });
  }, [reviewDialogData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReviewData((prevReviewData) => ({
      ...prevReviewData,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setReviewDialogData({
      ...reviewDialogData,
      videoId: 0,
      rating: {},
      open: false,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    await handleRatingReviewSubmit(reviewData);
    setLoading(false);
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
  handleRatingReviewSubmit: PropTypes.func.isRequired,
};
