import { useState } from 'react';
import PropTypes from 'prop-types';
// MUI components
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// Components
import CommentDesktop from 'src/components/RequestDetails/CommentDesktop';
import CommentMobile from 'src/components/RequestDetails/CommentMobile';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import {
  createComment,
  updateComment,
  deleteComment,
} from 'src/api/requestApi';
import {
  createCommentAdmin,
  updateCommentAdmin,
  deleteCommentAdmin,
} from 'src/api/requestAdminApi';
import compareValues from 'src/helpers/objectComperator';
import handleError from 'src/helpers/errorHandler';

import stylesModule from './Comments.module.css';

export default function Comments({
  requestId,
  requestData,
  setRequestData,
  isPrivileged,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(-1);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
    });
  };

  const handleSubmit = async (values, newComment, { resetForm }) => {
    let result;
    try {
      if (editingCommentId > 0 && !newComment) {
        if (isPrivileged) {
          result = await updateCommentAdmin(
            requestId,
            editingCommentId,
            values,
          );
        } else {
          result = await updateComment(requestId, editingCommentId, values);
        }
        setEditingCommentId(-1);
        setRequestData({
          ...requestData,
          comments: requestData.comments.map((comment) => {
            if (comment.id === editingCommentId) {
              return result.data;
            }
            return comment;
          }),
        });
      } else {
        if (isPrivileged) {
          result = await createCommentAdmin(requestId, values);
        } else {
          result = await createComment(requestId, values);
        }
        setRequestData({
          ...requestData,
          comments: [...requestData.comments, result.data],
        });
        resetForm();
      }
    } catch (e) {
      showError(e);
    }
  };

  const handleDelete = async (commentId) => {
    setLoading(true);
    try {
      if (isPrivileged) {
        await deleteCommentAdmin(requestId, commentId);
      } else {
        await deleteComment(requestId, commentId);
      }
      setRequestData({
        ...requestData,
        comments: requestData.comments.filter(
          (comment) => comment.id !== commentId,
        ),
      });
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h6" className={stylesModule.title}>
              Hozzászólások
            </Typography>
          </Grid>
        </Grid>
      </div>
      <Divider variant="middle" />
      <Paper className={stylesModule.paper} elevation={2}>
        {requestData.comments.length > 0 && (
          <>
            {requestData.comments
              .sort(compareValues('id'))
              .map((comment) =>
                isMobileView ? (
                  <CommentMobile
                    key={`${comment.id}-comment-base`}
                    comment={comment}
                    handleDelete={handleDelete}
                    handleSubmit={handleSubmit}
                    isEditing={editingCommentId === comment.id}
                    isPrivileged={isPrivileged}
                    loading={loading}
                    requesterId={requestData.requester.id}
                    setEditingCommentId={setEditingCommentId}
                  />
                ) : (
                  <CommentDesktop
                    key={`${comment.id}-comment-base`}
                    comment={comment}
                    handleDelete={handleDelete}
                    handleSubmit={handleSubmit}
                    isEditing={editingCommentId === comment.id}
                    isPrivileged={isPrivileged}
                    loading={loading}
                    requesterId={requestData.requester.id}
                    setEditingCommentId={setEditingCommentId}
                  />
                ),
              )}
          </>
        )}
        {isMobileView ? (
          <CommentMobile
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            isNew
            isPrivileged={isPrivileged}
            loading={loading}
            setEditingCommentId={setEditingCommentId}
          />
        ) : (
          <CommentDesktop
            handleDelete={handleDelete}
            handleSubmit={handleSubmit}
            isNew
            isPrivileged={isPrivileged}
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
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
  isPrivileged: PropTypes.bool.isRequired,
};
