import PropTypes from 'prop-types';
// material-kit-react
import Badge from 'src/components/material-kit-react/Badge/Badge';
// MUI components
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
// New comment
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
// Date format
import { format, formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
// Helpers
import stringToColor from 'src/helpers/stringToColor';
// API calls
import { isSelf } from 'src/api/loginApi';

import stylesModule from './Comment.module.css';

export default function CommentMobile({
  comment,
  handleDelete,
  handleSubmit,
  isEditing,
  isNew,
  loading,
  requesterId,
  setEditingCommentId,
}) {
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
          {({ isSubmitting, errors, touched }) => (
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
                  <h4 className={stylesModule.commentAuthor}>{userName}</h4>
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
                  className={stylesModule.buttonStack}
                >
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
              <h4 className={stylesModule.commentAuthor}>{userName}</h4>
              <Stack direction="row" alignItems="center">
                {comment.author.id === requesterId && (
                  <Badge color="info">Felkérő</Badge>
                )}
                {comment.internal && <Badge color="danger">Belső</Badge>}
              </Stack>
            </Stack>
          </Stack>
          <p className={stylesModule.commentText}>{comment.text}</p>
          <Tooltip
            title={format(new Date(comment.created), 'yyyy. MMMM d. H:mm:ss', {
              locale: hu,
            })}
            placement="bottom-start"
          >
            <p className={stylesModule.commentCreated}>
              {formatDistanceToNow(new Date(comment.created), {
                locale: hu,
                addSuffix: true,
              })}
            </p>
          </Tooltip>
          {isSelf(comment.author.id) && (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              className={stylesModule.buttonStack}
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
        <Divider
          variant="fullWidth"
          className={stylesModule.commentDividerMobile}
        />
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
