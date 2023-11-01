import PropTypes from 'prop-types';
// material-kit-react
import Badge from 'src/components/material-kit-react/Badge/Badge';
// MUI components
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import makeStyles from '@mui/styles/makeStyles';
// New comment
import { Formik, Form, Field } from 'formik';
import { TextField, Checkbox } from 'formik-mui';
import * as Yup from 'yup';
// Date format
import { format, formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
// Helpers
import stringToColor from 'src/helpers/stringToColor';
// API calls
import { isAdmin, isSelf } from 'src/api/loginApi';

const useStyles = makeStyles(() => ({
  commentAuthor: {
    margin: 0,
    textAlign: 'left',
    fontWeight: 400,
  },
  commentText: {
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
  commentCreated: {
    textAlign: 'left',
    color: 'gray',
  },
  commentDivider: {
    margin: '15px 0',
  },
  buttonStack: {
    margin: '0 !important',
  },
}));

export default function CommentMobile({
  comment,
  handleDelete,
  handleSubmit,
  isEditing,
  isNew,
  isPrivileged,
  loading,
  requesterId,
  setEditingCommentId,
}) {
  const classes = useStyles();
  const userName = isNew
    ? localStorage.getItem('name')
    : ` ${comment.author.last_name} ${comment.author.first_name}`;
  const nameFirstLetter = isNew
    ? localStorage.getItem('name') &&
      localStorage.getItem('name').split(' ')[1] &&
      localStorage.getItem('name').split(' ')[1][0]
    : comment.author.first_name && comment.author.first_name[0];
  const avatarUrl = isNew
    ? localStorage.getItem('avatar')
    : comment.author.profile.avatar_url;
  const validationSchema = Yup.object({
    text: Yup.string().trim().required('Üres hozzászólás nem küldhető be!'),
  });

  return (
    <>
      {isEditing || isNew ? (
        <Formik
          initialValues={comment}
          onSubmit={(values, resetForm) =>
            handleSubmit(values, isNew, resetForm)
          }
          validationSchema={validationSchema}
        >
          {({ isSubmitting, values, errors, touched }) => (
            <Form>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    src={avatarUrl}
                    sx={{
                      bgcolor: stringToColor(userName),
                    }}
                  >
                    {nameFirstLetter}
                  </Avatar>
                  <h4 className={classes.commentAuthor}>{userName}</h4>
                </Stack>
                <Field
                  name="text"
                  label={isNew ? 'Új hozzászólás' : 'Szerkesztés'}
                  margin="normal"
                  component={TextField}
                  fullWidth
                  multiline
                  rows={5}
                  error={touched.text && !!errors.text}
                  helperText={touched.text && errors.text}
                />
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  className={classes.buttonStack}
                >
                  {isPrivileged && (
                    <Tooltip
                      title={values.internal ? 'Belső' : 'Publikus'}
                      arrow
                    >
                      <span>
                        <Field
                          component={Checkbox}
                          type="checkbox"
                          name="internal"
                          color="secondary"
                          icon={<LockOpenIcon />}
                          checkedIcon={<LockIcon />}
                        />
                      </span>
                    </Tooltip>
                  )}
                  {!isNew && (
                    <Tooltip title="Elvetés" arrow>
                      <span>
                        <IconButton
                          onClick={() => setEditingCommentId(-1)}
                          disabled={isSubmitting}
                        >
                          <ClearIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip title={isNew ? 'Küldés' : 'Mentés'} arrow>
                    <span>
                      <IconButton type="submit" disabled={isSubmitting}>
                        <SendIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      ) : (
        <Stack direction="column" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={avatarUrl}
              sx={{
                bgcolor: stringToColor(userName),
              }}
            >
              {nameFirstLetter}
            </Avatar>
            <Stack direction="column">
              <h4 className={classes.commentAuthor}>{userName}</h4>
              <Stack direction="row" alignItems="center">
                {comment.author.id === requesterId && (
                  <Badge color="info">Felkérő</Badge>
                )}
                {comment.internal && <Badge color="danger">Belső</Badge>}
              </Stack>
            </Stack>
          </Stack>
          <p className={classes.commentText}>{comment.text}</p>
          <Tooltip
            title={format(new Date(comment.created), 'yyyy. MMMM d. H:mm:ss', {
              locale: hu,
            })}
            placement="bottom-start"
          >
            <p className={classes.commentCreated}>
              {formatDistanceToNow(new Date(comment.created), {
                locale: hu,
                addSuffix: true,
              })}
            </p>
          </Tooltip>
          {((isPrivileged && isAdmin()) || isSelf(comment.author.id)) && (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              className={classes.buttonStack}
            >
              <Tooltip title="Törlés" arrow>
                <span>
                  <IconButton
                    onClick={() => handleDelete(comment.id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Szerkesztés" arrow>
                <span>
                  <IconButton
                    onClick={() => setEditingCommentId(comment.id)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      )}
      {!isNew && (
        <Divider variant="fullWidth" className={classes.commentDivider} />
      )}
    </>
  );
}

CommentMobile.propTypes = {
  comment: PropTypes.oneOfType([
    PropTypes.instanceOf(Comment),
    PropTypes.shape({
      text: PropTypes.string,
      internal: PropTypes.bool,
    }),
  ]),
  handleDelete: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isNew: PropTypes.bool,
  isPrivileged: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  requesterId: PropTypes.number,
  setEditingCommentId: PropTypes.func.isRequired,
};

CommentMobile.defaultProps = {
  comment: {
    text: '',
    internal: false,
  },
  isEditing: false,
  isNew: false,
  requesterId: 0,
};
