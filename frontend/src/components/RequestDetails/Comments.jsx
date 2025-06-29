import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';

import {
  createComment,
  updateComment,
  deleteComment,
  listComments,
} from 'api/requestApi';
import CommentDesktop from 'components/RequestDetails/CommentDesktop';
import CommentMobile from 'components/RequestDetails/CommentMobile';
import handleError from 'helpers/errorHandler';
import compareValues from 'helpers/objectComperator';

import stylesModule from './Comments.module.scss';

export default function Comments({ requestId, requesterId, reload }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(-1);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'));
  const [data, setData] = useState([]);

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
    });
  };

  const handleSubmit = async (values, newComment) => {
    let result;
    try {
      if (editingCommentId > 0 && !newComment) {
        result = await updateComment(requestId, editingCommentId, values);

        setEditingCommentId(-1);
        setData([
          ...data.map((comment) => {
            if (comment.id === editingCommentId) {
              return result.data;
            }
            return comment;
          }),
        ]);
      } else {
        result = await createComment(requestId, values);
        setData([...data, result.data]);
      }
    } catch (e) {
      showError(e);
    }
  };

  const handleDelete = async (commentId) => {
    setLoading(true);
    try {
      await deleteComment(requestId, commentId);
      setData([...data.filter((comment) => comment.id !== commentId)]);
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadData(reqId) {
      try {
        const result = await listComments(reqId, {
          signal: controller.signal,
        });
        setData(result.data);
        setLoading(false);
      } catch (e) {
        const errorMessage = handleError(e);
        if (errorMessage) {
          enqueueSnackbar(errorMessage, {
            variant: 'error',
          });
        }
      }
    }

    setLoading(true);
    loadData(requestId);

    return () => {
      controller.abort();
    };
  }, [requestId, enqueueSnackbar, reload]);

  return (
    <div>
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Grid>
            <Typography variant="h6" className={stylesModule.title}>
              Hozzászólások
            </Typography>
          </Grid>
        </Grid>
      </div>
      <Divider variant="middle" />
      <Paper className={stylesModule.paper} elevation={2}>
        {data.length > 0 && (
          <>
            {data
              .sort(compareValues('id'))
              .map((comment) =>
                isMobileView ? (
                  <CommentMobile
                    key={`${comment.id}-comment-base`}
                    comment={comment}
                    handleDelete={handleDelete}
                    handleSubmit={handleSubmit}
                    isEditing={editingCommentId === comment.id}
                    loading={loading}
                    requesterId={requesterId}
                    setEditingCommentId={setEditingCommentId}
                  />
                ) : (
                  <CommentDesktop
                    key={`${comment.id}-comment-base`}
                    comment={comment}
                    handleDelete={handleDelete}
                    handleSubmit={handleSubmit}
                    isEditing={editingCommentId === comment.id}
                    loading={loading}
                    requesterId={requesterId}
                    setEditingCommentId={setEditingCommentId}
                  />
                ),
              )}
          </>
        )}
        {
          <>
            <LinearProgress />
            <Box sx={{ marginY: isMobileView ? '15px' : '30px' }}>
              <Divider variant="fullWidth" />
            </Box>
          </>
        }
        {isMobileView ? (
          <CommentMobile
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            isNew
            loading={loading}
            setEditingCommentId={setEditingCommentId}
          />
        ) : (
          <CommentDesktop
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            isNew
            loading={loading}
            setEditingCommentId={setEditingCommentId}
          />
        )}
      </Paper>
    </div>
  );
}

Comments.propTypes = {
  requestId: PropTypes.string.isRequired,
  requesterId: PropTypes.number.isRequired,
  reload: PropTypes.bool.isRequired,
};
