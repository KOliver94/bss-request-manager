import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// MUI components
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// Icons
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// Notistack
import { useSnackbar } from 'notistack';
// Date format
import { format } from 'date-fns';
// API calls
import {
  listRatingsAdmin,
  updateRatingAdmin,
  deleteRatingAdmin,
} from 'src/api/requestAdminApi';
import compareValues from 'src/helpers/objectComperator';
import handleError from 'src/helpers/errorHandler';
import { isSelf } from 'src/api/loginApi';

export default function RatingsDialog({
  ratingsDialogData,
  setRatingsDialogData,
  setRequestData,
  isAdmin,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [inProgress, setInProgress] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [editingRating, setEditingRating] = useState({
    id: -1,
    rating: 0,
    review: '',
  });
  const [orderBy, setOrderBy] = useState({
    field: 'created',
    direction: 'desc',
    field2: null,
  });
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const headCells = [
    { id: 'rating', label: 'Értékelés' },
    { id: 'review', label: 'Szöveges értékelés' },
    { id: 'author', label: 'Értékelő' },
    { id: 'created', label: 'Létrehozva' },
  ];

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
    });
  };

  useEffect(() => {
    async function loadData(requestId, videoId) {
      try {
        const result = await listRatingsAdmin(requestId, videoId);
        setRatings(result.data);
        setLoading(false);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
        });
      }
    }
    if (ratingsDialogData.open) {
      loadData(ratingsDialogData.requestId, ratingsDialogData.videoId);
    }
  }, [ratingsDialogData, enqueueSnackbar]);

  const closeDialog = () => {
    setRatingsDialogData({
      ...ratingsDialogData,
      ...{
        open: false,
      },
    });
  };

  const changeOrderBy = (field) => {
    let direction = 'asc';
    if (orderBy.field === field) {
      if (orderBy.direction === 'asc') {
        direction = 'desc';
      }
    }
    if (field === 'author') {
      setOrderBy({ field, direction, field2: 'last_name' });
    } else {
      setOrderBy({ field, direction, field2: null });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditingRating((prevRatingDetails) => ({
      ...prevRatingDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const result = await updateRatingAdmin(
        ratingsDialogData.requestId,
        ratingsDialogData.videoId,
        editingRating.id,
        editingRating,
      );
      setEditingRating({
        id: -1,
        rating: 0,
        review: '',
      });
      setRatings(
        ratings.map((rating) => {
          if (rating.id === editingRating.id) {
            return result.data;
          }
          return rating;
        }),
      );
      if (isSelf(result.data.author.id)) {
        setRequestData((prevRequestData) => ({
          ...prevRequestData,
          videos: prevRequestData.videos.map((video) => {
            if (video.id !== ratingsDialogData.videoId) {
              return video;
            }

            return {
              ...video,
              ratings: video.ratings.map((rating) => {
                if (rating.id === editingRating.id) {
                  return result.data;
                }
                return rating;
              }),
            };
          }),
        }));
      }
    } catch (e) {
      showError(e);
    }
  };

  const handleDelete = async (ratingId, authorId) => {
    setInProgress(true);
    try {
      await deleteRatingAdmin(
        ratingsDialogData.requestId,
        ratingsDialogData.videoId,
        ratingId,
      );
      setRatings(ratings.filter((rating) => rating.id !== ratingId));
      if (isSelf(authorId)) {
        setRequestData((prevRequestData) => ({
          ...prevRequestData,
          videos: prevRequestData.videos.map((video) => {
            if (video.id !== ratingsDialogData.videoId) {
              return video;
            }

            return {
              ...video,
              ratings: video.ratings.filter((rating) => rating.id !== ratingId),
            };
          }),
        }));
      }
    } catch (e) {
      showError(e);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <Dialog
      open={ratingsDialogData.open}
      onClose={closeDialog}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
    >
      <DialogTitle id="ratings-dialog">
        <Box display="flex" alignItems="center">
          <Box flexGrow={1}>Értékelések</Box>
          <Box>
            <IconButton onClick={closeDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((item) => (
                  <TableCell align="center" key={`${item.id}-headCell`}>
                    {item.label}
                    <TableSortLabel
                      active={orderBy.field === item.id}
                      direction={orderBy.direction}
                      onClick={() => changeOrderBy(item.id)}
                    />
                  </TableCell>
                ))}
                {isAdmin && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <>
                  {[...Array(5).keys()].map((x) => (
                    <TableRow key={`${x}-skeleton`} hover>
                      {headCells.map((item) => (
                        <TableCell align="center" key={`${item.id}-${x}`}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                      {isAdmin && (
                        <TableCell align="center" key={`${x}-buttons`}>
                          <Skeleton variant="text" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {ratings
                    .sort(
                      compareValues(
                        orderBy.field,
                        orderBy.direction,
                        orderBy.field2,
                      ),
                    )
                    .map((rating) => (
                      <TableRow key={`${rating.id}-rating`} hover>
                        <TableCell align="center">
                          <Rating
                            name="rating"
                            value={
                              editingRating.id === rating.id
                                ? editingRating.rating
                                : rating.rating
                            }
                            readOnly={editingRating.id !== rating.id}
                            onChange={handleChange}
                            disabled={inProgress}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {editingRating.id === rating.id ? (
                            <TextField
                              name="review"
                              multiline
                              fullWidth
                              rows={4}
                              value={editingRating.review}
                              onChange={handleChange}
                            />
                          ) : (
                            rating.review
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {`${rating.author.last_name} ${rating.author.first_name}`}
                        </TableCell>
                        <TableCell align="center">
                          {format(
                            new Date(rating.created),
                            'yyyy.MM.dd. HH:mm',
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell align="right">
                            {editingRating.id === rating.id ? (
                              <>
                                <IconButton
                                  onClick={handleSubmit}
                                  disabled={inProgress}
                                >
                                  <CheckIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    setEditingRating({
                                      id: -1,
                                      rating: 0,
                                      review: '',
                                    })
                                  }
                                  disabled={inProgress}
                                >
                                  <ClearIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  onClick={() =>
                                    setEditingRating({
                                      id: rating.id,
                                      rating: rating.rating,
                                      review: rating.review,
                                    })
                                  }
                                  disabled={inProgress}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    handleDelete(rating.id, rating.author.id)
                                  }
                                  disabled={inProgress}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

RatingsDialog.propTypes = {
  ratingsDialogData: PropTypes.object.isRequired,
  setRatingsDialogData: PropTypes.func.isRequired,
  setRequestData: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
