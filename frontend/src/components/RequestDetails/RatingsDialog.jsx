import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Material UI components
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Rating from '@material-ui/lab/Rating';
import Skeleton from '@material-ui/lab/Skeleton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles, useTheme } from '@material-ui/core/styles';
// Icons
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
// Notistack
import { useSnackbar } from 'notistack';
// Date format
import { format } from 'date-fns';
// API calls
import {
  listRatingsAdmin,
  updateRatingAdmin,
  deleteRatingAdmin,
} from 'api/requestAdminApi';
import compareValues from 'helpers/objectComperator';
import handleError from 'helpers/errorHandler';

const useStyles = makeStyles(() => ({
  ratingLabel: {
    fontSize: 'inherit',
    color: 'inherit',
  },
}));

export default function RatingsDialog({
  ratingsDialogData,
  setRatingsDialogData,
  setRequestData,
  isAdmin,
}) {
  const classes = useStyles();
  const userId = parseInt(localStorage.getItem('user_id'), 10);
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const headCells = [
    { id: 'rating', label: 'Értékelés' },
    { id: 'review', label: 'Szöveges értékelés' },
    { id: 'author', label: 'Értékelő' },
    { id: 'created', label: 'Létrehozva' },
  ];

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
      autoHideDuration: 5000,
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
          autoHideDuration: 5000,
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
        editingRating
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
        })
      );
      if (userId === result.data.author.id) {
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
        ratingId
      );
      setRatings(ratings.filter((rating) => rating.id !== ratingId));
      if (userId === authorId) {
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
                        orderBy.field2
                      )
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
                            classes={{
                              label: classes.ratingLabel,
                            }}
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
                            'yyyy.MM.dd. HH:mm'
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
