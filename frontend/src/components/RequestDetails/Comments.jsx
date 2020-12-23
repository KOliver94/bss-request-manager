import { useState } from 'react';
import PropTypes from 'prop-types';
// Material UI components
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import EditIcon from '@material-ui/icons/Edit';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
// New comment
import { Formik, Form, Field } from 'formik';
import { TextField, Checkbox } from 'formik-material-ui';
import * as Yup from 'yup';
// Date format
import { format, formatDistance } from 'date-fns';
import { hu } from 'date-fns/locale';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import { createComment, updateComment, deleteComment } from 'api/requestApi';
import {
  createCommentAdmin,
  updateCommentAdmin,
  deleteCommentAdmin,
} from 'api/requestAdminApi';
import { isAdmin } from 'api/loginApi';
import compareValues from 'api/objectComperator';
import handleError from 'api/errorHandler';

const useStyles = makeStyles(() => ({
  title: {
    padding: '10px 15px',
  },
  paper: {
    padding: '40px 20px',
    margin: '16px',
  },
  commentAuthor: {
    margin: 0,
    textAlign: 'left',
    fontWeight: 400,
  },
  commentText: {
    textAlign: 'left',
  },
  commentDivider: {
    margin: '30px 0',
  },
  commentCreated: {
    textAlign: 'left',
    color: 'gray',
  },
  internalComment: {
    background: 'rgba(0, 0, 0, 0.08)',
  },
  commentButtons: {
    alignSelf: 'flex-end',
  },
}));

export default function Comments({
  requestId,
  requestData,
  setRequestData,
  isPrivileged,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(-1);

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
      variant: 'error',
      autoHideDuration: 5000,
    });
  };

  const handleSubmit = async (values, newComment = false, { resetForm }) => {
    let result;
    try {
      if (editingCommentId > 0 && !newComment) {
        if (isPrivileged) {
          result = await updateCommentAdmin(
            requestId,
            editingCommentId,
            values
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
          (comment) => comment.id !== commentId
        ),
      });
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (commentId) => {
    setEditingCommentId(commentId);
  };

  const handleCancel = () => {
    setEditingCommentId(-1);
  };

  const validationSchema = Yup.object({
    text: Yup.string().trim().required('Üres hozzászólás nem küldhető be!'),
  });

  return (
    <div>
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              Hozzászólások
            </Typography>
          </Grid>
        </Grid>
      </div>
      <Divider variant="middle" />
      <Paper className={classes.paper} elevation={2}>
        {requestData.comments.length > 0 && (
          <>
            {requestData.comments.sort(compareValues('id')).map((comment) => (
              <div key={`${comment.id}-base`}>
                {editingCommentId === comment.id ? (
                  <div key={`${comment.id}-edit-base`}>
                    <Formik
                      initialValues={comment}
                      onSubmit={(values, resetForm) =>
                        handleSubmit(values, false, resetForm)
                      }
                      validationSchema={validationSchema}
                    >
                      {({ isSubmitting, values, errors, touched }) => (
                        <Form>
                          <Grid container wrap="nowrap" spacing={2}>
                            <Grid item>
                              <Avatar
                                alt={`${comment.author.first_name} ${comment.author.last_name}`}
                                src={comment.author.profile.avatar_url}
                              />
                            </Grid>
                            <Grid item xs zeroMinWidth>
                              <h4 className={classes.commentAuthor}>
                                {`${comment.author.last_name} ${comment.author.first_name}`}
                              </h4>
                              <Field
                                name="text"
                                label="Szerkesztés"
                                margin="normal"
                                component={TextField}
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={5}
                                error={touched.text && !!errors.text}
                                helperText={touched.text && errors.text}
                              />
                            </Grid>
                            <Grid item className={classes.commentButtons}>
                              {isPrivileged && (
                                <Tooltip
                                  title={values.internal ? 'Belső' : 'Publikus'}
                                  placement="left"
                                  arrow
                                >
                                  <Grid item>
                                    <Field
                                      component={Checkbox}
                                      type="checkbox"
                                      name="internal"
                                      icon={<LockOpenIcon />}
                                      checkedIcon={<LockIcon />}
                                    />
                                  </Grid>
                                </Tooltip>
                              )}
                              <Grid item>
                                <Tooltip title="Elvetés" placement="left" arrow>
                                  <IconButton
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                              <Grid item>
                                <Tooltip title="Mentés" placement="left" arrow>
                                  <IconButton
                                    type="submit"
                                    disabled={isSubmitting}
                                  >
                                    <SendIcon />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Form>
                      )}
                    </Formik>
                  </div>
                ) : (
                  <Grid
                    container
                    wrap="nowrap"
                    spacing={2}
                    className={comment.internal ? classes.internalComment : ''}
                  >
                    <Grid item>
                      <Avatar
                        alt={`${comment.author.first_name} ${comment.author.last_name}`}
                        src={comment.author.profile.avatar_url}
                      />
                    </Grid>
                    <Grid item xs zeroMinWidth>
                      <h4 className={classes.commentAuthor}>
                        {`${comment.author.last_name} ${comment.author.first_name}`}
                      </h4>
                      <p className={classes.commentText}>{comment.text}</p>
                      <Tooltip
                        title={format(
                          new Date(comment.created),
                          'yyyy. MMMM d. H:mm:ss',
                          {
                            locale: hu,
                          }
                        )}
                        placement="bottom-start"
                      >
                        <p className={classes.commentCreated}>
                          {formatDistance(
                            new Date(comment.created),
                            new Date(),
                            {
                              locale: hu,
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </Tooltip>
                    </Grid>

                    {((isPrivileged && isAdmin()) ||
                      comment.author.id.toString() ===
                        localStorage.getItem('user_id')) && (
                      <Grid item className={classes.commentButtons}>
                        <Grid item>
                          <Tooltip title="Törlés" placement="left" arrow>
                            <IconButton
                              onClick={() => handleDelete(comment.id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip title="Szerkesztés" placement="left" arrow>
                            <IconButton
                              onClick={() => handleEdit(comment.id)}
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                )}
                <Divider
                  variant="fullWidth"
                  className={classes.commentDivider}
                />
              </div>
            ))}
          </>
        )}
        <Formik
          initialValues={{
            text: '',
            internal: false,
          }}
          onSubmit={(values, resetForm) =>
            handleSubmit(values, true, resetForm)
          }
          validationSchema={validationSchema}
        >
          {({ isSubmitting, values, errors, touched }) => (
            <Form>
              <Grid container wrap="nowrap" spacing={2}>
                <Grid item>
                  <Avatar src={localStorage.getItem('avatar')} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <h4 className={classes.commentAuthor}>
                    {localStorage.getItem('name')}
                  </h4>
                  <Field
                    name="text"
                    label="Új hozzászólás"
                    margin="normal"
                    component={TextField}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={5}
                    error={touched.text && !!errors.text}
                    helperText={touched.text && errors.text}
                  />
                </Grid>
                <Grid item className={classes.commentButtons}>
                  {isPrivileged && (
                    <Tooltip
                      title={values.internal ? 'Belső' : 'Publikus'}
                      placement="left"
                      arrow
                    >
                      <Grid item>
                        <Field
                          component={Checkbox}
                          type="checkbox"
                          name="internal"
                          icon={<LockOpenIcon />}
                          checkedIcon={<LockIcon />}
                        />
                      </Grid>
                    </Tooltip>
                  )}
                  <Grid item>
                    <Tooltip title="Küldés" placement="left" arrow>
                      <IconButton type="submit" disabled={isSubmitting}>
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
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
